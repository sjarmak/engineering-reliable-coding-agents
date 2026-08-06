#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ALLOWED_LABELS = [
  "strong",
  "directional",
  "corroborating",
  "null_or_conflicting",
];

const DEFAULT_PACKET_PATH = fileURLToPath(
  new URL("./blinded-evidence-items.json", import.meta.url),
);

function assertUniqueIds(rows, file) {
  const seen = new Set();
  for (const row of rows) {
    if (!row || typeof row !== "object" || typeof row.evidence_id !== "string") {
      throw new Error(`${file} contains a row without an evidence_id`);
    }
    if (seen.has(row.evidence_id)) {
      throw new Error(`${file} contains duplicate evidence_id ${row.evidence_id}`);
    }
    seen.add(row.evidence_id);
  }
}

export function normalizeResponse(raw, { file, expectedIds }) {
  const envelope = Array.isArray(raw) ? { items: raw } : raw;
  if (!envelope || typeof envelope !== "object" || !Array.isArray(envelope.items)) {
    throw new Error(`${file} must be a response envelope or an array of response rows`);
  }
  const rows = envelope.items;
  assertUniqueIds(rows, file);

  const expected = new Set(expectedIds);
  const byId = new Map(rows.map((row) => [row.evidence_id, row]));
  const missing = expectedIds.filter((id) => !byId.has(id));
  const extra = rows.map((row) => row.evidence_id).filter((id) => !expected.has(id));
  if (missing.length || extra.length) {
    throw new Error(
      `${file} has ${missing.length} missing and ${extra.length} unexpected evidence IDs`,
    );
  }

  for (const id of expectedIds) {
    const row = byId.get(id);
    if (!ALLOWED_LABELS.includes(row.label)) {
      throw new Error(`${file} has a missing or invalid label for ${id}`);
    }
    if (typeof row.rationale !== "string" || !row.rationale.trim()) {
      throw new Error(`${file} has no rationale for ${id}`);
    }
  }

  if (!Array.isArray(raw) && envelope.independence_attestation !== true) {
    throw new Error(`${file} must affirm independence_attestation`);
  }

  return {
    file,
    reviewer_id:
      !Array.isArray(raw) && typeof envelope.reviewer_id === "string"
        ? envelope.reviewer_id.trim()
        : file,
    packet_id: !Array.isArray(raw) ? envelope.packet_id ?? null : null,
    labels: expectedIds.map((id) => byId.get(id).label),
    rationales: expectedIds.map((id) => byId.get(id).rationale.trim()),
  };
}

export function cohenKappa(a, b) {
  if (a.length !== b.length || a.length === 0) {
    throw new Error("Cohen's kappa requires non-empty, aligned label vectors");
  }
  const observed = a.filter((label, index) => label === b[index]).length / a.length;
  const expected = ALLOWED_LABELS.reduce((sum, label) => {
    const pa = a.filter((value) => value === label).length / a.length;
    const pb = b.filter((value) => value === label).length / b.length;
    return sum + pa * pb;
  }, 0);
  return {
    n: a.length,
    observed_agreement: observed,
    expected_agreement: expected,
    kappa: expected === 1 ? null : (observed - expected) / (1 - expected),
    kappa_note:
      expected === 1
        ? "Undefined because both readers used one category for every item."
        : null,
  };
}

export function fleissKappa(labelSets) {
  if (labelSets.length < 3) {
    throw new Error("Fleiss's kappa requires at least three readers");
  }
  const n = labelSets[0].length;
  if (n === 0 || labelSets.some((labels) => labels.length !== n)) {
    throw new Error("Fleiss's kappa requires non-empty, aligned label vectors");
  }
  const raters = labelSets.length;
  const categoryTotals = Object.fromEntries(ALLOWED_LABELS.map((label) => [label, 0]));
  let observedSum = 0;
  for (let item = 0; item < n; item += 1) {
    const counts = Object.fromEntries(ALLOWED_LABELS.map((label) => [label, 0]));
    for (const labels of labelSets) {
      counts[labels[item]] += 1;
      categoryTotals[labels[item]] += 1;
    }
    observedSum +=
      ALLOWED_LABELS.reduce((sum, label) => sum + counts[label] ** 2, 0) - raters;
  }
  const observed = observedSum / (n * raters * (raters - 1));
  const expected = ALLOWED_LABELS.reduce(
    (sum, label) => sum + (categoryTotals[label] / (n * raters)) ** 2,
    0,
  );
  return {
    n,
    raters,
    observed_agreement: observed,
    expected_agreement: expected,
    kappa: expected === 1 ? null : (observed - expected) / (1 - expected),
    kappa_note:
      expected === 1
        ? "Undefined because every assignment used one category."
        : null,
  };
}

function confusionMatrix(left, right) {
  const matrix = Object.fromEntries(
    ALLOWED_LABELS.map((label) => [
      label,
      Object.fromEntries(ALLOWED_LABELS.map((other) => [other, 0])),
    ]),
  );
  for (let index = 0; index < left.length; index += 1) {
    matrix[left[index]][right[index]] += 1;
  }
  return matrix;
}

export function analyzeResponses({ responses, packetRows }) {
  if (responses.length < 2) {
    throw new Error("At least two independent responses are required");
  }
  assertUniqueIds(packetRows, "blinded packet");
  const ids = packetRows.map((row) => row.evidence_id);
  const practiceIds = [...new Set(packetRows.map((row) => row.practice_id))];
  const normalized = responses.map(({ file, raw }) =>
    normalizeResponse(raw, { file, expectedIds: ids }),
  );

  const packetIds = new Set(normalized.map((response) => response.packet_id).filter(Boolean));
  if (packetIds.size > 1) {
    throw new Error("Responses identify different calibration packets");
  }

  const pairwise = [];
  for (let left = 0; left < normalized.length; left += 1) {
    for (let right = left + 1; right < normalized.length; right += 1) {
      pairwise.push({
        readers: [normalized[left].reviewer_id, normalized[right].reviewer_id],
        ...cohenKappa(normalized[left].labels, normalized[right].labels),
        confusion_matrix_rows_left_columns_right: confusionMatrix(
          normalized[left].labels,
          normalized[right].labels,
        ),
      });
    }
  }

  const disagreements = ids.flatMap((id, index) => {
    const labels = normalized.map((response) => response.labels[index]);
    if (labels.every((label) => label === labels[0])) return [];
    return [
      {
        evidence_id: id,
        practice_id: packetRows[index].practice_id,
        assignments: Object.fromEntries(
          normalized.map((response, responseIndex) => [
            response.reviewer_id,
            labels[responseIndex],
          ]),
        ),
      },
    ];
  });

  const assignmentCounts = Object.fromEntries(
    normalized.map((response) => [
      response.reviewer_id,
      Object.fromEntries(
        ALLOWED_LABELS.map((label) => [
          label,
          response.labels.filter((value) => value === label).length,
        ]),
      ),
    ]),
  );
  const unanimousItems = ids.length - disagreements.length;

  return {
    calibration_unit: "scoped evidence item",
    sampling_unit: "practice",
    sampled_practices: practiceIds.length,
    evidence_items: ids.length,
    readers: normalized.map((response) => response.reviewer_id),
    unanimous_items: unanimousItems,
    unanimous_share: unanimousItems / ids.length,
    pairwise_cohen_kappa: pairwise,
    fleiss_kappa:
      normalized.length >= 3
        ? fleissKappa(normalized.map((response) => response.labels))
        : null,
    assignment_counts_by_reader: assignmentCounts,
    disagreement_items: disagreements,
    interpretation_boundary:
      "Agreement estimates reproducibility of the evidence-group instrument; it does not establish that any author or external label is correct.",
  };
}

function parseArguments(args) {
  const options = {
    packetPath: DEFAULT_PACKET_PATH,
    outputPath: null,
    responsePaths: [],
  };
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === "--packet") {
      options.packetPath = args[++index];
    } else if (value === "--output") {
      options.outputPath = args[++index];
    } else {
      options.responsePaths.push(value);
    }
  }
  if (options.responsePaths.length < 2) {
    throw new Error(
      "Usage: node analyze-grades.mjs [--packet packet.json] [--output report.json] reader-a.json reader-b.json [reader-c.json]",
    );
  }
  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const packetRows = JSON.parse(await readFile(options.packetPath, "utf8"));
  const responses = await Promise.all(
    options.responsePaths.map(async (file) => ({
      file,
      raw: JSON.parse(await readFile(file, "utf8")),
    })),
  );
  const report = analyzeResponses({ responses, packetRows });
  const rendered = `${JSON.stringify(report, null, 2)}\n`;
  if (options.outputPath) {
    await writeFile(options.outputPath, rendered);
  } else {
    process.stdout.write(rendered);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
