# Scopus fallback decision

## Decision

The Scopus lane was not executed for this release-candidate audit because no
Elsevier API key or institutional token was available in the configured
research environment on 2026-08-07. No Scopus result count, coverage result,
or publisher/index-native search claim is inferred from that absence.

A credential-free DBLP title census was executed as replacement evidence. It
is useful but not equivalent to Scopus. The preserved Scopus plan is future
work rather than a v1 release requirement. Stable v1 instead uses
`not-performed-with-disclosed-source-limitations`, reports explicitly that
Scopus was not searched, and remains conditional on adjudicating the candidates
already surfaced.

## Replacement evidence executed

The plan `erca_dblp_title_census_plan_2026-08.json` applies the same eight
topic boundaries to eight named software-engineering and CSCW venue streams
for 2018 through 2026. The exact SPARQL query, its SHA-256, all returned result
bindings and their SHA-256, zero-result cells, and upstream comparison hashes are preserved in
`../dblp-title-census-2026-08.json`.

The 64 topic-by-venue cells returned 55 unique publications in 21 nonempty
cells. One publication was already in the manuscript's resolved-reference
metadata, four had appeared in the OpenAlex coverage probe, and 50 were absent
from both prior sets. Those 50 records are a title-screening queue, not 50
admissions. Final inclusion remains an author decision under the published
screening protocol.

This lane complements the existing OpenAlex venue probe, Crossref DOI identity
resolution, SciX exact-DOI audit, and arXiv/SciX review. The systems remain
separate source lanes; overlap does not turn any one of them into a recall
estimate for another.

## Equivalence assessment

| Capability | Scopus plan | DBLP replacement |
| --- | --- | --- |
| Named venue restriction | Yes | Yes, through curated publication streams |
| 2018--2026 interval | Yes | Yes |
| Title search | Yes | Yes |
| Abstract and author-keyword search | Yes | No |
| Complete zero-cell accounting | Planned | Preserved |
| Provider/index-native provenance | Yes | No |
| Open redistributable metadata | Restricted retention boundary | DBLP metadata is CC0 1.0 |
| Equivalence established | Target lane | No |

DBLP's public SPARQL service and RDF schema document the venue-stream model.
DBLP releases its metadata under CC0 1.0 and recommends persistent monthly
snapshots for fully replayable experiments. This run used the live SPARQL
service, so the exact returned result bindings and query hash are preserved with the
artifact rather than claiming that a later live query will be byte-identical.

Sources:

- <https://sparql.dblp.org/>
- <https://dblp.org/rdf/docu/>
- <https://dblp.org/db/about/copyright>
- <https://dblp.org/faq/4621382>
- <https://service.elsevier.com/app/answers/detail/a_id/11365/supporthub/scopus/>
- <https://dev.elsevier.com/documentation/SCOPUSSearchAPI.wadl>

## Required follow-through

The 50 records absent from both prior sets require title and, for retained
candidates, abstract/full-text screening. Every exclusion needs a reason;
admitted sources require a bounded claim, evidence-group adjudication, and
manuscript placement. Exact-DOI enrichment supplied abstracts for 47 records,
and the companion preserves preliminary model recommendations for all 50. The
34 retained candidates were discovered after the August 6 cutoff; none
identified a factual correction, so all were deferred to the next-edition
queue. The ACM manual lane and a future IEEE API run remain optional
extensions. If executed later, the IEEE credential must first be rotated.
Neither provider plan blocks archival v1, and neither may be represented as
executed from its prepared plan alone.
