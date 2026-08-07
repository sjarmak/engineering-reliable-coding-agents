import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { expectedCompanionFiles, verifyChecksums } from "./release-gate.mjs";

test("companion release metadata ignores macOS Finder files only", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "erca-release-metadata-test-"));
  const companion = path.join(root, "companion");
  const nested = path.join(companion, "methodology");
  const content = "preserved research artifact";
  const checksum = createHash("sha256").update(content).digest("hex");

  await mkdir(nested, { recursive: true });
  await writeFile(path.join(companion, "item.txt"), content);
  await writeFile(path.join(companion, "SHA256SUMS"), `${checksum}  item.txt\n`);
  await writeFile(path.join(companion, ".DS_Store"), "Finder metadata");
  await writeFile(path.join(nested, ".DS_Store"), "nested Finder metadata");

  assert.deepEqual(await verifyChecksums(root), []);
  assert.deepEqual(await expectedCompanionFiles(root), ["SHA256SUMS", "item.txt"]);

  await writeFile(path.join(nested, "unlisted.txt"), "must remain visible");
  assert.ok((await verifyChecksums(root)).some((error) => error.includes("unlisted.txt")));
  assert.deepEqual(await expectedCompanionFiles(root), [
    "SHA256SUMS",
    "item.txt",
    "methodology/unlisted.txt",
  ]);
});
