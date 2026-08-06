# Evidence and practice map

This skill turns several evaluation and verification findings into a compact
testing workflow. It does not validate a universal coverage percentage, pass
rate, flake budget, locator strategy, or test framework.

## Mapped practices

- `ERCA-094` · `ground-evaluation-in-execution`: prefer executed behavior over plausibility or text similarity.
- `ERCA-095` · `golden-set-pass-k`: replay representative tasks across releases and measure repeated success.
- `ERCA-001` · `strengthen-test-oracles-before-adjudication`: verify that assertions can detect the failures the gate claims to prevent.
- `ERCA-153` · `make-verification-cheaper-than-acceptance`: retain failure artifacts that make review and diagnosis efficient.
- `ERCA-069` · `distrust-agent-self-reports`: treat completion claims as hypotheses until workspace and execution state agree.

These practices are developed in the manuscript. Journey selection, framework
syntax, and release thresholds remain local engineering decisions.
