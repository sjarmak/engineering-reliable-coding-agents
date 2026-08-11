#!/usr/bin/env python3
"""
audit_all_refs.py — audit every arXiv citation in the release, not just the ones
in references.tex, against the live arXiv record.

audit_arxiv_refs.py covers manuscript/references.tex. That misses three places a
title can go stale independently:

  * companion/evidence-ledger.csv  — carries its own citation string per item
  * companion/catalog.json         — carries its own citation string per item
  * manuscript/chapters/*.tex      — Sources entries quote titles in prose

The third is the one that bites after an upstream retitle: references.tex gets
corrected and a chapter's Sources entry keeps quoting the version the author
read. Any quoted title near an arXiv ID is compared against the live record and
against references.tex, so the two cannot drift apart silently.

    python3 scripts/audit_all_refs.py --out reference-audit/full-audit.md
    python3 scripts/audit_all_refs.py --offline    # companion cache, no network

Exits nonzero on any mismatch so it can gate a release script.
"""

import argparse
import collections
import csv
import difflib
import json
import os
import re
import sys
import time
import unicodedata
import urllib.request
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audit_arxiv_refs import backfill_missing  # noqa: E402  shared batch-omission repair

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ATOM = "{http://www.w3.org/2005/Atom}"
API = "https://export.arxiv.org/api/query"
BATCH = 20
DELAY_S = 3.0
TITLE_THRESHOLD = 0.82

ARXIV_RE = re.compile(r"arXiv:(\d{4}\.\d{4,5})", re.I)
ACCENT_RE = re.compile(r"\\[`'^\"~=.uvHtcdbkr]\s*\{?(\w)\}?")
# A title quoted in TeX: ``Some Title'' or \emph{Some Title}
QUOTED_RE = re.compile(r"``(.+?)''|\\emph\{([^}]{8,})\}", re.S)
# A note recording a title a paper used to carry. Deliberate history, not a
# claim about the current record, so the quoted title after it is not audited.
SUPERSEDED_RE = re.compile(
    r"(?:v\d+\s+record\s+carried\s+the\s+title|formerly\s+titled|retitled\s+from|"
    r"published\s+earlier\s+as)\s*[:,]?\s*(?:``.+?''|\\emph\{[^}]*\})",
    re.S | re.I,
)


GREEK = {"τ": "tau", "α": "alpha", "β": "beta", "γ": "gamma", "δ": "delta",
         "ε": "epsilon", "θ": "theta", "λ": "lambda", "μ": "mu", "π": "pi",
         "σ": "sigma", "φ": "phi", "ω": "omega"}


def norm(s: str) -> str:
    s = ACCENT_RE.sub(r"\1", s or "")
    s = s.replace("\\&", "&").replace("~", " ")
    for glyph, name in GREEK.items():
        s = s.replace(glyph, name)
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]", "", s.lower())


def similarity(a: str, b: str) -> float:
    return difflib.SequenceMatcher(None, norm(a), norm(b)).ratio()


def short_form(cited: str, actual: str) -> bool:
    """True when the cited string is a shortened way of naming the same paper:
    a subtitle dropped, a leading article dropped, or the distinctive phrase
    quoted out of a longer title."""
    c, a = norm(cited), norm(actual)
    return bool(c) and bool(a) and c in a


def compare(cited: str, actual: str):
    """Classify a cited title against the current record.

    Shortening a title is normal citation style and is not a defect. The
    reverse is: text that is not part of the title (journal volume, page
    numbers) pasted into the title field.
    """
    c, a = norm(cited), norm(actual)
    if not c or not a or c == a:
        return None, 1.0
    if short_form(cited, actual):
        return None, 1.0
    if a in c:
        return "EXTRA_METADATA", similarity(cited, actual)
    sim = similarity(cited, actual)
    return ("TITLE_MISMATCH", sim) if sim < TITLE_THRESHOLD else (None, sim)


def fetch_batch(ids):
    url = f"{API}?id_list={','.join(ids)}&max_results={len(ids)}"
    req = urllib.request.Request(
        url, headers={"User-Agent": "reference-audit/1.0 (mailto:steph.jarmak@gmail.com)"}
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        root = ET.fromstring(resp.read())
    out = {}
    entries = 0
    for entry in root.findall(f"{ATOM}entry"):
        entries += 1
        m = re.search(r"abs/(\d{4}\.\d{4,5})v?(\d*)", entry.findtext(f"{ATOM}id") or "")
        if not m:
            continue
        out[m.group(1)] = {
            "title": " ".join((entry.findtext(f"{ATOM}title") or "").split()),
            "authors": [a.findtext(f"{ATOM}name") for a in entry.findall(f"{ATOM}author")],
            "version": m.group(2),
            "updated": entry.findtext(f"{ATOM}updated") or "",
        }
    if ids and not entries:
        # No entry at all means arXiv never answered (it throttles this way).
        # An error placeholder entry means it did answer and has no such paper,
        # which falls through as an empty result and is reported as NOT_FOUND.
        raise EmptyFeed(f"empty feed for {len(ids)} id(s) starting {ids[0]}")
    return out


def fetch_all(ids):
    """Resolve every ID. Returns (lookup, unverified), where unverified holds
    IDs the API never answered for. Those must not be reported as missing
    papers; see backfill_missing."""
    lookup = {}
    ids = sorted(ids)
    for i in range(0, len(ids), BATCH):
        batch = ids[i:i + BATCH]
        for attempt in range(3):
            try:
                lookup.update(fetch_batch(batch))
                break
            except Exception as exc:
                if attempt == 2:
                    print(f"  batch {batch[0]}..{batch[-1]} failed: {exc}", file=sys.stderr)
                else:
                    time.sleep(10 * 2 ** attempt)
        print(f"  fetched {min(i + BATCH, len(ids))}/{len(ids)}")
        if i + BATCH < len(ids):
            time.sleep(DELAY_S)
    return lookup, backfill_missing(ids, lookup, fetch_batch)


def load_cache():
    data = json.load(open(os.path.join(REPO, "companion", "reference-metadata.json"), encoding="utf-8"))
    return {r["id"]: r.get("metadata", {}) for r in data.get("arxiv", [])}


def claims_from_references():
    """(id, title, where) for each bibitem in references.tex."""
    path = os.path.join(REPO, "manuscript", "references.tex")
    tex = open(path, encoding="utf-8").read()
    out = []
    for key, body in re.findall(
        r"\\bibitem\{([^}]+)\}\s*(.*?)(?=\\bibitem|\\end\{thebibliography\})", tex, re.S
    ):
        body = " ".join(body.split())
        m = ARXIV_RE.search(body)
        if not m:
            continue
        tm = re.search(r"\((\d{4})\)\.\s*(.*?)\s*arXiv:", body)
        title = tm.group(2).rstrip(".").strip() if tm else ""
        out.append((m.group(1), title, f"references.tex[{key}]"))
    return out


def claims_from_ledger():
    path = os.path.join(REPO, "companion", "evidence-ledger.csv")
    out = []
    for r in csv.DictReader(open(path, encoding="utf-8")):
        aid = (r.get("arxiv") or "").strip()
        if not aid:
            continue
        cite = " ".join((r.get("citation") or "").split())
        tm = re.search(r"\(\d{4}\)\.\s*(.*?)\s*arXiv:", cite)
        title = tm.group(1).rstrip(".").strip() if tm else ""
        out.append((aid, title, f"evidence-ledger[{r['practice_id']}/{r['evidence_id']}]"))
    return out


def claims_from_catalog():
    path = os.path.join(REPO, "companion", "catalog.json")
    out = []

    def walk(node, pid):
        if isinstance(node, dict):
            aid = str(node.get("arxiv") or "").strip()
            cite = " ".join(str(node.get("citation") or "").split())
            if aid and cite:
                tm = re.search(r"\(\d{4}\)\.\s*(.*?)\s*arXiv:", cite)
                if tm:
                    out.append((aid, tm.group(1).rstrip(".").strip(), f"catalog[{pid}]"))
            for v in node.values():
                walk(v, pid)
        elif isinstance(node, list):
            for v in node:
                walk(v, pid)

    for rec in json.load(open(path, encoding="utf-8")):
        walk(rec, rec.get("practice_id"))
    return out


def claims_from_chapters():
    """Titles quoted in chapter prose within the same item/sentence as an arXiv ID."""
    out = []
    chapters = sorted(
        f for f in os.listdir(os.path.join(REPO, "manuscript", "chapters"))
        if f.endswith(".tex")
    )
    for name in chapters:
        text = open(os.path.join(REPO, "manuscript", "chapters", name), encoding="utf-8").read()
        # Split into \item / paragraph units so a quoted title is attributed to
        # the ID it actually sits beside.
        for chunk in re.split(r"\\item\b|\n\n", text):
            chunk = SUPERSEDED_RE.sub(" ", chunk)
            ids = ARXIV_RE.findall(chunk)
            if len(ids) != 1:
                continue  # ambiguous or absent: skip rather than guess
            titles = [" ".join((a or b).split()) for a, b in QUOTED_RE.findall(chunk)]
            titles = [t for t in titles if len(t) >= 12]
            if not titles:
                continue
            # A chunk may legitimately cover several works while carrying one
            # arXiv ID -- an item that cites a paper alongside a blog account of
            # the same result, for instance. Only one of those titles belongs to
            # the ID, so the alternatives travel together and the ID passes if
            # any of them matches upstream.
            out.append((ids[0], titles[0], f"{name}", titles[1:]))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--offline", action="store_true")
    ap.add_argument("--out", default=None)
    args = ap.parse_args()

    claims = (
        claims_from_references()
        + claims_from_ledger()
        + claims_from_catalog()
        + claims_from_chapters()
    )
    # references/ledger/catalog claims carry no alternatives; normalise the shape.
    claims = [c if len(c) == 4 else (c[0], c[1], c[2], []) for c in claims]
    ids = {c[0] for c in claims}
    print(f"collected {len(claims)} cited titles across {len(ids)} unique arXiv IDs")

    if args.offline:
        lookup, label = load_cache(), "companion cache (can be stale after an upstream retitle)"
        unverified = set()
    else:
        lookup, unverified = fetch_all(ids)
        label = "live arXiv API"

    findings = []
    unchecked = []
    checked = 0
    matched_title = {}
    for aid, title, where, alternatives in claims:
        actual = lookup.get(aid)
        if actual is None:
            # Absence of an answer is not an answer. Only an ID the API
            # affirmatively lacked belongs in findings; one it never responded
            # for is unverified, and reporting it as missing turns a throttled
            # run into a page of false findings against a correct bibliography.
            if aid in unverified:
                unchecked.append((aid, where))
            else:
                findings.append((aid, where, f"NOT_FOUND in {label}"))
            continue
        if not title:
            continue  # nothing to compare; the ID itself resolved
        checked += 1
        verdict, sim = compare(title, actual.get("title", ""))
        for alternative in alternatives:
            if verdict is None:
                break
            alt_verdict, alt_sim = compare(alternative, actual.get("title", ""))
            if alt_verdict is None:
                verdict, sim, title = None, alt_sim, alternative
        matched_title[(aid, where)] = title
        if verdict:
            findings.append(
                (aid, where,
                 f'{verdict} (sim={sim:.2f}): cited "{title}" vs current "{actual.get("title", "")}"')
            )

    # Same ID cited with materially different titles in different places.
    by_id = collections.defaultdict(set)
    for aid, title, where, _ in claims:
        # Compare the title that actually belongs to the ID, not every title
        # that happened to share a bullet with it.
        title = matched_title.get((aid, where), title)
        if title:
            by_id[aid].add(title)
    for aid, titles in sorted(by_id.items()):
        titles = list(titles)
        for i in range(len(titles)):
            for j in range(i + 1, len(titles)):
                if short_form(titles[i], titles[j]) or short_form(titles[j], titles[i]):
                    continue  # one is a short form of the other
                if similarity(titles[i], titles[j]) < TITLE_THRESHOLD:
                    findings.append(
                        (aid, "internal",
                         f'INTERNAL_DISAGREEMENT: "{titles[i]}" vs "{titles[j]}"')
                    )

    lines = [
        f"# Full arXiv citation audit — {time.strftime('%Y-%m-%d')}",
        f"\nSource of truth: {label}",
        f"\nScope: references.tex, evidence ledger, catalog, and chapter prose.",
        f"\n**{len(claims)} cited titles / {len(ids)} unique IDs / {checked} title comparisons / "
        f"{len(findings)} flagged / {len(unchecked)} unverified**\n",
    ]
    if unchecked:
        lines.append(
            f"\n{len(unchecked)} citation(s) could not be checked because the API"
            " did not answer for their IDs, usually rate limiting (HTTP 429)."
            " They are unverified, not missing papers. Re-run after a cooldown"
            " before treating this audit as complete.\n")
        for aid, where in unchecked:
            lines.append(f"- `{aid}` in `{where}`: UNVERIFIED")
    for aid, where, verdict in findings:
        lines.append(f"- `{aid}` in `{where}`: {verdict}")
    report = "\n".join(lines) + "\n"
    print("\n" + report)
    if args.out:
        open(os.path.join(REPO, args.out), "w", encoding="utf-8").write(report)
        print(f"report written to {args.out}")
    # Unverified citations fail the gate too. A release must not pass on an
    # audit that could not reach the source, but the report says which of the
    # two happened so the reader is not sent chasing correct references.
    return 1 if findings or unchecked else 0


if __name__ == "__main__":
    sys.exit(main())
