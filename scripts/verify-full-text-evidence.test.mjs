import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { verifyFullTextEvidence } from "./verify-full-text-evidence.mjs";

const HEADER = "publication,doi,title,full_text_source_url,source_version,pages,full_text_sha256,verification_outcome,verification_locator,verified_bounded_claim,verification_note";

function row({ publication, hash, pages }) {
  return `${publication},10.1000/example,Example title,https://example.test/paper.pdf,accepted_manuscript,${pages},${hash},supported,p. 1,Bounded claim,Boundary note`;
}

function runCli(args, options = {}) {
  return spawnSync(process.execPath, ["scripts/verify-full-text-evidence.mjs", ...args], {
    cwd: path.resolve("."),
    encoding: "utf8",
    ...options,
  });
}

test("full-text source verification matches evidence rows to PDF bytes and page counts", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "full-text-evidence-"));
  const pdfDirectory = path.join(root, "pdfs");
  const artifactPath = path.join(root, "evidence.csv");
  await mkdir(pdfDirectory);
  const bytes = Buffer.from("test PDF bytes");
  const digest = createHash("sha256").update(bytes).digest("hex");
  await writeFile(path.join(pdfDirectory, "arbitrary-name.pdf"), bytes);
  await writeFile(artifactPath, `${HEADER}\n${row({ publication: "publication-1", hash: digest, pages: 7 })}\n`);

  assert.deepEqual(
    await verifyFullTextEvidence({
      artifactPaths: [artifactPath],
      pdfDirectory,
      inspectPages: async () => 7,
    }),
    [],
  );
});

test("full-text source verification reports missing bytes and wrong page counts", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "full-text-evidence-"));
  const pdfDirectory = path.join(root, "pdfs");
  const artifactPath = path.join(root, "evidence.csv");
  await mkdir(pdfDirectory);
  const bytes = Buffer.from("available PDF bytes");
  const digest = createHash("sha256").update(bytes).digest("hex");
  await writeFile(path.join(pdfDirectory, "available.pdf"), bytes);
  await writeFile(
    artifactPath,
    [
      HEADER,
      row({ publication: "wrong-pages", hash: digest, pages: 9 }),
      row({ publication: "missing", hash: "f".repeat(64), pages: 1 }),
      "",
    ].join("\n"),
  );

  const errors = await verifyFullTextEvidence({
    artifactPaths: [artifactPath],
    pdfDirectory,
    inspectPages: async () => 8,
  });

  assert.ok(errors.some((error) => error.includes("wrong-pages") && error.includes("expected 9 pages")));
  assert.ok(errors.some((error) => error.includes("missing") && error.includes("no PDF")));
});

test("full-text source verification reports malformed artifacts and PDF inspection failures", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "full-text-evidence-errors-"));
  const pdfDirectory = path.join(root, "pdfs");
  const nestedDirectory = path.join(pdfDirectory, "nested");
  await mkdir(nestedDirectory, { recursive: true });
  const bytes = Buffer.from("nested PDF bytes");
  const digest = createHash("sha256").update(bytes).digest("hex");
  await writeFile(path.join(nestedDirectory, "source.PDF"), bytes);
  await writeFile(path.join(pdfDirectory, "ignored.txt"), "not a PDF");

  const malformedColumns = path.join(root, "malformed-columns.csv");
  const unterminated = path.join(root, "unterminated.csv");
  const wrongSchema = path.join(root, "wrong-schema.csv");
  const inspectionFailure = path.join(root, "inspection-failure.csv");
  await Promise.all([
    writeFile(malformedColumns, `${HEADER}\nonly,two\n`),
    writeFile(unterminated, `${HEADER}\n"unterminated\n`),
    writeFile(wrongSchema, `wrong,header\nvalue,other\n`),
    writeFile(
      inspectionFailure,
      `${HEADER}\npublication-quoted,10.1000/example,"Example, ""quoted"" title",https://example.test/paper.pdf,accepted_manuscript,1,${digest},supported,p. 1,Bounded claim,Boundary note\n`,
    ),
  ]);

  const errors = await verifyFullTextEvidence({
    artifactPaths: [malformedColumns, unterminated, wrongSchema, inspectionFailure],
    pdfDirectory,
    inspectPages: async () => {
      throw new Error("inspection unavailable");
    },
  });

  assert.ok(errors.some((error) => error.includes("different number of columns")));
  assert.ok(errors.some((error) => error.includes("unterminated quoted field")));
  assert.ok(errors.some((error) => error.includes("schema does not match")));
  assert.ok(errors.some((error) => error.includes("inspection unavailable")));
});

test("full-text source verification CLI checks supplied PDFs", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "full-text-evidence-cli-"));
  const pdfDirectory = path.join(root, "pdfs");
  const binDirectory = path.join(root, "bin");
  const artifactPath = path.join(root, "evidence.csv");
  await Promise.all([mkdir(pdfDirectory), mkdir(binDirectory)]);
  const bytes = Buffer.from("CLI PDF bytes");
  const digest = createHash("sha256").update(bytes).digest("hex");
  await writeFile(path.join(pdfDirectory, "source.pdf"), bytes);
  await writeFile(artifactPath, `${HEADER}\n${row({ publication: "publication-cli", hash: digest, pages: 1 })}\n`);
  const pdfinfo = path.join(binDirectory, "pdfinfo");
  await writeFile(pdfinfo, "#!/bin/sh\nprintf 'Pages:          1\\n'\n");
  await chmod(pdfinfo, 0o755);

  const result = runCli(["--pdf-dir", pdfDirectory, "--evidence", artifactPath], {
    env: { ...process.env, PATH: `${binDirectory}:${process.env.PATH}` },
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Verified 1 full-text evidence artifact/);
});

test("full-text source verification CLI rejects invalid arguments and failed evidence", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "full-text-evidence-cli-errors-"));
  const pdfDirectory = path.join(root, "pdfs");
  const binDirectory = path.join(root, "bin");
  const emptyBinDirectory = path.join(root, "empty-bin");
  const artifactPath = path.join(root, "evidence.csv");
  await Promise.all([mkdir(pdfDirectory), mkdir(binDirectory), mkdir(emptyBinDirectory)]);
  const bytes = Buffer.from("failed inspection bytes");
  const digest = createHash("sha256").update(bytes).digest("hex");
  await writeFile(path.join(pdfDirectory, "source.pdf"), bytes);
  await writeFile(artifactPath, `${HEADER}\n${row({ publication: "publication-failed", hash: digest, pages: 1 })}\n`);
  const pdfinfo = path.join(binDirectory, "pdfinfo");
  await writeFile(pdfinfo, "#!/bin/sh\nprintf 'inspection failed\\n' >&2\nexit 3\n");
  await chmod(pdfinfo, 0o755);

  const unknown = runCli(["--unknown"]);
  const missingDirectory = runCli([]);
  const failedInspection = runCli(["--pdf-dir", pdfDirectory, "--evidence", artifactPath], {
    env: { ...process.env, PATH: `${binDirectory}:${process.env.PATH}` },
  });
  const unavailablePdfinfo = runCli(["--pdf-dir", pdfDirectory, "--evidence", artifactPath], {
    env: { ...process.env, PATH: emptyBinDirectory },
  });
  const missingPdfDirectory = runCli([
    "--pdf-dir",
    path.join(root, "missing-pdfs"),
    "--evidence",
    artifactPath,
  ]);
  const defaults = runCli(["--pdf-dir", pdfDirectory]);

  assert.equal(unknown.status, 2);
  assert.match(unknown.stderr, /unknown argument/);
  assert.equal(missingDirectory.status, 2);
  assert.match(missingDirectory.stderr, /--pdf-dir is required/);
  assert.equal(failedInspection.status, 1);
  assert.match(failedInspection.stderr, /inspection failed/);
  assert.equal(unavailablePdfinfo.status, 1);
  assert.match(unavailablePdfinfo.stderr, /pdfinfo could not run/);
  assert.equal(missingPdfDirectory.status, 1);
  assert.match(missingPdfDirectory.stderr, /verification could not run/);
  assert.doesNotMatch(missingPdfDirectory.stderr, /at async|node:internal/);
  assert.equal(defaults.status, 1);
  assert.match(defaults.stderr, /Full-text evidence verification failed/);
});
