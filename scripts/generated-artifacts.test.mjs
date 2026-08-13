import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildFigures, figureNames } from "./build-figures.mjs";
import { buildAppendix, escapeTex, renderAppendix, treatmentLabel } from "./build-practice-appendix.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("the practice appendix matches the catalog it indexes", async () => {
  const { records, changed } = await buildAppendix(repositoryRoot, { check: true });
  assert.equal(
    changed,
    false,
    "manuscript/appendix-practices.tex is stale; run node scripts/build-practice-appendix.mjs",
  );
  assert.equal(records, 206);
});

test("every catalog record gets a row and a link target", async () => {
  const catalog = JSON.parse(
    await readFile(path.join(repositoryRoot, "companion", "catalog.json"), "utf8"),
  );
  const appendix = await readFile(
    path.join(repositoryRoot, "manuscript", "appendix-practices.tex"),
    "utf8",
  );
  for (const record of catalog) {
    const anchor = record.practice_id.toLowerCase();
    assert.ok(
      appendix.includes(`\\hypertarget{${anchor}}{}`),
      `${record.practice_id} has no link target in the appendix`,
    );
  }
  const targets = appendix.match(/\\hypertarget\{erca-\d{3}\}/g) ?? [];
  assert.equal(targets.length, catalog.length);
});

test("every ERCA reference in the manuscript is a link, not bare text", async () => {
  const sources = [
    path.join("manuscript", "frontmatter.tex"),
    path.join("manuscript", "materials.tex"),
    ...(await readFile(path.join(repositoryRoot, "manuscript", "main.tex"), "utf8"))
      .split("\n")
      .flatMap((line) => {
        const match = line.match(/\\input\{(chapters\/[^}]+)\}/);
        return match ? [path.join("manuscript", `${match[1]}.tex`)] : [];
      }),
  ];
  const catalog = JSON.parse(
    await readFile(path.join(repositoryRoot, "companion", "catalog.json"), "utf8"),
  );
  const known = new Set(catalog.map((record) => record.practice_id.slice(5)));
  for (const relative of sources) {
    const text = await readFile(path.join(repositoryRoot, relative), "utf8").catch(() => null);
    if (text === null) continue;
    const bare = text.match(/(?<!\\erca\{)ERCA-\d{3}/g) ?? [];
    assert.deepEqual(bare, [], `${relative} names practice records without \\erca{}`);
    for (const [, number] of text.matchAll(/\\erca\{(\d{3})\}/g)) {
      assert.ok(known.has(number), `${relative} links to ERCA-${number}, which is not in the catalog`);
    }
  }
});

test("the editing copy prints the identifiers the TeX sources link", async () => {
  const editing = await readFile(
    path.join(repositoryRoot, "editing", "engineering-reliable-coding-agents.md"),
    "utf8",
  );
  const mapped = [...editing.matchAll(/tex-sync:start (\{.*?\}) -->/g)].map(
    ([, json]) => JSON.parse(json).path,
  );
  assert.ok(mapped.length > 20, "the editing copy maps no TeX sections");
  const wanted = new Set();
  for (const relative of mapped) {
    const tex = await readFile(path.join(repositoryRoot, relative), "utf8");
    for (const [, number] of tex.matchAll(/\\erca\{(\d{3})\}/g)) wanted.add(`ERCA-${number}`);
  }
  assert.ok(wanted.size > 40, "no practice identifiers found in the mapped TeX sources");
  const missing = [...wanted].filter((id) => !editing.includes(id)).sort();
  assert.deepEqual(
    missing,
    [],
    "pandoc dropped these identifiers; regenerate with node scripts/editable-manuscript.mjs --write --force",
  );
});

test("the figure PDFs match their SVG sources", () => {
  const { names, changed } = buildFigures(repositoryRoot, { check: true });
  assert.equal(
    changed.length,
    0,
    `stale figures: ${changed.join(", ")}; run node scripts/build-figures.mjs`,
  );
  assert.ok(names.length >= 23);
});

test("every figure the manuscript includes has a tracked SVG source", async () => {
  const sources = new Set(figureNames(repositoryRoot));
  const chapterFiles = (await readFile(path.join(repositoryRoot, "manuscript", "main.tex"), "utf8"))
    .split("\n")
    .flatMap((line) => {
      const match = line.match(/\\input\{([^}]+)\}/);
      return match ? [path.join("manuscript", `${match[1]}.tex`)] : [];
    });
  for (const relative of [path.join("manuscript", "frontmatter.tex"), ...chapterFiles]) {
    const text = await readFile(path.join(repositoryRoot, relative), "utf8").catch(() => null);
    if (text === null) continue;
    for (const [, name] of text.matchAll(/\\includegraphics(?:\[[^\]]*\])?\{figures\/([^}]+)\.pdf\}/g)) {
      assert.ok(sources.has(name), `${relative} includes ${name}.pdf, which has no assets/${name}.svg`);
    }
  }
});

test("escapeTex leaves plain names alone and repairs what the T1 font lacks", () => {
  assert.equal(escapeTex("Strengthen weak test oracles"), "Strengthen weak test oracles");
  assert.equal(escapeTex("Keep authority real — experts catch it"), "Keep authority real --- experts catch it");
  assert.equal(escapeTex("100% of pass@k & cost_per_run"), "100\\% of pass@k \\& cost\\_per\\_run");
});

test("treatment labels separate developed practices, companion entries, and leads", () => {
  assert.equal(treatmentLabel({ practice_id: "ERCA-020", treatment: "developed_in_manuscript" }), "developed");
  assert.equal(treatmentLabel({ practice_id: "ERCA-050", treatment: "companion_only", thin_support: true }), "companion");
  assert.equal(treatmentLabel({ practice_id: "ERCA-199", treatment: "companion_only", thin_support: true }), "lead");
  assert.equal(treatmentLabel({ practice_id: "ERCA-206", treatment: "companion_only", thin_support: false }), "companion");
});

test("the rendered appendix reports the counts the manuscript claims", () => {
  const rendered = renderAppendix([
    { practice_id: "ERCA-001", name: "One", chapter: 3, treatment: "developed_in_manuscript", thin_support: false },
    { practice_id: "ERCA-050", name: "Two", chapter: 9, treatment: "companion_only", thin_support: true },
    { practice_id: "ERCA-199", name: "Three", chapter: 6, treatment: "companion_only", thin_support: true },
  ]);
  assert.match(rendered, /3 reliability records: 2 gated practices, including 1 developed in the main chapters, plus 1 research lead/);
  assert.match(rendered, /A dagger marks the 1 companion entries/);
});
