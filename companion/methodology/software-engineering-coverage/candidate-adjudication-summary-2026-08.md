# Post-cutoff software-engineering candidate adjudication

Decision date: 2026-08-07

## Boundary

The published update policy fixes the v1 evidence cutoff at 2026-08-06. Later
records enter the next-edition queue unless they correct a factual error. The
DBLP census and ChatGPT web-surrogate workbook were produced on 2026-08-07, so
their candidates were evaluated against that rule rather than treated as an
unbounded extension of the frozen corpus.

## Accounting

| Queue | Retained records | Disposition |
| --- | ---: | --- |
| DBLP full-text recommendations | 34 | 34 defer |
| Web-surrogate workbook | 19 | 19 defer |
| Exact DBLP/web duplicates | 2 | Counted once in the union |
| Unique candidates across both queues | 51 | 51 next-edition records |

The DBLP queue has 31 source-hashed full-text support notes and three explicit
access exceptions. The web-surrogate queue has 12 DOI-bearing records and seven
records whose stable bibliographic identities remain unresolved. Two web rows
duplicate DBLP records: *Large Language Models for Software Engineering: A
Systematic Literature Review* and *Support, Not Automation: Towards
AI-supported Code Review for Code Quality and Beyond*.

## Decision

No candidate identified a factual error in the frozen manuscript. The reviewed
claims were additive, qualifying, methodological, or redundant support. All 51
unique candidates were therefore deferred to the next-edition queue under the
published cutoff; none was admitted to v1, and no manuscript evidence count or
claim changed.

The record-level DBLP decisions and reasons appear in
`dblp-author-adjudication-2026-08.csv`. The 19 workbook decisions, source URLs,
and overlap markers appear in `web-surrogate-adjudication-2026-08.csv`.

This disposition closes candidate handling, not provider coverage. ACM Digital
Library, IEEE Xplore, and Scopus were not searched, and neither DBLP nor the web
surrogate is represented as equivalent to those sources or as evidence of
exhaustive recall.
