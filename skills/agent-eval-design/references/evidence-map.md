# Evidence and practice map

This skill is a derived operational artifact. It does not add independent
evidence to the manuscript or establish that an evaluation design transfers
unchanged to another workload.

## Mapped practices

`ERCA-NNN` is the stable identifier of a practice record in the companion
catalog, after the initials of *Engineering Reliable Coding Agents*. Resolve
one in [`companion/catalog.json`](https://github.com/sjarmak/engineering-reliable-coding-agents/blob/main/companion/catalog.json)
or on the [companion site](https://sjarmak.ai/books/engineering-reliable-coding-agents/companion).

- `ERCA-020` · `never-report-a-single-run`: require repeated randomized runs and report the distribution.
- `ERCA-025` · `power-analyze-before-running`: plan sample size or state the minimum detectable effect.
- `ERCA-024` · `use-paired-tests-matched-to-metric`: compare matched systems with metric-appropriate paired analysis.
- `ERCA-114` · `run-ablation-controls`: isolate the contribution of the model, harness, tools, and other components.
- `ERCA-012` · `report-cost-accuracy-pareto`: report cost and accuracy jointly rather than naming one winner.
- `ERCA-003` · `measure-public-score-inflation-with-matched-controls`: treat public-benchmark results as contamination-sensitive.
- `ERCA-001` · `strengthen-test-oracles-before-adjudication`: establish that the oracle can distinguish correct from plausible output.
- `ERCA-066` · `benchmark-on-your-own-workload`: tie tasks and metrics to the deployment decision.
- `ERCA-014` · `pin-and-publish-eval-harness`: preserve prompts, code, versions, and raw outputs for reproduction.

The first eight practices are developed in the manuscript. Harness publication
is a companion-only practice. Consult `companion/LEARNINGS.md` and
`companion/catalog.json` for their evidence and boundary conditions.
