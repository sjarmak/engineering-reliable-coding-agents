#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createReadStream } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const EVIDENCE_HEADERS = Object.freeze([
  "publication",
  "doi",
  "title",
  "full_text_source_url",
  "source_version",
  "pages",
  "full_text_sha256",
  "verification_outcome",
  "verification_locator",
  "verified_bounded_claim",
  "verification_note",
]);
const PDFINFO_TIMEOUT_MS = 30_000;

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (quoted && character === '"' && content[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row = [...row, field];
      field = "";
    } else if (character === "\n" && !quoted) {
      rows.push([...row, field.replace(/\r$/, "")]);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (quoted) throw new Error("unterminated quoted field");
  if (field || row.length) rows.push([...row, field]);
  const [header, ...values] = rows;
  if (!header?.length) throw new Error("missing header");
  if (values.some((columns) => columns.length !== header.length)) {
    throw new Error("row has a different number of columns than the header");
  }
  return {
    header,
    records: values.map((columns) =>
      Object.fromEntries(header.map((name, index) => [name, columns[index]])),
    ),
  };
}

async function listPdfFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return listPdfFiles(entryPath);
      return entry.isFile() && entry.name.toLowerCase().endsWith(".pdf") ? [entryPath] : [];
    }),
  );
  return nested.flat();
}

function digestFile(filePath) {
  return new Promise((resolve, reject) => {
    const digest = createHash("sha256");
    const input = createReadStream(filePath);
    input.on("data", (chunk) => digest.update(chunk));
    input.on("error", reject);
    input.on("end", () => resolve(digest.digest("hex")));
  });
}

async function inspectPdfPages(filePath) {
  const result = spawnSync("pdfinfo", [filePath], {
    encoding: "utf8",
    timeout: PDFINFO_TIMEOUT_MS,
  });
  if (result.error) throw new Error(`pdfinfo could not run (${result.error.message})`);
  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || `pdfinfo exited with status ${result.status}`);
  }
  const match = result.stdout.match(/^Pages:\s+(\d+)$/m);
  if (!match) throw new Error("pdfinfo output did not contain a page count");
  return Number(match[1]);
}

export async function verifyFullTextEvidence({
  artifactPaths,
  pdfDirectory,
  inspectPages = inspectPdfPages,
}) {
  const errors = [];
  const documents = await Promise.all(
    artifactPaths.map(async (artifactPath) => {
      try {
        return { artifactPath, ...parseCsv(await readFile(artifactPath, "utf8")) };
      } catch (error) {
        errors.push(`${artifactPath}: ${error.message}`);
        return null;
      }
    }),
  );
  for (const document of documents.filter(Boolean)) {
    const exactSchema = document.header.length === EVIDENCE_HEADERS.length &&
      document.header.every((name, index) => name === EVIDENCE_HEADERS[index]);
    if (!exactSchema) errors.push(`${document.artifactPath}: schema does not match the evidence contract`);
  }

  const pdfFiles = await listPdfFiles(pdfDirectory);
  const indexed = await Promise.all(
    pdfFiles.map(async (filePath) => [await digestFile(filePath), filePath]),
  );
  const pdfByDigest = new Map(indexed);
  const pagesByDigest = new Map();
  for (const document of documents.filter(Boolean)) {
    for (const record of document.records) {
      const pdfPath = pdfByDigest.get(record.full_text_sha256);
      if (!pdfPath) {
        errors.push(`${record.publication}: no PDF matches SHA-256 ${record.full_text_sha256}`);
        continue;
      }
      try {
        if (!pagesByDigest.has(record.full_text_sha256)) {
          pagesByDigest.set(record.full_text_sha256, await inspectPages(pdfPath));
        }
        const actualPages = pagesByDigest.get(record.full_text_sha256);
        if (actualPages !== Number(record.pages)) {
          errors.push(`${record.publication}: expected ${record.pages} pages but PDF has ${actualPages}`);
        }
      } catch (error) {
        errors.push(`${record.publication}: could not inspect PDF pages (${error.message})`);
      }
    }
  }
  return errors;
}

function cliArguments(argv) {
  const artifactPaths = [];
  let pdfDirectory = "";
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--pdf-dir") pdfDirectory = argv[++index] ?? "";
    else if (argv[index] === "--evidence") artifactPaths.push(argv[++index] ?? "");
    else throw new Error(`unknown argument: ${argv[index]}`);
  }
  if (!pdfDirectory) throw new Error("--pdf-dir is required");
  return {
    pdfDirectory,
    artifactPaths: artifactPaths.length
      ? artifactPaths
      : [
          "companion/methodology/software-engineering-coverage/dblp-full-text-verification-2026-08.csv",
          "companion/methodology/software-engineering-coverage/dblp-supplemental-full-text-verification-2026-08.csv",
        ],
  };
}

async function main() {
  let options;
  try {
    options = cliArguments(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
    return;
  }
  let errors;
  try {
    errors = await verifyFullTextEvidence(options);
  } catch (error) {
    console.error(`Full-text evidence verification could not run: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  if (errors.length) {
    console.error(`Full-text evidence verification failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Verified ${options.artifactPaths.length} full-text evidence artifact(s) against supplied PDF bytes.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await main();
}
