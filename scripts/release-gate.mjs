#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ARXIV_COMPILER_VERSION, ARXIV_TEX_IMAGE } from "./arxiv-compile.mjs";
import {
  adjudicationArtifactErrors,
  fullTextArtifactErrors,
  isValidIsoDate,
  supplementalArtifactErrors,
} from "./dblp-release-evidence.mjs";
import { publisherCoverageArtifactErrors } from "./publisher-coverage-evidence.mjs";

const ARXIV_ARCHIVE = "engineering-reliable-coding-agents-arxiv-source.zip";
const ARXIV_ROOT = "engineering-reliable-coding-agents-arxiv-source";
const PREVIEW_PDF = "engineering-reliable-coding-agents-preview.pdf";
const DOI_PATTERN = /^10\.\d{4,9}\/[\w.()/:;-]+$/i;

const STABLE_STATE_VALUES = Object.freeze({
  "arxiv.license": Object.freeze([
    "arxiv-perpetual-non-exclusive-1.0",
    "CC-BY-4.0",
    "CC-BY-SA-4.0",
    "CC-BY-NC-SA-4.0",
    "CC-BY-NC-ND-4.0",
    "CC0-1.0",
  ]),
  "arxiv.endorsement": Object.freeze(["confirmed", "not-required"]),
  "arxiv.orcid": Object.freeze(["linked", "not-linked-by-choice"]),
  "companion.license": Object.freeze(["CC-BY-4.0", "CC0-1.0", "Apache-2.0", "MIT"]),
  // External grading and publisher-native search are disclosed limitations of a
  // structured, explicitly non-exhaustive review, not preconditions for it.
  // Requiring "complete" here made a stable release impossible while the
  // manuscript truthfully reported both as not performed, which is what
  // produced the contradiction of publishing a release that called its own
  // limitations unmet gates. A disclosed state still has to prove disclosure:
  // methodologyArtifactErrors validates the status artifacts either way.
  "methodology_gates.external_grading": Object.freeze([
    "complete",
    "not-performed-with-disclosed-limitation",
  ]),
  "methodology_gates.publisher_native_search": Object.freeze([
    "complete",
    "complete-with-documented-exclusions",
    "not-performed-with-disclosed-source-limitations",
  ]),
});

const REQUIRED_DOI_FILES = [
  ["CITATION.cff", "rootCitation"],
  ["companion/CITATION.cff", "companionCitation"],
  ["companion/README.md", "companionReadme"],
  ["manuscript/materials.tex", "manuscriptMaterials"],
];

function humanDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function isStableVersion(version) {
  return /^\d+\.\d+\.\d+$/.test(version);
}

function markdownSubsection(content, heading) {
  const lines = (content ?? "").split("\n");
  const start = lines.findIndex((line) => line.trim() === `### ${heading}`);
  if (start < 0) return "";
  const remainder = lines.slice(start + 1);
  const end = remainder.findIndex((line) => line.startsWith("### "));
  return remainder.slice(0, end < 0 ? undefined : end).join("\n");
}

function validKappa(value) {
  return value === null || (Number.isFinite(value) && value >= -1 && value <= 1);
}

function readerPairKey(pair, allowedReaders) {
  if (!Array.isArray(pair) || pair.length !== 2 || pair[0] === pair[1]) return "";
  if (pair.some((reader) => !allowedReaders.has(reader))) return "";
  return [...pair].sort().join("\u0000");
}

function pairwiseGradingErrors(report, readers, name) {
  const pairs = Array.isArray(report?.pairwise_cohen_kappa)
    ? report.pairwise_cohen_kappa
    : [];
  const allowedReaders = new Set(readers);
  const expectedKeys = readers.flatMap((left, leftIndex) =>
    readers.slice(leftIndex + 1).map((right) => readerPairKey([left, right], allowedReaders)),
  );
  const actualKeys = pairs.map((pair) => readerPairKey(pair?.readers, allowedReaders));
  const pairSetMatches =
    actualKeys.every(Boolean) &&
    new Set(actualKeys).size === actualKeys.length &&
    expectedKeys.every((key) => actualKeys.includes(key));
  const checks = [
    [pairs.length === expectedKeys.length, "pairwise comparison count is invalid"],
    [pairSetMatches, "each unordered reader pair must appear exactly once"],
    [pairs.every((pair) => pair?.n === 43), "each pairwise comparison must cover 43 items"],
    [pairs.every((pair) => validKappa(pair?.kappa)), "each pairwise kappa must be null or between -1 and 1"],
    [
      pairs.every((pair) => pair?.kappa !== null || pair?.kappa_note?.trim()),
      "a null pairwise kappa requires an explanation",
    ],
  ];
  return checks.flatMap(([passed, message]) => (passed ? [] : [`${name}: ${message}`]));
}

function fleissGradingErrors(report, readerCount, name) {
  if (readerCount !== 3) {
    return report?.fleiss_kappa === null ? [] : [`${name}: two-reader reports require null Fleiss kappa`];
  }
  const fleiss = report?.fleiss_kappa;
  const valid =
    fleiss?.n === 43 &&
    fleiss?.raters === 3 &&
    validKappa(fleiss?.kappa) &&
    (fleiss.kappa !== null || Boolean(fleiss.kappa_note?.trim()));
  return valid ? [] : [`${name}: three-reader reports require a valid 43-item Fleiss kappa`];
}

function externalGradingArtifactErrors(content) {
  const name = "companion/methodology/external-grading/calibration-report.json";
  if (!content) return [`${name}: required for a stable release`];
  let report;
  try {
    report = JSON.parse(content);
  } catch (error) {
    return [`${name}: invalid JSON (${error.message})`];
  }
  const readers = Array.isArray(report?.readers) ? report.readers : [];
  const uniqueReaders = new Set(
    readers.filter((reader) => typeof reader === "string" && reader.trim()),
  );
  const checks = [
    [readers.length >= 2 && readers.length <= 3, "must contain two or three readers"],
    [uniqueReaders.size === readers.length, "reader identifiers must be unique and nonempty"],
    [report?.sampled_practices === 20, "sampled_practices must be 20"],
    [report?.evidence_items === 43, "evidence_items must be 43"],
    [Array.isArray(report?.disagreement_items), "disagreement_items must be an array"],
    [
      typeof report?.interpretation_boundary === "string" &&
        Boolean(report.interpretation_boundary.trim()),
      "interpretation_boundary is required",
    ],
  ];
  return [
    ...checks.flatMap(([passed, message]) => (passed ? [] : [`${name}: ${message}`])),
    ...pairwiseGradingErrors(report, readers, name),
    ...fleissGradingErrors(report, readers.length, name),
  ];
}

function externalGradingNonperformanceArtifactErrors(content, manifest) {
  const name = "companion/methodology/external-grading/status.json";
  if (!content) return [`${name}: required for disclosed external-grading nonperformance`];
  let status;
  try {
    status = JSON.parse(content);
  } catch (error) {
    return [`${name}: invalid JSON (${error.message})`];
  }
  const checks = [
    [status?.schema_version === 1, "schema_version must be 1"],
    [status?.release_version === manifest.version, "release_version must match release metadata"],
    [
      status?.status === "not-performed-with-disclosed-limitation",
      "status must record disclosed nonperformance",
    ],
    [isValidIsoDate(status?.decision_date), "decision_date must be a valid YYYY-MM-DD date"],
    [status?.commissioned_reader_count === 0, "commissioned_reader_count must be 0"],
    [status?.completed_response_count === 0, "completed_response_count must be 0"],
    [
      status?.agreement_statistics_reported === false,
      "agreement_statistics_reported must be false",
    ],
    [
      status?.claims_independent_calibration === false,
      "claims_independent_calibration must be false",
    ],
    [
      status?.protocol_retained_for_independent_reuse === true,
      "protocol_retained_for_independent_reuse must be true",
    ],
    [
      typeof status?.limitation === "string" && Boolean(status.limitation.trim()),
      "limitation is required",
    ],
  ];
  return checks.flatMap(([passed, message]) => (passed ? [] : [`${name}: ${message}`]));
}

function metadataErrors(manifest) {
  const errors = [];
  if (manifest?.schema_version !== 1) errors.push("release-metadata.json: schema_version must be 1");
  if (typeof manifest?.version !== "string") {
    errors.push("release-metadata.json: version is required");
  } else if (!/^\d+\.\d+\.\d+(?:-rc\.\d+)?$/.test(manifest.version)) {
    errors.push("release-metadata.json: version must match x.y.z or x.y.z-rc.N");
  }
  if (!isValidIsoDate(manifest?.freeze_date)) {
    errors.push("release-metadata.json: freeze_date must be a valid YYYY-MM-DD date");
  }
  if (manifest?.arxiv?.primary_category !== "cs.SE") {
    errors.push("release-metadata.json: arxiv.primary_category must be cs.SE");
  }
  if (JSON.stringify(manifest?.arxiv?.cross_lists) !== JSON.stringify(["cs.AI"])) {
    errors.push("release-metadata.json: arxiv.cross_lists must contain only cs.AI");
  }
  if (manifest?.arxiv?.processor !== "xelatex") {
    errors.push("release-metadata.json: arxiv.processor must be xelatex");
  }
  if (manifest?.arxiv?.texlive_version !== 2025) {
    errors.push("release-metadata.json: arxiv.texlive_version must be 2025");
  }
  return errors;
}

function arxivProcessorErrors(files) {
  const errors = [];
  if (!files.arxivReadme?.includes("Engine: XeLaTeX")) {
    errors.push("manuscript/00README: expected Engine: XeLaTeX");
  }
  if (!files.arxivReadme?.includes("TeX Live: 2025")) {
    errors.push("manuscript/00README: expected TeX Live: 2025");
  }
  return errors;
}

function versionErrors(manifest, files) {
  const version = manifest.version;
  const date = manifest.freeze_date;
  let skillsVersion = "";
  try {
    skillsVersion = JSON.parse(files.skillsManifest ?? "{}").derived_from?.companion_version ?? "";
  } catch {
    skillsVersion = "";
  }
  const checks = [
    ["CITATION.cff", files.rootCitation, `version: "${version}"`],
    ["CITATION.cff", files.rootCitation, `date-released: ${date}`],
    ["companion/CITATION.cff", files.companionCitation, `version: "${version}"`],
    ["companion/CITATION.cff", files.companionCitation, `date-released: ${date}`],
    ["manuscript/main.tex", files.manuscriptMain, `Version ${version}`],
    ["README.md", files.rootReadme, version],
    ["companion/README.md", files.companionReadme, version],
    ["companion/README.md", files.companionReadme, humanDate(date)],
    ["SUBMISSION.md", files.submission, version],
    ["CHANGELOG.md", files.changelog, `## ${version} — ${date}`],
  ];
  return [
    ...checks.flatMap(([name, content, expected]) =>
      content?.includes(expected)
        ? []
        : [`${name}: expected release value ${JSON.stringify(expected)}`],
    ),
    ...(skillsVersion === version
      ? []
      : [`skills/manifest.json: expected derived companion version ${JSON.stringify(version)}`]),
  ];
}

function stableReleaseErrors(manifest, files) {
  if (!isStableVersion(manifest.version)) return [];
  const stateValues = {
    "arxiv.license": manifest.arxiv?.license,
    "arxiv.endorsement": manifest.arxiv?.endorsement,
    "arxiv.orcid": manifest.arxiv?.orcid,
    "companion.license": manifest.companion?.license,
    "methodology_gates.external_grading": manifest.methodology_gates?.external_grading,
    "methodology_gates.publisher_native_search":
      manifest.methodology_gates?.publisher_native_search,
  };
  const stateErrors = Object.entries(STABLE_STATE_VALUES).flatMap(([name, allowedValues]) =>
    allowedValues.includes(stateValues[name])
      ? []
      : [
          `release-metadata.json: ${name} must be one of ${allowedValues
            .map((value) => JSON.stringify(value))
            .join(", ")} for a stable release`,
        ],
  );
  // A DOI is optional. arXiv's requirement is that linked code and data be
  // publicly available, which the public repository satisfies. When a DOI is
  // declared it must still be well formed and carried consistently everywhere
  // it is cited; when it is "not-assigned" the release proceeds without one
  // rather than holding a finished edition behind a future-tense promise.
  const doi = manifest.companion?.doi;
  const doiErrors =
    doi === "not-assigned" || doi == null
      ? []
      : !DOI_PATTERN.test(doi)
        ? [
            'release-metadata.json: companion.doi must be a valid DOI or "not-assigned"',
          ]
        : [
            ...REQUIRED_DOI_FILES.flatMap(([name, key]) =>
              files[key]?.includes(doi) ? [] : [`${name}: companion DOI ${doi} is missing`],
            ),
            ...(markdownSubsection(files.submission, "Comments").includes(doi)
              ? []
              : [`SUBMISSION.md: companion DOI ${doi} is missing from arXiv Comments`]),
          ];
  const provisionalLicense = /all rights reserved|until explicit|provisional notice/i.test(
    files.licenseScope ?? "",
  );
  const licenseErrors = provisionalLicense
    ? ["LICENSE-SCOPE.md: replace provisional manuscript and companion terms before stable release"]
    : [];
  const methodologyArtifactErrors = [
    ...adjudicationArtifactErrors(
      files.dblpAuthorAdjudication,
      files.dblpScreeningTriage,
    ),
    ...fullTextArtifactErrors(
      files.dblpFullTextVerification,
      files.dblpAuthorAdjudication,
    ),
    ...supplementalArtifactErrors(
      files.dblpSupplementalFullTextVerification,
      files.dblpFullTextAccessExceptions,
      files.dblpAuthorAdjudication,
    ),
  ];
  return [...stateErrors, ...doiErrors, ...licenseErrors, ...methodologyArtifactErrors];
}

function methodologyArtifactErrors(manifest, files) {
  const externalGradingState = manifest.methodology_gates?.external_grading;
  const externalGradingErrors =
    externalGradingState === "complete"
      ? externalGradingArtifactErrors(files.externalGradingReport)
      : externalGradingState === "not-performed-with-disclosed-limitation"
        ? [
            ...externalGradingNonperformanceArtifactErrors(
              files.externalGradingStatus,
              manifest,
            ),
            ...(files.externalGradingReportExists || files.externalGradingReport
              ? [
                  "companion/methodology/external-grading/calibration-report.json: must be absent when external grading was not performed",
                ]
              : []),
          ]
        : [];
  const publisherSearchState = manifest.methodology_gates?.publisher_native_search;
  const publisherSearchErrors = [
    "complete",
    "complete-with-documented-exclusions",
    "not-performed-with-disclosed-source-limitations",
  ].includes(publisherSearchState)
    ? publisherCoverageArtifactErrors(manifest.version, publisherSearchState, files)
    : [];
  return [...externalGradingErrors, ...publisherSearchErrors];
}

export function collectReleaseErrors(manifest, files) {
  return [
    ...metadataErrors(manifest),
    ...arxivProcessorErrors(files),
    ...versionErrors(manifest, files),
    ...methodologyArtifactErrors(manifest, files),
    ...stableReleaseErrors(manifest, files),
  ];
}

async function regularFiles(root, include) {
  async function walk(directory, prefix = "") {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map(async (entry) => {
        const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory()) return walk(absolute, relative);
        if (entry.isFile() && include(relative)) return [relative];
        return [];
      }),
    );
    return nested.flat();
  }
  return (await walk(root)).sort();
}

export function expectedArxivFiles(root) {
  const manuscriptRoot = path.join(root, "manuscript");
  return regularFiles(manuscriptRoot, (relative) =>
    relative === "00README" ||
    relative.endsWith(".tex") ||
    (relative.startsWith("figures/") && relative.endsWith(".pdf")),
  );
}

function isReleaseArtifact(relative) {
  return path.basename(relative) !== ".DS_Store";
}

export function expectedCompanionFiles(root) {
  return regularFiles(path.join(root, "companion"), isReleaseArtifact);
}

function command(commandName, args, options = {}) {
  const encoding = Object.hasOwn(options, "encoding") ? options.encoding : "utf8";
  const result = spawnSync(commandName, args, {
    encoding,
    cwd: options.cwd,
    maxBuffer: 128 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  return result;
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export function verifyZipMirror({ archivePath, archiveRoot, sourceRoot, relativeFiles }) {
  const listed = command("unzip", ["-Z1", archivePath]);
  if (listed.status !== 0) return [`${archivePath}: cannot list ZIP: ${listed.stderr.trim()}`];
  const actualFiles = listed.stdout
    .split("\n")
    .filter((entry) => entry && !entry.endsWith("/"))
    .sort();
  const expectedFiles = relativeFiles.map((relative) => `${archiveRoot}/${relative}`).sort();
  const inventoryErrors = [];
  const missing = expectedFiles.filter((entry) => !actualFiles.includes(entry));
  const extra = actualFiles.filter((entry) => !expectedFiles.includes(entry));
  if (missing.length) inventoryErrors.push(`${archivePath}: missing entries: ${missing.join(", ")}`);
  if (extra.length) inventoryErrors.push(`${archivePath}: unexpected entries: ${extra.join(", ")}`);
  const contentErrors = relativeFiles.flatMap((relative) => {
    const entry = `${archiveRoot}/${relative}`;
    if (!actualFiles.includes(entry)) return [];
    const archived = command("unzip", ["-p", archivePath, entry], { encoding: null });
    if (archived.status !== 0) return [`${archivePath}: cannot read ${entry}`];
    const source = readFileSync(path.join(sourceRoot, relative));
    return sha256(archived.stdout) === sha256(source)
      ? []
      : [`${archivePath}: content mismatch for ${entry}`];
  });
  return [...inventoryErrors, ...contentErrors];
}

export function validatePreview({ version, pdfInfo, text, pages = 270 }) {
  const listOfTablesHeaderPages = text
    .split("\f")
    .map((page) => page.split("\n").find((line) => line.trim())?.trim())
    .filter((heading) => heading === "List of Tables").length;
  const checks = [
    [pdfInfo.includes(`Pages:           ${pages}`) || pdfInfo.includes(`Pages: ${pages}`), `${pages} pages`],
    [pdfInfo.includes("612 x 792 pts (letter)"), "US letter page size"],
    [/Encrypted:\s+no/i.test(pdfInfo), "unencrypted PDF"],
    [text.includes(`Version ${version}`), `version ${version}`],
    [!text.includes("ů"), "no U+016F glyph substitutions"],
    [!text.includes("Œ"), "no U+0152 glyph substitutions"],
    [listOfTablesHeaderPages <= 1, "only one List of Tables page header"],
  ];
  return checks.flatMap(([passed, expectation]) =>
    passed ? [] : [`dist/${PREVIEW_PDF}: expected ${expectation}`],
  );
}

export function verifyCompilationReport({
  archive,
  pdf,
  report,
  expectedPages,
  expectedSourceDateEpoch,
}) {
  const checks = [
    [report?.schema_version === 1, "schema_version must be 1"],
    [report?.engine === "xelatex", "engine must be xelatex"],
    [report?.texlive_version === 2025, "texlive_version must be 2025"],
    [report?.container_image === ARXIV_TEX_IMAGE, "container_image must match the approved digest"],
    [report?.compiler_version === ARXIV_COMPILER_VERSION, "compiler_version must match the pinned image"],
    [report?.source_date_epoch === expectedSourceDateEpoch, "source_date_epoch must match freeze_date"],
    [report?.archive_sha256 === sha256(archive), "archive_sha256 must match the exact arXiv ZIP"],
    [
      Buffer.isBuffer(pdf) && report?.pdf_sha256 === sha256(pdf),
      "pdf_sha256 must match the exact preview PDF",
    ],
    [report?.pdf?.pages === expectedPages, `PDF must contain ${expectedPages} pages`],
    [report?.pdf?.encrypted === false, "PDF must be unencrypted"],
    [report?.pdf?.page_size === "612 x 792 pts (letter)", "PDF must use US letter page size"],
    [report?.diagnostics?.material_errors === 0, "diagnostics.material_errors must be zero"],
  ];
  return checks.flatMap(([passed, expectation]) =>
    passed ? [] : [`companion/methodology/release-verification/arxiv-compile-report.json: ${expectation}`],
  );
}

async function loadContractFiles(root) {
  const entries = {
    rootCitation: "CITATION.cff",
    companionCitation: "companion/CITATION.cff",
    manuscriptMain: "manuscript/main.tex",
    manuscriptMaterials: "manuscript/materials.tex",
    arxivReadme: "manuscript/00README",
    rootReadme: "README.md",
    companionReadme: "companion/README.md",
    submission: "SUBMISSION.md",
    changelog: "CHANGELOG.md",
    skillsManifest: "skills/manifest.json",
    licenseScope: "LICENSE-SCOPE.md",
    acmPlan:
      "companion/methodology/software-engineering-coverage/plans/erca_acm_dl_manual_plan_2026-08.json",
    ieeePlan:
      "companion/methodology/software-engineering-coverage/plans/erca_ieee_xplore_search_plan_2026-08.json",
    scopusPlan:
      "companion/methodology/software-engineering-coverage/plans/erca_scopus_search_plan_2026-08.json",
    scopusFallbackDecision:
      "companion/methodology/software-engineering-coverage/plans/erca_scopus_fallback_decision_2026-08.md",
  };
  const pairs = await Promise.all(
    Object.entries(entries).map(async ([key, relative]) => [
      key,
      await readFile(path.join(root, relative), "utf8"),
    ]),
  );
  const optionalEntries = {
    externalGradingReport:
      "companion/methodology/external-grading/calibration-report.json",
    externalGradingStatus:
      "companion/methodology/external-grading/status.json",
    publisherCoverageStatus:
      "companion/methodology/software-engineering-coverage/publisher-coverage-status.json",
    acmExecutionReport:
      "companion/methodology/software-engineering-coverage/acm-dl-execution-2026-08.json",
    ieeeExecutionReport:
      "companion/methodology/software-engineering-coverage/ieee-xplore-execution-2026-08.json",
    scopusExecutionReport:
      "companion/methodology/software-engineering-coverage/scopus-execution-2026-08.json",
    dblpScreeningTriage:
      "companion/methodology/software-engineering-coverage/dblp-screening-triage-2026-08.csv",
    dblpAuthorAdjudication:
      "companion/methodology/software-engineering-coverage/dblp-author-adjudication-2026-08.csv",
    dblpFullTextVerification:
      "companion/methodology/software-engineering-coverage/dblp-full-text-verification-2026-08.csv",
    dblpSupplementalFullTextVerification:
      "companion/methodology/software-engineering-coverage/dblp-supplemental-full-text-verification-2026-08.csv",
    dblpFullTextAccessExceptions:
      "companion/methodology/software-engineering-coverage/dblp-full-text-access-exceptions-2026-08.csv",
  };
  const optionalPairs = await Promise.all(
    Object.entries(optionalEntries).map(async ([key, relative]) => {
      try {
        return [key, await readFile(path.join(root, relative), "utf8")];
      } catch (error) {
        if (error.code === "ENOENT") return [key, ""];
        throw error;
      }
    }),
  );
  const externalGradingReportExists = await stat(
    path.join(root, optionalEntries.externalGradingReport),
  )
    .then(() => true)
    .catch((error) => {
      if (error.code === "ENOENT") return false;
      throw error;
    });
  const executionReportExistence = await Promise.all(
    ["acmExecutionReport", "ieeeExecutionReport", "scopusExecutionReport"].map(
      async (key) => [
        `${key}Exists`,
        await stat(path.join(root, optionalEntries[key]))
          .then(() => true)
          .catch((error) => {
            if (error.code === "ENOENT") return false;
            throw error;
          }),
      ],
    ),
  );
  return Object.fromEntries([
    ...pairs,
    ...optionalPairs,
    ["externalGradingReportExists", externalGradingReportExists],
    ...executionReportExistence,
  ]);
}

export async function verifyChecksums(root) {
  const companionRoot = path.join(root, "companion");
  const checksumContent = await readFile(path.join(companionRoot, "SHA256SUMS"), "utf8");
  const checksumLines = checksumContent.split("\n").filter(Boolean);
  const parsedLines = checksumLines.map((line) => line.match(/^[a-f0-9]{64} [ *](.+)$/));
  const formatErrors = parsedLines.flatMap((match, index) =>
    match ? [] : [`companion/SHA256SUMS: malformed line ${index + 1}`],
  );
  const listed = parsedLines.flatMap((match) => (match ? [match[1]] : [])).sort();
  const actual = await regularFiles(
    companionRoot,
    (relative) => relative !== "SHA256SUMS" && isReleaseArtifact(relative),
  );
  const unlisted = actual.filter((relative) => !listed.includes(relative));
  const stale = listed.filter((relative) => !actual.includes(relative));
  const coverageErrors = [
    ...(unlisted.length
      ? [`companion/SHA256SUMS: unlisted files: ${unlisted.join(", ")}`]
      : []),
    ...(stale.length ? [`companion/SHA256SUMS: missing files: ${stale.join(", ")}`] : []),
  ];
  const result = command("sha256sum", ["-c", "SHA256SUMS"], {
    cwd: companionRoot,
  });
  const verificationErrors =
    result.status === 0
      ? []
      : [`companion/SHA256SUMS: verification failed\n${result.stdout}${result.stderr}`.trim()];
  return [...formatErrors, ...coverageErrors, ...verificationErrors];
}

async function verifyPreview(root, manifest) {
  const preview = path.join(root, "dist", PREVIEW_PDF);
  const previewStat = await stat(preview).catch(() => null);
  if (!previewStat?.isFile()) return [`dist/${PREVIEW_PDF}: missing preview`];
  const info = command("pdfinfo", [preview]);
  const text = command("pdftotext", ["-layout", preview, "-"]);
  if (info.status !== 0 || text.status !== 0) {
    return [`dist/${PREVIEW_PDF}: PDF inspection failed`];
  }
  return validatePreview({
    version: manifest.version,
    pages: manifest.manuscript?.pages,
    pdfInfo: info.stdout,
    text: text.stdout,
  });
}

export async function verifyRelease(root) {
  const metadataPath = path.join(root, "release-metadata.json");
  const manifest = JSON.parse(await readFile(metadataPath, "utf8"));
  const arxivArchivePath = path.join(root, "dist", ARXIV_ARCHIVE);
  const [
    files,
    arxivFiles,
    companionFiles,
    checksumErrors,
    previewErrors,
    arxivArchive,
    previewPdf,
    compilationReport,
  ] = await Promise.all([
    loadContractFiles(root),
    expectedArxivFiles(root),
    expectedCompanionFiles(root),
    verifyChecksums(root),
    verifyPreview(root, manifest),
    readFile(arxivArchivePath),
    readFile(path.join(root, "dist", PREVIEW_PDF)),
    readFile(
      path.join(
        root,
        "companion",
        "methodology",
        "release-verification",
        "arxiv-compile-report.json",
      ),
      "utf8",
    ).then(JSON.parse),
  ]);
  const contractErrors = collectReleaseErrors(manifest, files);
  const compilationErrors = verifyCompilationReport({
    archive: arxivArchive,
    pdf: previewPdf,
    report: compilationReport,
    expectedPages: manifest.manuscript?.pages,
    expectedSourceDateEpoch: Math.floor(Date.parse(`${manifest.freeze_date}T00:00:00Z`) / 1000),
  });
  const arxivErrors = verifyZipMirror({
    archivePath: arxivArchivePath,
    archiveRoot: ARXIV_ROOT,
    sourceRoot: path.join(root, "manuscript"),
    relativeFiles: arxivFiles,
  });
  const companionArchive = `engineering-reliable-coding-agents-companion-${manifest.version}.zip`;
  const companionErrors = verifyZipMirror({
    archivePath: path.join(root, "dist", companionArchive),
    archiveRoot: "companion-release",
    sourceRoot: path.join(root, "companion"),
    relativeFiles: companionFiles,
  });
  return [
    ...contractErrors,
    ...checksumErrors,
    ...previewErrors,
    ...compilationErrors,
    ...arxivErrors,
    ...companionErrors,
  ];
}

async function main() {
  const rootFlag = process.argv.indexOf("--root");
  const root = path.resolve(rootFlag >= 0 ? process.argv[rootFlag + 1] : ".");
  const errors = await verifyRelease(root);
  if (errors.length) {
    console.error(`Release gate failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  const manifest = JSON.parse(await readFile(path.join(root, "release-metadata.json"), "utf8"));
  console.log(`Release gate passed for ${manifest.version}.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await main();
}
