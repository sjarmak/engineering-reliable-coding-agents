import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildExactDoiQuery,
  buildOverlapArtifact,
} from "./audit-scix-doi-overlap.mjs";
import {
  buildDblpArtifact,
  buildDblpSparqlQuery,
  fetchDblpBindings,
} from "./run-dblp-title-census.mjs";

test("publisher coverage status matches the checked-in plans and pending lane evidence", async () => {
  const readJson = async (relative) =>
    JSON.parse(await readFile(new URL(relative, new URL(".", import.meta.url)), "utf8"));
  const [status, acm, ieee, scopus, dblp] = await Promise.all([
    readJson("publisher-coverage-status.json"),
    readJson("plans/erca_acm_dl_manual_plan_2026-08.json"),
    readJson("plans/erca_ieee_xplore_search_plan_2026-08.json"),
    readJson("plans/erca_scopus_search_plan_2026-08.json"),
    readJson("dblp-title-census-2026-08.json"),
  ]);
  const cells = (plan) => plan.topics.length * plan.venues.length;

  assert.equal(status.status, "pending");
  assert.equal(status.lanes.acm.planned_cells, cells(acm));
  assert.equal(status.lanes.ieee.planned_cells, cells(ieee));
  assert.equal(status.lanes.scopus.planned_cells, cells(scopus));
  assert.equal(status.lanes.dblp.completed_cells, dblp.results.query_cells);
  assert.equal(status.lanes.dblp.unique_publications, dblp.results.unique_publications);
  assert.equal(status.lanes.dblp.new_to_prior_sets, dblp.results.new_to_both_prior_sets);
  assert.equal(status.lanes.dblp.publisher_native, false);
  assert.equal(status.lanes.dblp.scopus_equivalent, false);
  const workbook = await readFile(new URL(status.web_surrogate.workbook, new URL(".", import.meta.url)));
  assert.equal(
    createHash("sha256").update(workbook).digest("hex"),
    status.web_surrogate.workbook_sha256,
  );
  assert.deepEqual(
    {
      candidates: status.web_surrogate.candidate_records,
      withDoi: status.web_surrogate.records_with_doi,
      withoutDoi: status.web_surrogate.records_without_doi,
      providerNative: status.web_surrogate.provider_native,
      closedCells: status.web_surrogate.closes_planned_cells,
    },
    { candidates: 19, withDoi: 12, withoutDoi: 7, providerNative: false, closedCells: 0 },
  );
  assert.deepEqual(
    [status.claims.acm_searched, status.claims.ieee_searched, status.claims.scopus_searched],
    [false, false, false],
  );
});

const DBLP_FIXTURE_PLAN = {
  schema_version: 1,
  source_lane: "open_bibliography_dblp_title_census",
  years: [2018, 2026],
  topics: [
    {
      id: "evaluation-validity",
      required_title_groups: [["coding agent", "program repair"], ["benchmark", "evaluation"]],
    },
    {
      id: "human-review",
      required_title_groups: [["code review"], ["human", "automation"]],
    },
  ],
  venues: [
    {
      id: "tse",
      streams: ["https://dblp.org/streams/journals/tse"],
    },
    {
      id: "icse",
      streams: ["https://dblp.org/streams/conf/icse"],
    },
  ],
};

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (quoted && character === '"' && content[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row = [...row, field];
      field = "";
    } else if (character === "\n" && !quoted) {
      rows.push([...row, field]);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (quoted) throw new Error("CSV contains an unterminated quoted field");
  if (field || row.length) rows.push([...row, field]);
  const [header, ...values] = rows;
  return values.map((columns) =>
    Object.fromEntries(header.map((name, index) => [name, columns[index]])),
  );
}

function csvHeader(content) {
  return content.slice(0, content.indexOf("\n")).split(",");
}

const FULL_TEXT_HEADERS = [
  "publication",
  "doi",
  "title",
  "full_text_source_url",
  "source_version",
  "pages",
  "full_text_sha256",
  "verification_outcome",
  "verification_locator",
  "verified_bounded_claim",
  "verification_note",
];
const ACCESS_EXCEPTION_HEADERS = [
  "publication",
  "doi",
  "title",
  "last_checked",
  "access_status",
  "checked_locations",
  "exclusion_boundary",
];

test("exact DOI query uses the indexed array overlap before normalization", function () {
  const sql = buildExactDoiQuery([
    "https://doi.org/10.1109/tse.2024.3403042",
    "10.1109/TSE.2024.3403042",
  ]);
  assert.match(sql, /p\.doi && ARRAY/);
  assert.match(sql, /10\.1109\/TSE\.2024\.3403042/);
  assert.match(sql, /lower\(d\) = ANY/);
});

test("overlap artifact reports known-set matches without a recall claim", function () {
  const artifact = buildOverlapArtifact({
    candidates: [
      {
        doi: "10.1109/tse.1",
        title: "One",
        year: 2024,
        venue: "TSE",
        query_ids: ["retrieval"],
        already_in_manuscript: false,
      },
      {
        doi: "10.1109/tse.2",
        title: "Two",
        year: 2024,
        venue: "TSE",
        query_ids: ["evaluation"],
        already_in_manuscript: true,
      },
    ],
    matches: [
      {
        doi: "10.1109/TSE.1",
        title: "One",
        bibcode: "2024TSE",
      },
    ],
    venue: "TSE",
    runDate: "2026-08-06",
  });
  assert.deepEqual(artifact.results, {
    candidates_with_doi: 2,
    exact_doi_matches: 1,
    exact_doi_nonmatches: 1,
    overlap_share: 0.5,
  });
  assert.match(artifact.interpretation, /does not estimate topic-search recall/);
});

test("DBLP query preserves the topic-by-venue title census contract", function () {
  const query = buildDblpSparqlQuery(DBLP_FIXTURE_PLAN);

  assert.match(query, /dblp:publishedInStream/);
  assert.match(query, /https:\/\/dblp\.org\/streams\/journals\/tse/);
  assert.match(query, /https:\/\/dblp\.org\/streams\/conf\/icse/);
  assert.match(query, /coding agent\|program repair/);
  assert.match(query, /benchmark\|evaluation/);
  assert.match(query, /2018.*2026/s);
  assert.doesNotMatch(query, /abstract/i);
});

test("DBLP artifact preserves zero cells, deduplicates matches, and limits its claim", function () {
  const duplicate = {
    topic: { value: "evaluation-validity" },
    venue: { value: "tse" },
    publication: { value: "https://dblp.org/rec/journals/tse/Example26" },
    title: { value: "Coding Agent Benchmark Evaluation." },
    year: { value: "2026" },
    doi: { value: "https://doi.org/10.1109/TSE.2026.1" },
  };
  const artifact = buildDblpArtifact({
    plan: DBLP_FIXTURE_PLAN,
    bindings: [duplicate, duplicate],
    referenceDois: ["10.1109/tse.2026.1"],
    probeDois: [],
    runDate: "2026-08-07",
    responseDate: "Fri, 07 Aug 2026 12:00:00 GMT",
    query: buildDblpSparqlQuery(DBLP_FIXTURE_PLAN),
  });

  assert.equal(artifact.results.query_cells, 4);
  assert.equal(artifact.results.cells_with_matches, 1);
  assert.equal(artifact.results.unique_publications, 1);
  assert.equal(artifact.results.already_in_reference_metadata, 1);
  assert.equal(artifact.results.already_in_openalex_probe, 0);
  assert.equal(artifact.results.new_to_both_prior_sets, 0);
  assert.equal(artifact.cells.length, 4);
  assert.equal(artifact.cells.find((cell) => cell.id === "human-review--icse").matches, 0);
  assert.equal(artifact.records[0].doi, "10.1109/tse.2026.1");
  assert.equal(artifact.records[0].already_in_reference_metadata, true);
  assert.deepEqual(artifact.source.response_bindings, [duplicate, duplicate]);
  assert.equal(artifact.source.response_binding_count, 2);
  assert.equal(
    artifact.source.response_bindings_sha256,
    createHash("sha256").update(JSON.stringify([duplicate, duplicate])).digest("hex"),
  );
  assert.match(artifact.interpretation, /title-only/i);
  assert.match(artifact.interpretation, /not.*publisher-native/i);
  assert.match(artifact.interpretation, /not.*equivalent.*Scopus/i);
});

test("DBLP artifact rejects malformed provider rows", function () {
  assert.throws(
    () =>
      buildDblpArtifact({
        plan: DBLP_FIXTURE_PLAN,
        bindings: [{ topic: { value: "evaluation-validity" } }],
        runDate: "2026-08-07",
        responseDate: "Fri, 07 Aug 2026 12:00:00 GMT",
        query: buildDblpSparqlQuery(DBLP_FIXTURE_PLAN),
      }),
    /missing required fields/,
  );
});

test("preserved DBLP evidence matches the checked-in plan and comparison boundary", async function () {
  const directory = fileURLToPath(new URL(".", import.meta.url));
  const [plan, artifact] = await Promise.all(
    [
      "plans/erca_dblp_title_census_plan_2026-08.json",
      "dblp-title-census-2026-08.json",
    ].map(async (relative) => JSON.parse(await readFile(`${directory}/${relative}`, "utf8"))),
  );

  assert.equal(artifact.query.sparql, buildDblpSparqlQuery(plan));
  assert.equal(artifact.results.query_cells, plan.topics.length * plan.venues.length);
  assert.equal(artifact.results.query_cells, 64);
  assert.equal(artifact.results.unique_publications, 55);
  assert.equal(artifact.results.new_to_both_prior_sets, 50);
  assert.equal(artifact.cells.length, 64);
  assert.ok(artifact.cells.some((cell) => cell.matches === 0));
});

test("DBLP triage covers the full new-to-both queue without claiming author decisions", async function () {
  const directory = fileURLToPath(new URL(".", import.meta.url));
  const [sourceContent, enrichment, triageContent] = await Promise.all([
    readFile(`${directory}/dblp-title-census-2026-08.json`, "utf8"),
    readFile(`${directory}/dblp-screening-enrichment-2026-08.json`, "utf8").then(JSON.parse),
    readFile(`${directory}/dblp-screening-triage-2026-08.csv`, "utf8"),
  ]);
  const source = JSON.parse(sourceContent);
  const candidates = [
    ...new Map(
      source.records
        .filter(
          (record) =>
            !record.already_in_reference_metadata && !record.already_in_openalex_probe,
        )
        .map((record) => [record.publication, record]),
    ).values(),
  ];
  const triage = parseCsv(triageContent);
  const digest = (value) => createHash("sha256").update(value).digest("hex");
  const allowed = new Set([
    "retain_for_full_text",
    "defer_after_abstract",
    "exclude_at_title",
    "exclude_after_abstract",
  ]);

  const doiFilter = candidates.map((record) => `https://doi.org/${record.doi}`).join("|");
  const enrichmentUrl = new URL("https://api.openalex.org/works");
  enrichmentUrl.searchParams.set("filter", `doi:${doiFilter}`);
  enrichmentUrl.searchParams.set("per-page", "100");
  enrichmentUrl.searchParams.set("select", "id,doi,title,abstract_inverted_index");
  const fullTextFilter = triage
    .filter((record) => record.model_recommendation === "retain_for_full_text")
    .map((record) => `https://doi.org/${record.doi}`)
    .join("|");
  const fullTextUrl = new URL("https://api.openalex.org/works");
  fullTextUrl.searchParams.set("filter", `doi:${fullTextFilter}`);
  fullTextUrl.searchParams.set("per-page", "100");
  fullTextUrl.searchParams.set(
    "select",
    "id,doi,title,open_access,best_oa_location,primary_location",
  );

  assert.equal(enrichment.input.artifact_sha256, digest(sourceContent));
  assert.equal(enrichment.input.doi_count, 50);
  assert.equal(enrichment.input.doi_filter_sha256, digest(doiFilter));
  assert.equal(enrichment.request.request_url_sha256, digest(enrichmentUrl.href));
  assert.equal(enrichment.response_summary.matched_input_dois, 50);
  assert.equal(enrichment.response_summary.input_dois_with_abstract, 47);
  assert.equal(enrichment.full_text_routing.doi_filter_sha256, digest(fullTextFilter));
  assert.equal(enrichment.full_text_routing.request_url_sha256, digest(fullTextUrl.href));
  assert.equal(triage.length, 50);
  assert.deepEqual(new Set(triage.map((record) => record.publication)), new Set(candidates.map((record) => record.publication)));
  assert.ok(triage.every((record) => allowed.has(record.model_recommendation)));
  assert.ok(triage.every((record) => record.author_decision === ""));
  assert.ok(triage.every((record) => record.model_recommendation !== "admitted"));
  assert.ok(
    triage.every(
      (record) => !/\badmi(?:t|ts|tted|tting|ssion|ssions)\b/i.test(Object.values(record).join(" ")),
    ),
  );
});

test("DBLP author packet covers every full-text recommendation without deciding for the author", async function () {
  const directory = fileURLToPath(new URL(".", import.meta.url));
  const [triageContent, packetContent] = await Promise.all([
    readFile(`${directory}/dblp-screening-triage-2026-08.csv`, "utf8"),
    readFile(`${directory}/dblp-author-adjudication-2026-08.csv`, "utf8"),
  ]);
  const triage = parseCsv(triageContent).filter(
    (record) => record.model_recommendation === "retain_for_full_text",
  );
  const packet = parseCsv(packetContent);
  const allowedEffects = new Set(["qualify", "strengthen", "methods"]);
  const allowedRoutes = new Set(["open_location", "closed_or_no_open_location"]);

  assert.equal(packet.length, 34);
  assert.deepEqual(
    new Set(packet.map((record) => record.publication)),
    new Set(triage.map((record) => record.publication)),
  );
  assert.equal(packet.filter((record) => record.evidence_basis === "abstract").length, 32);
  assert.equal(packet.filter((record) => record.evidence_basis === "title").length, 2);
  assert.equal(packet.filter((record) => record.full_text_route === "open_location").length, 18);
  assert.ok(packet.every((record) => allowedEffects.has(record.candidate_effect)));
  assert.ok(packet.every((record) => allowedRoutes.has(record.full_text_route)));
  assert.ok(packet.every((record) => record.proposed_placement && record.bounded_candidate_claim));
  assert.ok(packet.every((record) => record.author_decision === "" && record.author_note === ""));
  assert.ok(
    packet.every(
      (record) => !/\badmi(?:t|ts|tted|tting|ssion|ssions)\b/i.test(Object.values(record).join(" ")),
    ),
  );
});

test("DBLP full-text notes cover every open-routed candidate without making author decisions", async function () {
  const directory = fileURLToPath(new URL(".", import.meta.url));
  const [packetContent, verificationContent] = await Promise.all([
    readFile(`${directory}/dblp-author-adjudication-2026-08.csv`, "utf8"),
    readFile(`${directory}/dblp-full-text-verification-2026-08.csv`, "utf8"),
  ]);
  const packet = parseCsv(packetContent);
  const openRouted = packet.filter(
    (record) => record.full_text_route === "open_location",
  );
  const verification = parseCsv(verificationContent);
  const packetByPublication = new Map(packet.map((record) => [record.publication, record]));
  const outcomes = new Set([
    "supported",
    "supported_with_version_boundary",
    "needs_narrowing",
    "position_only",
  ]);
  const versions = new Set(["published_version", "accepted_manuscript", "submitted_version"]);

  assert.equal(verification.length, 18);
  assert.deepEqual(csvHeader(verificationContent), FULL_TEXT_HEADERS);
  assert.deepEqual(
    new Set(verification.map((record) => record.publication)),
    new Set(openRouted.map((record) => record.publication)),
  );
  assert.equal(new Set(verification.map((record) => record.publication)).size, 18);
  assert.ok(
    verification.every((record) => {
      const packetRecord = packetByPublication.get(record.publication);
      return packetRecord?.doi === record.doi && packetRecord?.title === record.title;
    }),
  );
  assert.ok(verification.every((record) => outcomes.has(record.verification_outcome)));
  assert.ok(verification.every((record) => versions.has(record.source_version)));
  assert.ok(verification.every((record) => /^https:\/\//.test(record.full_text_source_url)));
  assert.ok(verification.every((record) => /^[a-f0-9]{64}$/.test(record.full_text_sha256)));
  assert.ok(verification.every((record) => Number(record.pages) > 0));
  assert.ok(
    verification.every(
      (record) => record.verification_locator && record.verified_bounded_claim && record.verification_note,
    ),
  );
  assert.ok(
    verification.every(
      (record) => !/\badmi(?:t|ts|tted|tting|ssion|ssions)\b/i.test(Object.values(record).join(" ")),
    ),
  );
});

test("DBLP supplemental verification partitions every closed-routed candidate", async function () {
  const directory = fileURLToPath(new URL(".", import.meta.url));
  const [packetContent, verificationContent, exceptionContent] = await Promise.all([
    readFile(`${directory}/dblp-author-adjudication-2026-08.csv`, "utf8"),
    readFile(`${directory}/dblp-supplemental-full-text-verification-2026-08.csv`, "utf8"),
    readFile(`${directory}/dblp-full-text-access-exceptions-2026-08.csv`, "utf8"),
  ]);
  const packet = parseCsv(packetContent);
  const closedRouted = packet.filter(
    (record) => record.full_text_route === "closed_or_no_open_location",
  );
  const verification = parseCsv(verificationContent);
  const exceptions = parseCsv(exceptionContent);
  const packetByPublication = new Map(packet.map((record) => [record.publication, record]));
  const verifiedIds = new Set(verification.map((record) => record.publication));
  const exceptionIds = new Set(exceptions.map((record) => record.publication));
  const outcomes = new Set([
    "supported",
    "supported_with_version_boundary",
    "needs_narrowing",
    "position_only",
  ]);
  const versions = new Set(["published_version", "accepted_manuscript", "submitted_version"]);

  assert.equal(verification.length, 13);
  assert.equal(exceptions.length, 3);
  assert.deepEqual(csvHeader(verificationContent), FULL_TEXT_HEADERS);
  assert.deepEqual(csvHeader(exceptionContent), ACCESS_EXCEPTION_HEADERS);
  assert.ok([...verifiedIds].every((publication) => !exceptionIds.has(publication)));
  assert.deepEqual(
    new Set([...verifiedIds, ...exceptionIds]),
    new Set(closedRouted.map((record) => record.publication)),
  );
  assert.ok(
    [...verification, ...exceptions].every((record) => {
      const packetRecord = packetByPublication.get(record.publication);
      return packetRecord?.doi === record.doi && packetRecord?.title === record.title;
    }),
  );
  assert.ok(verification.every((record) => outcomes.has(record.verification_outcome)));
  assert.ok(verification.every((record) => versions.has(record.source_version)));
  assert.ok(verification.every((record) => new URL(record.full_text_source_url).protocol === "https:"));
  assert.ok(verification.every((record) => /^[a-f0-9]{64}$/.test(record.full_text_sha256)));
  assert.ok(verification.every((record) => Number(record.pages) > 0));
  assert.ok(
    verification.every(
      (record) => record.verification_locator && record.verified_bounded_claim && record.verification_note,
    ),
  );
  assert.ok(exceptions.every((record) => /^2026-08-\d{2}$/.test(record.last_checked)));
  assert.ok(
    exceptions.every(
      (record) => record.access_status && record.checked_locations && record.exclusion_boundary,
    ),
  );
  assert.ok(
    [...verification, ...exceptions].every(
      (record) => !/\badmi(?:t|ts|tted|tting|ssion|ssions)\b/i.test(Object.values(record).join(" ")),
    ),
  );
});

test("DBLP plan validation rejects malformed search boundaries", function () {
  const invalidPlans = [
    [{ ...DBLP_FIXTURE_PLAN, schema_version: 2 }, /schema_version/],
    [{ ...DBLP_FIXTURE_PLAN, source_lane: "other" }, /source_lane/],
    [{ ...DBLP_FIXTURE_PLAN, years: [2026] }, /years/],
    [{ ...DBLP_FIXTURE_PLAN, years: [2026, 2018] }, /ordered/],
    [{ ...DBLP_FIXTURE_PLAN, years: [2018, 2026.5] }, /integer/],
    [{ ...DBLP_FIXTURE_PLAN, topics: [] }, /topics/],
    [{ ...DBLP_FIXTURE_PLAN, venues: [] }, /venues/],
    [
      { ...DBLP_FIXTURE_PLAN, topics: [{ id: "broken", required_title_groups: [] }] },
      /title groups/,
    ],
    [
      {
        ...DBLP_FIXTURE_PLAN,
        topics: [{ id: "broken", required_title_groups: [[]] }],
      },
      /empty title group/,
    ],
    [{ ...DBLP_FIXTURE_PLAN, venues: [{ id: "broken", streams: [] }] }, /streams/],
    [
      {
        ...DBLP_FIXTURE_PLAN,
        venues: [{ id: "broken", streams: ["https://example.com/not-dblp"] }],
      },
      /invalid stream/,
    ],
    [
      {
        ...DBLP_FIXTURE_PLAN,
        venues: [
          {
            id: "broken",
            streams: [
              "https://dblp.org/streams/conf/icse> . SERVICE <https://attacker.invalid/sparql",
            ],
          },
        ],
      },
      /invalid stream/,
    ],
    [
      {
        ...DBLP_FIXTURE_PLAN,
        topics: [DBLP_FIXTURE_PLAN.topics[0], DBLP_FIXTURE_PLAN.topics[0]],
      },
      /duplicate topic id/,
    ],
    [
      {
        ...DBLP_FIXTURE_PLAN,
        topics: [{ id: " ", required_title_groups: [["code"]] }],
      },
      /invalid topic id/,
    ],
    [
      {
        ...DBLP_FIXTURE_PLAN,
        venues: [DBLP_FIXTURE_PLAN.venues[0], DBLP_FIXTURE_PLAN.venues[0]],
      },
      /duplicate venue id/,
    ],
  ];

  for (const [plan, pattern] of invalidPlans) {
    assert.throws(() => buildDblpSparqlQuery(plan), pattern);
  }
});

test("DBLP artifact rejects conflicting duplicate provider rows", function () {
  const row = {
    topic: { value: "evaluation-validity" },
    venue: { value: "tse" },
    publication: { value: "https://dblp.org/rec/journals/tse/Example26" },
    title: { value: "Coding Agent Benchmark Evaluation." },
    year: { value: "2026" },
    doi: { value: "https://doi.org/10.1109/TSE.2026.1" },
  };
  const conflicting = {
    ...row,
    doi: { value: "https://doi.org/10.1109/TSE.2026.2" },
  };

  assert.throws(
    () =>
      buildDblpArtifact({
        plan: DBLP_FIXTURE_PLAN,
        bindings: [row, conflicting],
        runDate: "2026-08-07",
        responseDate: null,
        query: buildDblpSparqlQuery(DBLP_FIXTURE_PLAN),
      }),
    /conflicting duplicate/,
  );
});

test("DBLP artifact rejects provider rows outside the plan", function () {
  const row = {
    topic: { value: "evaluation-validity" },
    venue: { value: "tse" },
    publication: { value: "https://dblp.org/rec/journals/tse/Example26" },
    title: { value: "Coding Agent Benchmark Evaluation." },
    year: { value: "2026" },
    doi: { value: "https://doi.org/10.1109/TSE.2026.1" },
  };
  const cases = [
    [{ ...row, topic: { value: "unknown" } }, /unknown topic/],
    [{ ...row, venue: { value: "unknown" } }, /unknown venue/],
    [{ ...row, year: { value: "2017" } }, /invalid year/],
    [{ ...row, doi: { value: "not-a-doi" } }, /invalid DOI/],
  ];

  for (const [binding, pattern] of cases) {
    assert.throws(
      () =>
        buildDblpArtifact({
          plan: DBLP_FIXTURE_PLAN,
          bindings: [binding],
          runDate: "2026-08-07",
          responseDate: null,
          query: buildDblpSparqlQuery(DBLP_FIXTURE_PLAN),
        }),
      pattern,
    );
  }
  assert.throws(
    () =>
      buildDblpArtifact({
        plan: DBLP_FIXTURE_PLAN,
        bindings: [],
        runDate: "August 7",
        query: buildDblpSparqlQuery(DBLP_FIXTURE_PLAN),
      }),
    /YYYY-MM-DD/,
  );
  assert.throws(
    () =>
      buildDblpArtifact({
        plan: DBLP_FIXTURE_PLAN,
        bindings: {},
        runDate: "2026-08-07",
        query: buildDblpSparqlQuery(DBLP_FIXTURE_PLAN),
      }),
    /bindings must be an array/,
  );
});

test("DBLP fetch uses one bounded SPARQL request and validates the response", async function () {
  const calls = [];
  const successfulFetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: 200,
      headers: new Headers({ date: "Fri, 07 Aug 2026 12:00:00 GMT" }),
      json: async () => ({ results: { bindings: [{ topic: { value: "one" } }] } }),
    };
  };
  const result = await fetchDblpBindings("SELECT * WHERE {}", successfulFetch);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://sparql.dblp.org/sparql");
  assert.equal(calls[0].options.method, "POST");
  assert.match(calls[0].options.body.toString(), /SELECT/);
  assert.equal(result.bindings.length, 1);
  assert.equal(result.responseDate, "Fri, 07 Aug 2026 12:00:00 GMT");

  await assert.rejects(
    () =>
      fetchDblpBindings("query", async () => ({
        ok: false,
        status: 503,
      })),
    /HTTP 503/,
  );
  await assert.rejects(
    () =>
      fetchDblpBindings("query", async () => ({
        ok: true,
        status: 200,
        json: async () => ({}),
      })),
    /results.bindings/,
  );
});
