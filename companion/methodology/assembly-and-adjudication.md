# Assembly and adjudication

## Retrieval systems

SciX is the NASA-supported scholarly discovery service used for bibliographic identity and metadata. SciX Agent is the author's local retrieval layer over a SciX and arXiv corpus. Code Intelligence Digest is the author's ingestion and search corpus for research feeds and practitioner material. These systems retrieved and ordered candidates. They were not evidence classes and did not assign final evidence groups.

## Decision sequence

The review followed this sequence:

1. define the question and boundary of each thread;
2. retrieve candidate records;
3. resolve record identity and deduplicate it;
4. screen for an in-scope claim;
5. extract the bounded claim and its conditions;
6. assign an evidence group to that claim;
7. challenge the assignment and record contrary or null findings;
8. derive candidate engineering practices;
9. select practices for chapter or companion treatment; and
10. audit identifiers, citations, and source-section labels.

Automated systems assisted with retrieval, normalization, duplicate detection, bounded claim extraction, metadata checks, and challenge passes. The cited source remained authoritative. The author made the final inclusion, evidence-group, practice-admission, chapter-placement, and prose decisions. Ambiguous evidence defaulted to the lower group unless the narrower directly measured claim could be stated.

| Review step | Mode | Human decision retained |
| --- | --- | --- |
| Candidate retrieval and ranking | Automated and assisted | The author defined each thread question and search boundary, then read the admitted sources. |
| Identity resolution, normalization, and duplicate checks | Automated checks with human resolution | The author resolved ambiguous identities and practitioner independence keys. |
| Bounded-claim extraction | Assisted | The author checked the source, revised the extracted claim, and accepted or rejected it. |
| Initial evidence-group proposal | Assisted | The author assigned the final label to the scoped claim. |
| Challenge pass | Assisted | Automated passes flagged composite claims, contrary findings, duplicate support, and label inconsistencies; the author reread the source and adjudicated every change. |
| Practice admission, chapter selection, and prose | Human | The author made the selection and writing decisions. |
| Schema, checksum, identifier, and cross-reference gates | Automated verification | Failures blocked the release until the underlying record was corrected. |

Here, *automated* means the operation ran without item-level prompting, *assisted* means a system proposed or flagged material for a human decision, and *human* means the substantive choice was made without an automated verdict. The challenge pass was an error-finding aid, not an independent grader.

## Practice-record accounting

The working extraction produced 244 candidate records across six shards. An admission gate retained 214 and rejected 30. Later adjudication cut 26 records, demoted 13 to asides, split eight bundled records, added three records, and reinstated one after a provenance correction, producing 192 records in this edition. That total is a bookkeeping consequence of claim granularity and editorial boundaries, not a count of practices that exist in the world. Stable identifiers preserve this edition's records even if a later edition splits, merges, or retires one.

The final admission gate required at least one scholarly item, a non-author synthesis with a resolvable scholarly identity, or two practitioner items with distinct independence keys. Three selection passes considered teachability, consequence, and coverage of fourteen mechanism clusters. Practices chosen by at least two passes formed the base of the developed set; individual adjudication repaired thin mechanism coverage and one provenance defect. The main manuscript retains these admission and selection rules while leaving the record arithmetic here.

## Independence and deduplication

Research records found through Code Intelligence Digest entered the scholarly lane and were deduplicated by bibliographic identity. Practitioner accounts were deduplicated by incident or originating claim. Several pages repeating one incident did not count as several independent observations.

## Update policy

The consolidation cutoff was July 26, 2026. A bounded audit through August 6 screened 39 candidate records: 38 surfaced in published Digest editions and one in a targeted release check. Eleven new works were admitted, one was already present, and 27 were deferred. Newness alone did not justify admission. The source had to correct, materially qualify, or directly strengthen a claim already in scope. Later records enter the next-edition queue unless they correct a factual error.

A separate software-engineering coverage probe searched eight preserved topic formulations across metadata for ICSE, FSE, ASE, ISSTA, EMSE, TSE, TOSEM, and CSCW. It surfaced 148 unique candidates and admitted nine methodologically material records after title-and-abstract screening. A deterministic 40-DOI comparison found eight exact matches in SciX. A follow-up check of all 26 TSE candidates found 26 exact DOI matches, showing that the known TSE subset was present even though records from other venue families were absent from the sample. Neither comparison estimates topic-search recall or establishes ACM Digital Library, IEEE Xplore, or Scopus coverage. Those sources were not searched for v1; the full probe, known-set audit, disclosed limitation, and future search plans appear under `software-engineering-coverage/`.

Because Scopus credentials remained unavailable, a credential-free DBLP title
census applied the same eight topic boundaries to eight named venue streams.
Its 64 cells returned 55 unique publications; 50 were absent from both the
resolved manuscript-reference set and the OpenAlex probe. These are candidates,
not admissions. DBLP supplies titles but not the abstract and author-keyword
search planned for Scopus, so the census exposes a conference-coverage gap and
creates a review queue without establishing provider equivalence. The exact
query, returned SPARQL bindings, comparison hashes, zero cells, and fallback decision are
preserved under `software-engineering-coverage/`.

An exact-DOI OpenAlex enrichment matched all 50 new-to-both records and supplied
abstracts for 47. Model-assisted preliminary triage recommended 34 for full-text
review and deferred or excluded 16 with record-level reasons. The retained
candidates were discovered after the August 6 cutoff. None identified a factual
correction, so all 34 were deferred to the next-edition queue under the published
update policy rather than admitted to the frozen v1 corpus.

For the 34 full-text recommendations, a separate adjudication packet records a
bounded candidate claim, proposed manuscript placement, evidence basis,
full-text access route, disposition, and reason. A separate verification
file identifies the exact public full-text bytes and page-level support notes
for all 18 open-routed candidates. A supplemental verification file records the
same evidence for 13 candidates that the provider had routed as closed but a
bounded exact-title search subsequently located. A separate exception file
records the three remaining access failures without treating metadata or a
browser extract as source-hashed full text. The papers are not redistributed,
and all 34 records remain available for next-edition review.

## Reproducibility boundary

The retained thread syntheses, source identities, corpus counts, update window, and update decisions are recorded here. Every machine-issued query from the original interactive searches was not preserved. The release therefore labels reconstructed protocol records as reconstructions and does not claim byte-for-byte replay of the original searches.
