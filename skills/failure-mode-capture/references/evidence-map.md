# Evidence and practice map

This skill operationalizes learning from observed failures. A captured rule is
a local prevention, not evidence that the same failure is common elsewhere.

## Mapped practices

- `ERCA-045` · `derive-taxonomy-from-own-traces`: let observed failures determine the prevention vocabulary.
- `ERCA-044` · `fix-failures-structurally-not-prompts`: encode recurring mechanisms in durable system controls rather than prompt patches.
- `ERCA-116` · `retain-raw-distill-separately`: preserve the incident record separately from the compact prevention.
- `ERCA-081` · `optimize-compaction-from-failures`: change compact instructions in response to measured omissions and distortions.
- `ERCA-134` · `diagnose-then-gate-recovery`: require a mechanism-level diagnosis before admitting retry guidance.

The first four practices are developed in the manuscript. Diagnosing before
gating recovery is a companion-only practice. The one-line format and file
budget are implementation choices, not measured universal constants.
