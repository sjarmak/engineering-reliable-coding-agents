import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  analyzeResponses,
  cohenKappa,
  normalizeResponse,
} from "./analyze-grades.mjs";
import { buildReviewForm } from "./build-review-form.mjs";

function packetRows() {
  return [
    { evidence_id: "p1:e1", practice_id: "ERCA-001" },
    { evidence_id: "p1:e2", practice_id: "ERCA-001" },
    { evidence_id: "p2:e1", practice_id: "ERCA-002" },
    { evidence_id: "p2:e2", practice_id: "ERCA-002" },
  ];
}

function response(reviewerId, labels) {
  return {
    schema_version: 1,
    packet_id: "packet",
    reviewer_id: reviewerId,
    independence_attestation: true,
    items: packetRows().map(function (row, index) {
      return {
        ...row,
        label: labels[index],
        rationale: "Rationale " + index,
      };
    }),
  };
}

test("Cohen's kappa is one for identical mixed assignments", function () {
  const labels = ["strong", "directional", "corroborating", "strong"];
  const result = cohenKappa(labels, labels);
  assert.equal(result.observed_agreement, 1);
  assert.equal(result.kappa, 1);
});

test("analysis distinguishes sampled practices from graded evidence items", function () {
  const labels = ["strong", "directional", "corroborating", "strong"];
  const report = analyzeResponses({
    packetRows: packetRows(),
    responses: [
      { file: "a.json", raw: response("reader-a", labels) },
      { file: "b.json", raw: response("reader-b", labels) },
    ],
  });
  assert.equal(report.sampled_practices, 2);
  assert.equal(report.evidence_items, 4);
  assert.equal(report.unanimous_share, 1);
  assert.equal(report.pairwise_cohen_kappa[0].kappa, 1);
  assert.deepEqual(report.disagreement_items, []);
});

test("analysis reports item-level disagreements and a confusion matrix", function () {
  const report = analyzeResponses({
    packetRows: packetRows(),
    responses: [
      {
        file: "a.json",
        raw: response("reader-a", [
          "strong",
          "directional",
          "corroborating",
          "strong",
        ]),
      },
      {
        file: "b.json",
        raw: response("reader-b", [
          "directional",
          "directional",
          "corroborating",
          "strong",
        ]),
      },
    ],
  });
  assert.equal(report.disagreement_items.length, 1);
  assert.equal(report.disagreement_items[0].evidence_id, "p1:e1");
  assert.equal(
    report.pairwise_cohen_kappa[0]
      .confusion_matrix_rows_left_columns_right.strong.directional,
    1,
  );
});

test("normalization rejects duplicate, missing, extra, or unrationalized rows", function () {
  const expectedIds = packetRows().map((row) => row.evidence_id);
  const valid = response("reader-a", [
    "strong",
    "directional",
    "corroborating",
    "strong",
  ]);

  assert.throws(
    function () {
      normalizeResponse(
        { ...valid, items: [valid.items[0], valid.items[0], ...valid.items.slice(2)] },
        { file: "duplicate.json", expectedIds },
      );
    },
    /duplicate evidence_id/,
  );
  assert.throws(
    function () {
      normalizeResponse(
        { ...valid, items: valid.items.slice(1) },
        { file: "missing.json", expectedIds },
      );
    },
    /missing/,
  );
  assert.throws(
    function () {
      normalizeResponse(
        {
          ...valid,
          items: [
            ...valid.items,
            {
              evidence_id: "extra",
              label: "strong",
              rationale: "Extra",
            },
          ],
        },
        { file: "extra.json", expectedIds },
      );
    },
    /unexpected/,
  );
  assert.throws(
    function () {
      normalizeResponse(
        {
          ...valid,
          items: valid.items.map(function (item, index) {
            return index === 0 ? { ...item, rationale: "" } : item;
          }),
        },
        { file: "no-rationale.json", expectedIds },
      );
    },
    /no rationale/,
  );
});

test("review form is self-contained and contains no completed author labels", async function () {
  const raw = await readFile(
    new URL("./blinded-evidence-items.json", import.meta.url),
  );
  const items = JSON.parse(raw.toString("utf8"));
  const html = buildReviewForm(items, raw);
  assert.match(html, /"practice_count":20/);
  assert.match(html, /"evidence_item_count":43/);
  assert.match(html, /independence_attestation/);
  assert.match(html, /Export completed response/);
  for (const item of items) {
    assert.equal(item.label, "");
    assert.equal(item.rationale, "");
    const escapedId = item.evidence_id.replace(
      /[-/\\^$*+?.()|[\]{}]/g,
      "\\$&",
    );
    assert.match(html, new RegExp(escapedId));
  }
});
