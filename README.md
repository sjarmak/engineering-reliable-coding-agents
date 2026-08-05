# Engineering Reliable Coding Agents

*Evaluation, Recovery, Context, and Control Beyond the Model*

This repository contains the manuscript source and companion research artifact
for Stephanie Jarmak's technical review of the evaluation, operation, and
governance of AI coding-agent systems.

The review treats coding agents as systems rather than isolated models. Its
contributions include an evidence audit, a catalog of 192 bounded engineering
practices, a dependency chain across evaluation and operation, scoped
author-system measurements and failure cases, and runnable evaluation and
fault-testing protocols.

## Repository contents

| Path | Contents |
| --- | --- |
| [`manuscript/`](manuscript/) | Complete, compilable LaTeX source with 18 chapters, closing chapter, 19 figures, and 182 references |
| [`companion/`](companion/) | Machine-readable practice catalog, evidence ledger, chapter crosswalk, benchmark catalog, schemas, checksums, citation metadata, and provenance |
| [`CITATION.cff`](CITATION.cff) | Repository-level citation metadata |
| [`LICENSE-SCOPE.md`](LICENSE-SCOPE.md) | Current license boundaries for the manuscript, data, and repository infrastructure |

The browser-based edition and companion catalog are available at
[sjarmak.ai/books/engineering-reliable-coding-agents](https://sjarmak.ai/books/engineering-reliable-coding-agents).

## Build the manuscript

The top-level TeX file is `manuscript/main.tex`. The arXiv release candidate was
compiled with Tectonic:

```sh
cd manuscript
tectonic main.tex
```

The generated PDF is 251 pages on US letter paper. The source uses standard
LaTeX packages and contains all required figures locally.

## Validate the companion

Run the checksum verification from the companion directory:

```sh
cd companion
sha256sum -c SHA256SUMS
```

The release candidate contains 192 practice records, 564 evidence or
corroboration records, and 29 benchmark records. Author-system cases are marked
as illustrations and are not counted as independent external evidence.

## Release status

The files currently represent the `1.0.0-rc.1` release candidate prepared on
August 5, 2026. The archival DOI and final license choices must be recorded
before the first stable release and arXiv submission.
