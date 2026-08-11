# Supplementary software-engineering coverage

This directory separates three activities that answer different questions:

1. The OpenAlex probe diagnosed whether the initial SciX and arXiv search could
   be assumed to cover core software-engineering venues. It could not.
2. Exact-DOI checks measure whether SciX contains records already known from
   the probe. They are identity-overlap diagnostics, not recall estimates.
3. The publisher- and index-native ACM Digital Library, IEEE Xplore, and Scopus
   plans document the remaining publisher-native search. They were not executed for
   this edition, and no result or provider-equivalence claim is inferred from
   them.
4. A credential-free DBLP title census records replacement evidence for the
   unavailable Scopus lane. It exposed conference records absent from the
   earlier OpenAlex probe, but it is title-only and is not treated as
   publisher-native or equivalent to Scopus.

## Preserved artifacts

- `candidate-records.json` and `candidate-records.csv`: all 148 records from
  the OpenAlex coverage probe.
- `scix-doi-coverage-sample.json`: deterministic 40-record exact-DOI sample.
- `tse-scix-doi-coverage.json`: complete exact-DOI audit of the 26 TSE
  candidates; all 26 are present in SciX.
- `audit-scix-doi-overlap.mjs`: reproducible known-set audit against the local
  SciX metadata corpus.
- `protocol-and-status.json`: provider status, bounded interpretation, and
  result summary.
- `publisher-coverage-status.json`: release-state summary for the ACM, IEEE,
  Scopus, and DBLP lanes. A prepared plan never counts as an executed search.
- `chatgpt-search-handoff.md`: copy-ready provider prompts, exact topic and
  venue matrices, required evidence fields, and the ACM manual-only boundary.
- `erca_publisher_coverage_with_web_surrogate_2026-08.xlsx`: returned ChatGPT
  workbook containing the unexecuted 48-cell ACM worksheet, incomplete web
  surrogate logs, and a 19-record candidate queue. It is discovery evidence,
  not an ACM, IEEE, or Scopus execution report.
- `chatgpt-web-surrogate-audit-2026-08.md`: structural, identifier, and local
  overlap audit of that workbook, including the unresolved bibliographic and
  screening work.
- `web-surrogate-adjudication-2026-08.csv`: all 19 workbook candidates with
  their DBLP-queue overlap and post-cutoff disposition. Two duplicate DBLP
  rows leave 51 unique candidates across the retained queues; none was admitted
  to the frozen v1 corpus.
- `candidate-adjudication-summary-2026-08.md`: union accounting, cutoff rule,
  and the bounded decision that all 51 unique late candidates remain queued for
  the next edition.
- `dblp-title-census-2026-08.json`: exact 64-cell DBLP query, returned SPARQL
  bindings and their hash, upstream comparison hashes, and all zero-result cells.
- `dblp-screening-enrichment-2026-08.json`: exact-DOI OpenAlex enrichment
  provenance for the 50-record queue; 47 DOIs had an abstract and three did not.
- `dblp-screening-triage-2026-08.csv`: complete model-assisted preliminary
  triage, with recommendations and rationales; final dispositions live in the
  separate adjudication packet.
- `dblp-author-adjudication-2026-08.csv`: the 34 full-text recommendations
  reduced to bounded candidate claims, proposed manuscript placements, access
  routes, and post-cutoff decisions with reasons.
- `dblp-full-text-verification-2026-08.csv`: page-level support notes, source
  URLs, version boundaries, and file hashes for all 18 open-routed candidates;
  the full texts themselves are not redistributed.
- `dblp-supplemental-full-text-verification-2026-08.csv`: the same source-hash
  and page-level verification for 13 records that OpenAlex had routed as closed
  but a bounded exact-title search later located on author, institutional,
  arXiv, publisher, or government-repository hosts.
- `dblp-full-text-access-exceptions-2026-08.csv`: the three remaining records,
  the locations checked, and the exact reason each lacks stable source bytes.
- `scripts/verify-full-text-evidence.mjs` (at the repository root): verifies
  that locally supplied PDFs exactly match every recorded SHA-256 digest and
  page count. The source PDFs are not redistributed; download the files from
  the recorded URLs into any directory, then run:

  ```sh
  node scripts/verify-full-text-evidence.mjs --pdf-dir /path/to/source-pdfs
  ```

  Filenames do not matter because the verifier joins records to files by their
  byte digest. Use repeated `--evidence path/to/file.csv` arguments to check a
  subset instead of the two full-text evidence files checked by default.
- `run-dblp-title-census.mjs`: reproducible DBLP SPARQL client and artifact
  builder.
- `plans/`: exact public plans for the manual ACM lane and the credentialed
  IEEE and Scopus lanes, plus the DBLP title-census plan and the documented
  Scopus fallback decision.

The private IEEE and Scopus checkpoints retain DOI and provider identifiers
only and are not part of this edition. After screening, publish the
aggregate query report and record-level inclusion decisions, not provider
descriptive content that the companion is not licensed to redistribute.

## Stable-release evidence contract

A release may report
`not-performed-with-disclosed-source-limitations` when ACM Digital Library,
IEEE Xplore, and Scopus are all recorded as not searched, their completed-cell
counts remain zero, the manuscript makes no provider-coverage or
exhaustive-recall claim, and no contradictory execution report is present.
That state does not establish publisher-native coverage.

A `complete` state requires `acm-dl-execution-2026-08.json`,
`ieee-xplore-execution-2026-08.json`, and `scopus-execution-2026-08.json`. The
`complete-with-documented-exclusions` state and DBLP replacement evidence remain
useful for a later edition or a methodological comparison, but neither
substitutes for Scopus execution.

Every execution report is bound to the SHA-256 of its exact plan and preserves
each planned topic-by-venue cell once, including zero-result cells. Each cell
records the planned and executed query, UTC execution time, complete result
count, and a checkpoint reference. The record set preserves a reasoned
screening disposition; included records also identify a bounded claim,
evidence group, and manuscript placement. When execution is claimed, the
release gate recomputes the cell matrix and PRISMA arithmetic and rejects a
completion flag without these artifacts.

The DBLP census found 55 unique publications, including 50 absent from both
the resolved manuscript-reference set and the OpenAlex probe. They are not
counted as admissions. Exact-DOI enrichment matched all 50 and supplied
abstracts for 47. Preliminary triage recommended 34 for full-text review and
deferred or excluded 16.
The 34 retained candidates were discovered after the August 6 cutoff. None
identified a factual correction, so every row was deferred to the next-edition
queue under the published update policy. The packet preserves the decision and
reason without treating an abstract-derived claim or open-access route as
sufficient evidence.
All 18 open-routed records and 13 of the 16 records initially routed as closed
now have model-assisted, source-hashed full-text support notes. The remaining
three have explicit access exceptions: one publisher landing page without
retrievable PDF bytes, one author-uploaded browser extract without a stable PDF
URL, and one institutional metadata record without a bitstream. The stable
release gate rejects blank or invalid decisions, duplicate publications, or
any packet that does not match all 34 retained triage records.
