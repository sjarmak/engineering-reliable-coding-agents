import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { publisherCoverageArtifactErrors } from "./publisher-coverage-evidence.mjs";

const VERSION = "1.0.0";

function plan(sourceLane) {
  return JSON.stringify({
    schema_version: 1,
    source_lane: sourceLane,
    years: [2018, 2026],
    topics: [
      { id: "topic-a", query: "query a" },
      { id: "topic-b", query: "query b" },
    ],
    venues: [
      { id: "venue-a", publication_filter: "Venue A" },
      { id: "venue-b", publication_filter: "Venue B" },
    ],
  });
}

function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}

function report(provider, sourceLane, planContent) {
  const cells = [
    ["topic-a", "venue-a", "query a"],
    ["topic-a", "venue-b", "query a"],
    ["topic-b", "venue-a", "query b"],
    ["topic-b", "venue-b", "query b"],
  ].map(([topicId, venueId, plannedQuery]) => ({
    cell_key: `${topicId}--${venueId}`,
    topic_id: topicId,
    venue_id: venueId,
    planned_query: plannedQuery,
    executed_query: `${plannedQuery} AND venue:${venueId}`,
    executed_at: "2026-08-07T12:00:00Z",
    result_count: 1,
    result_set_complete: true,
    checkpoint_ref: `${provider}-${topicId}-${venueId}.json`,
    limitation: null,
  }));
  return JSON.stringify({
    schema_version: 1,
    release_version: VERSION,
    provider,
    source_lane: sourceLane,
    status: "complete",
    run_date: "2026-08-07",
    plan_sha256: hash(planContent),
    cells,
    prisma: {
      records_identified: 4,
      unique_records_after_deduplication: 2,
      records_screened: 2,
      records_excluded_at_title_abstract: 1,
      reports_sought_for_retrieval: 1,
      reports_not_retrieved: 0,
      reports_assessed: 1,
      reports_excluded: 0,
      studies_included: 1,
    },
    records: [
      {
        record_id: "10.1000/excluded",
        doi: "10.1000/excluded",
        title: "Excluded record",
        source_cells: ["topic-a--venue-a", "topic-a--venue-b", "topic-b--venue-a"],
        screening_decision: "exclude-title-abstract",
        exclusion_reason: "Outside the coding-agent reliability scope.",
        bounded_claim: null,
        evidence_group: null,
        manuscript_placement: null,
      },
      {
        record_id: "10.1000/included",
        doi: "10.1000/included",
        title: "Included record",
        source_cells: ["topic-b--venue-b"],
        screening_decision: "include",
        exclusion_reason: null,
        bounded_claim: "Supports the bounded mechanism under the evaluated conditions.",
        evidence_group: "directional",
        manuscript_placement: "Chapter 5",
      },
    ],
    interpretation_boundary:
      "The lane records bounded search and screening, not exhaustive recall.",
  });
}

function status(overallStatus) {
  const scopusExcluded = overallStatus === "complete-with-documented-exclusions";
  return JSON.stringify({
    schema_version: 1,
    release_version: VERSION,
    status: overallStatus,
    as_of: "2026-08-07",
    lanes: {
      acm: { status: "complete", planned_cells: 4, completed_cells: 4 },
      ieee: { status: "complete", planned_cells: 4, completed_cells: 4 },
      scopus: {
        status: scopusExcluded ? "excluded-with-documented-replacement" : "complete",
        planned_cells: 4,
        completed_cells: scopusExcluded ? 0 : 4,
        exclusion_accepted: scopusExcluded,
        replacement: scopusExcluded ? "dblp-title-census" : null,
      },
      dblp: {
        status: scopusExcluded ? "replacement-screening-complete" : "supplemental",
        publisher_native: false,
        scopus_equivalent: false,
      },
    },
    claims: {
      acm_searched: true,
      ieee_searched: true,
      scopus_searched: !scopusExcluded,
      scopus_equivalence_claimed: false,
      complete_with_documented_exclusions: scopusExcluded,
    },
    interpretation_boundary:
      "Completed lanes establish bounded source coverage, not exhaustive recall.",
  });
}

function fixture(overallStatus = "complete") {
  const acmPlan = plan("publisher_native_acm_manual");
  const ieeePlan = plan("publisher_native_ieee");
  const scopusPlan = plan("index_native_scopus");
  return {
    publisherCoverageStatus: status(overallStatus),
    acmPlan,
    ieeePlan,
    scopusPlan,
    acmExecutionReport: report("acm_dl", "publisher_native_acm_manual", acmPlan),
    ieeeExecutionReport: report("ieee_xplore", "publisher_native_ieee", ieeePlan),
    scopusExecutionReport:
      overallStatus === "complete"
        ? report("scopus", "index_native_scopus", scopusPlan)
        : "",
    scopusExecutionReportExists: overallStatus === "complete",
    scopusFallbackDecision:
      "Scopus was not searched. DBLP is title-only replacement evidence and is not Scopus-equivalent.",
  };
}

test("completed coverage requires exact ACM, IEEE, and Scopus execution evidence", () => {
  assert.deepEqual(publisherCoverageArtifactErrors(VERSION, "complete", fixture()), []);

  const missing = publisherCoverageArtifactErrors(VERSION, "complete", {
    ...fixture(),
    ieeeExecutionReport: "",
  });
  assert.ok(missing.some((error) => error.includes("ieee-xplore-execution")));
});

test("documented Scopus exclusion requires completed ACM/IEEE lanes and a non-equivalence boundary", () => {
  const files = fixture("complete-with-documented-exclusions");
  assert.deepEqual(
    publisherCoverageArtifactErrors(
      VERSION,
      "complete-with-documented-exclusions",
      files,
    ),
    [],
  );

  const errors = publisherCoverageArtifactErrors(
    VERSION,
    "complete-with-documented-exclusions",
    { ...files, scopusFallbackDecision: "Scopus omitted." },
  );
  assert.ok(errors.some((error) => error.includes("not Scopus-equivalent")));
});

test("lane reports are bound to the exact plan and full topic-by-venue matrix", () => {
  const files = fixture();
  const invalidReport = JSON.parse(files.acmExecutionReport);
  invalidReport.plan_sha256 = "0".repeat(64);
  invalidReport.cells.pop();

  const errors = publisherCoverageArtifactErrors(VERSION, "complete", {
    ...files,
    acmExecutionReport: JSON.stringify(invalidReport),
  });

  assert.ok(errors.some((error) => error.includes("plan_sha256")));
  assert.ok(errors.some((error) => error.includes("topic-by-venue cell")));
});

test("lane reports reject incomplete result sets and inconsistent PRISMA arithmetic", () => {
  const files = fixture();
  const invalidReport = JSON.parse(files.ieeeExecutionReport);
  invalidReport.cells[0].result_set_complete = false;
  invalidReport.prisma.studies_included = 2;

  const errors = publisherCoverageArtifactErrors(VERSION, "complete", {
    ...files,
    ieeeExecutionReport: JSON.stringify(invalidReport),
  });

  assert.ok(errors.some((error) => error.includes("result_set_complete")));
  assert.ok(errors.some((error) => error.includes("PRISMA")));
});

test("every screened record requires a reasoned disposition and included-claim boundary", () => {
  const files = fixture();
  const invalidReport = JSON.parse(files.scopusExecutionReport);
  invalidReport.records[0].exclusion_reason = "";
  invalidReport.records[1].bounded_claim = "";

  const errors = publisherCoverageArtifactErrors(VERSION, "complete", {
    ...files,
    scopusExecutionReport: JSON.stringify(invalidReport),
  });

  assert.ok(errors.some((error) => error.includes("exclusion_reason")));
  assert.ok(errors.some((error) => error.includes("bounded_claim")));
});

test("coverage status must match release state and cannot claim Scopus equivalence", () => {
  const files = fixture("complete-with-documented-exclusions");
  const invalidStatus = JSON.parse(files.publisherCoverageStatus);
  invalidStatus.status = "complete";
  invalidStatus.claims.scopus_equivalence_claimed = true;

  const errors = publisherCoverageArtifactErrors(
    VERSION,
    "complete-with-documented-exclusions",
    { ...files, publisherCoverageStatus: JSON.stringify(invalidStatus) },
  );

  assert.ok(errors.some((error) => error.includes("must match release metadata")));
  assert.ok(errors.some((error) => error.includes("scopus_equivalence_claimed")));
});

test("plans require unique nonempty identifiers and query text", () => {
  const files = fixture();
  const invalidPlan = JSON.parse(files.acmPlan);
  invalidPlan.topics[0].query = "";
  invalidPlan.venues[0].id = null;

  const errors = publisherCoverageArtifactErrors(VERSION, "complete", {
    ...files,
    acmPlan: JSON.stringify(invalidPlan),
  });

  assert.ok(errors.some((error) => error.includes("referenced plan is malformed")));
});

test("execution timestamps reject calendar rollover", () => {
  const files = fixture();
  const invalidReport = JSON.parse(files.acmExecutionReport);
  invalidReport.cells[0].executed_at = "2026-02-30T12:00:00Z";

  const errors = publisherCoverageArtifactErrors(VERSION, "complete", {
    ...files,
    acmExecutionReport: JSON.stringify(invalidReport),
  });

  assert.ok(errors.some((error) => error.includes("executed_at")));
});

test("cell result counts require matching preserved record membership", () => {
  const files = fixture();
  const invalidReport = JSON.parse(files.ieeeExecutionReport);
  invalidReport.cells[0].result_count = 2;
  invalidReport.prisma.records_identified = 5;

  const errors = publisherCoverageArtifactErrors(VERSION, "complete", {
    ...files,
    ieeeExecutionReport: JSON.stringify(invalidReport),
  });

  assert.ok(errors.some((error) => error.includes("result_count")));
});

test("a documented Scopus exclusion rejects even an empty Scopus report artifact", () => {
  const files = fixture("complete-with-documented-exclusions");
  const errors = publisherCoverageArtifactErrors(
    VERSION,
    "complete-with-documented-exclusions",
    { ...files, scopusExecutionReportExists: true },
  );

  assert.ok(errors.some((error) => error.includes("must be absent")));
});
