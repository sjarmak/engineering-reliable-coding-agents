# Changelog

## 1.0.0-rc.16 — 2026-08-09

- Restructured Chapter 7 to the book's chapter form after editorial review: a
  sourced opening tied to Chapter 9's guarded-mutation fault demonstration
  with the duplicate-pull-request incident marked as a constructed sequence,
  the historical lineage compressed to one paragraph, the five distinctions
  kept as the chapter's core, a closing audit procedure for one logical work
  item, and the reliability-dimensions and book-map sections removed.
- Renamed the eleven invariants to factory contracts, grouped them as six
  contract families in the chapter, and published the full machine-testable
  catalog as `protocols/factory-contracts.yaml`; all cross-chapter references
  now cite contracts. Added `input_state_id` to the identity vocabulary and
  revised the `verification_id` and `effect_id` definitions.
- Replaced both Chapter 7 figures: the reference decomposition became an
  identity-and-boundary model, and the state machine now shows separate
  logical-work and attempt lifecycles with explicit retry and reassignment
  transitions.
- Normalized all evidence profiles to the declared four-group taxonomy;
  preprint status, practitioner authorship, and historical lineage are now
  source attributes, not evidence grades.
- Reduced the Chapter 10 ambiguity-fault table to five representative rows,
  published the full matrix as `protocols/distributed-ambiguity-faults.yaml`,
  and corrected the protocol wording (faults added to the test menu, not
  injected results).
- Reorganized Chapter 19's overload section around three responsibilities,
  opened it with the retained contended-pool replay observation, and assigned
  the admission-and-recovery-capacity practice its stable identifier
  (ERCA-206); the catalog now holds 206 records, 56 developed.
- Added the versioned code-estate view to Chapter 18's task-node record and
  Chapter 19's allocation ledger as a proposed control-plane requirement, with
  full cross-repository campaign semantics kept in the repository artifacts.
- Applied the aphorism and generic-authority prose pass across the new
  material. The manuscript now builds to 297 pages under the pinned TeX
  Live 2025 image.

## 1.0.0-rc.15 — 2026-08-09

- Added Chapter 7, "The software factory as a distributed system": the factory
  decomposition, the ledger-owned work state machine, the identity vocabulary
  (work, ownership epoch, attempt, artifact version, verification, effect), and
  invariants I1 through I11 that later chapters cite by identifier. Chapters
  formerly numbered 7 through 18 are now 8 through 19; files, figures, labels,
  cross-references, and the companion crosswalk were renumbered to match.
- Integrated the distributed-systems evidence base: Chubby, ZooKeeper, Beldi,
  ExoFlow, Fractal, FATE/DESTINI, lineage-driven fault injection, Legolas,
  Sieve, Pilot Execution, Borg, Omega, Mesos, Retro, and Build Systems à la
  Carte as directional systems evidence; Osterweil (1987, 1997) and Choi and
  Scacchi (1991) as historical lineage; AWS Builders' Library, Google SRE,
  OpenAI Symphony, Spotify, and Cloudflare as practitioner sources; and three
  2026 preprints (Failure as a Process, Agentic Harness Engineering, flaky
  GitHub Actions builds) as agent-specific evidence. 28 new reference entries.
- Chapter 9 gains the effect-vocabulary table and the authority-generation
  bridge; Chapter 10 gains the distributed-ambiguity fault table; Chapter 6
  gains the verifier-execution-reliability axis and versioned acceptance
  records; Chapter 13 maps freshness mechanisms to the consistency invariants;
  Chapter 11 gains the component-boundary attribution vocabulary; Chapter 18
  gains lease-versus-authority fencing; Chapter 19 gains admission,
  backpressure, retry budgets, and the recovery-capacity experiment.
- Six new hand-authored figures (factory decomposition, factory state machine,
  verifier failure domains, epoch fencing, recovery backpressure, and a
  rebuilt durable-effects timeline with named commitment barriers), with SVG
  sources in the website repository.
- Companion: 13 catalog-level thin-support practice records (ERCA-193 through
  ERCA-205), 29 evidence-ledger rows, and reference metadata for the new
  sources; manuscript and companion counts updated to 205.
- Manuscript now builds to 299 pages under the pinned TeX Live 2025 image.

## 1.0.0-rc.14 — 2026-08-07

- Repaired XeLaTeX character encoding for all chapter evidence profiles and the
  Chapter 5 multiplication example; added release regressions for the observed
  `ů` and `Œ` substitutions and leaked front-matter running headers.
- Restored blinded external calibration and completed ACM Digital Library,
  IEEE Xplore, and Scopus searches as mandatory stable-v1 gates. Disclosure of
  nonperformance remains valid only for an explicitly unfinished release
  candidate.
- Bound the source ZIP, preview PDF, companion, checksums, README, submission
  handoff, citation metadata, and derived skills to the rc.14 identity. The
  arXiv handoff now explicitly requires submitting verified LaTeX source.

## 1.0.0-rc.13 — 2026-08-06

- Added a self-contained blinded-review form for the 20-practice external
  calibration and strengthened the analyzer to reject incomplete responses and
  report confusion matrices and item-level disagreements.
- Audited every TSE record surfaced by the software-engineering coverage probe;
  all 26 candidates matched SciX by exact DOI, without treating that known-set
  overlap as a recall estimate.
- Added preserved 64-cell IEEE and Scopus plans, an API-ready identifier-only
  Scopus client, and a 48-cell manual ACM Digital Library protocol that follows
  ACM's end-user automation restrictions.
- Corrected the release-candidate methods text and front-matter running head,
  rebuilt the 270-page manuscript, and expanded the companion methodology and
  release documentation.

## 1.0.0-rc.12 — 2026-08-06

- Corrected four author attributions introduced by the software-engineering
  coverage probe: Stol and Fitzgerald, Sjøberg and Bergersen, Sun et al., and
  Johnson et al.; aligned the latter record with its 2026 publication year.
- Regenerated the manuscript, companion catalog, evidence ledger, reference
  audit, checksums, and exact arXiv archive from the corrected source records.
- Recompiled the 270-page source archive in a fresh directory and reran the
  65-entry strong-evidence audit and companion validation gates.

## 1.0.0-rc.11 — 2026-08-06

- Preserved the `rc.10` release and advanced the candidate after repairing the
  website's cached empty chapter and companion render.
- Standardized reader-facing companion language on “developed” and
  “companion-only” while retaining the internal classification fields used by
  the parser and graph filters.
- Made the companion importer attach all stable `ERCA` identifiers itself, so
  a content refresh cannot silently remove direct-link and cross-artifact IDs.
- Corrected the review-flow SVG's accessibility and theme metadata, rebuilt the
  exact 270-page TeX archive, and revalidated the companion checksums.

## 1.0.0-rc.10 — 2026-08-06

- Reframed the review as a multivocal software-engineering secondary study,
  added claim-scoped quality-assessment terminology, and documented the
  curation, automation, screening, challenge, extraction, and synthesis steps.
- Added a PRISMA-style review-flow figure, stable `ERCA-001` through
  `ERCA-192` practice identifiers, per-chapter evidence-density banners, a
  glossary, numbered tables, and explicit research-agenda formatting for Part
  VI.
- Ran a software-engineering venue coverage probe over 148 OpenAlex candidates,
  admitted nine methodologically material works, and made publisher-native ACM,
  IEEE, and Scopus searching an explicit archival-v1 gate.
- Added a blinded 20-practice independent-replication packet and agreement
  analyzer. No external graders were commissioned for v1, no agreement value is
  reported, and the edition makes no independent-calibration claim.
- Added six runnable protocols plus a minimum reliability pass, and connected
  every protocol and reusable skill to stable practice IDs.
- Completed the composite-claim audit with 65 of 65 strong-evidence entries
  passing; resolved 319 arXiv identifiers and 14 DOIs; and rebuilt the exact
  clean archive at 270 pages, 17 figures, 7 numbered tables, and 213 references.

## 1.0.0-rc.9 — 2026-08-06

- Added three high-information conceptual figures: the benchmark validity
  chain in Chapter 3, durable execution across the execute-then-log gap in
  Chapter 9, and the distinction between an advisory review and an effective
  human gate in Chapter 17.
- Replaced Chapter 9's text-only execution sketch with the durable-effects
  figure, keeping the mechanism in one place instead of restating it.
- Corrected the LaTeX conversion pipeline to preserve aspect ratios whenever
  Markdown constrains figure dimensions.
- Rebuilt and independently compiled the exact arXiv archive: 258 pages, 16
  figures, 196 references, and no overfull boxes or undefined references.

## 1.0.0-rc.8 — 2026-08-06

- Defined SciX, the local SciX Agent retrieval layer, and Code Intelligence
  Digest in the manuscript's review method; added the human and automated
  decision boundary for source curation and practice selection.
- Published corpus snapshots, seven thread protocols, 118 retained scholarly
  source identities, and 39 record-level decisions from the bounded update
  audit without representing reconstructed queries as historical logs.
- Admitted 11 recent scholarly works with claim-specific evidence groups across
  evaluation validity, gating, safety, diagnosis, retrieval, context files,
  topology, workload characterization, and routing.
- Expanded the reference audit to 319 arXiv identifiers and the bibliography to
  196 entries; all arXiv and DOI identifiers resolve, and 66 strong-evidence
  entries pass the composite-claim audit.
- Rebuilt and independently compiled the arXiv package: 258 pages, 13 figures,
  no overfull boxes, undefined references, or missing characters.

## 1.0.0-rc.7 — 2026-08-05

- Established once that some practices are engineering controls justified by
  a structural mechanism and observable boundary rather than a measured trial
  effect, then materially reduced repeated chapter-level caveat templates.
- Consolidated repeated topology, provenance, freshness, and dependency-chain
  procedures; added clearly labeled personal defaults, an apparatus-cost
  ledger, and a constrained-budget removal order.
- Corrected the LongCodeBench capacity account, GSM1k correlation notation,
  benchmark percentage wording, Skalse theorem scope, and several garbled or
  unfinished passages.
- Removed five low-information or cross-study figures, leaving 13 conceptual
  and data-explanatory figures; verified that the Chapter 10 connector renders
  behind its nodes.
- Removed unstable unsupported citations, archived four retained mutable web
  sources, and documented unreleased author-system data and its constraints.
- Fixed mathematical typesetting for `pass@k`, `pass^k`, and retrieval metrics;
  the final candidate is 254 pages with 183 full references.

## 1.0.0-rc.6 — 2026-08-05

- Audited all 58 strong-evidence entries against the manuscript's
  composite-claim rule and narrowed overbroad claims to the result each source
  directly measures.
- Reclassified the two Chapter 2 synthesis records as directional and aligned
  the companion evidence ledger with the same boundary.
- Defined “unverified working artifact” once, then used “local artifact” in
  subsequent author-system cases.
- Standardized the distinction between `pass@k` (at least one success) and
  `pass^k` (all trials succeed), including a visual typesetting inspection.
- Removed the redundant compaction figure while retaining the comparative
  long-context figure; the manuscript now contains 18 figures and 186
  references.

## 1.0.0-rc.5 — 2026-08-05

- Restored the introduction's method hierarchy so its four components render
  as subsections rather than leaving an empty peer section.
- Added an orienting paragraph to the method section.
- Replaced the ambiguous NASA ADS reference with the full, linked NASA Science
  Explorer (SciX) API name.

## 1.0.0-rc.4 — 2026-08-05

- Added the review method, evidence-grading rules, practice-selection process,
  and explicit limitations to the manuscript introduction.
- Moved the reliability dependency chain into the introduction and added its
  temporal-orchestration-style figure.
- Standardized the work's identity as a technical review and engineering
  monograph, compressed repeated evidence caveats, and marked Part VI as the
  most transfer-heavy section.
- Corrected section numbering, citation metadata, academic register, list
  spacing, and the Chapter 10 figure rendering.
- Replaced the generic recall-depth figure, expanded the bibliography to 185
  entries, and linked the repository, interactive companion, web edition, and
  five reusable agent skills from the manuscript.

## 1.0.0-rc.3 — 2026-08-05

- Added five reusable agent skills for evaluation design, end-to-end testing,
  failure-mode capture, scoped execution, and durable autonomous execution.
- Added practice-level evidence maps and transfer boundaries to every skill.
- Added Codex interface metadata and a reproducible skills-bundle packager.

## 1.0.0-rc.2 — 2026-08-05

- Added `companion/LEARNINGS.md`, a human-readable presentation of all 192
  practices organized by manuscript chapter.
- Added direct links to the interactive website companion.
- Recorded the human-readable companion source and transformation in the
  provenance manifest and release checksums.

## 1.0.0-rc.1 — 2026-08-05

- Added the complete arXiv-ready LaTeX manuscript source.
- Added 18 chapters, the closing chapter, 19 figures, and 182 references.
- Added the 192-practice companion catalog and 564-row evidence ledger.
- Added the benchmark catalog, chapter crosswalk, schemas, provenance,
  citation metadata, and checksums.
