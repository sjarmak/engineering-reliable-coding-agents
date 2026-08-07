import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { compileArxivArchive } from "./arxiv-compile.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("the exact arXiv ZIP compiles reproducibly under the pinned release environment", async () => {
  const first = await compileArxivArchive(repositoryRoot);
  const second = await compileArxivArchive(repositoryRoot);
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

  assert.equal(first.archive_sha256, second.archive_sha256);
  assert.equal(first.pdf_sha256, second.pdf_sha256);
  assert.equal(first.pdf.pages, 270);
  assert.equal(first.pdf.page_size, "612 x 792 pts (letter)");
  assert.equal(first.pdf.encrypted, false);
  assert.equal(first.diagnostics.material_errors, 0);
  assert.equal(first.source_date_epoch, 1785974400);
  for (const field of [
    "archive_sha256",
    "pdf_sha256",
    "container_image",
    "compiler_version",
    "source_date_epoch",
  ]) {
    assert.equal(first[field], stored[field], field);
  }
});
