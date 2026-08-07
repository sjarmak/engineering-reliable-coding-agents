import { createHash } from "node:crypto";

function minimalPublisherPlan(sourceLane) {
  return JSON.stringify({
    schema_version: 1,
    source_lane: sourceLane,
    years: [2018, 2026],
    topics: [{ id: "topic", query: "query" }],
    venues: [{ id: "venue", publication_filter: "Venue" }],
  });
}

function minimalPublisherReport(version, provider, sourceLane, planContent) {
  return JSON.stringify({
    schema_version: 1,
    release_version: version,
    provider,
    source_lane: sourceLane,
    status: "complete",
    run_date: "2026-08-07",
    plan_sha256: createHash("sha256").update(planContent).digest("hex"),
    cells: [{
      cell_key: "topic--venue", topic_id: "topic", venue_id: "venue",
      planned_query: "query", executed_query: "query AND venue",
      executed_at: "2026-08-07T12:00:00Z", result_count: 1,
      result_set_complete: true, checkpoint_ref: "checkpoint.json", limitation: null,
    }],
    prisma: {
      records_identified: 1, unique_records_after_deduplication: 1, records_screened: 1,
      records_excluded_at_title_abstract: 0, reports_sought_for_retrieval: 1,
      reports_not_retrieved: 0, reports_assessed: 1, reports_excluded: 0,
      studies_included: 1,
    },
    records: [{
      record_id: "10.1000/test", doi: "10.1000/test", title: "Test record",
      source_cells: ["topic--venue"], screening_decision: "include",
      exclusion_reason: null, bounded_claim: "Supports a bounded mechanism claim.",
      evidence_group: "directional", manuscript_placement: "Chapter 5",
    }],
    interpretation_boundary: "This fixture establishes bounded coverage, not recall.",
  });
}

function minimalPublisherStatus(version, overallState) {
  const excluded = overallState === "complete-with-documented-exclusions";
  return JSON.stringify({
    schema_version: 1, release_version: version, status: overallState, as_of: "2026-08-07",
    lanes: {
      acm: { status: "complete", planned_cells: 1, completed_cells: 1 },
      ieee: { status: "complete", planned_cells: 1, completed_cells: 1 },
      scopus: {
        status: excluded ? "excluded-with-documented-replacement" : "complete",
        planned_cells: 1, completed_cells: excluded ? 0 : 1,
        exclusion_accepted: excluded, replacement: excluded ? "dblp-title-census" : null,
      },
      dblp: {
        status: excluded ? "replacement-screening-complete" : "supplemental",
        publisher_native: false, scopus_equivalent: false,
      },
    },
    claims: {
      acm_searched: true, ieee_searched: true, scopus_searched: !excluded,
      scopus_equivalence_claimed: false, complete_with_documented_exclusions: excluded,
    },
    interpretation_boundary: "This fixture establishes bounded coverage, not recall.",
  });
}

export function publisherCoverageFixture(version, overallState = "complete") {
  const acmPlan = minimalPublisherPlan("publisher_native_acm_manual");
  const ieeePlan = minimalPublisherPlan("publisher_native_ieee");
  const scopusPlan = minimalPublisherPlan("index_native_scopus");
  const complete = overallState === "complete";
  return {
    publisherCoverageStatus: minimalPublisherStatus(version, overallState),
    acmPlan,
    ieeePlan,
    scopusPlan,
    acmExecutionReport: minimalPublisherReport(
      version, "acm_dl", "publisher_native_acm_manual", acmPlan,
    ),
    ieeeExecutionReport: minimalPublisherReport(
      version, "ieee_xplore", "publisher_native_ieee", ieeePlan,
    ),
    scopusExecutionReport: complete
      ? minimalPublisherReport(version, "scopus", "index_native_scopus", scopusPlan)
      : "",
    scopusExecutionReportExists: complete,
    scopusFallbackDecision:
      "DBLP is replacement evidence and is not Scopus-equivalent.",
  };
}
