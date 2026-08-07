import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { ARXIV_TEX_IMAGE } from "./arxiv-compile.mjs";
import { publisherCoverageFixture } from "./publisher-coverage-test-fixtures.mjs";
import {
  collectReleaseErrors,
  expectedArxivFiles,
  validatePreview,
  verifyChecksums,
  verifyCompilationReport,
  verifyZipMirror,
} from "./release-gate.mjs";

const DOI = "10.5281/zenodo.1234567";
const COMPLETE_EXTERNAL_GRADING_REPORT = JSON.stringify({
  sampled_practices: 20,
  evidence_items: 43,
  readers: ["reader-a", "reader-b"],
  pairwise_cohen_kappa: [{ readers: ["reader-a", "reader-b"], n: 43, kappa: 0.5 }],
  fleiss_kappa: null,
  disagreement_items: [],
  interpretation_boundary: "Agreement measures instrument reproducibility, not correctness.",
});
const DISCLOSED_EXTERNAL_GRADING_NONPERFORMANCE = JSON.stringify({
  schema_version: 1,
  release_version: "1.0.0",
  status: "not-performed-with-disclosed-limitation",
  decision_date: "2026-08-07",
  commissioned_reader_count: 0,
  completed_response_count: 0,
  agreement_statistics_reported: false,
  claims_independent_calibration: false,
  protocol_retained_for_independent_reuse: true,
  limitation:
    "The author did not commission external graders; this edition makes no independent-calibration or inter-rater-agreement claim.",
});
const COMPLETE_DBLP_ADJUDICATION = [
  "publication,doi,title,full_text_route,author_decision,author_note",
  ...Array.from(
    { length: 34 },
    (_, index) =>
      `publication-${index + 1},10.1000/${index + 1},Title ${index + 1},${index < 18 ? "open_location" : "closed_or_no_open_location"},defer,Author reviewed candidate ${index + 1}`,
  ),
].join("\n");
const COMPLETE_DBLP_TRIAGE = [
  "publication,model_recommendation",
  ...Array.from(
    { length: 34 },
    (_, index) => `publication-${index + 1},retain_for_full_text`,
  ),
].join("\n");
const COMPLETE_DBLP_FULL_TEXT_VERIFICATION = [
  "publication,doi,title,full_text_source_url,source_version,pages,full_text_sha256,verification_outcome,verification_locator,verified_bounded_claim,verification_note",
  ...Array.from(
    { length: 18 },
    (_, index) =>
      `publication-${index + 1},10.1000/${index + 1},Title ${index + 1},https://example.test/paper-${index + 1}.pdf,published_version,10,${"a".repeat(64)},supported,p. 1,Bounded claim ${index + 1},Verification note ${index + 1}`,
  ),
].join("\n");
const COMPLETE_DBLP_SUPPLEMENTAL_FULL_TEXT_VERIFICATION = [
  "publication,doi,title,full_text_source_url,source_version,pages,full_text_sha256,verification_outcome,verification_locator,verified_bounded_claim,verification_note",
  ...Array.from(
    { length: 13 },
    (_, index) =>
      `publication-${index + 19},10.1000/${index + 19},Title ${index + 19},https://example.test/supplement-${index + 1}.pdf,published_version,10,${"b".repeat(64)},supported,p. 1,Supplemental claim ${index + 1},Supplemental note ${index + 1}`,
  ),
].join("\n");
const COMPLETE_DBLP_FULL_TEXT_ACCESS_EXCEPTIONS = [
  "publication,doi,title,last_checked,access_status,checked_locations,exclusion_boundary",
  ...Array.from(
    { length: 3 },
    (_, index) =>
      `publication-${index + 32},10.1000/${index + 32},Title ${index + 32},2026-08-06,publisher_landing_only,Checked locations ${index + 1},Exclusion boundary ${index + 1}`,
  ),
].join("\n");

function fixtureFiles({ version, date, doi = "", provisional = false }) {
  const doiText = doi ? `\nCompanion DOI: ${doi}` : "";
  const prepared = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
  return {
    ...publisherCoverageFixture(version),
    rootCitation: `version: "${version}"\ndate-released: ${date}${doiText}\n`,
    companionCitation: `version: "${version}"\ndate-released: ${date}${doiText}\n`,
    manuscriptMain: `Version ${version} --- August 2026`,
    manuscriptMaterials: `Replication package ${doiText}`,
    arxivReadme: "Top-level file: main.tex\nEngine: XeLaTeX\nTeX Live: 2025\n",
    rootReadme: `The files represent ${version}.${doiText}`,
    companionReadme: `Release ${version}, prepared ${prepared}.${doiText}`,
    submission: `### Comments\nPrepared metadata for ${version}.${doiText}\n\n### Categories\n- cs.SE`,
    changelog: `## ${version} — ${date}\n`,
    skillsManifest: JSON.stringify({ derived_from: { companion_version: version } }),
    licenseScope: provisional
      ? "Manuscript and companion remain all rights reserved until explicit licenses are selected."
      : "Manuscript: CC BY 4.0. Companion: CC BY 4.0.",
    externalGradingReport: COMPLETE_EXTERNAL_GRADING_REPORT,
    externalGradingReportExists: true,
    externalGradingStatus: DISCLOSED_EXTERNAL_GRADING_NONPERFORMANCE,
    dblpScreeningTriage: COMPLETE_DBLP_TRIAGE,
    dblpAuthorAdjudication: COMPLETE_DBLP_ADJUDICATION,
    dblpFullTextVerification: COMPLETE_DBLP_FULL_TEXT_VERIFICATION,
    dblpSupplementalFullTextVerification: COMPLETE_DBLP_SUPPLEMENTAL_FULL_TEXT_VERIFICATION,
    dblpFullTextAccessExceptions: COMPLETE_DBLP_FULL_TEXT_ACCESS_EXCEPTIONS,
  };
}

function disclosedNonperformanceStableManifest() {
  return {
    ...completedStableManifest(),
    methodology_gates: {
      external_grading: "not-performed-with-disclosed-limitation",
      publisher_native_search: "complete",
    },
  };
}

function fixtureManifest(overrides = {}) {
  return {
    schema_version: 1,
    version: "1.0.0-rc.13",
    freeze_date: "2026-08-06",
    arxiv: {
      primary_category: "cs.SE",
      cross_lists: ["cs.AI"],
      processor: "xelatex",
      texlive_version: 2025,
      license: "pending",
      endorsement: "pending",
      orcid: "pending",
    },
    companion: { license: "pending", doi: "pending" },
    methodology_gates: {
      external_grading: "pending",
      publisher_native_search: "pending",
    },
    ...overrides,
  };
}

function completedStableManifest() {
  return fixtureManifest({
    version: "1.0.0",
    freeze_date: "2026-08-07",
    arxiv: {
      primary_category: "cs.SE",
      cross_lists: ["cs.AI"],
      processor: "xelatex",
      texlive_version: 2025,
      license: "arxiv-perpetual-non-exclusive-1.0",
      endorsement: "confirmed",
      orcid: "linked",
    },
    companion: { license: "CC-BY-4.0", doi: DOI },
    methodology_gates: {
      external_grading: "complete",
      publisher_native_search: "complete",
    },
  });
}

test("release candidates may retain explicit pending human gates", () => {
  const manifest = fixtureManifest();
  const errors = collectReleaseErrors(
    manifest,
    fixtureFiles({ version: manifest.version, date: manifest.freeze_date, provisional: true }),
  );

  assert.deepEqual(errors, []);
});

test("unsupported version strings cannot bypass stable-release checks", () => {
  for (const version of ["1.0.0+build.1", "v1.0.0", "stable", "1.0.0-beta.1"]) {
    const manifest = fixtureManifest({ version });
    const errors = collectReleaseErrors(
      manifest,
      fixtureFiles({ version, date: manifest.freeze_date, provisional: true }),
    );

    assert.ok(
      errors.some((error) => error.includes("version must match")),
      `unsupported version ${version} was accepted`,
    );
  }
});

test("stable v1 rejects pending gates, provisional licensing, and missing DOI propagation", () => {
  const manifest = fixtureManifest({
    version: "1.0.0",
    freeze_date: "2026-08-07",
  });
  const errors = collectReleaseErrors(
    manifest,
    fixtureFiles({ version: manifest.version, date: manifest.freeze_date, provisional: true }),
  );

  const requiredRejections = [
    "arxiv.license",
    "arxiv.endorsement",
    "arxiv.orcid",
    "companion.license",
    "methodology_gates.external_grading",
    "methodology_gates.publisher_native_search",
    "companion.doi",
    "LICENSE-SCOPE.md",
  ];
  for (const expected of requiredRejections) {
    assert.ok(errors.some((error) => error.includes(expected)), `missing rejection for ${expected}`);
  }
});

test("stable v1 accepts completed gates and a DOI propagated to every required artifact", () => {
  const manifest = completedStableManifest();
  const errors = collectReleaseErrors(
    manifest,
    fixtureFiles({ version: manifest.version, date: manifest.freeze_date, doi: DOI }),
  );

  assert.deepEqual(errors, []);
});

test("stable v1 rejects a publisher-search completion flag without execution evidence", () => {
  const manifest = completedStableManifest();
  const files = fixtureFiles({
    version: manifest.version,
    date: manifest.freeze_date,
    doi: DOI,
  });

  const errors = collectReleaseErrors(manifest, {
    ...files,
    publisherCoverageStatus: "",
  });

  assert.ok(errors.some((error) => error.includes("publisher-coverage-status.json")));
});

test("stable v1 rejects a documented Scopus exclusion in place of native execution", () => {
  const complete = completedStableManifest();
  const manifest = {
    ...complete,
    methodology_gates: {
      ...complete.methodology_gates,
      publisher_native_search: "complete-with-documented-exclusions",
    },
  };
  const files = {
    ...fixtureFiles({ version: manifest.version, date: manifest.freeze_date, doi: DOI }),
    ...publisherCoverageFixture(
      manifest.version,
      "complete-with-documented-exclusions",
    ),
  };

  const errors = collectReleaseErrors(manifest, files);
  assert.ok(errors.some((error) => error.includes("methodology_gates.publisher_native_search")));
});

test("stable v1 rejects disclosed proprietary-source limitations in place of native execution", () => {
  const complete = completedStableManifest();
  const state = "not-performed-with-disclosed-source-limitations";
  const manifest = {
    ...complete,
    methodology_gates: {
      ...complete.methodology_gates,
      publisher_native_search: state,
    },
  };
  const files = {
    ...fixtureFiles({ version: manifest.version, date: manifest.freeze_date, doi: DOI }),
    ...publisherCoverageFixture(manifest.version, state),
  };

  const errors = collectReleaseErrors(manifest, files);
  assert.ok(errors.some((error) => error.includes("methodology_gates.publisher_native_search")));
});

test("stable v1 rejects a Scopus report artifact when Scopus is documented as excluded", () => {
  const complete = completedStableManifest();
  const manifest = {
    ...complete,
    methodology_gates: {
      ...complete.methodology_gates,
      publisher_native_search: "complete-with-documented-exclusions",
    },
  };
  const files = {
    ...fixtureFiles({ version: manifest.version, date: manifest.freeze_date, doi: DOI }),
    ...publisherCoverageFixture(
      manifest.version,
      "complete-with-documented-exclusions",
    ),
    scopusExecutionReportExists: true,
  };

  const errors = collectReleaseErrors(manifest, files);
  assert.ok(errors.some((error) => error.includes("must be absent")));
});

test("stable v1 rejects external grading nonperformance in place of calibration", () => {
  const manifest = disclosedNonperformanceStableManifest();
  const files = {
    ...fixtureFiles({ version: manifest.version, date: manifest.freeze_date, doi: DOI }),
    externalGradingReport: "",
    externalGradingReportExists: false,
  };

  const errors = collectReleaseErrors(manifest, files);
  assert.ok(errors.some((error) => error.includes("methodology_gates.external_grading")));
});

test("stable v1 rejects an external-grading waiver without exact nonperformance evidence", () => {
  const manifest = disclosedNonperformanceStableManifest();
  const baseFiles = {
    ...fixtureFiles({ version: manifest.version, date: manifest.freeze_date, doi: DOI }),
    externalGradingReport: "",
    externalGradingReportExists: false,
  };
  const invalidStatuses = [
    ["required", ""],
    ["invalid JSON", "{"],
    ["release_version", { ...JSON.parse(DISCLOSED_EXTERNAL_GRADING_NONPERFORMANCE), release_version: "1.0.0-rc.13" }],
    ["status", { ...JSON.parse(DISCLOSED_EXTERNAL_GRADING_NONPERFORMANCE), status: "waived" }],
    ["commissioned_reader_count", { ...JSON.parse(DISCLOSED_EXTERNAL_GRADING_NONPERFORMANCE), commissioned_reader_count: 1 }],
    ["completed_response_count", { ...JSON.parse(DISCLOSED_EXTERNAL_GRADING_NONPERFORMANCE), completed_response_count: 1 }],
    ["agreement_statistics_reported", { ...JSON.parse(DISCLOSED_EXTERNAL_GRADING_NONPERFORMANCE), agreement_statistics_reported: true }],
    ["claims_independent_calibration", { ...JSON.parse(DISCLOSED_EXTERNAL_GRADING_NONPERFORMANCE), claims_independent_calibration: true }],
    ["protocol_retained_for_independent_reuse", { ...JSON.parse(DISCLOSED_EXTERNAL_GRADING_NONPERFORMANCE), protocol_retained_for_independent_reuse: false }],
    ["limitation", { ...JSON.parse(DISCLOSED_EXTERNAL_GRADING_NONPERFORMANCE), limitation: "" }],
  ];

  for (const [expected, status] of invalidStatuses) {
    const externalGradingStatus = typeof status === "string" ? status : JSON.stringify(status);
    const errors = collectReleaseErrors(manifest, { ...baseFiles, externalGradingStatus });
    assert.ok(errors.some((error) => error.includes(expected)), `missing rejection for ${expected}`);
  }
});

test("stable v1 rejects a calibration report when external grading is disclosed as not performed", () => {
  const manifest = disclosedNonperformanceStableManifest();
  const files = fixtureFiles({
    version: manifest.version,
    date: manifest.freeze_date,
    doi: DOI,
  });

  const errors = collectReleaseErrors(manifest, files);

  assert.ok(errors.some((error) => error.includes("must be absent")));
});

test("stable v1 rejects a zero-byte calibration report when grading was not performed", () => {
  const manifest = disclosedNonperformanceStableManifest();
  const files = {
    ...fixtureFiles({ version: manifest.version, date: manifest.freeze_date, doi: DOI }),
    externalGradingReport: "",
    externalGradingReportExists: true,
  };

  const errors = collectReleaseErrors(manifest, files);

  assert.ok(errors.some((error) => error.includes("must be absent")));
});

test("stable v1 rejects completed methodology flags without completed artifacts", () => {
  const manifest = completedStableManifest();
  const files = {
    ...fixtureFiles({ version: manifest.version, date: manifest.freeze_date, doi: DOI }),
    externalGradingReport: "",
    dblpAuthorAdjudication:
      "publication,full_text_route,author_decision,author_note\npublication-1,open_location,,\n",
    dblpFullTextVerification: "",
  };

  const errors = collectReleaseErrors(manifest, files);

  assert.ok(errors.some((error) => error.includes("calibration-report.json")));
  assert.ok(errors.some((error) => error.includes("dblp-author-adjudication")));
  assert.ok(errors.some((error) => error.includes("dblp-full-text-verification")));
});

test("stable v1 rejects malformed external-calibration evidence", () => {
  const manifest = completedStableManifest();
  const baseFiles = fixtureFiles({
    version: manifest.version,
    date: manifest.freeze_date,
    doi: DOI,
  });
  const validThreeReaderReport = {
    sampled_practices: 20,
    evidence_items: 43,
    readers: ["reader-a", "reader-b", "reader-c"],
    pairwise_cohen_kappa: [
      { readers: ["reader-a", "reader-b"], n: 43, kappa: 0.5 },
      { readers: ["reader-a", "reader-c"], n: 43, kappa: 0.25 },
      { readers: ["reader-b", "reader-c"], n: 43, kappa: 0 },
    ],
    fleiss_kappa: { n: 43, raters: 3, kappa: 0 },
    disagreement_items: [],
    interpretation_boundary: "Agreement measures reproducibility, not correctness.",
  };
  assert.deepEqual(
    collectReleaseErrors(manifest, {
      ...baseFiles,
      externalGradingReport: JSON.stringify(validThreeReaderReport),
    }),
    [],
  );
  const invalidReports = [
    ["invalid JSON", "{"],
    ["two or three readers", "null"],
    ["two or three readers", { ...validThreeReaderReport, readers: ["reader-a"] }],
    [
      "unique and nonempty",
      { ...validThreeReaderReport, readers: ["reader-a", "reader-a", "reader-c"] },
    ],
    ["sampled_practices", { ...validThreeReaderReport, sampled_practices: 19 }],
    ["evidence_items", { ...validThreeReaderReport, evidence_items: 42 }],
    [
      "reader pair",
      {
        ...validThreeReaderReport,
        pairwise_cohen_kappa: [
          validThreeReaderReport.pairwise_cohen_kappa[0],
          validThreeReaderReport.pairwise_cohen_kappa[0],
          validThreeReaderReport.pairwise_cohen_kappa[2],
        ],
      },
    ],
    [
      "kappa",
      {
        ...validThreeReaderReport,
        pairwise_cohen_kappa: validThreeReaderReport.pairwise_cohen_kappa.map((pair, index) =>
          index === 0 ? { ...pair, kappa: 2 } : pair,
        ),
      },
    ],
    ["Fleiss", { ...validThreeReaderReport, fleiss_kappa: {} }],
    ["interpretation_boundary", { ...validThreeReaderReport, interpretation_boundary: "" }],
  ];

  for (const [expected, report] of invalidReports) {
    const externalGradingReport = typeof report === "string" ? report : JSON.stringify(report);
    const errors = collectReleaseErrors(manifest, { ...baseFiles, externalGradingReport });
    assert.ok(errors.some((error) => error.includes(expected)), `missing rejection for ${expected}`);
  }
});

test("stable v1 rejects incomplete or inconsistent DBLP author adjudication", () => {
  const manifest = completedStableManifest();
  const baseFiles = fixtureFiles({
    version: manifest.version,
    date: manifest.freeze_date,
    doi: DOI,
  });
  const rows = COMPLETE_DBLP_ADJUDICATION.split("\n");
  const invalidPackets = [
    ["all 34", rows.slice(0, -1).join("\n"), COMPLETE_DBLP_TRIAGE],
    ["unique", [rows[0], rows[1], ...rows.slice(1, -1)].join("\n"), COMPLETE_DBLP_TRIAGE],
    ["retained triage set", COMPLETE_DBLP_ADJUDICATION.replace("publication-1,", "other-1,"), COMPLETE_DBLP_TRIAGE],
    ["invalid or blank", COMPLETE_DBLP_ADJUDICATION.replace(",defer,", ",include,"), COMPLETE_DBLP_TRIAGE],
    ["requires a note", COMPLETE_DBLP_ADJUDICATION.replace("Author reviewed candidate 1", ""), COMPLETE_DBLP_TRIAGE],
    ["invalid CSV", `${COMPLETE_DBLP_ADJUDICATION}\n\"`, COMPLETE_DBLP_TRIAGE],
    [
      "nonempty",
      COMPLETE_DBLP_ADJUDICATION.replace("publication-1,", ","),
      COMPLETE_DBLP_TRIAGE.replace("publication-1,", ","),
    ],
    ["all 34", COMPLETE_DBLP_ADJUDICATION, COMPLETE_DBLP_TRIAGE.split("\n").slice(0, -1).join("\n")],
  ];

  for (const [expected, dblpAuthorAdjudication, dblpScreeningTriage] of invalidPackets) {
    const errors = collectReleaseErrors(manifest, {
      ...baseFiles,
      dblpAuthorAdjudication,
      dblpScreeningTriage,
    });
    assert.ok(errors.some((error) => error.includes(expected)), `missing rejection for ${expected}`);
  }
});

test("stable v1 rejects incomplete or malformed DBLP full-text support notes", () => {
  const manifest = completedStableManifest();
  const baseFiles = fixtureFiles({
    version: manifest.version,
    date: manifest.freeze_date,
    doi: DOI,
  });
  const rows = COMPLETE_DBLP_FULL_TEXT_VERIFICATION.split("\n");
  const invalidNotes = [
    ["required", ""],
    ["all 18", rows.slice(0, -1).join("\n")],
    ["unique", [rows[0], rows[1], ...rows.slice(1, -1)].join("\n")],
    ["open-routed", COMPLETE_DBLP_FULL_TEXT_VERIFICATION.replace("publication-1,", "other-1,")],
    ["HTTPS", COMPLETE_DBLP_FULL_TEXT_VERIFICATION.replace("https://", "http://")],
    ["HTTPS", COMPLETE_DBLP_FULL_TEXT_VERIFICATION.replace("https://example.test/paper-1.pdf", "https://")],
    ["invalid CSV", COMPLETE_DBLP_FULL_TEXT_VERIFICATION.replace("Verification note 1", "Verification note 1,unexpected")],
    ["source_version", COMPLETE_DBLP_FULL_TEXT_VERIFICATION.replace("published_version", "unknown")],
    ["SHA-256", COMPLETE_DBLP_FULL_TEXT_VERIFICATION.replace("a".repeat(64), "not-a-hash")],
    ["positive pages", COMPLETE_DBLP_FULL_TEXT_VERIFICATION.replace(",10,", ",0,")],
    ["verification_outcome", COMPLETE_DBLP_FULL_TEXT_VERIFICATION.replace(",supported,", ",accepted,")],
    ["support fields", COMPLETE_DBLP_FULL_TEXT_VERIFICATION.replace(",p. 1,Bounded claim 1,Verification note 1", ",,,")],
  ];

  for (const [expected, dblpFullTextVerification] of invalidNotes) {
    const errors = collectReleaseErrors(manifest, { ...baseFiles, dblpFullTextVerification });
    assert.ok(errors.some((error) => error.includes(expected)), `missing rejection for ${expected}`);
  }
});

test("stable v1 rejects incomplete or malformed DBLP supplemental full-text evidence", () => {
  const manifest = completedStableManifest();
  const baseFiles = fixtureFiles({
    version: manifest.version,
    date: manifest.freeze_date,
    doi: DOI,
  });
  const verificationRows = COMPLETE_DBLP_SUPPLEMENTAL_FULL_TEXT_VERIFICATION.split("\n");
  const exceptionRows = COMPLETE_DBLP_FULL_TEXT_ACCESS_EXCEPTIONS.split("\n");
  const invalidArtifacts = [
    ["required", "", COMPLETE_DBLP_FULL_TEXT_ACCESS_EXCEPTIONS],
    ["required", COMPLETE_DBLP_SUPPLEMENTAL_FULL_TEXT_VERIFICATION, ""],
    ["13", verificationRows.slice(0, -1).join("\n"), COMPLETE_DBLP_FULL_TEXT_ACCESS_EXCEPTIONS],
    ["three", COMPLETE_DBLP_SUPPLEMENTAL_FULL_TEXT_VERIFICATION, exceptionRows.slice(0, -1).join("\n")],
    ["partition", COMPLETE_DBLP_SUPPLEMENTAL_FULL_TEXT_VERIFICATION.replace("publication-19,", "publication-32,"), COMPLETE_DBLP_FULL_TEXT_ACCESS_EXCEPTIONS],
    ["HTTPS", COMPLETE_DBLP_SUPPLEMENTAL_FULL_TEXT_VERIFICATION.replace("https://example.test/supplement-1.pdf", "https://") , COMPLETE_DBLP_FULL_TEXT_ACCESS_EXCEPTIONS],
    ["source_version", COMPLETE_DBLP_SUPPLEMENTAL_FULL_TEXT_VERIFICATION.replace("published_version", "unknown"), COMPLETE_DBLP_FULL_TEXT_ACCESS_EXCEPTIONS],
    ["access_status", COMPLETE_DBLP_SUPPLEMENTAL_FULL_TEXT_VERIFICATION, COMPLETE_DBLP_FULL_TEXT_ACCESS_EXCEPTIONS.replace("publisher_landing_only", "unknown")],
    ["last_checked", COMPLETE_DBLP_SUPPLEMENTAL_FULL_TEXT_VERIFICATION, COMPLETE_DBLP_FULL_TEXT_ACCESS_EXCEPTIONS.replace("2026-08-06", "August 6")],
    ["last_checked", COMPLETE_DBLP_SUPPLEMENTAL_FULL_TEXT_VERIFICATION, COMPLETE_DBLP_FULL_TEXT_ACCESS_EXCEPTIONS.replace("2026-08-06", "2026-99-99")],
    ["last_checked", COMPLETE_DBLP_SUPPLEMENTAL_FULL_TEXT_VERIFICATION, COMPLETE_DBLP_FULL_TEXT_ACCESS_EXCEPTIONS.replace("2026-08-06", "2026-02-30")],
    ["invalid CSV", `${COMPLETE_DBLP_SUPPLEMENTAL_FULL_TEXT_VERIFICATION}\npublication-99,extra`, COMPLETE_DBLP_FULL_TEXT_ACCESS_EXCEPTIONS],
    ["access-exceptions", COMPLETE_DBLP_SUPPLEMENTAL_FULL_TEXT_VERIFICATION, `${COMPLETE_DBLP_FULL_TEXT_ACCESS_EXCEPTIONS}\npublication-99,extra`],
    ["schema", COMPLETE_DBLP_SUPPLEMENTAL_FULL_TEXT_VERIFICATION.replace("publication,doi,title,", "publication,wrong_doi,title,"), COMPLETE_DBLP_FULL_TEXT_ACCESS_EXCEPTIONS],
    ["DOI/title", COMPLETE_DBLP_SUPPLEMENTAL_FULL_TEXT_VERIFICATION.replace("10.1000/19,Title 19", "10.1000/999,Wrong title"), COMPLETE_DBLP_FULL_TEXT_ACCESS_EXCEPTIONS],
    ["DOI/title", COMPLETE_DBLP_SUPPLEMENTAL_FULL_TEXT_VERIFICATION, COMPLETE_DBLP_FULL_TEXT_ACCESS_EXCEPTIONS.replace("10.1000/32,Title 32", "10.1000/999,Wrong title")],
  ];

  for (const [expected, dblpSupplementalFullTextVerification, dblpFullTextAccessExceptions] of invalidArtifacts) {
    const errors = collectReleaseErrors(manifest, {
      ...baseFiles,
      dblpSupplementalFullTextVerification,
      dblpFullTextAccessExceptions,
    });
    assert.ok(errors.some((error) => error.includes(expected)), `missing rejection for ${expected}`);
  }
});

test("stable v1 rejects ambiguous or failed gate states", () => {
  const manifest = fixtureManifest({
    version: "1.0.0",
    freeze_date: "2026-08-07",
    arxiv: {
      primary_category: "cs.SE",
      cross_lists: ["cs.AI"],
      processor: "xelatex",
      texlive_version: 2025,
      license: "unresolved",
      endorsement: "unknown",
      orcid: "not-linked",
    },
    companion: { license: "TBD", doi: DOI },
    methodology_gates: {
      external_grading: "not-started",
      publisher_native_search: "failed",
    },
  });

  const errors = collectReleaseErrors(
    manifest,
    fixtureFiles({ version: manifest.version, date: manifest.freeze_date, doi: DOI }),
  );

  for (const field of [
    "arxiv.license",
    "arxiv.endorsement",
    "arxiv.orcid",
    "companion.license",
    "methodology_gates.external_grading",
    "methodology_gates.publisher_native_search",
  ]) {
    assert.ok(errors.some((error) => error.includes(field)), `missing rejection for ${field}`);
  }
});

test("a DOI outside the paste-ready arXiv Comments does not satisfy propagation", () => {
  const manifest = fixtureManifest({
    version: "1.0.0",
    freeze_date: "2026-08-07",
    arxiv: {
      primary_category: "cs.SE",
      cross_lists: ["cs.AI"],
      processor: "xelatex",
      texlive_version: 2025,
      license: "arxiv-perpetual-non-exclusive-1.0",
      endorsement: "confirmed",
      orcid: "linked",
    },
    companion: { license: "CC-BY-4.0", doi: DOI },
    methodology_gates: {
      external_grading: "complete",
      publisher_native_search: "complete",
    },
  });
  const files = fixtureFiles({ version: manifest.version, date: manifest.freeze_date, doi: DOI });
  const submission = `### Comments\n270 pages, 17 figures.\n\n### Workflow note\nReserved DOI: ${DOI}`;

  const errors = collectReleaseErrors(manifest, { ...files, submission });

  assert.ok(errors.some((error) => error.includes("arXiv Comments")));
});

test("metadata drift is reported with the affected artifact", () => {
  const manifest = fixtureManifest();
  const files = fixtureFiles({ version: "1.0.0-rc.12", date: manifest.freeze_date });

  const errors = collectReleaseErrors(manifest, files);

  assert.ok(errors.some((error) => error.includes("CITATION.cff")));
  assert.ok(errors.some((error) => error.includes("manuscript/main.tex")));
});

test("release metadata rejects stale companion dates, changelog versions, and skill provenance", () => {
  const manifest = fixtureManifest();
  const files = {
    ...fixtureFiles({ version: manifest.version, date: manifest.freeze_date }),
    companionCitation: `version: "${manifest.version}"\ndate-released: 2026-08-05\n`,
    changelog: "## 1.0.0-rc.12 — 2026-08-05\n",
    skillsManifest: JSON.stringify({
      derived_from: { companion_version: "1.0.0-rc.6" },
    }),
  };

  const errors = collectReleaseErrors(manifest, files);

  assert.ok(errors.some((error) => error.includes("companion/CITATION.cff")));
  assert.ok(errors.some((error) => error.includes("CHANGELOG.md")));
  assert.ok(errors.some((error) => error.includes("skills/manifest.json")));
});

test("the release contract rejects a processor that does not match the verified arXiv build", () => {
  const manifest = fixtureManifest();
  const files = {
    ...fixtureFiles({ version: manifest.version, date: manifest.freeze_date }),
    arxivReadme: "Top-level file: main.tex\nEngine: pdfLaTeX\n",
  };

  assert.ok(collectReleaseErrors(manifest, files).some((error) => error.includes("XeLaTeX")));
  assert.ok(
    collectReleaseErrors(
      { ...manifest, arxiv: { ...manifest.arxiv, processor: "pdflatex" } },
      fixtureFiles({ version: manifest.version, date: manifest.freeze_date }),
    ).some((error) => error.includes("arxiv.processor")),
  );
});

test("the compilation report is bound to the exact archive and verified processor", () => {
  const archive = Buffer.from("exact archive");
  const pdf = Buffer.from("exact preview PDF");
  const archiveHash = createHash("sha256").update(archive).digest("hex");
  const pdfHash = createHash("sha256").update(pdf).digest("hex");
  const report = {
    schema_version: 1,
    engine: "xelatex",
    texlive_version: 2025,
    container_image: ARXIV_TEX_IMAGE,
    source_date_epoch: 1785974400,
    compiler_version: "XeTeX 3.141592653-2.6-0.999997 (TeX Live 2025)",
    archive_sha256: archiveHash,
    pdf_sha256: pdfHash,
    pdf: {
      pages: 270,
      encrypted: false,
      page_size: "612 x 792 pts (letter)",
    },
    diagnostics: { material_errors: 0 },
  };

  assert.deepEqual(
    verifyCompilationReport({
      archive,
      pdf,
      report,
      expectedPages: 270,
      expectedSourceDateEpoch: 1785974400,
    }),
    [],
  );
  assert.ok(
    verifyCompilationReport({
      archive: Buffer.from("different archive"),
      pdf,
      report: { ...report, engine: "pdflatex", texlive_version: 2023 },
      expectedPages: 270,
      expectedSourceDateEpoch: 1785974400,
    }).some((error) => error.includes("archive_sha256")),
  );
  assert.ok(
    verifyCompilationReport({
      archive,
      pdf: Buffer.from("different preview PDF"),
      report,
      expectedPages: 270,
      expectedSourceDateEpoch: 1785974400,
    }).some((error) => error.includes("pdf_sha256")),
  );
  assert.ok(
    verifyCompilationReport({
      archive,
      pdf,
      report: { ...report, diagnostics: { material_errors: 1 } },
      expectedPages: 270,
      expectedSourceDateEpoch: 1785974400,
    }).some((error) => error.includes("material_errors")),
  );
  const provenanceErrors = verifyCompilationReport({
    archive,
    pdf,
    report: {
      ...report,
      container_image: "texlive/texlive:TL2025-historic@sha256:" + "a".repeat(64),
      compiler_version: "",
      pdf_sha256: "not-a-hash",
    },
    expectedPages: 270,
    expectedSourceDateEpoch: 1785974400,
  });
  for (const expectation of ["container_image", "compiler_version", "pdf_sha256"]) {
    assert.ok(provenanceErrors.some((error) => error.includes(expectation)), expectation);
  }
});

test("arXiv inventory excludes generated TeX output", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "erca-release-test-"));
  await mkdir(path.join(root, "manuscript", "figures"), { recursive: true });
  await writeFile(path.join(root, "manuscript", "main.tex"), "source");
  await writeFile(path.join(root, "manuscript", "main.pdf"), "generated");
  await writeFile(path.join(root, "manuscript", "main.aux"), "generated");
  await writeFile(path.join(root, "manuscript", "00README"), "readme");
  await writeFile(path.join(root, "manuscript", "figures", "figure.pdf"), "figure");

  assert.deepEqual(await expectedArxivFiles(root), ["00README", "figures/figure.pdf", "main.tex"]);
});

test("archive verification preserves arbitrary binary bytes and detects drift", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "erca-release-test-"));
  const source = path.join(root, "source");
  const archiveRoot = "artifact";
  await mkdir(path.join(source, archiveRoot), { recursive: true });
  await writeFile(path.join(source, archiveRoot, "item.bin"), Buffer.from([0, 255, 128, 10, 42]));
  const archive = path.join(root, "artifact.zip");
  const zipped = spawnSync("zip", ["-q", "-r", archive, archiveRoot], {
    cwd: source,
    encoding: "utf8",
  });
  assert.equal(zipped.status, 0, zipped.stderr);

  assert.deepEqual(
    verifyZipMirror({
      archivePath: archive,
      archiveRoot,
      sourceRoot: path.join(source, archiveRoot),
      relativeFiles: ["item.bin"],
    }),
    [],
  );

  await writeFile(path.join(source, archiveRoot, "item.bin"), Buffer.from([0, 254, 128, 10, 42]));
  const errors = verifyZipMirror({
    archivePath: archive,
    archiveRoot,
    sourceRoot: path.join(source, archiveRoot),
    relativeFiles: ["item.bin"],
  });
  assert.ok(errors.some((error) => error.includes("content mismatch")));

  const missing = verifyZipMirror({
    archivePath: archive,
    archiveRoot,
    sourceRoot: path.join(source, archiveRoot),
    relativeFiles: ["item.bin", "missing.bin"],
  });
  assert.ok(missing.some((error) => error.includes("missing entries")));

  const extra = verifyZipMirror({
    archivePath: archive,
    archiveRoot,
    sourceRoot: path.join(source, archiveRoot),
    relativeFiles: [],
  });
  assert.ok(extra.some((error) => error.includes("unexpected entries")));
});

test("preview validation checks release identity and PDF structure without requiring byte determinism", () => {
  assert.deepEqual(
    validatePreview({
      version: "1.0.0-rc.13",
      pdfInfo: "Pages: 270\nPage size: 612 x 792 pts (letter)\nEncrypted: no\nPDF version: 1.5\n",
      text: "Engineering Reliable Coding Agents\nVersion 1.0.0-rc.13 — August 2026\n",
    }),
    [],
  );

  const errors = validatePreview({
    version: "1.0.0-rc.13",
    pdfInfo: "Pages: 269\nPage size: 595 x 842 pts (A4)\nEncrypted: yes\n",
    text: "Version 1.0.0-rc.12 — August 2026\n",
  });
  assert.ok(errors.some((error) => error.includes("270 pages")));
  assert.ok(errors.some((error) => error.includes("US letter")));
  assert.ok(errors.some((error) => error.includes("unencrypted")));
  assert.ok(errors.some((error) => error.includes("1.0.0-rc.13")));
});

test("preview validation rejects observed glyph substitutions and leaked front-matter headers", () => {
  const errors = validatePreview({
    version: "1.0.0-rc.14",
    pdfInfo: "Pages: 271\nPage size: 612 x 792 pts (letter)\nEncrypted: no\nPDF version: 1.7\n",
    pages: 271,
    text: [
      "Engineering Reliable Coding Agents\nVersion 1.0.0-rc.14 — August 2026\n",
      "\fList of Tables\nTable 1\n",
      "\fList of Tables\nEvidence profile. 10 strong ů 1 directional ů 0 corroborating.\n",
      "expected PASS agreement: 0.90 Œ 0.90 = 0.81\n",
    ].join(""),
  });

  assert.ok(errors.some((error) => error.includes("U+016F")));
  assert.ok(errors.some((error) => error.includes("U+0152")));
  assert.ok(errors.some((error) => error.includes("List of Tables")));
});

test("preview validation accepts intended centered dots, multiplication signs, and Introduction headers", () => {
  assert.deepEqual(
    validatePreview({
      version: "1.0.0-rc.14",
      pdfInfo: "Pages: 271\nPage size: 612 x 792 pts (letter)\nEncrypted: no\nPDF version: 1.7\n",
      pages: 271,
      text: [
        "Engineering Reliable Coding Agents\nVersion 1.0.0-rc.14 — August 2026\n",
        "\fList of Tables\nTable 1\n",
        "\fIntroduction\nEvidence profile. 10 strong · 1 directional · 0 corroborating.\n",
        "expected PASS agreement: 0.90 × 0.90 = 0.81\n",
      ].join(""),
    }),
    [],
  );
});

test("checksum verification rejects a modified companion file", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "erca-release-test-"));
  const companion = path.join(root, "companion");
  await mkdir(companion, { recursive: true });
  const content = "original";
  const checksum = createHash("sha256").update(content).digest("hex");
  await writeFile(path.join(companion, "item.txt"), content);
  await writeFile(path.join(companion, "SHA256SUMS"), `${checksum}  item.txt\n`);
  assert.deepEqual(await verifyChecksums(root), []);

  await writeFile(path.join(companion, "unlisted.txt"), "unlisted");
  assert.ok((await verifyChecksums(root)).some((error) => error.includes("unlisted.txt")));

  await writeFile(path.join(companion, "item.txt"), "modified");
  const errors = await verifyChecksums(root);
  assert.ok(errors.some((error) => error.includes("verification failed")));
});
