#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const allowed = ["strong", "directional", "corroborating", "null_or_conflicting"];
const responsePaths = process.argv.slice(2);
if (responsePaths.length < 2) {
  throw new Error("Usage: node analyze-grades.mjs reader-a.json reader-b.json [reader-c.json]");
}

const responses = await Promise.all(responsePaths.map(async (file) => ({
  file,
  rows: JSON.parse(await readFile(file, "utf8")),
})));
const ids = responses[0].rows.map((row) => row.evidence_id);
for (const response of responses) {
  const byId = new Map(response.rows.map((row) => [row.evidence_id, row.label]));
  const missing = ids.filter((id) => !allowed.includes(byId.get(id)));
  if (missing.length) throw new Error(`${response.file} has ${missing.length} missing or invalid labels`);
  response.labels = ids.map((id) => byId.get(id));
}

function cohenKappa(a, b) {
  const observed = a.filter((label, index) => label === b[index]).length / a.length;
  const expected = allowed.reduce((sum, label) => {
    const pa = a.filter((value) => value === label).length / a.length;
    const pb = b.filter((value) => value === label).length / b.length;
    return sum + pa * pb;
  }, 0);
  return { n: a.length, observed_agreement: observed, expected_agreement: expected, kappa: expected === 1 ? null : (observed - expected) / (1 - expected) };
}

function fleissKappa(labelSets) {
  const n = ids.length;
  const raters = labelSets.length;
  const categoryTotals = Object.fromEntries(allowed.map((label) => [label, 0]));
  let observedSum = 0;
  for (let item = 0; item < n; item += 1) {
    const counts = Object.fromEntries(allowed.map((label) => [label, 0]));
    for (const labels of labelSets) {
      counts[labels[item]] += 1;
      categoryTotals[labels[item]] += 1;
    }
    observedSum += allowed.reduce((sum, label) => sum + counts[label] ** 2, 0) - raters;
  }
  const observed = observedSum / (n * raters * (raters - 1));
  const expected = allowed.reduce((sum, label) => sum + (categoryTotals[label] / (n * raters)) ** 2, 0);
  return { n, raters, observed_agreement: observed, expected_agreement: expected, kappa: expected === 1 ? null : (observed - expected) / (1 - expected) };
}

const pairwise = [];
for (let left = 0; left < responses.length; left += 1) {
  for (let right = left + 1; right < responses.length; right += 1) {
    pairwise.push({
      readers: [responses[left].file, responses[right].file],
      ...cohenKappa(responses[left].labels, responses[right].labels),
    });
  }
}

const disagreementPattern = allowed.map((label) => ({
  label,
  assignments: responses.reduce((sum, response) => sum + response.labels.filter((value) => value === label).length, 0),
}));
const unanimous = ids.filter((_, index) => responses.every((response) => response.labels[index] === responses[0].labels[index])).length;

console.log(JSON.stringify({
  response_files: responsePaths,
  evidence_items: ids.length,
  unanimous_items: unanimous,
  unanimous_share: unanimous / ids.length,
  pairwise_cohen_kappa: pairwise,
  fleiss_kappa: responses.length >= 3 ? fleissKappa(responses.map((response) => response.labels)) : null,
  assignment_counts: disagreementPattern,
}, null, 2));
