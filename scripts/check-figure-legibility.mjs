#!/usr/bin/env node
/**
 * check-figure-legibility.mjs -- find text a figure draws over or outside its
 * own geometry.
 *
 * Two defects reached the release this way, both caught by eye rather than by
 * a check: a label that ran past the box holding it, and a connector routed
 * straight through a sentence. Both are measurable. Word boxes come from
 * `pdftotext -bbox` on the built figure, which reports what the renderer
 * actually placed; boxes and connectors come from the SVG source, where the
 * coordinates are exact. rsvg-convert maps SVG pixels to PDF points at 0.75,
 * so the word boxes scale back into SVG units and the two meet in one space.
 *
 *     node scripts/check-figure-legibility.mjs [--root .] [--figure NAME]
 *
 * Exits nonzero when a figure has an overflow or a collision.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { figureNames } from "./build-figures.mjs";

const PT_PER_PX = 0.75;
// A stroke has width, and a word box from pdftotext carries a little bearing on
// each side, so exact adjacency reads as a hit without some slack.
const EDGE_TOLERANCE_PX = 1.5;
const CROSSING_INSET_PX = 1.5;

function attribute(tag, name) {
  const match = tag.match(new RegExp(`${name}="([^"]*)"`));
  return match ? match[1] : null;
}

function numeric(tag, name) {
  const raw = attribute(tag, name);
  return raw === null ? null : Number.parseFloat(raw);
}

/**
 * Rectangles that hold content. A rect with no fill and no stroke is a spacer,
 * and the full-bleed background rect contains everything by construction, so
 * neither can tell us that a word escaped anything.
 */
export function containerRects(svg) {
  const viewBox = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const pageWidth = viewBox ? Number.parseFloat(viewBox[1]) : Infinity;
  const rects = [];
  for (const [tag] of svg.matchAll(/<rect\b[^>]*>/g)) {
    const x = numeric(tag, "x") ?? 0;
    const y = numeric(tag, "y") ?? 0;
    const width = numeric(tag, "width");
    const height = numeric(tag, "height");
    if (width === null || height === null) continue;
    if (width >= pageWidth - 1) continue;
    const className = attribute(tag, "class") ?? "";
    if (/\bf-bg\b/.test(className)) continue;
    // A tint marks a region of the drawing rather than holding anything, and
    // labels are meant to sit across its edge.
    if ((numeric(tag, "fill-opacity") ?? 1) < 1) continue;
    rects.push({ x, y, width, height });
  }
  return rects;
}

/**
 * Axis-aligned connector segments. Curves and arrowheads are left out: they sit
 * at the ends of a run, where a collision would already be reported for the
 * straight part, and admitting them would mean flattening beziers for no gain.
 */
export function connectorSegments(svg) {
  const segments = [];
  for (const [tag] of svg.matchAll(/<line\b[^>]*>/g)) {
    segments.push({
      x1: numeric(tag, "x1"),
      y1: numeric(tag, "y1"),
      x2: numeric(tag, "x2"),
      y2: numeric(tag, "y2"),
    });
  }
  for (const [tag] of svg.matchAll(/<path\b[^>]*>/g)) {
    const d = attribute(tag, "d");
    if (!d || /[CcSsQqTtAaZz]/.test(d)) continue;
    let cursor = null;
    for (const [, op, args] of d.matchAll(/([MmLlHhVv])\s*([-\d.,\s]*)/g)) {
      const values = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
      if (op === "M" || op === "m") {
        cursor = { x: values[0], y: values[1] };
        continue;
      }
      if (cursor === null) continue;
      const next =
        op === "H" || op === "h"
          ? { x: op === "H" ? values[0] : cursor.x + values[0], y: cursor.y }
          : op === "V" || op === "v"
            ? { x: cursor.x, y: op === "V" ? values[0] : cursor.y + values[0] }
            : { x: values[0], y: values[1] };
      segments.push({ x1: cursor.x, y1: cursor.y, x2: next.x, y2: next.y });
      cursor = next;
    }
  }
  return segments.filter(
    (s) =>
      Number.isFinite(s.x1) &&
      Number.isFinite(s.y1) &&
      Number.isFinite(s.x2) &&
      Number.isFinite(s.y2) &&
      (Math.abs(s.x1 - s.x2) < 0.01 || Math.abs(s.y1 - s.y2) < 0.01),
  );
}

/** Word boxes as the renderer placed them, converted back into SVG units. */
export function wordBoxes(pdfPath) {
  const xml = execFileSync("pdftotext", ["-bbox", "-f", "1", "-l", "1", pdfPath, "-"], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  return [...xml.matchAll(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<\/word>/g)]
    .map(([, xMin, yMin, xMax, yMax, text]) => ({
      text,
      x1: Number.parseFloat(xMin) / PT_PER_PX,
      y1: Number.parseFloat(yMin) / PT_PER_PX,
      x2: Number.parseFloat(xMax) / PT_PER_PX,
      y2: Number.parseFloat(yMax) / PT_PER_PX,
    }));
}

/**
 * Words joined back into the lines of text a reader sees. A connector that
 * threads the gap between two words still cuts the sentence in half, and
 * checking word boxes alone missed exactly that: the line fell 2.8px wide of
 * every glyph and the figure shipped with a sentence sliced through the middle.
 */
export function textRuns(words, { maxGap = 8 } = {}) {
  const ordered = [...words]
    .filter((word) => word.text.trim())
    .sort((a, b) => a.y1 - b.y1 || a.x1 - b.x1);
  const runs = [];
  for (const word of ordered) {
    const open = runs[runs.length - 1];
    const sameLine = open && Math.abs(open.y1 - word.y1) < 0.5 && Math.abs(open.y2 - word.y2) < 0.5;
    if (sameLine && word.x1 - open.x2 <= maxGap) {
      open.x2 = Math.max(open.x2, word.x2);
      open.text = `${open.text} ${word.text}`;
      continue;
    }
    runs.push({ ...word });
  }
  return runs;
}

/**
 * Which box a word belongs to. Testing the word's center against the box misses
 * the case that matters: the word that ran far enough past the edge that its
 * center left the box too, and so was reported as belonging to nothing. A word
 * sitting on the box's line of text and overlapping it at all belongs to it.
 */
function belongsTo(word, rect) {
  const cy = (word.y1 + word.y2) / 2;
  return (
    cy >= rect.y &&
    cy <= rect.y + rect.height &&
    word.x2 > rect.x &&
    word.x1 < rect.x + rect.width
  );
}

function crosses(segment, word) {
  const left = word.x1 + CROSSING_INSET_PX;
  const right = word.x2 - CROSSING_INSET_PX;
  const top = word.y1 + CROSSING_INSET_PX;
  const bottom = word.y2 - CROSSING_INSET_PX;
  if (left >= right || top >= bottom) return false;
  if (Math.abs(segment.y1 - segment.y2) < 0.01) {
    const [from, to] = [Math.min(segment.x1, segment.x2), Math.max(segment.x1, segment.x2)];
    return segment.y1 > top && segment.y1 < bottom && from < right && to > left;
  }
  const [from, to] = [Math.min(segment.y1, segment.y2), Math.max(segment.y1, segment.y2)];
  return segment.x1 > left && segment.x1 < right && from < bottom && to > top;
}

export function figureProblems({ svg, words }) {
  const rects = containerRects(svg);
  const segments = connectorSegments(svg);
  const problems = [];
  for (const word of words) {
    if (!word.text.trim()) continue;
    // The tightest rect holding the word is the one meant to contain it; an
    // outer panel would report the same overflow twice.
    const holders = rects.filter((rect) => belongsTo(word, rect));
    const holder = holders.sort((a, b) => a.width * a.height - b.width * b.height)[0];
    if (holder) {
      const overflow = Math.max(
        holder.x - word.x1,
        word.x2 - (holder.x + holder.width),
        holder.y - word.y1,
        word.y2 - (holder.y + holder.height),
      );
      if (overflow > EDGE_TOLERANCE_PX) {
        problems.push(`"${word.text}" runs ${overflow.toFixed(1)}px past its box`);
      }
    }
  }
  for (const run of textRuns(words)) {
    if (segments.some((segment) => crosses(segment, run))) {
      problems.push(`a connector runs through "${run.text}"`);
    }
  }
  return problems;
}

export function checkFigures(root, { only = null } = {}) {
  const names = figureNames(root).filter((name) => !only || name === only);
  return names.map((name) => ({
    name,
    problems: figureProblems({
      svg: readFileSync(path.join(root, "assets", `${name}.svg`), "utf8"),
      words: wordBoxes(path.join(root, "manuscript", "figures", `${name}.pdf`)),
    }),
  }));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const rootFlag = process.argv.indexOf("--root");
  const figureFlag = process.argv.indexOf("--figure");
  const root = path.resolve(rootFlag >= 0 ? process.argv[rootFlag + 1] : ".");
  const results = checkFigures(root, {
    only: figureFlag >= 0 ? process.argv[figureFlag + 1] : null,
  });
  const failing = results.filter((result) => result.problems.length);
  for (const { name, problems } of failing) {
    console.log(name);
    for (const problem of problems) console.log(`  - ${problem}`);
  }
  if (failing.length) {
    console.log(`${failing.length} of ${results.length} figures have text a reader cannot read.`);
    process.exitCode = 1;
  } else {
    console.log(`all ${results.length} figures keep their text inside their boxes and clear of connectors`);
  }
}
