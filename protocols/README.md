# Runnable protocols

These protocols turn selected manuscript practices into bounded engineering
checks. They are reusable templates, not new evidence and not universal
thresholds. Record local deviations instead of silently changing a pass
condition.

| Protocol | Decision it supports | Mapped practices |
| --- | --- | --- |
| [`minimum-reliability-pass.md`](minimum-reliability-pass.md) | What should a constrained team implement first? | Cross-chapter minimum |
| [`evaluation-comparison.md`](evaluation-comparison.md) | Is one system measurably better on the target workload? | ERCA-020, ERCA-024, ERCA-025 |
| [`authority-boundary-test.md`](authority-boundary-test.md) | Can ordinary agent credentials perform a destructive action? | ERCA-068, ERCA-069, ERCA-105 |
| [`recovery-fault-injection.md`](recovery-fault-injection.md) | Does the system recover from a named fault without unsafe duplication? | ERCA-097, ERCA-127 |
| [`failure-trace-review.md`](failure-trace-review.md) | Does a trace support a reproducible upstream attribution? | ERCA-045, ERCA-046, ERCA-047 |
| [`allocation-policy-replay.md`](allocation-policy-replay.md) | Does a routing policy beat the live baseline within budget and deadline? | ERCA-171, ERCA-187, ERCA-191 |
| [`factory-contracts.yaml`](factory-contracts.yaml) | Which factory contract (I1-I11) does a control enforce, and how is it checked? | Chapter 7 contract catalog |
| [`distributed-ambiguity-faults.yaml`](distributed-ambiguity-faults.yaml) | Does the runtime resolve component disagreement safely? | ERCA-097, ERCA-127, ERCA-193 through ERCA-205 |

The evidence and boundary conditions for every mapped practice live in
[`companion/catalog.json`](../companion/catalog.json). Keep protocol outputs
with the evaluated system revision; a result without version identity is not a
current result.
