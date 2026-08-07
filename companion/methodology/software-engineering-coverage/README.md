# Supplementary software-engineering coverage

This directory separates three activities that answer different questions:

1. The OpenAlex probe diagnosed whether the initial SciX and arXiv search could
   be assumed to cover core software-engineering venues. It could not.
2. Exact-DOI checks measure whether SciX contains records already known from
   the probe. They are identity-overlap diagnostics, not recall estimates.
3. The publisher- and index-native ACM Digital Library, IEEE Xplore, and Scopus
   plans close the remaining search-source gap. Their results are not claimed
   until each plan has executed and its screening decisions are preserved.
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
- `dblp-title-census-2026-08.json`: exact 64-cell DBLP query, returned SPARQL
  bindings and their hash, upstream comparison hashes, and all zero-result cells.
- `dblp-screening-enrichment-2026-08.json`: exact-DOI OpenAlex enrichment
  provenance for the 50-record queue; 47 DOIs had an abstract and three did not.
- `dblp-screening-triage-2026-08.csv`: complete model-assisted preliminary
  triage, with recommendations and rationales but blank author decisions.
- `dblp-author-adjudication-2026-08.csv`: the 34 full-text recommendations
  reduced to bounded candidate claims, proposed manuscript placements, access
  routes, and blank author decision/note fields.
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
only and are not part of this release candidate. After screening, publish the
aggregate query report and record-level inclusion decisions, not provider
descriptive content that the companion is not licensed to redistribute.

The DBLP census found 55 unique publications, including 50 absent from both
the resolved manuscript-reference set and the OpenAlex probe. Those records
remain a screening queue. They are not counted as admissions until the
published title/abstract screening and author adjudication steps are complete.
Exact-DOI enrichment matched all 50 and supplied abstracts for 47. Preliminary
triage recommends 34 for full-text review and defers or excludes 16; these are
model recommendations, not completed screening decisions or admissions.
The author packet makes the remaining decision explicit without treating an
abstract-derived claim or an open-access route as sufficient evidence.
All 18 open-routed records and 13 of the 16 records initially routed as closed
now have model-assisted, source-hashed full-text support notes. The remaining
three have explicit access exceptions: one publisher landing page without
retrievable PDF bytes, one author-uploaded browser extract without a stable PDF
URL, and one institutional metadata record without a bitstream. These notes do
not decide whether a record belongs in the manuscript; all 34 records still
require author adjudication.
For every packet row, the author must set `author_decision` to exactly
`include-full-text-verified`, `defer`, or `exclude` and record a nonempty
`author_note`. The stable-release gate rejects blank or invalid decisions,
duplicate publications, or any packet that does not match all 34 retained
triage records.
