import { createHash } from "node:crypto";

import { isValidIsoDate } from "./dblp-release-evidence.mjs";

const LANE_CONFIG = Object.freeze({
  acm: Object.freeze({
    provider: "acm_dl",
    sourceLane: "publisher_native_acm_manual",
    reportName:
      "companion/methodology/software-engineering-coverage/acm-dl-execution-2026-08.json",
    reportKey: "acmExecutionReport",
    planKey: "acmPlan",
  }),
  ieee: Object.freeze({
    provider: "ieee_xplore",
    sourceLane: "publisher_native_ieee",
    reportName:
      "companion/methodology/software-engineering-coverage/ieee-xplore-execution-2026-08.json",
    reportKey: "ieeeExecutionReport",
    planKey: "ieeePlan",
  }),
  scopus: Object.freeze({
    provider: "scopus",
    sourceLane: "index_native_scopus",
    reportName:
      "companion/methodology/software-engineering-coverage/scopus-execution-2026-08.json",
    reportKey: "scopusExecutionReport",
    planKey: "scopusPlan",
  }),
});

const EVIDENCE_GROUPS = new Set([
  "strong",
  "directional",
  "corroborating",
  "null_or_conflicting",
]);
const SCREENING_DECISIONS = new Set([
  "exclude-title-abstract",
  "not-retrieved",
  "exclude-full-text",
  "include",
]);

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function parseJson(content, name) {
  if (!content) return { value: null, errors: [`${name}: required for a stable release`] };
  try {
    return { value: JSON.parse(content), errors: [] };
  } catch (error) {
    return { value: null, errors: [`${name}: invalid JSON (${error.message})`] };
  }
}

function validTimestamp(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
  ) {
    return false;
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return false;
  const canonical = value.endsWith("Z") && !value.endsWith(".000Z")
    ? value.replace(/Z$/, ".000Z")
    : value;
  return new Date(timestamp).toISOString() === canonical;
}

function planContract(planContent, config) {
  const parsed = parseJson(planContent, `${config.reportName}: referenced plan`);
  if (!parsed.value) return { ...parsed, cellKeys: [], queryByTopic: new Map() };
  const plan = parsed.value;
  const topics = Array.isArray(plan?.topics) ? plan.topics : [];
  const venues = Array.isArray(plan?.venues) ? plan.venues : [];
  const topicIds = topics.map((topic) => topic?.id);
  const venueIds = venues.map((venue) => venue?.id);
  const queryByTopic = new Map(
    topics.map((topic) => [topic?.id, topic?.query ?? topic?.querytext ?? ""]),
  );
  const cellKeys = topics.flatMap((topic) =>
    venues.map((venue) => `${topic?.id}--${venue?.id}`),
  );
  const valid =
    plan?.schema_version === 1 &&
    plan?.source_lane === config.sourceLane &&
    topics.length > 0 &&
    venues.length > 0 &&
    topicIds.every((id) => typeof id === "string" && id.trim()) &&
    venueIds.every((id) => typeof id === "string" && id.trim()) &&
    topics.every((topic) => {
      const query = topic?.query ?? topic?.querytext;
      return typeof query === "string" && Boolean(query.trim());
    }) &&
    new Set(topicIds).size === topics.length &&
    new Set(venueIds).size === venues.length;
  return {
    value: plan,
    cellKeys,
    queryByTopic,
    errors: valid ? [] : [`${config.reportName}: referenced plan is malformed`],
  };
}

function reportHeaderErrors(report, version, config, planContent, name) {
  const checks = [
    [report?.schema_version === 1, "schema_version must be 1"],
    [report?.release_version === version, "release_version must match release metadata"],
    [report?.provider === config.provider, `provider must be ${config.provider}`],
    [report?.source_lane === config.sourceLane, `source_lane must be ${config.sourceLane}`],
    [report?.status === "complete", "status must be complete"],
    [isValidIsoDate(report?.run_date), "run_date must be a valid YYYY-MM-DD date"],
    [report?.plan_sha256 === sha256(planContent), "plan_sha256 must match the exact plan"],
    [
      typeof report?.interpretation_boundary === "string" &&
        Boolean(report.interpretation_boundary.trim()),
      "interpretation_boundary is required",
    ],
  ];
  return checks.flatMap(([passed, message]) => (passed ? [] : [`${name}: ${message}`]));
}

function cellErrors(report, plan, name) {
  const cells = Array.isArray(report?.cells) ? report.cells : [];
  const records = Array.isArray(report?.records) ? report.records : [];
  const actualKeys = cells.map((cell) => cell?.cell_key);
  const exactMatrix =
    cells.length === plan.cellKeys.length &&
    new Set(actualKeys).size === actualKeys.length &&
    plan.cellKeys.every((key) => actualKeys.includes(key));
  const checks = [
    [exactMatrix, "every planned topic-by-venue cell must appear exactly once"],
    [
      cells.every((cell) => cell?.cell_key === `${cell?.topic_id}--${cell?.venue_id}`),
      "cell_key must match topic_id and venue_id",
    ],
    [
      cells.every((cell) => cell?.planned_query === plan.queryByTopic.get(cell?.topic_id)),
      "planned_query must match the exact plan",
    ],
    [
      cells.every(
        (cell) => typeof cell?.executed_query === "string" && cell.executed_query.trim(),
      ),
      "executed_query is required for every cell",
    ],
    [cells.every((cell) => validTimestamp(cell?.executed_at)), "executed_at must be ISO UTC"],
    [
      cells.every((cell) => Number.isInteger(cell?.result_count) && cell.result_count >= 0),
      "result_count must be a nonnegative integer",
    ],
    [
      cells.every((cell) => cell?.result_set_complete === true),
      "result_set_complete must be true for every stable-release cell",
    ],
    [
      cells.every(
        (cell) => typeof cell?.checkpoint_ref === "string" && cell.checkpoint_ref.trim(),
      ),
      "checkpoint_ref is required for every cell",
    ],
    [
      cells.every(
        (cell) =>
          records.filter((record) => record?.source_cells?.includes(cell?.cell_key)).length ===
          cell?.result_count,
      ),
      "result_count must equal preserved record membership for every cell",
    ],
  ];
  return checks.flatMap(([passed, message]) => (passed ? [] : [`${name}: ${message}`]));
}

function recordIdentityErrors(records, validCellKeys, name) {
  const identifiers = records.map((record) => record?.record_id);
  const checks = [
    [new Set(identifiers).size === identifiers.length, "record_id values must be unique"],
    [
      records.every(
        (record) => typeof record?.record_id === "string" && record.record_id.trim(),
      ),
      "record_id is required",
    ],
    [
      records.every((record) => typeof record?.title === "string" && record.title.trim()),
      "title is required for every record",
    ],
    [
      records.every(
        (record) =>
          Array.isArray(record?.source_cells) &&
          record.source_cells.length > 0 &&
          record.source_cells.every((key) => validCellKeys.has(key)),
      ),
      "source_cells must identify valid executed cells",
    ],
  ];
  return checks.flatMap(([passed, message]) => (passed ? [] : [`${name}: ${message}`]));
}

function recordDispositionErrors(records, name) {
  const checks = [
    [records.every((record) => SCREENING_DECISIONS.has(record?.screening_decision)), "screening_decision is invalid"],
  ];
  return checks.flatMap(([passed, message]) => (passed ? [] : [`${name}: ${message}`]));
}

function includedRecordErrors(records, name) {
  const checks = [
    [
      records.every(
        (record) =>
          !record?.screening_decision?.startsWith("exclude") ||
          Boolean(record?.exclusion_reason?.trim()),
      ),
      "exclusion_reason is required for excluded records",
    ],
    [
      records.every(
        (record) =>
          record?.screening_decision !== "not-retrieved" ||
          Boolean(record?.exclusion_reason?.trim()),
      ),
      "exclusion_reason is required for unretrieved reports",
    ],
    [
      records.every(
        (record) =>
          record?.screening_decision !== "include" || Boolean(record?.bounded_claim?.trim()),
      ),
      "bounded_claim is required for included records",
    ],
    [
      records.every(
        (record) =>
          record?.screening_decision !== "include" || EVIDENCE_GROUPS.has(record?.evidence_group),
      ),
      "evidence_group is required for included records",
    ],
    [
      records.every(
        (record) =>
          record?.screening_decision !== "include" ||
          Boolean(record?.manuscript_placement?.trim()),
      ),
      "manuscript_placement is required for included records",
    ],
  ];
  return checks.flatMap(([passed, message]) => (passed ? [] : [`${name}: ${message}`]));
}

function recordErrors(report, validCellKeys, name) {
  const records = Array.isArray(report?.records) ? report.records : [];
  return [
    ...recordIdentityErrors(records, validCellKeys, name),
    ...recordDispositionErrors(records, name),
    ...includedRecordErrors(records, name),
  ];
}

function expectedPrisma(report) {
  const records = Array.isArray(report?.records) ? report.records : [];
  const count = (decision) =>
    records.filter((record) => record?.screening_decision === decision).length;
  const cells = Array.isArray(report?.cells) ? report.cells : [];
  const excludedAtScreening = count("exclude-title-abstract");
  const sought = records.length - excludedAtScreening;
  const notRetrieved = count("not-retrieved");
  const assessed = sought - notRetrieved;
  return {
    records_identified: cells.reduce((total, cell) => total + (cell?.result_count ?? 0), 0),
    unique_records_after_deduplication: records.length,
    records_screened: records.length,
    records_excluded_at_title_abstract: excludedAtScreening,
    reports_sought_for_retrieval: sought,
    reports_not_retrieved: notRetrieved,
    reports_assessed: assessed,
    reports_excluded: count("exclude-full-text"),
    studies_included: count("include"),
  };
}

function prismaErrors(report, name) {
  const prisma = report?.prisma;
  const expected = expectedPrisma(report);
  if (!prisma || typeof prisma !== "object") return [`${name}: PRISMA summary is required`];
  return Object.entries(expected).flatMap(([field, value]) =>
    prisma[field] === value ? [] : [`${name}: PRISMA ${field} must be ${value}`],
  );
}

function laneReportErrors(content, planContent, version, config) {
  const parsed = parseJson(content, config.reportName);
  const plan = planContract(planContent, config);
  if (!parsed.value || !plan.value) return [...parsed.errors, ...plan.errors];
  return [
    ...plan.errors,
    ...reportHeaderErrors(parsed.value, version, config, planContent, config.reportName),
    ...cellErrors(parsed.value, plan, config.reportName),
    ...recordErrors(parsed.value, new Set(plan.cellKeys), config.reportName),
    ...prismaErrors(parsed.value, config.reportName),
  ];
}

function laneStatusErrors(lane, expectedCells, expectedStatus, name) {
  const checks = [
    [lane?.status === expectedStatus, `lanes.${name}.status must be ${expectedStatus}`],
    [lane?.planned_cells === expectedCells, `lanes.${name}.planned_cells must be ${expectedCells}`],
    [
      lane?.completed_cells === (expectedStatus === "complete" ? expectedCells : 0),
      `lanes.${name}.completed_cells is inconsistent`,
    ],
  ];
  return checks.flatMap(([passed, message]) =>
    passed ? [] : [`companion/methodology/software-engineering-coverage/publisher-coverage-status.json: ${message}`],
  );
}

function statusHeaderErrors(status, version, overallState, name) {
  const excluded = overallState === "complete-with-documented-exclusions";
  const disclosed = overallState === "not-performed-with-disclosed-source-limitations";
  const checks = [
    [status?.schema_version === 1, "schema_version must be 1"],
    [status?.release_version === version, "release_version must match release metadata"],
    [status?.status === overallState, "status must match release metadata"],
    [isValidIsoDate(status?.as_of), "as_of must be a valid YYYY-MM-DD date"],
    [status?.claims?.acm_searched === !disclosed, "claims.acm_searched is inconsistent"],
    [status?.claims?.ieee_searched === !disclosed, "claims.ieee_searched is inconsistent"],
    [
      status?.claims?.scopus_searched === (overallState === "complete"),
      "claims.scopus_searched is inconsistent",
    ],
    [
      status?.claims?.scopus_equivalence_claimed === false,
      "claims.scopus_equivalence_claimed must be false",
    ],
    [
      status?.claims?.complete_with_documented_exclusions === excluded,
      "claims.complete_with_documented_exclusions is inconsistent",
    ],
    [
      disclosed
        ? status?.claims?.source_limitations_disclosed === true
        : status?.claims?.source_limitations_disclosed !== true,
      "claims.source_limitations_disclosed is inconsistent",
    ],
    [
      typeof status?.interpretation_boundary === "string" &&
        Boolean(status.interpretation_boundary.trim()),
      "interpretation_boundary is required",
    ],
  ];
  return checks.flatMap(([passed, message]) => (passed ? [] : [`${name}: ${message}`]));
}

function replacementStatusErrors(status, replacementRequired, name) {
  return [
    ...(replacementRequired && status?.lanes?.scopus?.replacement !== "dblp-title-census"
      ? [`${name}: lanes.scopus.replacement must be dblp-title-census`]
      : []),
    ...(status?.status === "complete-with-documented-exclusions" &&
    status?.lanes?.scopus?.exclusion_accepted !== true
      ? [`${name}: lanes.scopus.exclusion_accepted must be true`]
      : []),
    ...(replacementRequired && status?.lanes?.dblp?.status !== "replacement-screening-complete"
      ? [`${name}: lanes.dblp.status must be replacement-screening-complete`]
      : []),
    ...(status?.lanes?.dblp?.publisher_native !== false ||
    status?.lanes?.dblp?.scopus_equivalent !== false
      ? [`${name}: DBLP must remain non-publisher-native and non-Scopus-equivalent`]
      : []),
  ];
}

function statusErrors(status, version, overallState, expectedCells) {
  const name =
    "companion/methodology/software-engineering-coverage/publisher-coverage-status.json";
  const excluded = overallState === "complete-with-documented-exclusions";
  const disclosed = overallState === "not-performed-with-disclosed-source-limitations";
  const providerStatus = disclosed ? "not-searched-with-disclosed-source-limitation" : "complete";
  return [
    ...statusHeaderErrors(status, version, overallState, name),
    ...laneStatusErrors(status?.lanes?.acm, expectedCells.acm, providerStatus, "acm"),
    ...laneStatusErrors(status?.lanes?.ieee, expectedCells.ieee, providerStatus, "ieee"),
    ...laneStatusErrors(
      status?.lanes?.scopus,
      expectedCells.scopus,
      disclosed
        ? "not-searched-with-disclosed-source-limitation"
        : excluded ? "excluded-with-documented-replacement" : "complete",
      "scopus",
    ),
    ...replacementStatusErrors(status, excluded || disclosed, name),
  ];
}

function planCellCount(content, config) {
  const plan = planContract(content, config);
  return { count: plan.cellKeys.length, errors: plan.errors };
}

export function publisherCoverageArtifactErrors(version, overallState, files) {
  const parsedStatus = parseJson(
    files.publisherCoverageStatus,
    "companion/methodology/software-engineering-coverage/publisher-coverage-status.json",
  );
  const planCounts = Object.fromEntries(
    Object.entries(LANE_CONFIG).map(([lane, config]) => [
      lane,
      planCellCount(files[config.planKey], config),
    ]),
  );
  const planErrors = Object.values(planCounts).flatMap((entry) => entry.errors);
  if (!parsedStatus.value || planErrors.length) return [...parsedStatus.errors, ...planErrors];
  const requiredReports = overallState === "complete"
    ? ["acm", "ieee", "scopus"]
    : overallState === "complete-with-documented-exclusions" ? ["acm", "ieee"] : [];
  const reportErrors = requiredReports.flatMap((lane) => {
    const config = LANE_CONFIG[lane];
    return laneReportErrors(
      files[config.reportKey],
      files[config.planKey],
      version,
      config,
    );
  });
  const fallbackErrors =
    overallState === "complete-with-documented-exclusions" &&
    !/not (?:Scopus-equivalent|equivalent to Scopus)/i.test(files.scopusFallbackDecision ?? "")
      ? [
          "companion/methodology/software-engineering-coverage/plans/erca_scopus_fallback_decision_2026-08.md: must state that replacement evidence is not Scopus-equivalent",
        ]
      : [];
  const prohibitedReports = overallState === "not-performed-with-disclosed-source-limitations"
    ? ["acm", "ieee", "scopus"]
    : overallState === "complete-with-documented-exclusions" ? ["scopus"] : [];
  const contradictoryReportErrors = prohibitedReports.flatMap((lane) => {
    const config = LANE_CONFIG[lane];
    return files[`${config.reportKey}Exists`] || files[config.reportKey]
      ? [`${config.reportName}: must be absent when the source is documented as not searched`]
      : [];
  });
  return [
    ...statusErrors(parsedStatus.value, version, overallState, {
      acm: planCounts.acm.count,
      ieee: planCounts.ieee.count,
      scopus: planCounts.scopus.count,
    }),
    ...reportErrors,
    ...fallbackErrors,
    ...contradictoryReportErrors,
  ];
}
