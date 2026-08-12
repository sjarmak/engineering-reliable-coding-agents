import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { resolveRsvg } from "./build-figures.mjs";
import {
  checkFigures,
  connectorSegments,
  containerRects,
  figureProblems,
  textRuns,
} from "./check-figure-legibility.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Render one synthetic figure into a throwaway root and check it. */
function problemsFor(body) {
  const root = mkdtempSync(path.join(tmpdir(), "erca-legibility-"));
  try {
    mkdirSync(path.join(root, "assets"));
    mkdirSync(path.join(root, "manuscript", "figures"), { recursive: true });
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="300" height="200">
<rect width="300" height="200" class="f-bg" fill="#ffffff"/>
${body}
</svg>`;
    writeFileSync(path.join(root, "assets", "probe.svg"), svg);
    execFileSync(resolveRsvg(), [
      "--format=pdf1.5",
      `--output=${path.join(root, "manuscript", "figures", "probe.pdf")}`,
      path.join(root, "assets", "probe.svg"),
    ]);
    return checkFigures(root)[0].problems;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const LABEL = '<text x="30" y="60" font-family="Helvetica, Arial, sans-serif" font-size="10" fill="#000000">durable work ledger</text>';

test("a label inside its box is not a problem", () => {
  const problems = problemsFor(
    `<rect x="20" y="40" width="160" height="40" fill="none" stroke="#6b6b6b"/>\n${LABEL}`,
  );
  assert.deepEqual(problems, []);
});

test("a label running past its box is reported with the distance", () => {
  const problems = problemsFor(
    `<rect x="20" y="40" width="50" height="40" fill="none" stroke="#6b6b6b"/>\n${LABEL}`,
  );
  assert.equal(problems.length, 1);
  assert.match(problems[0], /runs [\d.]+px past its box/);
});

test("a connector routed through a label is reported", () => {
  const problems = problemsFor(`${LABEL}\n<line x1="60" y1="20" x2="60" y2="120" stroke="#6b6b6b"/>`);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /connector runs through/);
});

test("a connector that stops short of a label is not reported", () => {
  const problems = problemsFor(`${LABEL}\n<line x1="60" y1="20" x2="60" y2="45" stroke="#6b6b6b"/>`);
  assert.deepEqual(problems, []);
});

test("a tint holds its labels like any other box", () => {
  const problems = problemsFor(
    `<rect x="20" y="40" width="50" height="40" fill="#000000" fill-opacity="0.07"/>\n${LABEL}`,
  );
  assert.equal(problems.length, 1);
  assert.match(problems[0], /runs [\d.]+px past its box/);
});

test("a word reaching the inner edge of a thick stroke counts as clipped", () => {
  // The label ends 0.3px inside the box edge and 1.7px inside the stroke: only
  // the second reading matches what the page shows, a word sitting on the rule.
  const onTheStroke = problemsFor(
    `<rect x="20" y="40" width="98" height="40" fill="none" stroke="#6b6b6b" stroke-width="4"/>\n${LABEL}`,
  );
  assert.equal(onTheStroke.length, 1);
  const clear = problemsFor(
    `<rect x="20" y="40" width="110" height="40" fill="none" stroke="#6b6b6b" stroke-width="4"/>\n${LABEL}`,
  );
  assert.deepEqual(clear, []);
});

test("words on one line join into a run, and separate labels stay apart", () => {
  const line = (text, x1, x2, y1) => ({ text, x1, x2, y1, y2: y1 + 10 });
  const runs = textRuns([
    line("new", 140, 158.2, 316.7),
    line("attempt,", 161, 196.9, 316.7),
    line("far", 260, 275, 316.7),
    line("below", 140, 165, 336.7),
  ]);
  assert.deepEqual(
    runs.map((run) => [run.text, run.x1, run.x2]),
    [
      ["new attempt,", 140, 196.9],
      ["far", 260, 275],
      ["below", 140, 165],
    ],
  );
});

test("a connector threading the gap between two words still cuts the line", () => {
  const run = textRuns([
    { text: "new", x1: 140, x2: 158.2, y1: 316.7, y2: 326.7 },
    { text: "attempt,", x1: 161, x2: 196.9, y1: 316.7, y2: 326.7 },
  ])[0];
  const problems = figureProblems({
    svg: '<svg viewBox="0 0 300 400"><line x1="159.6" y1="310" x2="159.6" y2="340"/></svg>',
    words: [run],
  });
  assert.deepEqual(problems, ['a connector runs through "new attempt,"']);
});

test("path connectors are read in absolute and relative form", () => {
  const segments = connectorSegments('<path d="M10 20 H60 V80"/><path d="M10 20 h50 v60"/>');
  assert.deepEqual(segments, [
    { x1: 10, y1: 20, x2: 60, y2: 20 },
    { x1: 60, y1: 20, x2: 60, y2: 80 },
    { x1: 10, y1: 20, x2: 60, y2: 20 },
    { x1: 60, y1: 20, x2: 60, y2: 80 },
  ]);
});

test("the full-bleed background is not counted as a container", () => {
  const svg = `<svg viewBox="0 0 300 200"><rect class="f-bg" width="300" height="200"/><rect x="5" y="5" width="20" height="20"/></svg>`;
  assert.deepEqual(containerRects(svg), [{ x: 5, y: 5, width: 20, height: 20, stroke: 0 }]);
});

test("two labels printed on top of each other are reported", () => {
  const problems = problemsFor(
    `${LABEL}\n<text x="40" y="60" font-family="Helvetica, Arial, sans-serif" font-size="10" fill="#000000">audit trail</text>`,
  );
  assert.ok(problems.some((problem) => /printed on top of each other/.test(problem)));
});

test("adjacent words on a line are not read as a collision", () => {
  const problems = problemsFor(LABEL);
  assert.deepEqual(problems, []);
});

test("every released figure keeps its text readable", () => {
  const failing = checkFigures(repositoryRoot).filter((result) => result.problems.length);
  assert.deepEqual(
    failing.map((result) => `${result.name}: ${result.problems.join("; ")}`),
    [],
  );
});
