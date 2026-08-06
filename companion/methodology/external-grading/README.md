# Blinded external evidence-grading calibration

This packet supports an independent calibration of the evidence groups used by the monograph. It samples 20 practice records deterministically from the edition catalog using SHA-256 ordering with seed `ERCA-2026-08-external-calibration-v1`. Because evidence groups attach to scoped evidence items rather than whole practices, reviewers label every evidence item associated with the sampled practices.

## Reviewer procedure

1. Work independently and do not consult `catalog.json`, `evidence-ledger.csv`, or another reviewer's response. Those files reveal the author's labels.
2. Read `blinded-evidence-items.json`. Open the cited source when the supplied claim and boundary are insufficient to grade it.
3. Copy `response-template.json` to a reader-specific file. For every item, assign exactly one of `strong`, `directional`, `corroborating`, or `null_or_conflicting`, and add a short rationale.
4. Return the completed response without discussing individual labels with the other reviewers.

The categories use the definitions in the manuscript. Judge whether the cited item supports the scoped claim written in `claim_support`; do not grade the prestige of the venue or the general quality of the source. A controlled result can be strong for a narrow measured claim and directional for a broader recommendation. When ambiguity remains, use the lower group and explain why.

After at least two readers respond, run:

`node analyze-grades.mjs reader-a.json reader-b.json [reader-c.json]`

Report pairwise Cohen's kappa, Fleiss's kappa when three readers participate, observed agreement, and the disagreement pattern. Agreement is not correctness. The result measures reproducibility of this classification instrument and identifies definitions that need adjudication. Do not use the author label as ground truth; compare it separately after the blinded pass.

No external labels or kappa value are included in this release candidate because the review has not yet occurred. The first archival edition is conditional on completing and reporting this calibration.
