#!/usr/bin/env node
/**
 * build-figures.mjs -- render assets/*.svg into manuscript/figures/*.pdf.
 *
 * The figure PDFs were previously edited without a tracked source, so two of
 * them drifted from the SVGs they were supposed to mirror and one lost its
 * source entirely. assets/ now holds the source of truth, one SVG per figure
 * with a matching basename, and this script is the only supported way to
 * regenerate the PDFs.
 *
 *     node scripts/build-figures.mjs [--root .] [--check]
 *
 * --check rebuilds into a temporary directory and reports which committed PDFs
 * would change, without writing any of them.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { inflateSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RSVG_CANDIDATES = ["rsvg-convert", "/tmp/arxiv-tools/rsvg/usr/bin/rsvg-convert"];

export function resolveRsvg() {
  for (const candidate of RSVG_CANDIDATES) {
    try {
      execFileSync(candidate, ["--version"], { stdio: "ignore" });
      return candidate;
    } catch {
      // try the next candidate
    }
  }
  throw new Error(
    `rsvg-convert not found. Looked for: ${RSVG_CANDIDATES.join(", ")}`,
  );
}

export function figureNames(root) {
  const sourceDirectory = path.join(root, "assets");
  return readdirSync(sourceDirectory)
    .filter((name) => name.endsWith(".svg"))
    .map((name) => name.replace(/\.svg$/, ""))
    .sort();
}

/**
 * rsvg-convert stamps a creation timestamp into the PDF's metadata object, so
 * two renders of the same SVG never match byte for byte. Compare the drawing
 * instead: inflate every stream and keep the ones that carry no timestamp.
 */
export function drawingDigest(pdfPath) {
  const bytes = readFileSync(pdfPath);
  // cairo writes the page content stream first. It holds every drawing
  // operator, including the fill colors, so it is what a figure edit changes.
  // Later objects carry a creation timestamp and a random font-subset tag,
  // which differ on every run and say nothing about the drawing.
  const start = bytes.indexOf("stream");
  const end = bytes.indexOf("endstream", start);
  if (start < 0 || end < 0) throw new Error(`no content stream in ${pdfPath}`);
  let from = start + "stream".length;
  if (bytes[from] === 0x0d) from += 1;
  if (bytes[from] === 0x0a) from += 1;
  const raw = bytes.subarray(from, end);
  let content;
  try {
    content = inflateSync(raw);
  } catch {
    content = raw;
  }
  return createHash("sha256").update(content).digest("hex");
}

function render(rsvg, source, destination) {
  execFileSync(rsvg, ["--format=pdf1.5", `--output=${destination}`, source], {
    stdio: ["ignore", "inherit", "inherit"],
  });
}

export function buildFigures(root, { check = false } = {}) {
  const rsvg = resolveRsvg();
  const names = figureNames(root);
  if (!names.length) throw new Error("no SVG sources found under assets/");

  const staging = check ? mkdtempSync(path.join(tmpdir(), "erca-figures-")) : null;
  const changed = [];
  try {
    for (const name of names) {
      const source = path.join(root, "assets", `${name}.svg`);
      const committed = path.join(root, "manuscript", "figures", `${name}.pdf`);
      const destination = check ? path.join(staging, `${name}.pdf`) : committed;
      render(rsvg, source, destination);
      if (!check) continue;
      const differs =
        !existsSync(committed) || drawingDigest(committed) !== drawingDigest(destination);
      if (differs) changed.push(name);
    }
  } finally {
    if (staging) rmSync(staging, { recursive: true, force: true });
  }
  return { names, changed };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const rootFlag = process.argv.indexOf("--root");
  const root = path.resolve(rootFlag >= 0 ? process.argv[rootFlag + 1] : ".");
  const check = process.argv.includes("--check");
  const { names, changed } = buildFigures(root, { check });
  if (!check) {
    console.log(`rendered ${names.length} figures into manuscript/figures/`);
  } else if (changed.length) {
    console.log(`${changed.length} figure(s) differ from their source:`);
    for (const name of changed) console.log(`  - ${name}`);
    process.exitCode = 1;
  } else {
    console.log(`all ${names.length} figures match their source`);
  }
}
