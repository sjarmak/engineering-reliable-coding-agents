#!/usr/bin/env python3
"""
check_evidence_profiles.py -- validate the practice IDs each chapter's
"Evidence profile" names, against companion/catalog.json and the chapter's own
Sources section.

What this checks, and why it is not a row count. A profile counts the evidence
items the chapter presents. The ledger groups rows by practice, and a practice
carries rows the chapter never cites while a chapter cites works owned by
several practices at once. Comparing the two totals therefore compares two
different populations; an earlier version of this script did that and reported
drift in chapters whose profiles matched their Sources lists exactly. The
per-item counts are verified against the Sources prose during editing, and the
crosswalk gate covers catalog membership.

What is left is the claim a profile makes about provenance, which is exact:

  1. every ERCA id named in a profile exists in the catalog;
  2. ids in the "across N developed practices (...)" parenthetical are
     developed_in_manuscript and assigned to this chapter, and N matches;
  3. ids in a "carried by companion record(s) ... (...)" note are
     companion_only and own at least one work the chapter actually cites.

Rule 3 is the one that catches a real error: naming a companion record that
sounds right but supplies nothing the chapter quotes. A work counts as cited when its arXiv id appears in the Sources
section, when the first author's surname and the publication year both appear,
or when enough distinctive title words appear to be unambiguous. The surname
and year rule is what catches works the chapters cite by short name: ch09 names
Chubby without repeating its full title, and ch10 names Sieve, whose paper is
titled "Automatic Reliability Testing for Cluster Management Controllers".

    python3 scripts/check_evidence_profiles.py [--verbose]

Exits nonzero on any disagreement so it can gate a release script.
"""

import argparse
import collections
import csv
import glob
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PROFILE_RE = re.compile(
    r"\\textbf\{Evidence profile\.\}(?P<body>.*?)(?:\n\n|\\textbf\{Chapter claim)", re.S
)
SCOPE_RE = re.compile(r"across\s+(\d+)\s+developed practices?\s*\(([^)]*)\)")
COMPANION_RE = re.compile(r"carried by (?:a |the )?companion records?[^(]*\(([^)]*)\)")
PRACTICE_RE = re.compile(r"ERCA-\d+")
ARXIV_RE = re.compile(r"(\d{4}\.\d{4,5})")
CHAPTER_RE = re.compile(r"ch(\d+)-")

# Words too common across this corpus to identify a work on their own.
STOPWORDS = set(
    """the and for with from that this into over under llm llms agent agents code coding
    software systems system data model models large language evaluation using toward
    towards based multi analysis study empirical automated learning what when how does
    why generation generated framework approach method methods results towards case
    cases design designing engineering distributed""".split()
)
MIN_TITLE_TOKENS = 5
SURNAME_RE = re.compile(r"^\s*(?:[A-Z][\w.'-]*\s+)*?([A-Z][\w'-]{2,})\s*(?:,|\()")
YEAR_RE = re.compile(r"\((\d{4})\)")


def surname_and_year(citation):
    """First author's surname and publication year, as the ledger writes them."""
    name = SURNAME_RE.match(citation or "")
    year = YEAR_RE.search(citation or "")
    return (name.group(1) if name else None), (year.group(1) if year else None)


def tokens(text):
    return {
        w
        for w in re.findall(r"[a-z][a-z-]{4,}", (text or "").lower())
        if w not in STOPWORDS
    }


def load_catalog():
    path = os.path.join(REPO, "companion", "catalog.json")
    with open(path, encoding="utf-8") as fh:
        return {r["practice_id"]: r for r in json.load(fh)}


def load_ledger():
    path = os.path.join(REPO, "companion", "evidence-ledger.csv")
    by_practice = collections.defaultdict(list)
    with open(path, encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            by_practice[row["practice_id"]].append(row)
    return by_practice


def parse_profile(text):
    match = PROFILE_RE.search(text)
    if not match:
        return None
    body = match.group("body")
    scope = SCOPE_RE.search(body)
    companion = COMPANION_RE.search(body)
    return {
        "stated_count": int(scope.group(1)) if scope else None,
        "developed": PRACTICE_RE.findall(scope.group(2)) if scope else [],
        "companion": PRACTICE_RE.findall(companion.group(1)) if companion else [],
        "all_ids": PRACTICE_RE.findall(body),
    }


def sources_section(text):
    match = re.search(r"\\section\*?\{Sources[^}]*\}", text)
    return text[match.end():] if match else ""


def cited_works(rows, sources):
    """Rows whose work the Sources section demonstrably cites."""
    arxiv_ids = set(ARXIV_RE.findall(sources))
    source_tokens = tokens(sources)
    hits = []
    for row in rows:
        arxiv = row["arxiv"].strip()
        if arxiv and arxiv in arxiv_ids:
            hits.append(row)
            continue
        surname, year = surname_and_year(row["citation"])
        if surname and year and surname in sources and year in sources:
            hits.append(row)
            continue
        if len(tokens(row["citation"]) & source_tokens) >= MIN_TITLE_TOKENS:
            hits.append(row)
    return hits


def check_chapter(path, catalog, ledger):
    text = open(path, encoding="utf-8").read()
    profile = parse_profile(text)
    if profile is None:
        return None, []

    chapter = int(CHAPTER_RE.search(os.path.basename(path)).group(1))
    sources = sources_section(text)
    problems = []

    for pid in profile["all_ids"]:
        if pid not in catalog:
            problems.append(f"{pid} is named in the profile but absent from the catalog")

    if profile["stated_count"] is not None and profile["stated_count"] != len(profile["developed"]):
        problems.append(
            f"profile says {profile['stated_count']} developed practices "
            f"but lists {len(profile['developed'])}"
        )

    for pid in profile["developed"]:
        record = catalog.get(pid)
        if record is None:
            continue
        if record["treatment"] != "developed_in_manuscript":
            problems.append(
                f"{pid} is listed as a developed practice but the catalog marks it "
                f"{record['treatment']}"
            )
        if int(record.get("chapter") or 0) != chapter:
            problems.append(
                f"{pid} is listed under chapter {chapter} but the catalog assigns it to "
                f"chapter {record.get('chapter')}"
            )

    for pid in profile["companion"]:
        record = catalog.get(pid)
        if record is None:
            continue
        if record["treatment"] != "companion_only":
            problems.append(
                f"{pid} is cited as a companion record but the catalog marks it "
                f"{record['treatment']}"
            )
        if not cited_works(ledger.get(pid, []), sources):
            problems.append(
                f"{pid} is cited as supplying evidence but none of its ledger works "
                f"appear in this chapter's Sources section"
            )

    return profile, problems


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    catalog = load_catalog()
    ledger = load_ledger()

    checked = 0
    failed = []
    for path in sorted(glob.glob(os.path.join(REPO, "manuscript", "chapters", "ch*.tex"))):
        profile, problems = check_chapter(path, catalog, ledger)
        if profile is None:
            continue
        checked += 1
        name = os.path.basename(path)
        if problems:
            failed.append(name)
            print(f"## {name}")
            for problem in problems:
                print(f"   - {problem}")
            print()
        elif args.verbose:
            note = f", companion {', '.join(profile['companion'])}" if profile["companion"] else ""
            print(f"ok {name}: developed {', '.join(profile['developed']) or '(none)'}{note}")

    if failed:
        print(f"{len(failed)} of {checked} chapter evidence profiles name records that do not check out.")
        return 1
    print(f"OK: all {checked} chapter evidence profiles name records that check out "
          f"against the catalog and their own Sources sections.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
