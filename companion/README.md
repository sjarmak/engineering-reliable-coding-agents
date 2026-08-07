# Engineering Reliable Coding Agents: companion research artifact

Release candidate 1.0.0-rc.13, prepared August 6, 2026.

This package accompanies *Engineering Reliable Coding Agents: Evaluation, Recovery, Context, and Control Beyond the Model*. It is designed to be archived as a separate, citable research artifact. The final archival release should receive its own DOI and should be cited alongside the manuscript.

Review the interactive [website companion](https://sjarmak.ai/books/engineering-reliable-coding-agents/companion), or read the complete chapter-organized catalog in [`LEARNINGS.md`](LEARNINGS.md).

Reusable agent workflows derived from selected practices are published separately in the repository's [`skills/` collection](https://github.com/sjarmak/engineering-reliable-coding-agents/tree/main/skills). They are implementation artifacts, not additional evidence.

Canonical repository: [https://github.com/sjarmak/engineering-reliable-coding-agents](https://github.com/sjarmak/engineering-reliable-coding-agents)

## Contents

- `LEARNINGS.md`: human-readable, chapter-organized presentation of the 192 practice records in this edition, including stable IDs, actions, mechanisms, evidence, and boundaries.
- `catalog.json`: the 192 bounded practice records in this edition in machine-readable form, including the bounded August 6 evidence additions. The count reflects this edition's granularity decisions; it is not an estimate of how many reliability practices exist.
- `evidence-ledger.csv`: one row per evidence item or corroborating item.
- `chapter-crosswalk.json`: the 55 practices developed in the manuscript and the 137 companion-only entries.
- `benchmark-catalog.json`: 29 coding-agent benchmark records.
- `reference-metadata.json`: resolved arXiv, DOI, and web-source metadata from the manuscript audit.
- `WEB-SOURCE-PRESERVATION.md`: canonical and archived URLs for retained practitioner sources on mutable hosts.
- `methodology/`: corpus snapshots, thread protocols and source identities, search records, record-level update decisions, the self-contained independent-grading replication packet and disclosed nonperformance status, the supplementary software-engineering search plans, DBLP title-census replacement evidence and full-text support notes, the human/automated adjudication boundary, and the exact arXiv compilation report.
- `schemas/`: JSON Schemas for the catalog and benchmark records.
- `PROVENANCE.md`: source snapshot, transformations, evidence definitions, and release exclusions.
- `CITATION.cff`: citation metadata for GitHub and archival services.
- `SHA256SUMS`: checksums for the release files.

## Evidence vocabulary

`strong` directly supports the stated claim through a controlled comparison, validated benchmark result, or comparably specific measurement. `directional` supports the mechanism or direction without establishing magnitude or broad transfer. `corroborating` establishes plausibility through a case or convergent observation. `null_or_conflicting` records a result that did not support the expected effect or limits another claim.

Author-system cases are labeled `author_system_illustration` and set `independent_external_evidence` to `false`. They illustrate mechanisms and failure cases but do not support general claims independently.

## Before public release

Complete the publisher-native ACM Digital Library and IEEE Xplore searches described under `methodology/software-engineering-coverage/`, and either execute Scopus or accept the documented non-equivalent DBLP fallback after screening its 50 records absent from both prior comparison sets. Preserve the explicit v1 boundary in `methodology/external-grading/status.json`: no external graders were commissioned, no agreement statistic is reported, and no independent-calibration claim is made. Then replace this release-candidate version with `1.0.0`, add the selected license, rebuild the exact archives, regenerate `methodology/release-verification/arxiv-compile-report.json`, publish a tagged release in the canonical repository, archive those exact objects with Zenodo or another DOI-granting repository, and add the resulting DOI to this file and `CITATION.cff`. Do not archive internal review notes, rejected candidates, private receipts, or unpublished operational data.
