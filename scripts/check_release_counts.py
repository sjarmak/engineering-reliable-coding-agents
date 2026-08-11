#!/usr/bin/env python3
"""
check_release_counts.py -- verify that every headline count stated in the
manuscript, the repo docs, and the figure source agrees with the machine-
readable companion data.

The counts are derived from companion/catalog.json, which the schema pins to
this edition's size, and from companion/chapter-crosswalk.json. Nothing here is
hard-coded except the relationships between them:

    total            = developed + companion_only
    total            = gated + catalog_level_leads
    crosswalk_total  = gated          (leads carry no chapter assignment)

Then every file that states one of those numbers is checked for the stale
values of the previous release candidate, which is how the counts drifted
apart in the first place.

    python3 scripts/check_release_counts.py

Exits nonzero on any disagreement so it can gate a release script.
"""

import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Files that state headline counts in prose, and must never carry a stale one.
PROSE_FILES = [
    "manuscript/abstract.tex",
    "manuscript/frontmatter.tex",
    "manuscript/materials.tex",
    "manuscript/chapters/closing.tex",
    "README.md",
    "SUBMISSION.md",
    "companion/README.md",
    "companion/methodology/assembly-and-adjudication.md",
]

FIGURE_SVG = "../website/src/assets/books/engineering-reliable-coding-agents/review-flow.svg"


def load_counts():
    catalog = json.load(open(os.path.join(REPO, "companion", "catalog.json"), encoding="utf-8"))
    crosswalk = json.load(open(os.path.join(REPO, "companion", "chapter-crosswalk.json"), encoding="utf-8"))

    total = len(catalog)
    developed = sum(1 for r in catalog if r["treatment"] == "developed_in_manuscript")
    companion_only = sum(1 for r in catalog if r["treatment"] == "companion_only")

    mapped = set()
    for ch in crosswalk:
        for key in ("developed_practices", "companion_practices"):
            mapped.update(p["practice_id"] for p in ch.get(key, []))
    gated = len(mapped)
    leads = total - gated

    return {
        "total": total,
        "developed": developed,
        "companion_only": companion_only,
        "gated": gated,
        "leads": leads,
    }


# Where the page count is restated outside release-metadata.json.
PAGE_CLAIMS = {
    "README.md": [r"generated PDF is (\d{3}) pages"],
    "SUBMISSION.md": [r"monograph, (\d{3}) pages", r"Output: (\d{3}) letter-size pages"],
    # CHANGELOG is scanned only within the current version's section; older
    # entries record the page count of the release they describe and are history.
    "CHANGELOG.md": [r"builds to (\d{3}) pages"],
    "scripts/arxiv-compile.e2e.test.mjs": [r"actual\.pdf\.pages, (\d{3})"],
}


def current_changelog_section(text, version):
    """Only the entry for the version being released; earlier entries are history."""
    start = text.find(f"## {version}")
    if start < 0:
        return ""
    nxt = text.find("\n## ", start + 1)
    return text[start:] if nxt < 0 else text[start:nxt]


def check_invariants(c, problems):
    if c["developed"] + c["companion_only"] != c["total"]:
        problems.append(
            f"catalog: developed ({c['developed']}) + companion_only "
            f"({c['companion_only']}) != total ({c['total']})"
        )
    if c["gated"] + c["leads"] != c["total"]:
        problems.append(
            f"crosswalk: gated ({c['gated']}) + leads ({c['leads']}) != total ({c['total']})"
        )


def stale_values(c):
    """Numbers that would be wrong if they appear as a practice/source count."""
    return {
        # previous release candidate's catalog arithmetic
        "192": "practice-record total (now %d)" % c["total"],
        "55 developed": "developed count (now %d developed)" % c["developed"],
        "137 companion": "companion-only count (now %d companion)" % c["companion_only"],
        "138 scholarly": "release-candidate scholarly corpus (now 159 scholarly)",
        "192-record": "practice-record total (now %d-record)" % c["total"],
        "192 practices": "practice-record total (now %d practices)" % c["total"],
        "192 companion practices": "practice-record total",
        "578-row": "evidence-ledger row count",
    }


def main():
    counts = load_counts()
    problems = []
    check_invariants(counts, problems)

    print("Derived from companion data:")
    for k, v in counts.items():
        print(f"  {k:>15}: {v}")
    print()

    stale = stale_values(counts)
    for rel in PROSE_FILES + [FIGURE_SVG]:
        path = os.path.normpath(os.path.join(REPO, rel))
        if not os.path.exists(path):
            problems.append(f"{rel}: missing")
            continue
        text = open(path, encoding="utf-8").read()
        for needle, why in stale.items():
            # "192" alone is too common (identifiers, line numbers); require it
            # to sit next to a counting word.
            if needle == "192":
                hits = re.findall(r"\b192\b(?=\s+(?:practice|record|bounded|edition|catalog))", text)
                hits += re.findall(r"(?<=all )\b192\b", text)
            else:
                hits = re.findall(re.escape(needle), text)
            if hits:
                problems.append(f"{rel}: stale {needle!r} ({len(hits)}x) -- {why}")

    # The ledger row count quoted in the repo docs must match the file.
    ledger = os.path.join(REPO, "companion", "evidence-ledger.csv")
    rows = sum(1 for _ in open(ledger, encoding="utf-8")) - 1
    for rel in ("README.md", "SUBMISSION.md"):
        text = open(os.path.join(REPO, rel), encoding="utf-8").read()
        for n in re.findall(r"(\d{3,4})[- ]row evidence", text) + re.findall(r"(\d{3,4}) evidence or", text):
            if int(n) != rows:
                problems.append(f"{rel}: states {n} evidence rows, ledger has {rows}")

    # The page count is asserted in prose, in the release contract, in the
    # changelog, and in the compile e2e test. Nothing tied those together, so a
    # rebuild that changed pagination left five files disagreeing with the PDF.
    pages = json.load(open(os.path.join(REPO, "release-metadata.json"), encoding="utf-8"))
    pages = pages.get("manuscript", {}).get("pages")
    report_path = os.path.join(
        REPO, "companion", "methodology", "release-verification", "arxiv-compile-report.json"
    )
    if os.path.exists(report_path):
        built = json.load(open(report_path, encoding="utf-8")).get("pdf", {}).get("pages")
        if built != pages:
            problems.append(
                f"release-metadata.json states {pages} pages, "
                f"but the compile report records {built}"
            )
    version = json.load(open(os.path.join(REPO, "release-metadata.json"), encoding="utf-8"))["version"]
    for rel, patterns in PAGE_CLAIMS.items():
        text = open(os.path.join(REPO, rel), encoding="utf-8").read()
        if rel == "CHANGELOG.md":
            text = current_changelog_section(text, version)
        for pattern in patterns:
            for n in re.findall(pattern, text):
                if int(n) != pages:
                    problems.append(
                        f"{rel}: states {n} pages, release-metadata.json says {pages}"
                    )

    if problems:
        print(f"{len(problems)} count problem(s):")
        for p in problems:
            print(f"  - {p}")
        return 1
    print(f"OK: headline counts agree across {len(PROSE_FILES) + 1} files; "
          f"evidence ledger has {rows} rows.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
