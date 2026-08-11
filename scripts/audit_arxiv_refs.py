#!/usr/bin/env python3
"""
audit_arxiv_refs.py — validate every arXiv citation in references.tex against
the live arXiv record (title + first-author surname), with an offline mode
that cross-checks the companion's cached metadata instead.

Designed for github.com/sjarmak/engineering-reliable-coding-agents:

    python3 audit_arxiv_refs.py --repo . --out audit-report.md
    python3 audit_arxiv_refs.py --repo . --offline          # no network: tex vs companion cache

Why entry-keyed matching matters: the arXiv Atom API may omit or reorder
entries in a batched id_list response, so results are matched by the ID
embedded in each entry's <id> element, never by list position.

Known failure mode this catches: authors retitle papers between versions
(e.g. 2603.25764 v1 "Confident and Wrong: ..." -> current "Consistency
Amplifies: ..."). A cached title captured at snapshot time can silently go
stale. Re-run this immediately before each arXiv submission.

No dependencies beyond the standard library.
"""

import argparse
import difflib
import json
import re
import sys
import time
import unicodedata
import urllib.request
import xml.etree.ElementTree as ET

ATOM = "{http://www.w3.org/2005/Atom}"
API = "https://export.arxiv.org/api/query"
BATCH = 20          # arXiv recommends small batches
DELAY_S = 3.0       # arXiv API politeness delay between requests
TITLE_THRESHOLD = 0.82

ACCENT_RE = re.compile(r"\\[`'^\"~=.uvHtcdbkr]\s*\{?(\w)\}?")


def norm(s: str) -> str:
    """Normalize for fuzzy comparison: strip LaTeX accents, case, punctuation."""
    s = ACCENT_RE.sub(r"\1", s or "")
    s = s.replace("\\&", "&").replace("~", " ")
    s = unicodedata.normalize("NFKD", s)          # ž -> z + combining mark
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]", "", s.lower())


def similarity(a: str, b: str) -> float:
    return difflib.SequenceMatcher(None, norm(a), norm(b)).ratio()


def parse_references(tex_path: str):
    """Extract (bibkey, arxiv_id, cited_year, cited_first_author, cited_title)
    from every \\bibitem that carries an arXiv ID."""
    tex = open(tex_path, encoding="utf-8").read()
    items = re.findall(
        r"\\bibitem\{([^}]+)\}\s*(.*?)(?=\\bibitem|\\end\{thebibliography\})",
        tex, re.S)
    refs = []
    for key, body in items:
        body = " ".join(body.split())
        m = re.search(r"arXiv:(\d{4}\.\d{4,5})", body)
        if not m:
            continue
        aid = m.group(1)
        tm = re.search(r"\((\d{4})\)\.\s*(.*?)\s*arXiv:", body)
        title = tm.group(2).rstrip(".").strip() if tm else ""
        year = tm.group(1) if tm else ""
        first_author = body.split("(")[0].strip().split(",")[0].strip()
        refs.append({"key": key, "id": aid, "year": year,
                     "first_author": first_author, "title": title})
    return refs


class EmptyFeed(RuntimeError):
    """arXiv returned a feed with no usable entry for a non-empty id_list."""


def backfill_missing(ids, lookup, fetch, delay=DELAY_S, attempts=4):
    """Re-query any IDs a batched id_list response omitted.

    arXiv's id_list endpoint can return fewer entries than were requested, and
    the omission is silent: the response parses cleanly, so the batch loop's
    exception retry never fires. Every omitted ID then reads as a paper that
    does not exist. That is a false NOT_FOUND in a release gate, and repeated
    runs over the same input disagree with each other.

    An ID is only genuinely unresolvable when its own single-ID query survives
    the retry ladder and still returns nothing. Retries back off exponentially,
    because the usual cause of an omission is throttling and hammering the API
    at a fixed interval reproduces it.

    Mutates `lookup` and returns the set of IDs whose every attempt failed at
    the transport layer. Those are unverified, not absent, and the caller must
    keep the two apart.
    """
    missing = [i for i in ids if i not in lookup]
    if not missing:
        return set()
    print(f"  re-querying {len(missing)} id(s) omitted from batch responses")
    unverified = set()
    for aid in missing:
        errors = 0
        for attempt in range(attempts):
            try:
                found = fetch([aid])
            except Exception as exc:
                found, errors = {}, errors + 1
                if attempt == attempts - 1:
                    print(f"  {aid}: single fetch failed: {exc}", file=sys.stderr)
            if found:
                lookup.update(found)
                break
            if attempt < attempts - 1:
                time.sleep(delay * 2 ** attempt)
        else:
            if errors == attempts:
                unverified.add(aid)
        time.sleep(delay)
    return unverified


def fetch_batch(ids):
    """Query the arXiv Atom API for a batch of IDs; return {id: {title, authors,
    published, updated}} keyed by the ID parsed from each entry itself."""
    url = f"{API}?id_list={','.join(ids)}&max_results={len(ids)}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "reference-audit/1.0 (mailto:steph.jarmak@gmail.com)"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        root = ET.fromstring(resp.read())
    out = {}
    entries = 0
    for entry in root.findall(f"{ATOM}entry"):
        entries += 1
        raw_id = (entry.findtext(f"{ATOM}id") or "")
        m = re.search(r"abs/(\d{4}\.\d{4,5})", raw_id)
        if not m:
            continue  # error placeholder entry for a malformed ID
        out[m.group(1)] = {
            "title": " ".join((entry.findtext(f"{ATOM}title") or "").split()),
            "authors": [a.findtext(f"{ATOM}name")
                        for a in entry.findall(f"{ATOM}author")],
            "published": entry.findtext(f"{ATOM}published") or "",
            "updated": entry.findtext(f"{ATOM}updated") or "",
        }
    if ids and not entries:
        # A feed with no entry at all for a non-empty id_list is a transport
        # result, not an answer about the papers: arXiv returns one when it is
        # throttling. Treating it as content marks every ID in the batch as
        # nonexistent, which is how this audit reported 164 OK on one run and
        # 149 OK on the next over identical input. Raise so the caller backs off.
        #
        # An error placeholder entry is different. arXiv answered, and the
        # answer is that it has no such paper, so that case falls through as an
        # empty result and is reported as NOT_FOUND rather than unverified.
        raise EmptyFeed(f"empty feed for {len(ids)} id(s) starting {ids[0]}")
    return out


def load_cache(cache_path: str):
    data = json.load(open(cache_path, encoding="utf-8"))
    return {r["id"]: r.get("metadata", {}) for r in data.get("arxiv", [])}


def surname_matches(cited_first_author: str, actual_authors) -> bool:
    if not actual_authors:
        return False
    cited = norm(cited_first_author.split()[-1]) if cited_first_author else ""
    # tolerate name-order flips (e.g. "Liu Xiangyan" vs "Xiangyan Liu")
    tokens = {norm(t) for a in actual_authors if a for t in a.split()}
    return bool(cited) and cited in tokens


def audit(refs, lookup, source_label, unverified=()):
    findings, ok = [], 0
    unverified = set(unverified)
    for r in refs:
        actual = lookup.get(r["id"])
        if actual is None:
            # An ID the source never answered for is not evidence against the
            # reference. Saying NOT_FOUND here is how a throttled run turns a
            # correct bibliography into a page of false findings.
            verdict = "UNVERIFIED" if r["id"] in unverified else "NOT_FOUND"
            detail = (f"{source_label} could not be reached for this id"
                      if verdict == "UNVERIFIED" else f"no record in {source_label}")
            findings.append({**r, "verdict": verdict, "detail": detail})
            continue
        problems = []
        t_sim = similarity(r["title"], actual.get("title", ""))
        if t_sim < TITLE_THRESHOLD:
            problems.append(
                f"TITLE_MISMATCH (sim={t_sim:.2f}): cited "
                f"\"{r['title']}\" vs actual \"{actual.get('title','')}\"")
        if actual.get("authors") is not None and \
                not surname_matches(r["first_author"], actual.get("authors")):
            problems.append(
                f"AUTHOR_MISMATCH: cited \"{r['first_author']}\" vs actual "
                f"{(actual.get('authors') or ['<none>'])[:3]}")
        pub_year = (actual.get("published") or "")[:4]
        if pub_year and r["year"] and pub_year != r["year"]:
            # arXiv 'published' is v1; a later journal year is not an error,
            # so only flag when the cited year predates v1.
            if r["year"] < pub_year:
                problems.append(
                    f"YEAR_SUSPECT: cited ({r['year']}) but v1 published {pub_year}")
        if problems:
            findings.append({**r, "verdict": "; ".join(problems),
                             "updated": actual.get("updated", "")})
        else:
            ok += 1
    return ok, findings


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    ap.add_argument("--repo", default=".", help="repo root")
    ap.add_argument("--tex", default=None,
                    help="path to references.tex (default: <repo>/manuscript/references.tex)")
    ap.add_argument("--offline", action="store_true",
                    help="compare against companion/reference-metadata.json instead of the live API")
    ap.add_argument("--out", default=None, help="write a markdown report here")
    args = ap.parse_args()

    tex_path = args.tex or f"{args.repo}/manuscript/references.tex"
    refs = parse_references(tex_path)
    unparsed = [r for r in refs if not r["title"]]
    print(f"parsed {len(refs)} arXiv references from {tex_path}"
          + (f" ({len(unparsed)} with unparseable titles)" if unparsed else ""))

    unverified = set()
    if args.offline:
        lookup = load_cache(f"{args.repo}/companion/reference-metadata.json")
        label = "companion cache (NOT ground truth: cached titles can be stale "\
                "if a paper was retitled after the snapshot)"
    else:
        lookup, ids = {}, [r["id"] for r in refs]
        for i in range(0, len(ids), BATCH):
            batch = ids[i:i + BATCH]
            for attempt in range(3):
                try:
                    lookup.update(fetch_batch(batch))
                    break
                except Exception as e:
                    if attempt == 2:
                        print(f"  batch {batch[0]}..{batch[-1]} failed: {e}",
                              file=sys.stderr)
                    else:
                        time.sleep(10 * 2 ** attempt)
            print(f"  fetched {min(i + BATCH, len(ids))}/{len(ids)}")
            if i + BATCH < len(ids):
                time.sleep(DELAY_S)
        unverified = backfill_missing(ids, lookup, fetch_batch)
        label = "live arXiv API"

    ok, findings = audit(refs, lookup, label, unverified)
    skipped = [f for f in findings if f["verdict"] == "UNVERIFIED"]
    lines = [f"# arXiv reference audit — {time.strftime('%Y-%m-%d')}",
             f"\nSource of truth: {label}",
             f"\n**{ok} OK / {len(findings) - len(skipped)} flagged / "
             f"{len(skipped)} unverified / {len(refs)} total**\n"]
    if skipped:
        lines.append(
            f"\n{len(skipped)} reference(s) could not be checked because the API"
            " did not answer for them, usually rate limiting (HTTP 429). They are"
            " reported as unverified, not as missing papers. Re-run after a"
            " cooldown before treating this audit as complete.\n")
    for f in findings:
        lines.append(f"- `{f['id']}` (bibkey `{f['key']}`): {f['verdict']}")
        if f.get("updated"):
            lines.append(f"  - record last updated {f['updated'][:10]} — if the"
                         " title changed between versions, decide whether to cite"
                         " the current title or pin the version you read (vN).")
    report = "\n".join(lines) + "\n"
    print("\n" + report)
    if args.out:
        open(args.out, "w", encoding="utf-8").write(report)
        print(f"report written to {args.out}")
    sys.exit(1 if findings else 0)


if __name__ == "__main__":
    main()
