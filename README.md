# Engineering Reliable Coding Agents

*Evaluation, Recovery, Context, and Control Beyond the Model*

This repository contains the manuscript source and companion research artifact
for Stephanie Jarmak's technical review and engineering monograph on the
evaluation, operation, and governance of AI coding-agent systems.

The review treats coding agents as systems rather than isolated models. Its
contributions include an evidence audit, a catalog of 192 bounded engineering
practices, a dependency chain across evaluation and operation, scoped
author-system measurements and failure cases, and runnable evaluation and
fault-testing protocols.

## Repository contents

| Path | Contents |
| --- | --- |
| [`manuscript/`](manuscript/) | Complete, compilable LaTeX source with 18 chapters, a closing chapter, 17 figures, 7 numbered tables, a glossary, and 213 references |
| [`editing/engineering-reliable-coding-agents.md`](editing/engineering-reliable-coding-agents.md) | Complete human-editable Markdown rendering with section-level mappings back to the canonical TeX files |
| [`companion/`](companion/) | Human-readable learnings plus the machine-readable practice catalog, evidence ledger, chapter crosswalk, benchmark catalog, review-method records, schemas, web-source preservation record, checksums, citation metadata, and provenance |
| [`protocols/`](protocols/) | Six runnable protocols and a minimum reliability pass, each with a decision, inputs, bounded procedure, pass condition, retained artifact, and stable practice mappings |
| [`skills/`](skills/) | Five reusable agent skills derived from the evaluation, verification, failure-analysis, and durable-execution practices |
| [`SUBMISSION.md`](SUBMISSION.md) | Paste-ready arXiv metadata, packaging decisions, license and endorsement notes, audit results, and upload checklist |
| [`CITATION.cff`](CITATION.cff) | Repository-level citation metadata |
| [`LICENSE-SCOPE.md`](LICENSE-SCOPE.md) | Current license boundaries for the manuscript, data, and repository infrastructure |

Read the [browser-based book](https://sjarmak.ai/books/engineering-reliable-coding-agents)
or use the [interactive companion catalog](https://sjarmak.ai/books/engineering-reliable-coding-agents/companion)
for chapter navigation, filtering, and graph exploration.

## Edit the manuscript in Markdown

Use [`editing/engineering-reliable-coding-agents.md`](editing/engineering-reliable-coding-agents.md)
for prose editing. Its `tex-sync` comments map every section to the exact TeX file that must
receive the approved change. After editing, run:

```sh
node scripts/editable-manuscript.mjs --status
```

The status report distinguishes Markdown-only edits, TeX-only drift, and conflicts. See
[`editing/README.md`](editing/README.md) for the reconciliation and regeneration workflow.

## Build the manuscript

The top-level TeX file is `manuscript/main.tex`. Tectonic remains a convenient
local preview compiler:

```sh
cd manuscript
tectonic main.tex
```

The generated PDF is 271 pages on US letter paper. The source uses standard
LaTeX packages and contains all required figures locally.

The arXiv compatibility contract uses XeLaTeX under TeX Live 2025. The
verification command extracts the exact source ZIP into a temporary directory,
compiles it offline in a digest-pinned container, rejects material TeX
diagnostics, and prints a report bound to the archive and generated PDF hashes:

```sh
node scripts/arxiv-compile.mjs
```

Submit the verified LaTeX source ZIP to arXiv, not the locally generated PDF.
arXiv normally rejects PDFs generated from TeX when source is available and
compiles the submitted source itself; inspect that generated result before
submission.

## Validate the companion

Start with [`companion/LEARNINGS.md`](companion/LEARNINGS.md) to review all 192
practices in chapter context. It presents each practice's action, mechanism,
evidence, and boundary in prose while preserving stable identifiers for the
machine-readable files.

Run the checksum verification from the companion directory:

```sh
cd companion
sha256sum -c SHA256SUMS
```

The release candidate contains 192 practice records, 578 evidence or
corroboration records, and 29 benchmark records. Its methodology directory
records the corpus snapshots, common search protocol, 138 retained scholarly
works, all 39 decisions in the bounded August update audit, a 148-record
software-engineering coverage probe, a deterministic 40-DOI SciX comparison,
a complete 26-record TSE known-set comparison, a 55-record DBLP title census,
and the prepared ACM, IEEE, and Scopus search plans. The DBLP census exposed 50
records absent from both prior comparison sets, but remains a title-screening
queue rather than a publisher-native or Scopus-equivalent result. The
independent-grading replication packet includes a self-contained reviewer form,
strict agreement analyzer, and a status record disclosing that this release
candidate has not commissioned external graders and makes no
independent-calibration claim.
Author-system cases are marked as illustrations and are not counted as
independent external evidence.

## Verify a release candidate

The release contract is machine-readable in [`release-metadata.json`](release-metadata.json).
It cross-checks the version and freeze date across the manuscript, citation
metadata, handoff, companion, preview PDF, and packaged ZIPs. It also verifies
the companion checksums and compares every archived source file byte-for-byte
with the repository:

```sh
node --test scripts/release-gate.test.mjs
node --test scripts/arxiv-compile.test.mjs
node --test scripts/arxiv-compile.e2e.test.mjs
node --test scripts/verify-full-text-evidence.test.mjs
node scripts/release-gate.mjs
node scripts/arxiv-compile.mjs
```

Release candidates may record uncompleted gates with machine-readable
limitations. Stable `1.0.0` accepts external grading only when at least two
readers have completed the blinded packet and a valid calibration report is
present. It also requires complete execution evidence for all planned ACM
Digital Library, IEEE Xplore, and Scopus cells. The stable gate continues to
reject unresolved arXiv license, endorsement, ORCID, provisional content
licensing, and companion DOI state.

## Reusable agent skills

The `skills/` collection packages five existing operational workflows:

- `agent-eval-design`: design decision-ready evaluations and benchmarks.
- `e2e-testing`: build stable end-to-end release gates around critical journeys.
- `failure-mode-capture`: turn observed failures into durable, deduplicated guardrails.
- `focus`: carry one scoped task through persistent state and verification.
- `ultracode`: execute a locked Codex goal through durable, verified completion.

Each skill includes `SKILL.md`, Codex interface metadata, and an evidence map to
the corresponding companion practices and transfer limits. Copy an individual
skill directory into your Codex skills directory, or build the complete bundle:

```sh
node scripts/package-skills.mjs
```

These are derived implementation artifacts, not independent evidence. Review
the evidence map and adapt thresholds, tools, and escalation rules to the local
system before use.

## Release status

The files currently represent the `1.0.0-rc.16` release candidate prepared on
August 7, 2026. It is explicitly unfinished: no external readers have completed
the blinded packet, and the ACM Digital Library, IEEE Xplore, and Scopus plans
have not been executed. The release candidate reports those limitations and
makes neither an independent-calibration nor provider-coverage claim. Both
measured additions remain gates for archival `1.0.0`; DBLP, OpenAlex, and web
surrogates do not substitute for the native searches. The final immutable
version, licenses, ORCID and endorsement state, companion DOI, exact source
archive, preview, checksums, GitHub tag, and website metadata must also be
synchronized before stable release and arXiv submission.
