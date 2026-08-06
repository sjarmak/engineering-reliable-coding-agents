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
| [`manuscript/`](manuscript/) | Complete, compilable LaTeX source with 18 chapters, closing chapter, 13 figures, and 183 references |
| [`companion/`](companion/) | Human-readable learnings plus the machine-readable practice catalog, evidence ledger, chapter crosswalk, benchmark catalog, schemas, web-source preservation record, checksums, citation metadata, and provenance |
| [`skills/`](skills/) | Five reusable agent skills derived from the evaluation, verification, failure-analysis, and durable-execution practices |
| [`SUBMISSION.md`](SUBMISSION.md) | Paste-ready arXiv metadata, packaging decisions, license and endorsement notes, audit results, and upload checklist |
| [`CITATION.cff`](CITATION.cff) | Repository-level citation metadata |
| [`LICENSE-SCOPE.md`](LICENSE-SCOPE.md) | Current license boundaries for the manuscript, data, and repository infrastructure |

Read the [browser-based book](https://sjarmak.ai/books/engineering-reliable-coding-agents)
or use the [interactive companion catalog](https://sjarmak.ai/books/engineering-reliable-coding-agents/companion)
for chapter navigation, filtering, and graph exploration.

## Build the manuscript

The top-level TeX file is `manuscript/main.tex`. The arXiv release candidate was
compiled with Tectonic:

```sh
cd manuscript
tectonic main.tex
```

The generated PDF is 254 pages on US letter paper. The source uses standard
LaTeX packages and contains all required figures locally.

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

The release candidate contains 192 practice records, 563 evidence or
corroboration records, and 29 benchmark records. Author-system cases are marked
as illustrations and are not counted as independent external evidence.

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

The files currently represent the `1.0.0-rc.7` release candidate prepared on
August 5, 2026. The archival DOI and final license choices must be recorded
before the first stable release and arXiv submission.
