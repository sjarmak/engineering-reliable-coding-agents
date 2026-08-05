# Engineering Reliable Coding Agents: companion research artifact

Release candidate 1.0.0-rc.1, prepared August 5, 2026.

This package accompanies *Engineering Reliable Coding Agents: Evaluation, Recovery, Context, and Control Beyond the Model*. It is designed to be archived as a separate, citable research artifact. The final archival release should receive its own DOI and should be cited alongside the manuscript.

Canonical repository: [https://github.com/sjarmak/engineering-reliable-coding-agents](https://github.com/sjarmak/engineering-reliable-coding-agents)

## Contents

- `catalog.json`: all 192 bounded practices, including evidence and boundary conditions.
- `evidence-ledger.csv`: one row per evidence item or corroborating item.
- `chapter-crosswalk.json`: the 55 practices developed in the manuscript and the 137 companion-only entries.
- `benchmark-catalog.json`: 29 coding-agent benchmark records.
- `reference-metadata.json`: resolved arXiv, DOI, and web-source metadata from the manuscript audit.
- `schemas/`: JSON Schemas for the catalog and benchmark records.
- `PROVENANCE.md`: source snapshot, transformations, evidence definitions, and release exclusions.
- `CITATION.cff`: citation metadata for GitHub and archival services.
- `SHA256SUMS`: checksums for the release files.

## Evidence vocabulary

`strong` directly supports the stated claim through a controlled comparison, validated benchmark result, or comparably specific measurement. `directional` supports the mechanism or direction without establishing magnitude or broad transfer. `corroborating` establishes plausibility through a case or convergent observation. `null_or_conflicting` records a result that did not support the expected effect or limits another claim.

Author-system cases are labeled `author_system_illustration` and set `independent_external_evidence` to `false`. They illustrate mechanisms and failure cases but do not support general claims independently.

## Before public release

Replace this release-candidate version with `1.0.0`, add the selected license, publish a tagged release in the canonical repository, archive that exact tag with Zenodo or another DOI-granting repository, and add the resulting DOI to this file and `CITATION.cff`. Do not archive internal review notes, rejected candidates, private receipts, or unpublished operational data.
