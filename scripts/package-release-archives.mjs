#!/usr/bin/env node
/**
 * package-release-archives.mjs -- build the arXiv source and companion ZIPs.
 *
 * The release gate byte-compares this archive against the working tree and the
 * compiler unzips it to produce the preview PDF, but nothing built it: the
 * archive was assembled by hand, which is how it drifted from the sources it is
 * supposed to mirror. This script closes that gap by packaging exactly the file
 * list the gate expects, so "rebuild the archive" and "what the gate verifies"
 * cannot disagree.
 *
 * The archive must be rebuilt before scripts/arxiv-compile.mjs runs. The
 * compiler compiles what it unzips, so packaging afterwards would bind a report
 * to a PDF built from stale sources.
 *
 *     node scripts/package-arxiv-source.mjs [--root .]
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, cpSync, existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { expectedArxivFiles, expectedCompanionFiles } from "./release-gate.mjs";

const ARXIV_ROOT = "engineering-reliable-coding-agents-arxiv-source";
const ARCHIVE_NAME = `${ARXIV_ROOT}.zip`;
const COMPANION_ROOT = "companion-release";

/**
 * Build one archive whose entries are `<archiveRoot>/<relative>` for exactly
 * the given files, copied from sourceRoot.
 */
async function packageArchive({ root, sourceRoot, archiveRoot, archiveName, files }) {
  if (!files.length) throw new Error(`no files found under ${sourceRoot}`);

  const distDirectory = path.join(root, "dist");
  mkdirSync(distDirectory, { recursive: true });
  const archivePath = path.join(distDirectory, archiveName);

  // Stage under the archive root so entry names carry the expected prefix, and
  // build into the staging area so a failure cannot leave a partial archive in
  // place of the previous one.
  const staging = mkdtempSync(path.join(tmpdir(), "arxiv-source-"));
  try {
    const stagedRoot = path.join(staging, archiveRoot);
    for (const relative of files) {
      const source = path.join(sourceRoot, relative);
      if (!existsSync(source)) throw new Error(`expected file is missing: ${source}`);
      const destination = path.join(stagedRoot, relative);
      mkdirSync(path.dirname(destination), { recursive: true });
      cpSync(source, destination);
    }

    const stagedArchive = path.join(staging, archiveName);
    // -X drops uid/gid and extra timestamps so the archive depends on content
    // and paths alone; the gate compares bytes per entry, not archive bytes,
    // but a stable archive keeps its own checksum meaningful across rebuilds.
    execFileSync("zip", ["-q", "-r", "-X", stagedArchive, archiveRoot], {
      cwd: staging,
      stdio: ["ignore", "inherit", "inherit"],
    });
    cpSync(stagedArchive, archivePath);
    return { archivePath, fileCount: files.length };
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}

export async function packageArxivSource(root) {
  return packageArchive({
    root,
    sourceRoot: path.join(root, "manuscript"),
    archiveRoot: ARXIV_ROOT,
    archiveName: ARCHIVE_NAME,
    files: await expectedArxivFiles(root),
  });
}

/**
 * The companion archive carries the compile report, so it must be packaged
 * after scripts/arxiv-compile.mjs has written that report. Packaging it first
 * ships a companion whose recorded build does not describe the shipped PDF.
 */
export async function packageCompanion(root) {
  const manifest = JSON.parse(
    await readFile(path.join(root, "release-metadata.json"), "utf8"),
  );
  return packageArchive({
    root,
    sourceRoot: path.join(root, "companion"),
    archiveRoot: COMPANION_ROOT,
    archiveName: `engineering-reliable-coding-agents-companion-${manifest.version}.zip`,
    files: await expectedCompanionFiles(root),
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const rootFlag = process.argv.indexOf("--root");
  const root = path.resolve(rootFlag >= 0 ? process.argv[rootFlag + 1] : ".");
  const only = process.argv.includes("--companion-only");
  if (!only) {
    const arxiv = await packageArxivSource(root);
    console.log(`packaged ${arxiv.fileCount} files into ${arxiv.archivePath}`);
  }
  const companion = await packageCompanion(root);
  console.log(`packaged ${companion.fileCount} files into ${companion.archivePath}`);
}
