# arXiv submission handoff

Prepared August 7, 2026 for the August 2026 edition of *Engineering Reliable Coding Agents*.

## Positioning

“Monograph” is the conventional scholarly term for a sustained book-length treatment of one subject. The stable positioning for this work is **technical review and engineering monograph**: “technical review” foregrounds the evidence synthesis, while “engineering monograph” accurately describes its scale and organizing argument. The title page carries only the title, subtitle, author, and date.

## Prepared files

- `engineering-reliable-coding-agents-arxiv-source.zip`: LaTeX release candidate for arXiv.
- `engineering-reliable-coding-agents-preview.pdf`: PDF compiled from that source.
- `engineering-reliable-coding-agents-companion-1.0.0-rc.16.zip`: separate companion research artifact release candidate.
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

AI coding agents are commonly evaluated as models but deployed as systems whose behavior also depends on evaluation harnesses, execution state, retrieval, permissions, review interfaces, and resource allocation. This technical review and engineering monograph examines reliability at those system boundaries. A structured multivocal search, bounded update audit, and software-engineering coverage probe assembled 138 scholarly works, 91 practitioner records, 29 benchmark records, and 17 author-system case records. Sources were screened through stated inclusion and exclusion criteria, assigned claim-scoped quality assessments, and challenged through targeted audits; ambiguous classifications defaulted to the lower group. The study contributes an evidence ledger, a versioned catalog of 192 practice records with 55 developed in depth, a dependency chain and repair asymmetry across evaluation and operation, scoped measurements and failure cases from author-operated systems, runnable protocols, and five reusable skills with evidence maps. The search is structured rather than exhaustive. The publisher- and index-native supplement remains incomplete in this release candidate: ACM Digital Library and IEEE Xplore were not searched through their publisher lanes, Scopus was not searched through its index, and the 20-practice sample has not received blinded external calibration. All four remain release gates for archival v1. The release candidate therefore claims neither provider coverage nor independent calibration and reports no inter-rater statistic. Evidence is uneven across topics, capability results remain time- and workload-dependent, and author-system cases are illustrations rather than independent external evidence.

### Comments

Technical review and engineering monograph, 271 pages, 17 figures. Includes an evidence audit, a 192-practice companion research artifact, and runnable protocols for evaluating and operating AI coding agents. August 2026. Source, companion, and reusable protocols: https://github.com/sjarmak/engineering-reliable-coding-agents.

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

Use the public [Engineering Reliable Coding Agents repository](https://github.com/sjarmak/engineering-reliable-coding-agents) as the versioned scholarly record for the book and companion. The website remains the reading and discovery layer. A practical top-level layout is `manuscript/` for the LaTeX source, `companion/` for the catalog, ledger, crosswalk, benchmark data, schemas, and provenance files, plus `CITATION.cff`, a release changelog, and separate manuscript and companion license files. Publish immutable version tags and archive the companion release through Zenodo or another DOI-granting service.

The repository currently has a root Apache-2.0 license. Before adding the manuscript or companion files, confirm that this license is intended to cover both. If it is not, replace the root license or add clearly scoped license files and notices before the first content release.

1. Complete the author review of `companion-release/`.
2. Choose a companion license separately from the manuscript license. `CITATION.cff` intentionally has no license field yet.
3. Have at least two independent readers complete the blinded 20-practice external-grading pass, run the analyzer, and report agreement and disagreement patterns without treating the author labels as ground truth.
4. Execute every planned publisher-native ACM Digital Library and IEEE Xplore cell and every index-native Scopus cell; preserve complete result sets, screening decisions, deduplication, and any resulting source or claim changes.
5. Create a draft Zenodo deposit for the companion and reserve its DOI. Do not publish the deposit yet.
6. Replace release-candidate version `1.0.0-rc.14` with `1.0.0`, record the final freeze date, and add the reserved DOI to both `CITATION.cff` files, the companion README, the manuscript’s Data and materials availability statement, and the arXiv Comments field.
7. Replace the provisional directory-license notice with the selected manuscript and companion terms, then update `release-metadata.json` with the resolved license, endorsement, ORCID, DOI, and methodology-gate states.
8. Rebuild both ZIPs and compile the exact final manuscript archive. Run `node --test scripts/release-gate.test.mjs scripts/arxiv-compile.test.mjs`, `node --test scripts/arxiv-compile.e2e.test.mjs`, `node scripts/release-gate.mjs`, and `node scripts/arxiv-compile.mjs`; the stable gate must pass without pending fields and the new compilation report must be included in the companion.
9. Commit the exact verified objects, create the immutable `v1.0.0` tag and GitHub release, then upload those exact release objects to the reserved Zenodo record and publish it.
10. Confirm that the published DOI resolves to the same version and files before uploading the arXiv source archive.

Reserving the DOI before the freeze avoids a circular release sequence: Zenodo
documents that a reserved DOI may be included in files before the record is
published, and registers it when the deposit is published. For this research
artifact, use a direct Zenodo deposit of the exact release objects rather than
assuming GitHub integration metadata will bind every companion asset.

The companion release contains:

- a human-readable, chapter-organized presentation of all 192 practices, with a direct link to the interactive website companion;
- 192 practice records, including boundary conditions;
- a 578-row evidence and corroboration ledger;
- a crosswalk separating 55 manuscript-developed practices from 137 companion-only practices;
- 29 benchmark records;
- resolved metadata for 319 arXiv identifiers, 14 DOIs, and other web sources;
- source snapshots, seven literature-review thread protocols, a 138-work scholarly corpus, 39 record-level update-screening decisions, a 148-record software-engineering coverage probe, a deterministic 40-DOI SciX comparison, a complete 26-record TSE known-set audit, a 55-record DBLP title census with 50 records absent from both prior comparison sets, and the prepared ACM, IEEE, and Scopus plans;
- a blinded external-grading packet for 20 practices, a self-contained reviewer form, and a strict analyzer for Cohen's and Fleiss's kappa, confusion matrices, and item-level disagreement analysis;
- JSON Schemas, provenance hashes, citation metadata, and checksums.

The separately packaged skills bundle contains five derived operational
workflows with practice-level evidence maps. Treat the skills as implementation
artifacts rather than independent evidence, and keep them outside the arXiv TeX
archive.

Author-system cases are labeled as illustrations and are explicitly excluded from independent external evidence. Working notes, rejected candidates, private comments, local paths, unpublished raw operational data, and internal derivation records are excluded.

## Reference-audit result

The audit covers all 21 manuscript files and all 192 companion practices.

- 319 unique arXiv identifiers resolved from official arXiv API metadata; zero unresolved. The current audit reused previously resolved official-API metadata after the API became temporarily unavailable, and records that fallback in its machine-readable method field.
- Fourteen DOI records resolved through Crossref; zero unresolved.
- 42 other web URLs checked with redirects enabled.
- Four canonical pages returned HTTP 403 to the automated client: two official OpenAI pages, one Netflix engineering post, and one Instacart engineering post. Their citation identities and canonical URLs are retained; the OpenAI claims were also checked against rendered pages during the source audit.
  - `https://openai.com/index/separating-signal-from-noise-coding-evaluations/`
  - `https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified`
  - `https://netflixtechblog.com/how-temporal-powers-reliable-cloud-operations-at-netflix-73c69ccb5953`
  - `https://tech.instacart.com/blueberry-force-multiplier-for-the-on-call-engineer-98c446dfcc12`
- The audit found and corrected one author-name defect in the companion source: DynTaskMAS is by Yu, Ding, and Sato, not “Yin.”
- Four retained practitioner pages on mutable hosts have timestamped Internet Archive snapshots listed in the companion's `WEB-SOURCE-PRESERVATION.md`. Unsupported swyx and Patwardhan records, plus an unarchivable X post, were removed rather than left as unstable support.

Identifier resolution verifies that the cited record exists and captures current metadata. The manuscript’s chapter-level evidence notes remain responsible for claim scope; the strength audit records where a source supports only a mechanism or direction rather than the full practice.

## Decisions required before v1

1. **External grading calibration.** Have at least two independent readers grade the packaged 20-practice sample while the author labels remain hidden. Run the analyzer and report agreement, disagreement patterns, and limitations in the manuscript and companion.
2. **Publisher- and index-native SE search.** Execute the supplementary ACM Digital Library, IEEE Xplore, and Scopus plans. Record exact queries, dates, complete result sets, screening decisions, deduplication, and every source or claim change. DBLP, OpenAlex, and web-surrogate discovery remain non-equivalent diagnostics.
3. **Structural freeze.** Read the generated PDF as a permanent, citable edition. Check every chapter start, figure, table, equation, source section, and the closing chapter. Confirm that extracted text contains no `ů` or `Œ` substitutions and that Introduction continuation pages retain the correct running header.
4. **Manuscript license.** If a commercial or university-press edition remains possible, arXiv’s perpetual non-exclusive license is the conservative starting point unless a publisher or funder requires a Creative Commons license. Check the intended publisher’s preprint policy first. The selected arXiv license is irrevocable for that version.
5. **Companion license.** Decide independently whether the catalog and benchmark metadata should permit adaptation and redistribution. The repository currently has a root Apache-2.0 license; confirm or scope it before publishing the companion.
6. **Endorsement.** Start a draft submission and select `cs.SE` early. A prior record in another archive may not satisfy endorsement for a new computer-science category.
7. **Identity.** Link ORCID and confirm author name and affiliation.
8. **Reference exceptions.** The four HTTP 403 results are access restrictions rather than unresolved identifiers. Recheck them manually at structural freeze if their claims remain material.
9. **Companion DOI.** Archive the final replication package through Zenodo, then append its DOI to the Comments field and data-availability statement.

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
  category may require endorsement even for an existing account.
- ORCID linkage is an arXiv account action and remains pending until confirmed
  on the user page.
- The arXiv license remains a human decision. arXiv states that the license for
  each version is irrevocable and recommends checking funder and intended
  publisher policies first. The perpetual non-exclusive license remains the
  conservative candidate when no external policy requires a Creative Commons
  grant.
- Zenodo permits a DOI to be reserved in a draft and embedded in files before
  publication. Publication registers the DOI. The reserved-DOI-first sequence
  above therefore binds the identifier to the exact stable package without a
  post-release metadata rewrite.

The machine-readable state is in `release-metadata.json`. Category and
cross-list choices are verified. This release candidate records external
grading as `not-performed-with-disclosed-limitation` and native search as
`not-performed-with-disclosed-source-limitations`; neither state satisfies the
stable `1.0.0` gate. Candidate adjudication is complete under the August 6
cutoff. License, endorsement, ORCID, and DOI remain pending.

## Submission sequence

1. Sign in at `https://arxiv.org` and create a new submission.
2. Select `cs.SE` as primary and `cs.AI` as the only cross-list.
3. Resolve any endorsement prompt.
4. Upload the exact verified `engineering-reliable-coding-agents-arxiv-source.zip`; do not upload the locally generated PDF in place of TeX source.
5. Confirm that arXiv identifies `main.tex` as the top-level file. Select XeLaTeX with TeX Live 2025; this is the verified processor recorded in `manuscript/00README` and `release-metadata.json`.
6. Compare arXiv’s generated PDF with `engineering-reliable-coding-agents-preview.pdf`.
7. Inspect the title page, abstract, table of contents, all part and chapter starts, equations, hyperlinks, all 17 figures, and all 7 numbered tables.
8. Paste the metadata above without the Markdown headings or any unresolved placeholder.
9. Choose the license only after the publisher/funder check.
10. Submit for moderation. After announcement, record the arXiv identifier and DOI on the website and in the companion metadata.

## Technical validation

- Exact source ZIP compiled twice in fresh temporary directories with XeLaTeX under the digest-pinned TeX Live 2025 container recorded in `companion/methodology/release-verification/arxiv-compile-report.json`. Both offline runs produced the same PDF SHA-256.
- Output: 271 letter-size pages, single-spaced, one-inch margins, PDF 1.7. A separate `pdflatex` diagnostic is not the release processor.
- Figures: 17 of 17 included as PDF; tables: 7 numbered and listed.
- Chapter sources: 19 unnumbered chapter-end source blocks, excluded from the numbered section hierarchy and table of contents.
- Full references: 213 alphabetized entries; all manuscript-cited arXiv identifiers, 14 DOI records, and audited web sources are represented, with additional named sources and author illustrations identified separately.
- Text extraction: approximately 94,000 machine-readable body words, plus references and source notes.
- PDF security: no encryption, JavaScript, forms, or embedded multimedia.
- Archive hygiene: 43 required files (46 ZIP entries including directories); no generated manuscript PDF, log, auxiliary file, Markdown source, dataset, or private note.
- TeX diagnostics: no errors, missing files, missing characters, undefined commands, or overfull boxes. A small number of harmless underfull-box warnings remain in source-list paragraphs.
- Prose review: all 21 source files were reviewed for academic register, casual framing, unsupported certainty, promotional language, and unexplained internal evidence shorthand.
- Companion checks: catalog and benchmark JSON validate against their schemas; checksums pass; the evidence ledger contains 578 records with a consistent 13-column structure. The update-screening decisions total 39: 11 admitted, one already present, and 27 deferred or excluded. The 148-record SE coverage probe admitted nine works, retains the 40-DOI diagnostic sample, and records that all 26 TSE candidates in the known set match SciX exactly by DOI.
- Release contract: `release-metadata.json` agrees with rc.16 metadata; every file in the arXiv source and companion ZIPs matches the repository byte-for-byte; the preview is an unencrypted 297-page letter-size PDF carrying the rc.16 identity; the TeX Live report binds a clean 297-page XeLaTeX build to the exact source ZIP; extracted text contains no observed substitution glyphs or leaked front-matter running headers; the stable-mode gate rejects incomplete methodology, licensing, identity, endorsement, or DOI state.

## Official arXiv guidance

- TeX submissions: https://info.arxiv.org/help/submit_tex.html
- Metadata preparation: https://info.arxiv.org/help/prep.html
- Category taxonomy: https://arxiv.org/category_taxonomy
- Cross-listing: https://info.arxiv.org/help/cross.html
- Endorsement: https://info.arxiv.org/help/endorsement.html
- Licenses: https://info.arxiv.org/help/license/index.html
- ORCID: https://info.arxiv.org/help/orcid.html
- Announcement schedule: https://info.arxiv.org/help/availability.html
- Reserve a Zenodo DOI: https://help.zenodo.org/docs/deposit/describe-records/reserve-doi/
