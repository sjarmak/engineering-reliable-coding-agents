# arXiv submission handoff

Prepared August 6, 2026 for the August 2026 edition of *Engineering Reliable Coding Agents*.

## Positioning

“Monograph” is the conventional scholarly term for a sustained book-length treatment of one subject. The stable positioning for this work is **technical review and engineering monograph**: “technical review” foregrounds the evidence synthesis, while “engineering monograph” accurately describes its scale and organizing argument. The title page carries only the title, subtitle, author, and date.

## Prepared files

- `engineering-reliable-coding-agents-arxiv-source.zip`: LaTeX release candidate for arXiv.
- `engineering-reliable-coding-agents-preview.pdf`: PDF compiled from that source.
- `engineering-reliable-coding-agents-companion-1.0.0-rc.8.zip`: separate companion research artifact release candidate.
- `engineering-reliable-coding-agents-skills-0.1.0.zip`: reusable agent workflows derived from selected companion practices.
- `reference-audit/README.md`: reference-audit summary.

The manuscript source ZIP does not contain the companion dataset. This keeps the article submission small and self-contained while allowing the catalog and evidence ledger to receive their own version and DOI.

## Paste-ready arXiv metadata

### Title

Engineering Reliable Coding Agents: Evaluation, Recovery, Context, and Control Beyond the Model

### Authors

Stephanie Jarmak

Add an affiliation only if it is current and should be public. Use the same name form as existing publications and connect the ORCID record before submission.

### Abstract

AI coding agents are commonly evaluated as models but deployed as systems whose behavior also depends on evaluation harnesses, execution state, retrieval, permissions, review interfaces, and resource allocation. This technical review and engineering monograph examines reliability at those system boundaries. A structured search and bounded update audit assembled 129 scholarly works, 91 practitioner records, 29 benchmark records, and 17 author-system case records. Sources were screened for identifiable claims, graded by the strength and independence of their support, and challenged through targeted evidence audits; ambiguous classifications defaulted to the lower grade. The study contributes an evidence audit, a catalog of 192 bounded practices with 55 developed in depth, a dependency chain across evaluation and operation, scoped measurements and failure cases from author-operated systems, and runnable protocols for local evaluation and fault testing. The review is structured rather than exhaustive, evidence is uneven across topics, and capability results remain time- and workload-dependent. Author-system cases are reported as illustrations, not as independent external evidence.

### Comments

Technical review and engineering monograph, 258 pages, 13 figures. Includes an evidence audit, a 192-practice companion research artifact, and runnable protocols for evaluating and operating AI coding agents. August 2026. Source, companion, and reusable protocols: https://github.com/sjarmak/engineering-reliable-coding-agents.

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
3. Replace release-candidate version `1.0.0-rc.8` with `1.0.0` in the build script and citation metadata.
4. Publish the exact package in the book repository and create a `v1.0.0` release.
5. Connect that repository to Zenodo or another DOI-granting archive and archive the exact tag.
6. Add the DOI to `CITATION.cff`, the companion README, the manuscript’s Data and materials availability statement, and the arXiv Comments field.
7. Rebuild both ZIPs and compile the exact final manuscript archive before uploading.

The companion release contains:

- a human-readable, chapter-organized presentation of all 192 practices, with a direct link to the interactive website companion;
- 192 practice records, including boundary conditions;
- a 574-row evidence and corroboration ledger;
- a crosswalk separating 55 manuscript-developed practices from 137 companion-only practices;
- 29 benchmark records;
- resolved metadata for 319 arXiv identifiers, five DOIs, and other web sources;
- source snapshots, seven literature-review thread protocols, a 118-record thread-source index, and 39 record-level update-screening decisions;
- JSON Schemas, provenance hashes, citation metadata, and checksums.

The separately packaged skills bundle contains five derived operational
workflows with practice-level evidence maps. Treat the skills as implementation
artifacts rather than independent evidence, and keep them outside the arXiv TeX
archive.

Author-system cases are labeled as illustrations and are explicitly excluded from independent external evidence. Working notes, rejected candidates, private comments, local paths, unpublished raw operational data, and internal derivation records are excluded.

## Reference-audit result

The audit covers all 20 manuscript files and all 192 companion practices.

- 319 unique arXiv identifiers resolved from official arXiv API metadata; zero unresolved. The current audit reused previously resolved official-API metadata after the API became temporarily unavailable, and records that fallback in its machine-readable method field.
- Five DOI records resolved through Crossref; zero unresolved.
- 34 other web URLs checked with redirects enabled.
- Three canonical pages returned HTTP 403 to the automated client: one official OpenAI page, one Netflix engineering post, and one Instacart engineering post. Their citation identities and canonical URLs are retained; the OpenAI claim was also checked against the rendered page during the source audit.
  - `https://openai.com/index/separating-signal-from-noise-coding-evaluations/`
- The audit found and corrected one author-name defect in the companion source: DynTaskMAS is by Yu, Ding, and Sato, not “Yin.”
- Four retained practitioner pages on mutable hosts have timestamped Internet Archive snapshots listed in the companion's `WEB-SOURCE-PRESERVATION.md`. Unsupported swyx and Patwardhan records, plus an unarchivable X post, were removed rather than left as unstable support.

Identifier resolution verifies that the cited record exists and captures current metadata. The manuscript’s chapter-level evidence notes remain responsible for claim scope; the strength audit records where a source supports only a mechanism or direction rather than the full practice.

## Decisions required before v1

1. **Structural freeze.** Read the generated PDF as a permanent, citable edition. Check every chapter start, figure, table, equation, source section, and the closing chapter.
2. **Manuscript license.** If a commercial or university-press edition remains possible, arXiv’s perpetual non-exclusive license is the conservative starting point unless a publisher or funder requires a Creative Commons license. Check the intended publisher’s preprint policy first. The selected arXiv license is irrevocable for that version.
3. **Companion license.** Decide independently whether the catalog and benchmark metadata should permit adaptation and redistribution. The repository currently has a root Apache-2.0 license; confirm or scope it before publishing the companion.
4. **Endorsement.** Start a draft submission and select `cs.SE` early. A prior record in another archive may not satisfy endorsement for a new computer-science category.
5. **Identity.** Link ORCID and confirm author name and affiliation.
6. **Reference exceptions.** The three HTTP 403 results are access restrictions rather than unresolved identifiers. Recheck them manually at structural freeze if their claims remain material.
7. **Companion DOI.** Either archive the companion first and append its DOI to the Comments field, or submit the paste-ready text above with the public repository URL only.

## Submission sequence

1. Sign in at `https://arxiv.org` and create a new submission.
2. Select `cs.SE` as primary and `cs.AI` as the only cross-list.
3. Resolve any endorsement prompt.
4. Upload `engineering-reliable-coding-agents-arxiv-source.zip`.
5. Confirm that arXiv identifies `main.tex` as the top-level file and compiles it in PDF mode.
6. Compare arXiv’s generated PDF with `engineering-reliable-coding-agents-preview.pdf`.
7. Inspect the title page, abstract, table of contents, all part and chapter starts, equations, hyperlinks, and all 13 figures.
8. Paste the metadata above without the Markdown headings or any unresolved placeholder.
9. Choose the license only after the publisher/funder check.
10. Submit for moderation. After announcement, record the arXiv identifier and DOI on the website and in the companion metadata.

## Technical validation

- Exact source ZIP compiled in a fresh temporary directory with Tectonic 0.16.9.
- Output: 258 letter-size pages, single-spaced, one-inch margins, PDF 1.5.
- Figures: 13 of 13 included as PDF.
- Chapter sources: 19 unnumbered chapter-end source blocks, excluded from the numbered section hierarchy and table of contents.
- Full references: 196 alphabetized entries; all manuscript-cited arXiv identifiers, five DOI records, and audited web sources are represented, with additional named sources and author illustrations identified separately.
- Text extraction: approximately 106,000 machine-readable words.
- PDF security: no encryption, JavaScript, forms, or embedded multimedia.
- Archive hygiene: 38 required files; no generated PDF, log, auxiliary file, Markdown source, dataset, or private note.
- TeX diagnostics: no errors, missing files, missing characters, undefined commands, or overfull boxes. A small number of harmless underfull-box warnings remain in source-list paragraphs.
- Prose review: all 20 source files were reviewed for academic register, casual framing, unsupported certainty, promotional language, and unexplained internal evidence shorthand.
- Companion checks: catalog and benchmark JSON validate against their schemas; checksums pass; the CSV contains 574 records with a consistent 11-column structure. The update-screening decisions total 39: 11 admitted, one already present, and 27 deferred or excluded.

## Official arXiv guidance

- TeX submissions: https://info.arxiv.org/help/submit_tex.html
- Metadata preparation: https://info.arxiv.org/help/prep.html
- Category taxonomy: https://arxiv.org/category_taxonomy
- Cross-listing: https://info.arxiv.org/help/cross.html
- Endorsement: https://info.arxiv.org/help/endorsement.html
- Licenses: https://info.arxiv.org/help/license/index.html
- ORCID: https://info.arxiv.org/help/orcid.html
- Announcement schedule: https://info.arxiv.org/help/availability.html
