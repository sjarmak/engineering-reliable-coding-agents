# Provenance

Canonical repository: [https://github.com/sjarmak/engineering-reliable-coding-agents](https://github.com/sjarmak/engineering-reliable-coding-agents)

Interactive companion: [https://sjarmak.ai/books/engineering-reliable-coding-agents/companion](https://sjarmak.ai/books/engineering-reliable-coding-agents/companion)

Derived agent skills: [https://github.com/sjarmak/engineering-reliable-coding-agents/tree/main/skills](https://github.com/sjarmak/engineering-reliable-coding-agents/tree/main/skills)

## Source snapshot

- Public manuscript chapter snapshot: packaged with companion version `1.0.0-rc.14` in the canonical repository.
- Human-readable companion input SHA-256: `1e01ccd0cafd92d526b4b86cc688647f740c4e1f84133b3d75f832f9a109bef3`.
- Practice catalog input SHA-256: `1709cc2216d46cf41cedbd580e6b7b9f424815a7ee2f8259f6e546e8a0500019`.
- Companion chapter-map input SHA-256: `b31599ac15bbb7747a704d0f9691c6f02fd6a7f72bb7d505fb5826c65fac7ffe`.
- Developed-practice map input SHA-256: `ce0100e923059ffbd2799af59a472454e8b4ea75893c22b765685eaa7e153513`.
- Benchmark catalog input SHA-256: `2e65dfebc4ba14990ddec70294efc6ac196f8bf693556c4c6a01df9c4c95a90f`.

Corpus counts, retrieval revisions, and retained thread hashes appear in `methodology/source-snapshot.json`. The hashes identify exact retained inputs without exposing workstation paths or unpublished repository contents. The v1 external-grading boundary appears in `methodology/external-grading/status.json`: zero readers were commissioned, no responses or agreement statistics are represented, and the edition makes no independent-calibration claim.

## Transformations

`LEARNINGS.md` is generated from the website companion source by removing site frontmatter and replacing rendered MathML spans with ordinary inline LaTeX. Internal evidence shorthand and editorial workflow notes were replaced by reader-facing `source_kind` and `evidence_group` fields in the machine-readable catalog. Internal derivation pointers were omitted. Five public-release evidence records were narrowed or reclassified to match the claim tested by the cited source: the SkillEvolBench and CoIR records under `run-ablation-controls`, the CodeSearchNet record under `hybrid-retrieval-fused-on-ranks`, the memory-degradation record under `retain-raw-distill-separately`, and the Netflix migration record under `use-durable-workflow-engine`. Eleven post-consolidation scholarly records and nine software-engineering coverage-probe records were added with claim-specific evidence groups; their record-level rulings appear in `methodology/screening-decisions.csv`.

The OpenAlex probe is published as a coverage diagnosis rather than evidence of publisher- or index-native coverage. ACM Digital Library, IEEE Xplore, and Scopus were not searched for this release candidate, and their exact plans remain stable-v1 release requirements. A follow-up exact-DOI audit found all 26 TSE candidates from that probe in SciX; the artifact states explicitly that this known-set overlap is not a recall estimate. A later DBLP title census preserved its exact 64-cell query and 55 unique results, including 50 absent from both prior comparison sets. That lane is labeled title-only replacement evidence, not publisher-native or Scopus-equivalent coverage. Exact-DOI enrichment supplied 47 abstracts for preliminary model triage; 34 full-text recommendations and 16 preliminary deferral/exclusion recommendations are preserved. The 34-row adjudication packet narrows the retained recommendations to candidate claims, manuscript placements, evidence bases, and access routes. Source-hashed page-level verification notes identify the exact public full-text bytes for all 18 open-routed candidates and 13 records later located through bounded exact-title searches. A separate artifact preserves the three remaining access exceptions and prevents metadata or a browser extract from being represented as source-hashed full text. Because the census postdated the August 6 cutoff and none of the candidates identified a factual correction, all 34 retained records were deferred to the next-edition queue rather than admitted to v1.

The external-grading form is generated only from the label-free packet and carries its SHA-256 identity; completed reader responses are not included. The known DynTaskMAS author-name defect in the source catalog was corrected from “Yin” to Yu, Ding, and Sato using the official arXiv record. Official arXiv metadata captured during the manuscript reference audit supplies citations and appears under `resolved_metadata`.

The external-grading packet is retained as the stable-v1 calibration protocol. No readers have been commissioned and no calibration report exists for this release candidate; the absence of responses is both a disclosed limitation and an incomplete stable-release gate.

The arXiv compilation report binds the exact source ZIP to a digest-pinned TeX
Live 2025 environment, the selected XeLaTeX processor, the release-date source
epoch, the generated PDF hash, structural PDF properties, and material
diagnostic count. Two clean offline runs from separate temporary directories
produced the same PDF hash. The report is build provenance, not evidence for a
substantive manuscript claim.

The separately packaged skills retain their own practice maps and evidence boundaries. They are derived operational artifacts and are not counted as independent evidence.

Corroborating author-system records remain available for reproducibility but are explicitly excluded from independent external evidence. Records previously removed from supporting evidence are retained as null or conflicting material with their limitation. Mutable practitioner pages retained by the manuscript have canonical and archived locations in `WEB-SOURCE-PRESERVATION.md`; unstable unsupported records removed during review are named there for auditability.

## Excluded material

The package excludes private working notes, detailed selection deliberations beyond the published update rulings, rejected catalog entries, private comments, unpublished raw operational data, local configuration, and internal receipts. The release is a public research artifact, not a mirror of the working directory.
