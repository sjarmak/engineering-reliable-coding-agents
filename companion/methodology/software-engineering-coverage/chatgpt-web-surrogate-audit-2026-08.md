# Audit of the ChatGPT web-surrogate workbook

Audit date: 2026-08-07

Workbook: `erca_publisher_coverage_with_web_surrogate_2026-08.xlsx`

SHA-256: `5d04442bac5ca4c61450e5e7a12035e58a095dceac739fd2c68e3fb88362920b`

## Release interpretation

The workbook is retained as candidate-discovery evidence. It is not an ACM
Digital Library, IEEE Xplore, or Scopus execution report and closes zero cells
in those plans. The release state therefore remains ACM 0/48, IEEE 0/64, and
Scopus 0/64.

The workbook contains no formulas, macros, or external-link parts. Its five
worksheets contain:

- a status sheet that preserves the exact SHA-256 digests of the three local
  provider plans and makes no completion claim;
- the exact 8-topic by 6-venue ACM matrix, with all 48 execution rows blank;
- 16 topic-level web-surrogate log rows, all marked incomplete and
  non-provider-native;
- 19 candidate records, 12 with a DOI and seven without one; and
- seven adjacent findings explicitly separated from target-lane hits.

The web logs do not preserve complete result counts or complete provider result
sets. They cannot support recall estimates, PRISMA retrieval counts, or a claim
that any planned cell ran.

## DOI validation and local overlap

The 12 supplied DOI-title pairs were resolved against the Crossref REST API on
2026-08-07. All 12 resolved titles matched the workbook titles after
case-insensitive comparison. The audit then compared normalized DOIs against
five local sets: manuscript citations (14 DOIs), the evidence ledger (4),
`reference-metadata.json` (14), the OpenAlex probe (148), and the DBLP census
(55).

| DOI | Crossref year | Local exact-DOI result |
| --- | ---: | --- |
| `10.1109/ICSE-SEIP66354.2025.00043` | 2025 | Not found in the five compared sets |
| `10.1109/TSE.2024.3474173` | 2024 | Not found in the five compared sets |
| `10.1145/3597503.3639095` | 2024 | Not found in the five compared sets |
| `10.1145/3715754` | 2025 | Not found in the five compared sets |
| `10.1145/3696630.3728549` | 2025 | Not found in the five compared sets |
| `10.1145/3695988` | 2024 | Present in the DBLP census |
| `10.1145/3731559` | 2025 | Not found in the five compared sets |
| `10.1145/3487043` | 2022 | Present in the OpenAlex probe |
| `10.1007/s10664-025-10759-2` | 2025 | Present in the OpenAlex probe |
| `10.1007/s10664-026-10869-5` | 2026 | Present in the OpenAlex probe |
| `10.1007/s10664-026-10889-1` | 2026 | Not found in the five compared sets |
| `10.1007/s10664-026-10812-8` | 2026 | Not found in the five compared sets |

Eight DOI records are therefore new only relative to these five local DOI
sets; this is not an inclusion or novelty judgment. Four are exact overlaps.
The workbook gives 2026 for `10.1007/s10664-025-10759-2`, while Crossref gives
2025. This may reflect online-first versus issue dating, but the boundary must
be resolved before final citation.

## Records without a DOI

The following seven workbook records retain conference-page URLs but need a
stable DOI or other bibliographic identity before deduplication and citation:

- *Evolving with AI: A Longitudinal Analysis of Developer Logs* (ICSE 2026)
- *SWE-Debate: Competitive Multi-Agent Debate for Software Issue Resolution*
  (ICSE 2026)
- *MaCTG: Multi-Agent Collaborative Thought Graph for Automatic Programming*
  (ICSE 2026)
- *Evaluating and Improving Automated Repository-Level Rust Issue Resolution
  with LLM-based Agents* (ICSE 2026)
- *From Overload to Insight: Bridging Code Search and Code Review with LLMs*
  (FSE 2025, Ideas, Visions and Reflections)
- *Support, Not Automation: Towards AI-supported Code Review for Code Quality
  and Beyond* (FSE 2025, Ideas, Visions and Reflections)
- *Explaining Explanations: An Empirical Study of Explanations in Code Reviews*
  (FSE 2025, Journal First)

## Required next handling

1. Resolve the seven incomplete identities and the one publication-year
   boundary through primary bibliographic sources.
2. Deduplicate every candidate against the full evidence corpus, not DOI-only
   subsets.
3. Retrieve and assess full text before making any support or inclusion claim.
4. Preserve author decisions separately from ChatGPT's preliminary relevance
   prose.
5. Execute the provider-native plans separately if their coverage claims are
   to close; never rename this workbook as an execution report.
