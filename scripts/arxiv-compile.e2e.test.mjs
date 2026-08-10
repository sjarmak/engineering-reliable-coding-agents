import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { compileArxivArchive } from "./arxiv-compile.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("the exact arXiv ZIP reproduces the recorded build under the pinned environment", async () => {
  const actual = await compileArxivArchive(repositoryRoot);
  const stored = JSON.parse(
    await readFile(
      path.join(
        repositoryRoot,
        "companion",
        "methodology",
        "release-verification",
        "arxiv-compile-report.json",
      ),
      "utf8",
    ),
  );

  assert.equal(actual.pdf.pages, 297);
  assert.equal(actual.pdf.page_size, "612 x 792 pts (letter)");
  assert.equal(actual.pdf.encrypted, false);
  assert.equal(actual.diagnostics.material_errors, 0);
  assert.equal(actual.source_date_epoch, 1786233600);
  for (const field of [
    "archive_sha256",
    "pdf_sha256",
    "container_image",
    "compiler_version",
    "source_date_epoch",
  ]) {
    assert.equal(actual[field], stored[field], field);
  }
});
