# ACM Digital Library manual review protocol

This protocol covers the publisher-native ACM portion of the supplementary
software-engineering search for *Engineering Reliable Coding Agents*. It is a
manual lane, not a SciX ingest source.

ACM's end-user policy prohibits robots or intelligent agents and systematic
downloading. For that reason, do not automate the Digital Library interface.
Use the browser search and citation-export controls available to the
institutional account. Retain citation identifiers and query provenance, not a
mirror of ACM content.

## Before searching

1. Sign in through the institutional ACM Digital Library route.
2. Open Advanced Search and select the ACM Full-Text Collection rather than the
   broader Guide to Computing Literature.
3. Record the date, account-access route, and whether Advanced Search and
   citation export are available. Digital Library Basic may not expose those
   features.
4. Use erca_acm_dl_manual_plan_2026-08.json without editing its topic or venue
   labels during the run. If the interface requires a syntax repair, preserve
   both the planned and executed form.

## Execute the matrix

Run each of the eight topic queries against each of the six publication
filters, for 48 cells. Apply the publication-year interval 2018 through the run
date in 2026.

For every cell, record:

- stable cell key topic-id--venue-id;
- planned query and the exact query accepted by the interface;
- publication and year filters;
- execution timestamp;
- provider-reported result count;
- whether the result set was complete or the interface imposed a limit;
- citation-export filename, when export is available; and
- any ambiguity in the publication filter, especially FSE/ESEC-FSE name
  changes or proceedings-series variants.

Use the Digital Library's own citation export where permitted. If bulk citation
export is unavailable, screen in the interface and record the DOI or ACM
citation URL for each retained candidate manually. Do not script the result
pages or download full text in bulk.

## Deduplicate and screen

Normalize DOI case and prefixes, then deduplicate by DOI. For records without a
DOI, use the ACM citation URL and normalized title. Preserve every duplicate
link to its source cell so the PRISMA flow can count records before and after
deduplication.

Apply the monograph's published inclusion and exclusion criteria to title and
abstract screening. Record an exclusion reason for each screened-out unique
record. Retrieve full text only for candidates that survive screening and only
through the access rights of the reviewing account.

## Report

Publish aggregate search provenance, result counts, deduplication, screening
counts, admitted sources, and the PRISMA-compatible flow. A null result is
reportable. This lane establishes that ACM Digital Library was searched; it
does not by itself establish exhaustive recall.
