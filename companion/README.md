# Engineering Reliable Coding Agents: companion research artifact

Release candidate 1.0.0-rc.16, prepared August 9, 2026.

This package accompanies *Engineering Reliable Coding Agents: Evaluating and Operating the System Around the Model*. It is designed to be archived as a separate, citable research artifact. The final archival release should receive its own DOI and should be cited alongside the manuscript.

Review the interactive [website companion](https://sjarmak.ai/books/engineering-reliable-coding-agents/companion), or read the complete chapter-organized catalog in [`LEARNINGS.md`](LEARNINGS.md).

Reusable agent workflows derived from selected practices are published separately in the repository's [`skills/` collection](https://github.com/sjarmak/engineering-reliable-coding-agents/tree/main/skills). They are implementation artifacts, not additional evidence.

Canonical repository: [https://github.com/sjarmak/engineering-reliable-coding-agents](https://github.com/sjarmak/engineering-reliable-coding-agents)

## Contents

- `LEARNINGS.md`: human-readable, chapter-organized presentation of the practice records in this edition, including stable IDs, actions, mechanisms, evidence, and boundaries.
- `catalog.json`: the 206 bounded practice records in this edition in machine-readable form, including the bounded August 6 evidence additions and the distributed-systems catalog-level entries (ERCA-193 through ERCA-205). The count reflects this edition's granularity decisions; it is not an estimate of how many reliability practices exist.
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

## Before stable release

Have at least two independent readers complete the blinded external-grading packet, run the analyzer, and report agreement and disagreement patterns. Execute and adjudicate every planned ACM Digital Library, IEEE Xplore, and Scopus cell; DBLP, OpenAlex, and web-surrogate discovery are useful diagnostics but are not provider-equivalent substitutes. Then replace this release-candidate version with `1.0.0`, add the selected license, rebuild the exact source and companion archives, regenerate `methodology/release-verification/arxiv-compile-report.json`, verify the PDF extraction and running headers, freeze all repository and website metadata to the same immutable version, publish the authorized tag, archive those exact objects with a DOI-granting repository, and submit the verified LaTeX source ZIP to arXiv. Do not archive internal review notes, rejected candidates, private receipts, or unpublished operational data.
