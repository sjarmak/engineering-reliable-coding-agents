# Evidence and practice map

This skill is a derived operational artifact. It does not add independent
evidence to the manuscript or establish that an evaluation design transfers
unchanged to another workload.

## Mapped practices

- `never-report-a-single-run`: require repeated randomized runs and report the distribution.
- `power-analyze-before-running`: plan sample size or state the minimum detectable effect.
- `use-paired-tests-matched-to-metric`: compare matched systems with metric-appropriate paired analysis.
- `run-ablation-controls`: isolate the contribution of the model, harness, tools, and other components.
- `report-cost-accuracy-pareto`: report cost and accuracy jointly rather than naming one winner.
- `measure-public-score-inflation-with-matched-controls`: treat public-benchmark results as contamination-sensitive.
- `strengthen-test-oracles-before-adjudication`: establish that the oracle can distinguish correct from plausible output.
- `benchmark-on-your-own-workload`: tie tasks and metrics to the deployment decision.
- `pin-and-publish-eval-harness`: preserve prompts, code, versions, and raw outputs for reproduction.

The first eight practices are developed in the manuscript. Harness publication
is a companion-only practice. Consult `companion/LEARNINGS.md` and
`companion/catalog.json` for their evidence and boundary conditions.
