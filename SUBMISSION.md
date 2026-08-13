# arXiv submission handoff

Prepared August 7, 2026 and updated at the August 11, 2026 freeze, for the August 2026 edition of *Engineering Reliable Coding Agents*.

## Positioning

“Monograph” is the conventional scholarly term for a sustained book-length treatment of one subject. The stable positioning for this work is **technical review and engineering monograph**: “technical review” foregrounds the evidence synthesis, while “engineering monograph” accurately describes its scale and organizing argument. The title page carries only the title, subtitle, author, and date.

## Prepared files

- `engineering-reliable-coding-agents-arxiv-source.zip`: LaTeX source for arXiv.
- `engineering-reliable-coding-agents-preview.pdf`: PDF compiled from that source.
- `engineering-reliable-coding-agents-companion-1.0.0.zip`: separate companion research artifact.
- `engineering-reliable-coding-agents-skills-0.1.0.zip`: reusable agent workflows derived from selected companion practices.
- `reference-audit/README.md`: reference-audit summary.

The manuscript source ZIP does not contain the companion dataset. This keeps the article submission small and self-contained while allowing the catalog and evidence ledger to receive their own version and DOI.

## Paste-ready arXiv metadata

### Title

Engineering Reliable Coding Agents: Evaluating and Operating the System Around the Model

### Authors

Stephanie Jarmak

Add an affiliation only if it is current and should be public. Use the same name form as existing publications and connect the ORCID record before submission.

### Abstract

AI coding agents are commonly evaluated as models but deployed as systems whose behavior also depends on evaluation harnesses, execution state, retrieval, memory and state management, permissions, review interfaces, and resource allocation. This technical review and engineering monograph examines reliability at those system boundaries. A structured multivocal search, bounded update audit, software-engineering coverage probe, and distributed-systems evidence synthesis assembled 164 scholarly works, 100 practitioner records, 29 benchmark records, and 17 author-system case records. Sources were screened through stated inclusion and exclusion criteria, assigned claim-scoped quality assessments, and challenged through targeted audits; ambiguous classifications defaulted to the lower group. Across this evidence, many apparent model failures originate elsewhere in the system, and improvements measured at one layer often fail to propagate to end-to-end outcomes, so evaluation and operation are treated as a dependency chain. The study contributes a versioned catalog of 206 reliability records: 193 gated practices, including 56 developed in depth, plus 13 research leads; an evidence ledger linking claims to their support; a system-level model of the software factory and the contracts it must hold; scoped measurements and failure cases from author-operated systems; runnable protocols; and five reusable skills with evidence maps. The review is structured rather than exhaustive, evidence strength varies by topic, capability results remain time- and workload-dependent, and author-system cases are illustrations rather than independent external evidence. The methods section records which search lanes this edition executed, which remain unexecuted, and the limits those choices place on its evidence-grading claims.

### Comments

Technical review and engineering monograph, 314 pages, 30 figures. Includes an evidence audit, a companion research artifact with 206 reliability records, and runnable protocols for evaluating and operating AI coding agents. August 2026. Source, companion, and reusable protocols: https://github.com/sjarmak/engineering-reliable-coding-agents.

If the companion receives a DOI before submission, append `Companion DOI: <DOI>.` Otherwise use the text above without a DOI placeholder.

### Categories

- Primary: `cs.SE` — Software Engineering
- Cross-list: `cs.AI` — Artificial Intelligence

Keep the cross-list to these two categories. The contribution centers on software measurement, testing, debugging, programming environments, operations, and governance; multi-agent topology is only one part.

### Other fields

- Report number: leave blank unless an institution has assigned one.
- Journal reference: leave blank until formally published.
- DOI: leave blank for the manuscript; do not enter the DOI arXiv later assigns automatically.
- ACM classification: optional; leaving it blank is reasonable.

## Companion release sequence

The companion should be a separate citable research artifact, not extra files inside the arXiv TeX archive.

Use the public [Engineering Reliable Coding Agents repository](https://github.com/sjarmak/engineering-reliable-coding-agents) as the versioned scholarly record for the book and companion. The website remains the reading and discovery layer. A practical top-level layout is `manuscript/` for the LaTeX source, `companion/` for the catalog, ledger, crosswalk, benchmark data, schemas, and provenance files, plus `CITATION.cff`, a release changelog, and separate manuscript and companion license files. Publish immutable version tags. Archiving the companion through Zenodo or another DOI-granting service is optional and is not done for this edition.

Licensing is scoped by directory in [`LICENSE-SCOPE.md`](LICENSE-SCOPE.md): the manuscript and companion are CC-BY-4.0, and the root Apache-2.0 license covers scripts, skills, protocols, and repository metadata.

1. Complete the author review of `companion-release/`.
2. Confirm the directory-scoped licenses still describe the intended grant.
3. Confirm that `release-metadata.json` records the resolved license, endorsement, and ORCID states.
4. Rebuild both ZIPs and compile the exact final manuscript archive. Run `node --test scripts/release-gate.test.mjs scripts/arxiv-compile.test.mjs`, `node --test scripts/arxiv-compile.e2e.test.mjs`, `node scripts/release-gate.mjs`, and `node scripts/arxiv-compile.mjs`; the stable gate must pass without pending fields and the new compilation report must be included in the companion.
5. Commit the exact verified objects, then create the immutable `v1.0.0` tag and GitHub release.
6. Upload the arXiv source archive, not the compiled PDF: arXiv prefers TeX source and normally rejects PDFs produced from LaTeX.

The blinded external-grading pass and the publisher-native ACM Digital Library,
IEEE Xplore, and Scopus searches are disclosed limitations of this edition, not
preconditions for it. Both packets ship so a later edition can execute and
adjudicate them, and neither blocks this release.

No archival DOI is assigned. arXiv requires that linked code and data be
publicly available, which the public repository satisfies. If a DOI is minted
later, set `companion.doi` in `release-metadata.json` and carry the same value
into both `CITATION.cff` files, the companion README, the manuscript's Data and
materials availability statement, and the arXiv Comments field; the release gate
enforces that consistency whenever a DOI is declared, and accepts
`not-assigned` when one is not.

The companion release contains:

- a human-readable, chapter-organized presentation of all 206 reliability records, with a direct link to the interactive website companion;
- 193 gated practices, including 56 developed in depth, plus 13 research leads, all with boundary conditions;
- a 619-row evidence and corroboration ledger;
- a crosswalk mapping the 193 gated records to chapters, separating 56 manuscript-developed practices from 137 chapter-assigned companion-only practices; the 13 catalog-level leads (ERCA-193 through ERCA-205) are indexed in the catalog outside that gated crosswalk, giving 150 companion-only records in total;
- 29 benchmark records;
- resolved metadata for 321 arXiv identifiers, 16 DOIs, and 65 other web sources;
- source snapshots, seven literature-review thread protocols, a 160-work scholarly corpus, 39 record-level update-screening decisions, a 148-record software-engineering coverage probe, a deterministic 40-DOI SciX comparison, a complete 26-record TSE known-set audit, a 55-record DBLP title census with 50 records absent from both prior comparison sets, and the prepared ACM, IEEE, and Scopus plans;
- a blinded external-grading packet for 20 practices, a self-contained reviewer form, and a strict analyzer for Cohen's and Fleiss's kappa, confusion matrices, and item-level disagreement analysis;
- JSON Schemas, provenance hashes, citation metadata, and checksums.

The separately packaged skills bundle contains five derived operational
workflows with practice-level evidence maps. Treat the skills as implementation
artifacts rather than independent evidence, and keep them outside the arXiv TeX
archive.

Author-system cases are labeled as illustrations and are explicitly excluded from independent external evidence. Working notes, rejected candidates, private comments, local paths, unpublished raw operational data, and internal derivation records are excluded.

## Reference-audit result

Two passes are recorded in `reference-audit/`. The identifier-resolution pass of August 6 covers all 21 manuscript files and the practice records present at that date, 192 of them, and its machine-readable result is `reference-audit.json`. The citation re-verification pass of August 11 covers the current `references.tex`, evidence ledger, catalog, and chapter prose against the live arXiv API: 164 manuscript identifiers all resolved with matching titles, and 960 cited titles across 321 unique identifiers with zero flagged and zero unverified.

- 319 unique arXiv identifiers resolved from official arXiv API metadata on August 6; zero unresolved. That run reused previously resolved official-API metadata after the API became temporarily unavailable, and records the fallback in its machine-readable method field. The August 11 pass queried the live API for every identifier and needed no fallback.
- Fourteen DOI records resolved through Crossref; zero unresolved. The manuscript now cites 17 DOIs after the repository-scale additions.
- 42 other web URLs checked with redirects enabled.
- Four canonical pages returned HTTP 403 to the automated client: two official OpenAI pages, one Netflix engineering post, and one Instacart engineering post. Their citation identities and canonical URLs are retained; the OpenAI claims were also checked against rendered pages during the source audit.
  - `https://openai.com/index/separating-signal-from-noise-coding-evaluations/`
  - `https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified`
  - `https://netflixtechblog.com/how-temporal-powers-reliable-cloud-operations-at-netflix-73c69ccb5953`
  - `https://tech.instacart.com/blueberry-force-multiplier-for-the-on-call-engineer-98c446dfcc12`
- The audit found and corrected one author-name defect in the companion source: DynTaskMAS is by Yu, Ding, and Sato, not “Yin.”
- Four retained practitioner pages on mutable hosts have timestamped Internet Archive snapshots listed in the companion's `WEB-SOURCE-PRESERVATION.md`. Unsupported swyx and Patwardhan records, plus an unarchivable X post, were removed rather than left as unstable support.

Identifier resolution verifies that the cited record exists and captures current metadata. The manuscript’s chapter-level evidence notes remain responsible for claim scope; the strength audit records where a source supports only a mechanism or direction rather than the full practice.

## Release decisions

1. **Manuscript license.** CC-BY-4.0. The arXiv grant is irrevocable for the submitted version.
2. **Companion license.** CC-BY-4.0, matching the manuscript so the catalog, ledger, and benchmark metadata carry one reuse rule. Scripts, skills, and protocols stay under the root Apache-2.0 license.
3. **Endorsement.** Not required.
4. **Identity.** ORCID linked; author name matches existing publications.
5. **Companion DOI.** Not assigned. arXiv requires linked code and data to be publicly available, which the public repository satisfies.
6. **External grading calibration.** Deferred to a later edition and disclosed as a limitation. The blinded 20-practice packet, reviewer form, and analyzer ship so independent readers can run it.
7. **Publisher- and index-native SE search.** Deferred to a later edition and disclosed as a limitation. The ACM Digital Library, IEEE Xplore, and Scopus plans ship unexecuted; DBLP, OpenAlex, and web-surrogate discovery remain non-equivalent diagnostics.
8. **Structural freeze.** Read the generated PDF as a permanent, citable edition. Check every chapter start, figure, table, equation, source section, and the closing chapter. Confirm that extracted text contains no `ů` or `Œ` substitutions and that Introduction continuation pages retain the correct running header.
9. **Reference exceptions.** The four HTTP 403 results are access restrictions rather than unresolved identifiers. Recheck them manually at structural freeze if their claims remain material.

## Requirement verification status

Verified against the official arXiv and Zenodo documentation on August 7,
2026:

- `cs.SE` is the correct primary category because arXiv defines it to cover
  software metrics, testing and debugging, and programming environments.
  `cs.AI` remains the only cross-list; arXiv says one or two justified
  cross-lists are normally the practical limit.
- The title, authors, and abstract are required metadata. Comments are optional
  but recommended and should carry the page and figure counts plus the
  companion location. The manuscript DOI field remains blank because that
  field is reserved for a publication DOI, not the companion DOI.
- When TeX source exists, submit the source archive rather than its generated
  PDF. arXiv compiles submitted TeX and normally rejects a PDF generated from
  TeX except case by case; the generated result must be inspected.
- Endorsement cannot be proven from repository state. arXiv reveals the need
  after a submitter starts a submission and selects the category; a new
  category may require endorsement even for an existing account. Confirm the
  recorded `not-required` state in the draft submission before uploading.
- ORCID linkage is an arXiv account action. Confirm it on the user page.
- The arXiv license is irrevocable for the version it is attached to. This
  edition grants CC-BY-4.0, matching the repository's manuscript terms.

The machine-readable state is in `release-metadata.json`. Category and
cross-list choices are verified. This edition records external
grading as `not-performed-with-disclosed-limitation` and native search as
`not-performed-with-disclosed-source-limitations`; both are disclosed
limitations that the stable `1.0.0` gate accepts, and both carry their status
artifacts. Candidate adjudication is complete under the August 6 cutoff.
License, endorsement, and ORCID are resolved; no DOI is assigned.

## Submission sequence

1. Sign in at `https://arxiv.org` and create a new submission.
2. Select `cs.SE` as primary and `cs.AI` as the only cross-list.
3. Resolve any endorsement prompt.
4. Upload the exact verified `engineering-reliable-coding-agents-arxiv-source.zip`; do not upload the locally generated PDF in place of TeX source.
5. Confirm that arXiv identifies `main.tex` as the top-level file. Select XeLaTeX with TeX Live 2025; this is the verified processor recorded in `manuscript/00README` and `release-metadata.json`.
6. Compare arXiv’s generated PDF with `engineering-reliable-coding-agents-preview.pdf`.
7. Inspect the title page, abstract, table of contents, all part and chapter starts, equations, hyperlinks, all 30 figures, and all 11 numbered tables.
8. Paste the metadata above without the Markdown headings or any unresolved placeholder.
9. Select CC-BY-4.0 as the license.
10. Submit for moderation. After announcement, record the arXiv identifier and DOI on the website and in the companion metadata.

## Technical validation

- Exact source ZIP compiled twice in fresh temporary directories with XeLaTeX under the digest-pinned TeX Live 2025 container recorded in `companion/methodology/release-verification/arxiv-compile-report.json`. Both offline runs produced the same PDF SHA-256.
- Output: 314 letter-size pages, single-spaced, one-inch margins, PDF 1.7. A separate `pdflatex` diagnostic is not the release processor.
- Figures: 23 of 23 included as PDF, 21 numbered by chapter plus 2 in the front matter; tables: 10, of which 7 are numbered by chapter, 2 appear in the front matter, and 1 is the appendix index.
- Chapter sources: 19 unnumbered chapter-end source blocks, excluded from the numbered section hierarchy and table of contents.
- Full references: 249 alphabetized entries; all manuscript-cited arXiv identifiers, 17 DOI records, and audited web sources are represented, with additional named sources and author illustrations identified separately.
- Text extraction: approximately 113,000 machine-readable words in the numbered chapters and closing chapter, plus front matter, glossary, references, and the data statement.
- PDF security: no encryption, JavaScript, forms, or embedded multimedia.
- Archive hygiene: 51 required files (54 ZIP entries including directories); no generated manuscript PDF, log, auxiliary file, Markdown source, dataset, or private note.
- TeX diagnostics: no errors, missing files, missing characters, undefined commands, or overfull boxes. A small number of harmless underfull-box warnings remain in source-list paragraphs.
- Prose review: all 21 source files were reviewed for academic register, casual framing, unsupported certainty, promotional language, and unexplained internal evidence shorthand.
- Companion checks: catalog and benchmark JSON validate against their schemas; checksums pass; the evidence ledger contains 619 records with a consistent 13-column structure. The update-screening decisions total 39: 11 admitted, one already present, and 27 deferred or excluded. The 148-record SE coverage probe admitted nine works, retains the 40-DOI diagnostic sample, and records that all 26 TSE candidates in the known set match SciX exactly by DOI.
- Release contract: `release-metadata.json` agrees with the 1.0.0 metadata; every file in the arXiv source and companion ZIPs matches the repository byte-for-byte; the preview is an unencrypted 314-page letter-size PDF carrying the 1.0.0 identity; the TeX Live report binds a clean 314-page XeLaTeX build to the exact source ZIP; extracted text contains no observed substitution glyphs or leaked front-matter running headers; the stable-mode gate rejects unresolved licensing, identity, or endorsement state, and rejects a declared DOI that is malformed or inconsistently carried.

## Official arXiv guidance

- TeX submissions: https://info.arxiv.org/help/submit_tex.html
- Metadata preparation: https://info.arxiv.org/help/prep.html
- Category taxonomy: https://arxiv.org/category_taxonomy
- Cross-listing: https://info.arxiv.org/help/cross.html
- Endorsement: https://info.arxiv.org/help/endorsement.html
- Licenses: https://info.arxiv.org/help/license/index.html
- ORCID: https://info.arxiv.org/help/orcid.html
- Announcement schedule: https://info.arxiv.org/help/availability.html
- Reserve a Zenodo DOI (optional, unused for this edition): https://help.zenodo.org/docs/deposit/describe-records/reserve-doi/
