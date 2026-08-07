#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ARXIV_TEX_IMAGE =
  "texlive/texlive:TL2025-historic@sha256:5912d6a33798957f4cd6ff1673819209f59300c378033d25066feb93270b90ce";
export const ARXIV_COMPILER_VERSION = "XeTeX 3.141592653-2.6-0.999997 (TeX Live 2025)";

const ARCHIVE_NAME = "engineering-reliable-coding-agents-arxiv-source.zip";
const ARCHIVE_ROOT = "engineering-reliable-coding-agents-arxiv-source";
const MATERIAL_DIAGNOSTICS = [
  /^!/m,
  /LaTeX Error/i,
  /Undefined control sequence/i,
  /LaTeX Warning: Citation .* undefined/i,
  /LaTeX Warning: Reference .* undefined/i,
  /undefined references/i,
  /Overfull \\[hv]box/i,
  /Missing character/i,
];

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function command(name, args, options = {}) {
  const result = spawnSync(name, args, {
    cwd: options.cwd,
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${name} failed with status ${result.status}\n${result.stdout}${result.stderr}`.trim(),
    );
  }
  return result.stdout;
}

export function sourceDateEpoch(freezeDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(freezeDate)) {
    throw new Error("freeze date must use YYYY-MM-DD");
  }
  const milliseconds = Date.parse(`${freezeDate}T00:00:00Z`);
  if (!Number.isFinite(milliseconds)) throw new Error("freeze date must be valid");
  if (new Date(milliseconds).toISOString().slice(0, 10) !== freezeDate) {
    throw new Error("freeze date must be valid");
  }
  return Math.floor(milliseconds / 1000);
}

export function buildDockerCommand(sourceDirectory, epoch, arguments_) {
  return [
    "run",
    "--rm",
    "--network",
    "none",
    "--env",
    `SOURCE_DATE_EPOCH=${epoch}`,
    "--env",
    "FORCE_SOURCE_DATE=1",
    "--volume",
    `${sourceDirectory}:/work`,
    "--workdir",
    "/work",
    ARXIV_TEX_IMAGE,
    ...arguments_,
  ];
}

export function parsePdfInfo(content) {
  const fields = Object.fromEntries(
    content
      .split("\n")
      .filter((line) => line.includes(":"))
      .map((line) => {
        const separator = line.indexOf(":");
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
  );
  return {
    pages: Number(fields.Pages),
    encrypted: fields.Encrypted?.toLowerCase() !== "no",
    page_size: fields["Page size"] ?? "",
    pdf_version: fields["PDF version"] ?? "",
  };
}

export function compilationErrors({ compilerVersion, log, pdf, expectedPages }) {
  const errors = [];
  if (!compilerVersion.includes("TeX Live 2025")) {
    errors.push("compiler: expected TeX Live 2025");
  }
  if (pdf.pages !== expectedPages) errors.push(`PDF: expected ${expectedPages} pages`);
  if (pdf.page_size !== "612 x 792 pts (letter)") errors.push("PDF: expected US letter page size");
  if (pdf.encrypted) errors.push("PDF: expected an unencrypted document");
  for (const pattern of MATERIAL_DIAGNOSTICS) {
    const match = log.match(pattern);
    if (match) errors.push(`TeX log: ${match[0]}`);
  }
  return errors;
}

export function createCompilationReport({
  archive,
  pdf,
  compilerVersion,
  pdfInfo,
  underfullWarnings,
  sourceDateEpoch: epoch,
}) {
  return {
    schema_version: 1,
    engine: "xelatex",
    texlive_version: 2025,
    container_image: ARXIV_TEX_IMAGE,
    source_date_epoch: epoch,
    compiler_version: compilerVersion.split("\n")[0],
    archive_sha256: sha256(archive),
    pdf_sha256: sha256(pdf),
    pdf: pdfInfo,
    diagnostics: {
      material_errors: 0,
      underfull_boxes: underfullWarnings,
    },
  };
}

export async function compileArxivArchive(root) {
  const archivePath = path.join(root, "dist", ARCHIVE_NAME);
  const manifest = JSON.parse(await readFile(path.join(root, "release-metadata.json"), "utf8"));
  const epoch = sourceDateEpoch(manifest.freeze_date);
  const workspace = await mkdtemp(path.join(tmpdir(), "erca-arxiv-compile-"));
  try {
    command("unzip", ["-q", archivePath, "-d", workspace]);
    const sourceDirectory = path.join(workspace, ARCHIVE_ROOT);
    const compilerOutput = command(
      "docker",
      buildDockerCommand(sourceDirectory, epoch, ["xelatex", "--version"]),
    );
    const compilerVersion = compilerOutput.trim();
    const compileArguments = [
      "xelatex",
      "-interaction=nonstopmode",
      "-halt-on-error",
      "-file-line-error",
      "main.tex",
    ];
    for (let pass = 0; pass < 3; pass += 1) {
      command("docker", buildDockerCommand(sourceDirectory, epoch, compileArguments));
    }

    const pdfPath = path.join(sourceDirectory, "main.pdf");
    const log = await readFile(path.join(sourceDirectory, "main.log"), "utf8");
    const pdfInfo = parsePdfInfo(command("pdfinfo", [pdfPath]));
    const errors = compilationErrors({
      compilerVersion,
      log,
      pdf: pdfInfo,
      expectedPages: manifest.manuscript.pages,
    });
    if (errors.length) throw new Error(`arXiv compilation failed:\n- ${errors.join("\n- ")}`);

    return createCompilationReport({
      archive: await readFile(archivePath),
      pdf: await readFile(pdfPath),
      compilerVersion,
      pdfInfo,
      underfullWarnings: (log.match(/Underfull \\[hv]box/g) ?? []).length,
      sourceDateEpoch: epoch,
    });
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
}

async function main() {
  const rootFlag = process.argv.indexOf("--root");
  const root = path.resolve(rootFlag >= 0 ? process.argv[rootFlag + 1] : ".");
  const report = await compileArxivArchive(root);
  console.log(JSON.stringify(report, null, 2));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await main();
}
