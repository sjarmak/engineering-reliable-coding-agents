# ChatGPT handoff for publisher and index coverage

Use this document to delegate preparation, logging, deduplication, and
preliminary screening without weakening the source boundary. The target period
is 2018 through 2026, inclusive.

Pinned plan hashes:

| Lane | Plan SHA-256 |
| --- | --- |
| ACM | `ac6159aa00ff73b2f7d76456ce8eaf0614151be530a9c4da57e9e7d755a93734` |
| IEEE | `f762171b53056c4069112740bca8137a506f329f187fe53e528d17ee21e67ea1` |
| Scopus | `e8bdc91a5d6306aad603deea587e8e595b14ba45243e13f2539408659188c7b4` |

## Important access boundary

- Do not ask ChatGPT or another automated agent to search ACM Digital Library.
  ACM's end-user policy prohibits robots, intelligent agents, and systematic
  downloading. A person must execute the 48 ACM cells manually through an
  authorized browser session. ChatGPT may process citation exports supplied
  afterward, using independently licensed metadata where necessary.
- Do not paste IEEE, Elsevier, Scopus, institutional, or proxy credentials into
  a chat. Use a user-controlled authenticated session, an approved connector,
  or an official local API client.
- An ordinary web search, Google Scholar search, or Crossref/OpenAlex search is
  not a completed IEEE Xplore, ACM Digital Library, or Scopus lane.
- If the provider does not expose complete pagination or citation export, mark
  `result_set_complete` false and stop. Do not infer missing results or report
  the lane as complete.
- Provider results are for human screening. Preserve provider identifiers and
  query provenance. Resolve titles or other descriptive metadata separately
  through Crossref, OpenAlex, DBLP, or another source whose terms permit it.
- ChatGPT may recommend screening decisions. The author must make the final
  inclusion, evidence-group, bounded-claim, and manuscript-placement decisions.

Policy and syntax references:

- ACM usage policy: <https://www.acm.org/publications/policies/usage-old>
- IEEE Xplore API documentation: <https://developer.ieee.org/docs/read/Searching_the_IEEE_Xplore_Metadata_API>
- Scopus Search API: <https://dev.elsevier.com/documentation/SCOPUSSearchAPI.wadl>
- Elsevier authentication: <https://dev.elsevier.com/tecdoc_api_authentication.html>

## Files to provide to ChatGPT

Attach this handoff and, where the interface permits attachments, these files:

1. `plans/erca_acm_dl_manual_plan_2026-08.json`
2. `plans/erca_ieee_xplore_search_plan_2026-08.json`
3. `plans/erca_scopus_search_plan_2026-08.json`
4. `plans/erca_scopus_fallback_decision_2026-08.md`
5. `publisher-coverage-status.json`
6. `../assembly-and-adjudication.md`
7. `../screening-decisions.csv`
8. `../../reference-metadata.json`
9. `candidate-records.json`
10. `dblp-title-census-2026-08.json`

For final claim placement, also attach the current manuscript PDF or the
relevant chapter source.

## Shared topic queries

The eight topic IDs are stable across providers. ACM and IEEE use the Boolean
query shown below. Scopus uses the corresponding `TITLE-ABS-KEY(...)` form in
the Scopus section.

| Topic ID | ACM/IEEE query |
| --- | --- |
| `secondary-study-method` | `("systematic literature review" OR "systematic mapping study" OR "multivocal literature review" OR "grey literature") AND "software engineering"` |
| `evaluation-validity` | `("coding agent" OR "program repair" OR "code generation") AND (benchmark OR evaluation OR contamination OR oracle)` |
| `grader-validity` | `("automated evaluation" OR "human evaluation" OR "inter-rater agreement") AND (software OR code)` |
| `human-review` | `("code review" OR "pull request review") AND ("artificial intelligence" OR automation OR human)` |
| `operations-recovery` | `(agent OR automation) AND ("fault injection" OR recovery OR reliability OR idempotent)` |
| `retrieval-context` | `("code search" OR "repository retrieval" OR "issue localization") AND (context OR developer)` |
| `topology` | `("multi-agent" OR "multi agent") AND ("software engineering" OR programming) AND (coordination OR delegation)` |
| `adoption-governance` | `("generative AI" OR "artificial intelligence") AND ("software engineering" OR programming) AND (adoption OR governance OR accountability)` |

## ACM manual lane: 48 cells

Run every topic above against each of these six ACM publication filters. Use
the ACM Full-Text Collection, not the broader Guide to Computing Literature,
and restrict publication year to 2018--2026.

| Venue ID | ACM publication filter |
| --- | --- |
| `tosem` | ACM Transactions on Software Engineering and Methodology |
| `icse` | International Conference on Software Engineering proceedings |
| `fse` | Foundations of Software Engineering or ESEC/FSE proceedings |
| `ase` | Automated Software Engineering conference proceedings |
| `issta` | International Symposium on Software Testing and Analysis proceedings |
| `cscw` | Proceedings of the ACM on Human-Computer Interaction, CSCW issues |

The required cells are the Cartesian product of 8 topics and 6 venues. Name
each cell `topic-id--venue-id`, for example
`evaluation-validity--icse`.

### Copy into ChatGPT for ACM preparation and post-processing

```text
I am completing the ACM Digital Library lane of a bounded literature search.
Do not browse, automate, scrape, or query ACM Digital Library on my behalf.
ACM execution must remain manual under its end-user policy.

Use the attached handoff and ACM plan to do only these tasks:

1. Produce a 48-row worksheet for the Cartesian product of the eight topic
   queries and six ACM venue filters. Preserve the exact topic and venue IDs.
2. Include columns for cell_key, planned_query, executed_query,
   publication_filter, years, executed_at_utc, result_count,
   result_set_complete, checkpoint_ref, and limitation.
3. Wait for me to paste completed rows or upload citation exports. Never mark a
   cell executed from the plan alone.
4. After I supply exports, deduplicate by normalized DOI, then ACM citation URL,
   then normalized title. Preserve every source-cell membership.
5. Resolve descriptive metadata independently through Crossref, OpenAlex, or
   DBLP. Keep the ACM lane as the discovery source and identify the metadata
   source separately.
6. Apply the attached inclusion/exclusion rules as preliminary screening only.
   Give every exclusion a concrete reason. Leave author_decision blank.
7. Return the completed cell log, deduplicated record table, preliminary
   screening table, and PRISMA arithmetic. Explicitly list incomplete cells,
   access limits, and any venue-filter ambiguity.

Do not claim exhaustive recall, do not claim ACM execution before I supply the
manual records, and do not infer missing result counts.
```

## IEEE Xplore lane: 64 cells

Run every shared topic query against each of these eight publication-title
filters, with years 2018--2026 inclusive.

| Venue ID | `publication_title` | Content type |
| --- | --- | --- |
| `tse` | IEEE Transactions on Software Engineering | Journals |
| `icse` | International Conference on Software Engineering | Conferences |
| `ase` | International Conference on Automated Software Engineering | Conferences |
| `fse` | International Symposium on Foundations of Software Engineering | Conferences |
| `issta` | International Symposium on Software Testing and Analysis | Conferences |
| `icst` | International Conference on Software Testing, Verification and Validation | Conferences |
| `msr` | International Conference on Mining Software Repositories | Conferences |
| `saner` | International Conference on Software Analysis, Evolution and Reengineering | Conferences |

The required cells are the Cartesian product of 8 topics and 8 venues. Name
each cell `topic-id--venue-id`.

### Copy into ChatGPT for IEEE execution

```text
I need a bounded, provider-native IEEE Xplore search executed and documented.
Use the attached handoff and IEEE plan exactly.

Before searching, confirm all of the following:

- you can access IEEE Xplore through an authorized user-controlled session or
  approved official interface;
- you can apply querytext, publication_title, content type, and the inclusive
  2018--2026 year boundary;
- you can traverse or export the complete result set for every cell; and
- you will not ask me to paste an API key, institutional password, session
  cookie, or proxy credential into chat.

If any condition is false, stop and report the blocker. Do not substitute
ordinary web search, Google Scholar, Crossref, OpenAlex, DBLP, or SciX and do
not describe the lane as complete.

If all conditions are true:

1. Execute all 64 topic-by-venue cells. Preserve the planned query and exact
   executed form accepted by IEEE.
2. For every cell record cell_key, topic_id, venue_id, planned_query,
   executed_query, executed_at_utc, result_count, result_set_complete,
   checkpoint_ref, and limitation. Preserve zero-result cells.
3. Export or preserve the complete provider identifier/DOI set for each cell.
   Do not redistribute IEEE-returned titles, abstracts, authors, or full text.
4. Deduplicate unique records by normalized DOI and then IEEE article number.
   Preserve all source-cell memberships. Each cell's result_count must equal
   the number of preserved records linked to that cell.
5. Resolve descriptive metadata independently through a permitted source such
   as Crossref, OpenAlex, or DBLP and label that metadata source.
6. Apply the attached inclusion/exclusion criteria as preliminary screening.
   Record a reason for every exclusion and leave final author_decision blank.
7. Return a machine-readable cell log, record table, preliminary screening
   table, PRISMA totals, incomplete-cell list, and a short account of what the
   lane adds beyond the supplied prior sets.

Do not claim exhaustive recall. Do not infer unobserved records or counts.
```

## Scopus lane: 64 cells

Use each Scopus topic query with each venue filter and the inclusive 2018--2026
year boundary. A combined Scopus query has this form:

```text
(TOPIC_QUERY) AND (VENUE_FILTER) AND PUBYEAR > 2017 AND PUBYEAR < 2027
```

### Scopus topic queries

| Topic ID | Scopus topic query |
| --- | --- |
| `secondary-study-method` | `TITLE-ABS-KEY(("systematic literature review" OR "systematic mapping study" OR "multivocal literature review" OR "grey literature") AND "software engineering")` |
| `evaluation-validity` | `TITLE-ABS-KEY(("coding agent" OR "program repair" OR "code generation") AND (benchmark OR evaluation OR contamination OR oracle))` |
| `grader-validity` | `TITLE-ABS-KEY(("automated evaluation" OR "human evaluation" OR "inter-rater agreement") AND (software OR code))` |
| `human-review` | `TITLE-ABS-KEY(("code review" OR "pull request review") AND ("artificial intelligence" OR automation OR human))` |
| `operations-recovery` | `TITLE-ABS-KEY((agent OR automation) AND ("fault injection" OR recovery OR reliability OR idempotent))` |
| `retrieval-context` | `TITLE-ABS-KEY(("code search" OR "repository retrieval" OR "issue localization") AND (context OR developer))` |
| `topology` | `TITLE-ABS-KEY(("multi-agent" OR "multi agent") AND ("software engineering" OR programming) AND (coordination OR delegation))` |
| `adoption-governance` | `TITLE-ABS-KEY(("generative AI" OR "artificial intelligence") AND ("software engineering" OR programming) AND (adoption OR governance OR accountability))` |

### Scopus venue filters

| Venue ID | Scopus venue filter |
| --- | --- |
| `tse` | `EXACTSRCTITLE("IEEE Transactions on Software Engineering")` |
| `tosem` | `EXACTSRCTITLE("ACM Transactions on Software Engineering and Methodology")` |
| `emse` | `EXACTSRCTITLE("Empirical Software Engineering")` |
| `icse` | `CONFNAME("International Conference on Software Engineering")` |
| `fse` | `CONFNAME("Foundations of Software Engineering")` |
| `ase` | `CONFNAME("Automated Software Engineering")` |
| `issta` | `CONFNAME("Software Testing and Analysis")` |
| `cscw` | `EXACTSRCTITLE("Proceedings of the ACM on Human-Computer Interaction") OR CONFNAME("Computer Supported Cooperative Work")` |

The required cells are the Cartesian product of 8 topic queries and 8 venue
filters. Name each cell `topic-id--venue-id`.

### Copy into ChatGPT for Scopus execution

```text
I need a bounded, index-native Scopus search executed and documented. Use the
attached handoff and Scopus plan exactly.

Before searching, confirm all of the following:

- you can access Scopus through an authorized user-controlled session or
  approved official interface;
- you can execute the exact TITLE-ABS-KEY and venue-filter syntax;
- you can traverse or export the complete result set for every cell; and
- you will not ask me to paste an Elsevier API key, institutional token,
  password, session cookie, or proxy credential into chat.

If any condition is false, stop and report the blocker. Do not substitute
ordinary web search, Google Scholar, Crossref, OpenAlex, DBLP, or SciX and do
not describe the lane as complete.

If all conditions are true:

1. Execute all 64 topic-by-venue cells using `(TOPIC_QUERY) AND
   (VENUE_FILTER) AND PUBYEAR > 2017 AND PUBYEAR < 2027`. Preserve the planned
   query and exact executed form accepted by Scopus.
2. For every cell record cell_key, topic_id, venue_id, planned_query,
   executed_query, executed_at_utc, result_count, result_set_complete,
   checkpoint_ref, and limitation. Preserve zero-result cells.
3. Export or preserve the complete DOI/Scopus EID set for each cell. Do not
   redistribute Scopus-returned titles, abstracts, authors, or full text.
4. Deduplicate unique records by normalized DOI and then Scopus EID. Preserve
   all source-cell memberships. Each cell's result_count must equal the number
   of preserved records linked to that cell.
5. Resolve descriptive metadata independently through a permitted source such
   as Crossref, OpenAlex, or DBLP and label that metadata source.
6. Apply the attached inclusion/exclusion criteria as preliminary screening.
   Record a reason for every exclusion and leave final author_decision blank.
7. Return a machine-readable cell log, record table, preliminary screening
   table, PRISMA totals, incomplete-cell list, and a short account of what the
   lane adds beyond the supplied prior sets.

Do not claim exhaustive recall. Do not infer unobserved records or counts.
```

## Evidence to obtain from every executed lane

Do not accept a prose-only summary. Obtain these artifacts:

1. A cell log covering every planned cell exactly once, including zero cells.
2. The exact plan SHA-256 and the exact executed query for every cell.
3. UTC execution timestamps and provider-reported result counts.
4. A `result_set_complete` value and checkpoint/export reference per cell.
5. A complete provider identifier/DOI list with all source-cell memberships.
6. Deduplication rules and a deduplicated unique-record table.
7. A preliminary screening disposition and concrete exclusion reason per
   record.
8. For each recommended inclusion: a bounded claim, proposed evidence group,
   and proposed manuscript placement, all still subject to author decision.
9. Recomputed PRISMA-compatible totals.
10. A list of new records relative to the supplied manuscript, OpenAlex, and
    DBLP sets, plus any proposed reference or claim changes.
11. An explicit limitation statement: bounded source coverage, not exhaustive
    recall.

The archival release gate accepts no completion flag without the corresponding
execution evidence. A Scopus exclusion is a separate disclosed state, not a
claim that DBLP or another source is equivalent to Scopus.
