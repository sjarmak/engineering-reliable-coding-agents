# Independent evidence-grading replication protocol

This packet supports independent replication of the evidence groups used by the monograph. It samples 20 practice records deterministically from the edition catalog using SHA-256 ordering with seed `ERCA-2026-08-external-calibration-v1`. Because evidence groups attach to scoped evidence items rather than whole practices, reviewers label all 43 evidence items associated with the sampled practices. The practice is the sampling unit; the scoped evidence item is the grading and agreement unit.

The author has not commissioned external graders for this release candidate. No reader responses, inter-rater statistics, or independent-calibration claim are part of it. [`status.json`](status.json) records that boundary in machine-readable form. At least two independent readers must complete this packet before stable v1; the author's labels remain hidden until their responses are frozen.

The easiest review surface is the self-contained `review-form.html`. It embeds the blinded packet, works without a server, supports draft import and export, requires a rationale for each label, and exports the JSON envelope accepted by the analyzer. Rebuild it after changing the packet with:

`node build-review-form.mjs`

## Reviewer procedure

1. Work independently and do not consult `catalog.json`, `evidence-ledger.csv`, or another reviewer's response. Those files reveal the author's labels.
2. Open `review-form.html`, or use `blinded-evidence-items.json` with `response-template.json`. Open the cited source when the supplied claim and boundary are insufficient to grade it.
3. For every item, assign exactly one of `strong`, `directional`, `corroborating`, or `null_or_conflicting`, and add a short rationale.
4. Return the completed response without discussing individual labels with the other reviewers.

The categories use the definitions in the manuscript. Judge whether the cited item supports the scoped claim written in `claim_support`; do not grade the prestige of the venue or the general quality of the source. A controlled result can be strong for a narrow measured claim and directional for a broader recommendation. When ambiguity remains, use the lower group and explain why.

After at least two readers respond, run:

`node analyze-grades.mjs --output calibration-report.json reader-a.json reader-b.json [reader-c.json]`

The analyzer rejects missing, duplicate, unexpected, invalid, or unrationalized assignments. It reports pairwise Cohen's kappa, Fleiss's kappa when three readers participate, observed agreement, per-reader label distributions, pairwise confusion matrices, and item-level disagreement patterns. Agreement is not correctness. The result measures reproducibility of this classification instrument and identifies definitions that need adjudication. Do not use the author label as ground truth; compare it separately after the blinded pass.

Keep the generated stable-v1 report at this exact `calibration-report.json` path. A release declaring completed external grading verifies that the report covers 20 practices and 43 evidence items, identifies two or three unique readers, reports each required reader pair exactly once, and preserves the interpretation and disagreement fields. Do not create a placeholder report: until valid reader responses exist, the release must remain an explicitly unfinished candidate.

There is no post hoc pass threshold. If disagreement exposes an ambiguous definition, preserve the first-pass result, revise the instrument prospectively, and test the revision on a fresh sample rather than relabeling the original sample to improve agreement.

The absence of external grading is a disclosed limitation of this release candidate and a blocking task for stable v1; author-only challenge passes are not equivalent to independent review.
