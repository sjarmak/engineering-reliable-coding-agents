# Supplementary software-engineering coverage

This directory separates three activities that answer different questions:

1. The OpenAlex probe diagnosed whether the initial SciX and arXiv search could
   be assumed to cover core software-engineering venues. It could not.
2. Exact-DOI checks measure whether SciX contains records already known from
   the probe. They are identity-overlap diagnostics, not recall estimates.
3. The publisher- and index-native ACM Digital Library, IEEE Xplore, and Scopus
   plans close the remaining search-source gap. Their results are not claimed
   until each plan has executed and its screening decisions are preserved.

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
- `plans/`: exact public plans for the manual ACM lane and the credentialed
  IEEE and Scopus lanes.

The private IEEE and Scopus checkpoints retain DOI and provider identifiers
only and are not part of this release candidate. After screening, publish the
aggregate query report and record-level inclusion decisions, not provider
descriptive content that the companion is not licensed to redistribute.
