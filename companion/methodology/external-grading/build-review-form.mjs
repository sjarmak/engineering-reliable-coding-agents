#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const DEFAULT_INPUT = fileURLToPath(
  new URL("./blinded-evidence-items.json", import.meta.url),
);
const DEFAULT_OUTPUT = fileURLToPath(
  new URL("./review-form.html", import.meta.url),
);
const PACKET_ID = "ERCA-2026-08-external-calibration-v1";

function validatePacket(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("The blinded packet must be a non-empty array");
  }
  const ids = new Set();
  for (const item of items) {
    if (!item || typeof item !== "object" || typeof item.evidence_id !== "string") {
      throw new Error("Every packet row needs an evidence_id");
    }
    if (ids.has(item.evidence_id)) {
      throw new Error("Duplicate evidence_id in packet: " + item.evidence_id);
    }
    ids.add(item.evidence_id);
    if (item.label || item.rationale) {
      throw new Error(
        "The reviewer form cannot embed a completed label or rationale: " +
          item.evidence_id,
      );
    }
    if (
      typeof item.source_url !== "string" ||
      !/^https?:\/\//i.test(item.source_url)
    ) {
      throw new Error("Packet item has no reviewable source URL: " + item.evidence_id);
    }
  }
}

function clientRuntime() {
  "use strict";

  const packetNode = document.getElementById("packet-data");
  const metadataNode = document.getElementById("packet-metadata");
  const items = JSON.parse(packetNode.textContent);
  const packetMetadata = JSON.parse(metadataNode.textContent);
  const allowed = [
    "strong",
    "directional",
    "corroborating",
    "null_or_conflicting",
  ];
  const labels = {
    strong: "Strong",
    directional: "Directional",
    corroborating: "Corroborating",
    null_or_conflicting: "Null or conflicting",
  };
  const state = new Map(
    items.map(function (item) {
      return [item.evidence_id, { label: "", rationale: "" }];
    }),
  );

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function updateProgress() {
    let labeled = 0;
    let rationalized = 0;
    state.forEach(function (answer) {
      if (allowed.includes(answer.label)) labeled += 1;
      if (answer.rationale.trim()) rationalized += 1;
    });
    const complete = Math.min(labeled, rationalized);
    document.getElementById("progress-text").textContent =
      complete + " of " + items.length + " items complete";
    document.getElementById("progress").value = complete;
  }

  function answerRow(item) {
    const wrapper = make("div", "answer");
    const selectLabel = make("label", null, "Evidence group");
    selectLabel.htmlFor = "label-" + item.evidence_id;
    const select = make("select");
    select.id = selectLabel.htmlFor;
    select.dataset.evidenceId = item.evidence_id;
    const prompt = make("option", null, "Choose one");
    prompt.value = "";
    select.appendChild(prompt);
    allowed.forEach(function (value) {
      const option = make("option", null, labels[value]);
      option.value = value;
      select.appendChild(option);
    });
    select.addEventListener("change", function () {
      state.get(item.evidence_id).label = select.value;
      updateProgress();
    });

    const rationaleLabel = make(
      "label",
      null,
      "Rationale for this scoped claim",
    );
    rationaleLabel.htmlFor = "rationale-" + item.evidence_id;
    const rationale = make("textarea");
    rationale.id = rationaleLabel.htmlFor;
    rationale.rows = 3;
    rationale.dataset.evidenceId = item.evidence_id;
    rationale.placeholder =
      "State why the source supports this group for the claim above.";
    rationale.addEventListener("input", function () {
      state.get(item.evidence_id).rationale = rationale.value;
      updateProgress();
    });

    wrapper.append(selectLabel, select, rationaleLabel, rationale);
    return wrapper;
  }

  function evidenceCard(item) {
    const article = make("article", "evidence-card");
    article.id = item.evidence_id;
    const heading = make("h3", null, item.evidence_id);
    const kind = make("span", "kind", item.source_kind);
    heading.append(" ", kind);

    const citation = make("p", "citation", item.citation);
    const link = make("a", null, "Open cited source");
    link.href = item.source_url;
    link.target = "_blank";
    link.rel = "noreferrer";
    citation.append(" ", link);

    const supportHeading = make("h4", null, "Scoped support to grade");
    const support = make("p", null, item.claim_support);
    article.append(heading, citation, supportHeading, support, answerRow(item));
    return article;
  }

  function renderItems() {
    const root = document.getElementById("items");
    const practices = new Map();
    items.forEach(function (item) {
      if (!practices.has(item.practice_id)) practices.set(item.practice_id, []);
      practices.get(item.practice_id).push(item);
    });

    practices.forEach(function (practiceItems, practiceId) {
      const first = practiceItems[0];
      const section = make("section", "practice");
      const heading = make(
        "h2",
        null,
        "Practice " + first.sample_order + ": " + practiceId,
      );
      const slug = make("p", "slug", first.practice_slug);
      const claimHeading = make("h3", "minor-heading", "Practice claim");
      const claim = make("p", null, first.practice_claim);
      const boundaryHeading = make(
        "h3",
        "minor-heading",
        "Boundary conditions",
      );
      const boundaries = make("p", "boundaries", first.boundary_conditions);
      const count = make(
        "p",
        "item-count",
        practiceItems.length +
          (practiceItems.length === 1 ? " evidence item" : " evidence items"),
      );
      section.append(
        heading,
        slug,
        claimHeading,
        claim,
        boundaryHeading,
        boundaries,
        count,
      );
      practiceItems.forEach(function (item) {
        section.appendChild(evidenceCard(item));
      });
      root.appendChild(section);
    });
  }

  function responseEnvelope(completed) {
    const reviewerId = document.getElementById("reviewer-id").value.trim();
    const attested = document.getElementById("attestation").checked;
    return {
      schema_version: 1,
      packet_id: packetMetadata.packet_id,
      packet_sha256: packetMetadata.packet_sha256,
      reviewer_id: reviewerId,
      independence_attestation: attested,
      completed_at: completed ? new Date().toISOString() : null,
      items: items.map(function (item) {
        const answer = state.get(item.evidence_id);
        return {
          evidence_id: item.evidence_id,
          practice_id: item.practice_id,
          practice_slug: item.practice_slug,
          label: answer.label,
          rationale: answer.rationale.trim(),
        };
      }),
    };
  }

  function validationErrors(envelope) {
    const errors = [];
    if (!envelope.reviewer_id) errors.push("Enter a reviewer identifier.");
    if (!envelope.independence_attestation) {
      errors.push("Affirm that the review was completed independently.");
    }
    envelope.items.forEach(function (item) {
      if (!allowed.includes(item.label)) {
        errors.push(item.evidence_id + " has no evidence group.");
      }
      if (!item.rationale) {
        errors.push(item.evidence_id + " has no rationale.");
      }
    });
    return errors;
  }

  function download(envelope, suffix) {
    const identifier = (envelope.reviewer_id || "unnamed")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
    const blob = new Blob([JSON.stringify(envelope, null, 2) + "\n"], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "erca-evidence-grades-" + identifier + "-" + suffix + ".json";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  document.getElementById("save-draft").addEventListener("click", function () {
    download(responseEnvelope(false), "draft");
  });

  document.getElementById("export-response").addEventListener("click", function () {
    const envelope = responseEnvelope(true);
    const errors = validationErrors(envelope);
    const status = document.getElementById("status");
    if (errors.length) {
      status.textContent =
        "The response is not complete: " +
        errors.slice(0, 3).join(" ") +
        (errors.length > 3 ? " " + (errors.length - 3) + " more." : "");
      status.className = "status error";
      return;
    }
    status.textContent = "Completed response exported.";
    status.className = "status success";
    download(envelope, "complete");
  });

  document.getElementById("import-response").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", function () {
      try {
        const imported = JSON.parse(reader.result);
        if (imported.packet_id !== packetMetadata.packet_id) {
          throw new Error("This response belongs to another packet.");
        }
        if (!Array.isArray(imported.items)) {
          throw new Error("The response has no items array.");
        }
        const importedById = new Map(
          imported.items.map(function (item) {
            return [item.evidence_id, item];
          }),
        );
        items.forEach(function (item) {
          const answer = importedById.get(item.evidence_id);
          if (!answer) throw new Error("Missing " + item.evidence_id + ".");
          state.set(item.evidence_id, {
            label: allowed.includes(answer.label) ? answer.label : "",
            rationale:
              typeof answer.rationale === "string" ? answer.rationale : "",
          });
          document.getElementById("label-" + item.evidence_id).value =
            state.get(item.evidence_id).label;
          document.getElementById("rationale-" + item.evidence_id).value =
            state.get(item.evidence_id).rationale;
        });
        document.getElementById("reviewer-id").value = imported.reviewer_id || "";
        document.getElementById("attestation").checked =
          imported.independence_attestation === true;
        document.getElementById("status").textContent = "Draft imported.";
        document.getElementById("status").className = "status success";
        updateProgress();
      } catch (error) {
        document.getElementById("status").textContent =
          "Could not import response: " + error.message;
        document.getElementById("status").className = "status error";
      }
    });
    reader.readAsText(file);
  });

  renderItems();
  document.getElementById("progress").max = items.length;
  document.getElementById("packet-summary").textContent =
    packetMetadata.practice_count +
    " sampled practices · " +
    packetMetadata.evidence_item_count +
    " scoped evidence items";
  updateProgress();
}

export function buildReviewForm(items, rawPacket) {
  validatePacket(items);
  const packetHash = createHash("sha256").update(rawPacket).digest("hex");
  const practiceCount = new Set(items.map((item) => item.practice_id)).size;
  const metadata = {
    packet_id: PACKET_ID,
    packet_sha256: packetHash,
    practice_count: practiceCount,
    evidence_item_count: items.length,
  };
  const safeItems = JSON.stringify(items).replaceAll("<", "\\u003c");
  const safeMetadata = JSON.stringify(metadata).replaceAll("<", "\\u003c");
  const styles = [
    ":root { color-scheme: light; --ink:#18202a; --muted:#566170; --line:#cfd6de; --paper:#fff; --wash:#f4f6f8; --accent:#0d5c63; --error:#9b2c2c; }",
    "* { box-sizing:border-box; }",
    "body { margin:0; color:var(--ink); background:var(--wash); font:16px/1.55 system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif; }",
    "main { max-width:980px; margin:0 auto; padding:2.5rem 1.25rem 6rem; }",
    "h1,h2,h3,h4 { line-height:1.2; }",
    "h1 { margin-bottom:.4rem; }",
    "a { color:var(--accent); }",
    ".lede,.boundaries,.slug,.item-count,.citation,.status { color:var(--muted); }",
    ".instructions,.reviewer,.practice { background:var(--paper); border:1px solid var(--line); border-radius:10px; padding:1.25rem; margin:1.25rem 0; }",
    ".definitions { display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:.75rem; }",
    ".definition { border-left:3px solid var(--accent); padding-left:.75rem; }",
    ".definition strong { display:block; }",
    ".reviewer { position:sticky; top:0; z-index:3; box-shadow:0 6px 18px rgb(24 32 42 / 10%); }",
    ".reviewer-grid { display:grid; grid-template-columns:minmax(220px,1fr) auto; gap:1rem; align-items:end; }",
    "input[type=text],select,textarea { width:100%; font:inherit; border:1px solid #9ba6b2; border-radius:6px; padding:.6rem; background:white; }",
    "textarea { resize:vertical; }",
    "label { display:block; font-weight:650; margin:.55rem 0 .25rem; }",
    ".attest { display:flex; gap:.55rem; align-items:flex-start; font-weight:400; }",
    ".attest input { margin-top:.35rem; }",
    "progress { width:100%; height:.8rem; }",
    ".actions { display:flex; flex-wrap:wrap; gap:.65rem; margin-top:.8rem; }",
    "button,.file-button { display:inline-block; border:1px solid var(--accent); color:var(--accent); background:white; border-radius:6px; padding:.55rem .8rem; font-weight:650; cursor:pointer; }",
    "button.primary { color:white; background:var(--accent); }",
    ".file-button input { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); }",
    ".practice > h2 { margin-bottom:.2rem; }",
    ".minor-heading { font-size:1rem; margin-bottom:.25rem; }",
    ".minor-heading + p { margin-top:0; }",
    ".evidence-card { border-top:1px solid var(--line); padding:1.15rem 0 .35rem; margin-top:1.2rem; }",
    ".evidence-card h3 { font-size:1.05rem; }",
    ".evidence-card h4 { font-size:.95rem; margin-bottom:.25rem; }",
    ".kind { font-size:.75rem; font-weight:500; text-transform:uppercase; letter-spacing:.04em; color:var(--muted); }",
    ".answer { background:var(--wash); border-radius:8px; padding:.9rem; margin-top:.85rem; }",
    ".status.error { color:var(--error); font-weight:650; }",
    ".status.success { color:var(--accent); font-weight:650; }",
    "@media (max-width:700px) { .reviewer { position:static; } .reviewer-grid { grid-template-columns:1fr; } main { padding-top:1rem; } }",
    "@media print { body { background:white; } .reviewer { position:static; box-shadow:none; } .actions { display:none; } .practice { break-inside:avoid; } }",
  ].join("\n");

  const body = [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    "<title>ERCA external evidence-grading calibration</title>",
    "<style>" + styles + "</style>",
    "</head>",
    "<body>",
    "<main>",
    "<h1>External evidence-grading calibration</h1>",
    '<p class="lede" id="packet-summary"></p>',
    '<section class="instructions">',
    "<h2>Review procedure</h2>",
    "<ol>",
    "<li>Work independently. Do not consult the monograph catalog, evidence ledger, author labels, or another reviewer.</li>",
    "<li>Grade the support supplied by each cited source for the scoped claim shown here. Do not grade venue prestige or the practice as a whole.</li>",
    "<li>Open the cited source whenever the citation, claim, and boundary are insufficient. When ambiguity remains, choose the lower group and explain why.</li>",
    "<li>Give every item one group and a short rationale, then export the completed JSON response.</li>",
    "</ol>",
    '<div class="definitions">',
    '<p class="definition"><strong>Strong</strong>On-claim controlled comparison, validated benchmark result, or comparably specific measurement within stated conditions.</p>',
    '<p class="definition"><strong>Directional</strong>Supports a mechanism, threat model, comparison design, or direction without establishing the complete recommendation, magnitude, or broad transfer.</p>',
    '<p class="definition"><strong>Corroborating</strong>Case report, practitioner account, or convergent observation establishing plausibility without estimating prevalence.</p>',
    '<p class="definition"><strong>Null or conflicting</strong>A result that does not support the expected effect or materially limits another claim.</p>',
    "</div>",
    "</section>",
    '<section class="reviewer">',
    '<div class="reviewer-grid">',
    "<div>",
    '<label for="reviewer-id">Reviewer identifier</label>',
    '<input id="reviewer-id" type="text" autocomplete="off" placeholder="Use the identifier supplied by the coordinator">',
    "</div>",
    "<div>",
    '<span id="progress-text">0 items complete</span>',
    '<progress id="progress" value="0"></progress>',
    "</div>",
    "</div>",
    '<label class="attest"><input id="attestation" type="checkbox"><span>I completed these judgments independently and did not consult the author labels or another reviewer.</span></label>',
    '<div class="actions">',
    '<button id="save-draft" type="button">Save draft JSON</button>',
    '<label class="file-button">Import draft JSON<input id="import-response" type="file" accept="application/json"></label>',
    '<button class="primary" id="export-response" type="button">Export completed response</button>',
    "</div>",
    '<p class="status" id="status" aria-live="polite"></p>',
    "</section>",
    '<div id="items"></div>',
    "</main>",
    '<script id="packet-data" type="application/json">' + safeItems + "</script>",
    '<script id="packet-metadata" type="application/json">' +
      safeMetadata +
      "</script>",
    "<script>(" + clientRuntime.toString() + ")();</script>",
    "</body>",
    "</html>",
    "",
  ];
  return body.join("\n");
}

async function main() {
  const input = process.argv[2] || DEFAULT_INPUT;
  const output = process.argv[3] || DEFAULT_OUTPUT;
  const rawPacket = await readFile(input);
  const items = JSON.parse(rawPacket.toString("utf8"));
  const html = buildReviewForm(items, rawPacket);
  await writeFile(output, html);
  process.stdout.write(
    "Wrote " +
      output +
      " with " +
      new Set(items.map((item) => item.practice_id)).size +
      " practices and " +
      items.length +
      " evidence items.\n",
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
