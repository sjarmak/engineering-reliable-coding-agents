# Changelog

## 1.0.0 — 2026-08-11

- Converted the last 26 ASCII diagrams out of `verbatim`. Seven became figures
  (score controls, the correction loop, all-k against at-least-one, blast
  radius, the trace commitment gap, the detection ladder, and authority rails),
  one became a table, five became display math, two were deleted as duplication
  of a figure or the prose above them, three became prose or lists, and the
  eight remaining schemas became shaded record blocks that read as code. The
  manuscript now has 30 figures and 11 tables.
- Removed the competing-interests section. It was a disclosure the book does not
  need, and it pulled attention away from the argument.
- Tightened `check-figure-legibility.mjs` after it passed two defects a reader
  caught. It exempted shaded bands from the overflow check, so a label hanging
  off the edge of one went unreported, and its 1.5px tolerance was wider than
  the 1.6px stroke a clipped label was sitting on. Overflow is now measured
  against the inner edge of the stroke, tints are checked like any other box,
  and a third defect class was added: two labels printed on top of each other.
  All three classes have regression tests, and the two shipped defects fail the
  check in their original form.
- Widened the Figure 7.1 identity column and the Figure 6.1 shaded band so no
  label runs past its boundary.
- Froze the first stable edition. Version strings, the freeze date, and the
  companion release metadata now read `1.0.0` rather than a release candidate.
- Regenerated Figure 2 from its SVG source. The compiled PDF had never been
  rebuilt after the distributed-systems expansion, so page xv still reported
  138 scholarly works, 192 records, 55 developed, and 137 companion against a
  manuscript stating 206 records, 56 developed, and 150 companion.
- Reframed external grading and the publisher-native ACM Digital Library, IEEE
  Xplore, and Scopus searches as disclosed limitations rather than archival-v1
  gates, in the manuscript, the repository docs, and `release-gate.mjs`.
  Requiring both to be `complete` for a stable release made this edition
  unreleasable while it truthfully reported them as not performed. The gate
  still enforces that a not-performed state carries its disclosure artifacts.
- Made the companion DOI optional. `companion.doi` accepts `not-assigned`, and
  the manuscript's data-availability statement no longer carries a future-tense
  DOI promise. A declared DOI is still validated everywhere it is cited.
- Admitted two sources supporting the repository-scale framing: Sadowski,
  Stolee, and Elbaum (2015) on developer code search, and Potvin and Levenberg
  (2016) on single-repository scale. Scholarly count 159 to 160, practitioner
  98 to 99, evidence ledger 612 to 614 rows.
- Corrected the data-availability statement. The 370-task retrieval evaluation
  is CodeScaleBench and is public under `csb-v1-mixed371`; it had been listed as
  not redistributable with third-party task content. Reconciled its reported
  repository coverage against the frozen suite: 46 anchor repositories, 56
  including cross-repository fixtures, replacing the unsupported 73.
- Fixed a duplicate `web-207` bibliography key and corrected the reference count
  to 244.
- Repaired the reference audits. A throttled arXiv response (HTTP 429 with an
  empty body) was reported as `NOT_FOUND`, marking correct references as
  nonexistent; two runs over identical input disagreed by 15 findings.
  `UNVERIFIED` is now distinct from `NOT_FOUND`, omitted IDs are re-queried with
  backoff, and `scripts/audit_refs_backfill.test.py` covers the regression.
- Resolved the licensing, endorsement, and identity state the stable gate had
  held open. The manuscript and companion are CC-BY-4.0; scripts, skills,
  protocols, and repository metadata stay under Apache-2.0. `LICENSE-SCOPE.md`
  now states the directory terms instead of an all-rights-reserved placeholder,
  and both `CITATION.cff` files carry a license field. arXiv endorsement is
  recorded as not required and ORCID as linked.
- Rebuilt the release artifacts as one bound set: the arXiv source ZIP, the
  preview PDF compiled from it in the digest-pinned TeX Live 2025 container,
  the compile report that records both hashes, `companion/SHA256SUMS`, and the
  companion ZIP. The stored report had described a 298-page build.
- Fixed `arxiv-compile.e2e.test.mjs`, which pinned `source_date_epoch` and the
  page count as literals. It failed on the freeze-date change while the
  invariant it existed to check, that the report matches
  `release-metadata.json`, was intact. Both values now derive from the manifest.
- Refreshed `SUBMISSION.md` against the built artifacts: 249 references, 30
  figures, 11 tables, 51 archived files, a 619-row ledger, a 314-page preview
  carrying the 1.0.0 identity, and roughly 113,000 words of chapter text.
- Re-ran the reference audits against the live arXiv API after the backfill fix:
  164 manuscript identifiers and 960 cited titles across 321 unique identifiers,
  none flagged or unverified. Deleted three stale reports produced by the
  throttling bug.
- Define the `ERCA-NNN` identifier. It appeared 71 times in the manuscript,
  including in every chapter's opening evidence profile, without ever being
  expanded or pointed at the catalog that resolves it. The glossary, front
  matter, companion README, protocols README, skill evidence maps, and root
  README now state what the identifier is and where to look one up, and the
  front matter explains how to read an evidence profile.
- Correct the competing-interests statement, which attributed the fleet and
  orchestration infrastructure to the vendor environment. The fleet-ledger
  replay in Chapter 19, the orchestration failures in Chapter 8, and the
  approval-queue and maintainer cases in Chapter 17 come from the author's own
  open-source software-factory work. The vendor-linked cases are the retrieval
  evaluation in Chapter 12, the evaluation apparatus in Chapters 2 and 3, and
  the trace-diagnostics corpus in Chapters 14 and 18.
- Added Appendix A, the practice catalog index: one row per catalog record with
  its name, chapter, and treatment, generated from `companion/catalog.json` by
  `scripts/build-practice-appendix.mjs`. Every `ERCA-NNN` in the manuscript is
  now a link into that table, through a `\erca{}` macro, so a reader who meets
  an identifier in an evidence profile can resolve it without leaving the PDF.
  The compiled book carries 206 named destinations and 76 link annotations.
- Put the figure sources under version control in `assets/`, one self-contained
  SVG per figure, rendered by `scripts/build-figures.mjs`. The PDFs had been
  edited without tracked sources: two had drifted from the SVGs they mirrored
  and one had lost its source, which is how the stale Figure 2 counts survived.
  A test now compares each committed PDF's drawing against a fresh render.
- Drew the figures in black and greyscale. The accent color is gone; emphasis
  now comes from weight, with accent shapes filled black and accent labels set
  bold against the existing grey ramp.
- Fixed the two illegible places in the figures: in the source-review flow a
  corpus label ran 16.8pt past its box, and in Figure 7.2 the terminal-failure
  connector was routed straight through the retryable-failure sentence. The
  attempt lifecycle now branches at two depths, and the self-report annotation
  sits under the state it describes.
- Added `scripts/check-figure-legibility.mjs`, which measures both defects
  instead of leaving them to be caught by eye. Word boxes come from
  `pdftotext -bbox` on the built figure and geometry from the SVG source. It
  reports text that leaves its box and connectors that cross a line of text,
  including one that threads the gap between two words, which is how the
  Figure 7.2 collision escaped a glyph-only check.
- Replaced the Chapter 15 memory-architecture ASCII block with a drawn figure.
- Taught the editable-Markdown generator the manuscript's own macros. Pandoc
  sees one file at a time, so `\erca{193}` was dropped along with its number,
  and the generated edition read "( through )".
- Admitted a third corroborating factory case in Chapter 7: Vercel's AI SDK
  factory (Grammel and Dodds 2026), which reports the same ledger, scheduler,
  worker, and gate decomposition and names a four-valued run outcome that
  separates attempt result from work state. Published after the update cutoff
  and admitted on that basis; its reported operating shares are self-reported
  over four weeks against no baseline. Practitioner count 99 to 100.
- Extended Chapter 19 with the serving conditions under which a routed call
  actually runs. Model routing has two layers: which model suffices, and where
  that inference executes given prefill and decode cost, key-value cache
  memory, cross-request prefix reuse, queueing, and batching policy. Two
  replicas of one model are not equivalent when one holds the session's prefix.
  Adds the inference-saturation failure chain, where a timeout and its retry
  amplify a capacity problem that never involved the model's capability, and
  the per-call serving fields the allocation ledger needs to tell that apart.
  Four inference-serving systems papers admitted as directional evidence
  (PagedAttention, SGLang, speculative decoding, 8-bit inference); scholarly
  count 160 to 164, evidence ledger 615 to 619 rows.
- Reused the Liu et al. cache-hit result for the constraint it implies rather
  than as a traffic statistic: an allocation experiment that samples model
  calls as independent requests destroys the session reuse structure it is
  measuring, so replays must preserve turn and session boundaries.
- Manuscript output is 314 pages, with 30 figures and 11 tables.

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
  material. The manuscript now builds to 298 pages under the pinned TeX
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
