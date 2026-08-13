# Engineering Reliable Coding Agents: companion research artifact

Version 1.0.0, frozen August 11, 2026.

This package accompanies *Engineering Reliable Coding Agents: Evaluating and Operating the System Around the Model*. It is designed to be archived as a separate, citable research artifact and should be cited alongside the manuscript.

Review the interactive [website companion](https://sjarmak.ai/books/engineering-reliable-coding-agents/companion), or read the complete chapter-organized catalog in [`LEARNINGS.md`](LEARNINGS.md).

Reusable agent workflows derived from selected practices are published separately in the repository's [`skills/` collection](https://github.com/sjarmak/engineering-reliable-coding-agents/tree/main/skills). They are implementation artifacts, not additional evidence.

Canonical repository: [https://github.com/sjarmak/engineering-reliable-coding-agents](https://github.com/sjarmak/engineering-reliable-coding-agents)

## Contents

- `LEARNINGS.md`: human-readable, chapter-organized presentation of the practice records in this edition, including stable IDs, actions, mechanisms, evidence, and boundaries.
- `catalog.json`: 206 reliability records: 193 gated practices, including 56 developed in depth, plus 13 research leads (ERCA-193 through ERCA-205). The machine-readable count reflects this edition's granularity decisions; it is not an estimate of how many reliability practices exist.
- `evidence-ledger.csv`: one row per evidence item or corroborating item.
- `chapter-crosswalk.json`: the 56 practices developed in the manuscript and the 137 chapter-assigned companion-only practices; the 13 research leads remain outside the gated crosswalk.
- `benchmark-catalog.json`: 29 coding-agent benchmark records.
- `reference-metadata.json`: resolved arXiv, DOI, and web-source metadata from the manuscript audit.
- `WEB-SOURCE-PRESERVATION.md`: canonical and archived URLs for retained practitioner sources on mutable hosts.
- `methodology/`: corpus snapshots, thread protocols and source identities, search records, record-level update decisions, the self-contained independent-grading replication packet and disclosed nonperformance status, the supplementary software-engineering search plans, DBLP title-census replacement evidence and full-text support notes, the human/automated adjudication boundary, and the exact arXiv compilation report.
- `schemas/`: JSON Schemas for the catalog and benchmark records.
- `PROVENANCE.md`: source snapshot, transformations, evidence definitions, and release exclusions.
- `CITATION.cff`: citation metadata for GitHub and archival services.
- `SHA256SUMS`: checksums for the release files.

## Practice identifiers

Every catalog record carries a stable identifier of the form `ERCA-NNN`, after the initials of *Engineering Reliable Coding Agents*. The same identifier names that record in the manuscript's chapter evidence profiles and source sections, `catalog.json`, `evidence-ledger.csv`, `chapter-crosswalk.json`, the runnable protocols, and the skill evidence maps, so a record can be traced across all of them. Identifiers are never reused: a later edition may retire, split, or merge a record, but its number will not be reassigned to a different practice. Resolve one in [`catalog.json`](catalog.json) or on the [companion site](https://sjarmak.ai/books/engineering-reliable-coding-agents/companion).

## Evidence vocabulary

`strong` directly supports the stated claim through a controlled comparison, validated benchmark result, or comparably specific measurement. `directional` supports the mechanism or direction without establishing magnitude or broad transfer. `corroborating` establishes plausibility through a case or convergent observation. `null_or_conflicting` records a result that did not support the expected effect or limits another claim.

Author-system cases are labeled `author_system_illustration` and set `independent_external_evidence` to `false`. They illustrate mechanisms and failure cases but do not support general claims independently.

## License

The companion is released under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/). Share and adapt it with attribution to the author and an indication of changes. Directory-level terms for the rest of the repository are in [`LICENSE-SCOPE.md`](https://github.com/sjarmak/engineering-reliable-coding-agents/blob/main/LICENSE-SCOPE.md).

## What a later edition should add

Two measured additions are out of scope for this edition and are disclosed as limitations rather than performed. First, have at least two independent readers complete the blinded external-grading packet, run the analyzer, and report agreement and disagreement patterns; this edition makes no independent-calibration claim. Second, execute and adjudicate every planned ACM Digital Library, IEEE Xplore, and Scopus cell; DBLP, OpenAlex, and web-surrogate discovery are useful diagnostics but are not provider-equivalent substitutes, so this edition makes no provider-coverage claim. Both packets ship here so a later edition can carry them out.

No archival DOI is assigned; the public repository is the citable source. If a later edition archives these objects with a DOI-granting repository, record the identifier in `release-metadata.json` and carry it into both `CITATION.cff` files, this README, the manuscript's data-availability statement, and the arXiv Comments field. Do not archive internal review notes, rejected candidates, private receipts, or unpublished operational data.
