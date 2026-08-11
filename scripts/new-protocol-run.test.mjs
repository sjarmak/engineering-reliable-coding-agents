import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { scaffoldProtocolRun } from "./new-protocol-run.mjs";

const REVISION = "0123456789abcdef0123456789abcdef01234567";
const CREATED_AT = "2026-08-11T18:00:00.000Z";

async function temporaryDirectory(context, prefix) {
  const directory = await mkdtemp(path.join(tmpdir(), prefix));
  context.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test("minimum reliability scaffold creates six empty control records tied to one revision", async (context) => {
  const root = await temporaryDirectory(context, "erca-protocol-");
  const target = path.join(root, "my-agent");

  const result = await scaffoldProtocolRun({
    protocol: "minimum-reliability-pass",
    target,
    revision: REVISION,
    createdAt: CREATED_AT,
  });

  assert.equal(result.target, target);
  assert.equal(result.recordCount, 6);

  const manifest = JSON.parse(await readFile(path.join(target, "manifest.json"), "utf8"));
  assert.equal(manifest.protocol, "minimum-reliability-pass");
  assert.equal(manifest.protocol_source, "protocols/minimum-reliability-pass.md");
  assert.equal(manifest.system.revision, REVISION);
  assert.equal(manifest.created_at, CREATED_AT);
  assert.deepEqual(
    manifest.records.map(({ status }) => status),
    Array(6).fill("not-run"),
  );

  const recordPaths = manifest.records.map(({ path: recordPath }) => recordPath);
  assert.deepEqual(recordPaths, [
    "01-repeated-runs.csv",
    "02-oracle-check.md",
    "03-authority-boundary.md",
    "04-interrupted-run.md",
    "05-failure-trace-review.md",
    "06-cost-time-summary.csv",
  ]);

  const records = await Promise.all(
    recordPaths.map((recordPath) => readFile(path.join(target, recordPath), "utf8")),
  );
  assert.ok(records.every((record) => record.length > 0));
  assert.ok(records.every((record) => !/illustrative example|synthetic example/i.test(record)));
  assert.match(records[1], /Status: not run/);
  assert.match(records[2], /ordinary identity/i);
  assert.match(records[3], /kill point/i);
  assert.match(records[4], /observability gap/i);
});

test("scaffold refuses an unknown protocol and preserves an existing target", async (context) => {
  const root = await temporaryDirectory(context, "erca-protocol-errors-");
  const target = path.join(root, "existing");

  await assert.rejects(
    scaffoldProtocolRun({ protocol: "unknown", target, revision: REVISION }),
    /Unsupported protocol/,
  );

  await scaffoldProtocolRun({
    protocol: "minimum-reliability-pass",
    target,
    revision: REVISION,
  });
  await assert.rejects(
    scaffoldProtocolRun({
      protocol: "minimum-reliability-pass",
      target,
      revision: REVISION,
    }),
    /already exists/,
  );
  assert.equal(
    JSON.parse(await readFile(path.join(target, "manifest.json"), "utf8")).system.revision,
    REVISION,
  );
});

test("scaffold refuses and preserves an existing empty target", async (context) => {
  const root = await temporaryDirectory(context, "erca-protocol-empty-target-");
  const target = path.join(root, "reserved");
  await mkdir(target);

  await assert.rejects(
    scaffoldProtocolRun({
      protocol: "minimum-reliability-pass",
      target,
      revision: REVISION,
    }),
    /already exists/,
  );
  assert.deepEqual(await readdir(target), []);
});

test("command-line quickstart creates a usable scaffold", async (context) => {
  const root = await temporaryDirectory(context, "erca-protocol-cli-");
  const script = path.resolve("scripts/new-protocol-run.mjs");
  const result = spawnSync(
    process.execPath,
    [script, "minimum-reliability-pass", "runs/my-agent", "--revision", REVISION],
    { cwd: root, encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Created minimum-reliability-pass/);
  assert.match(result.stdout, /6 control records/);
  const manifest = JSON.parse(
    await readFile(path.join(root, "runs/my-agent/manifest.json"), "utf8"),
  );
  assert.equal(manifest.system.name, "my-agent");
  assert.equal(manifest.system.revision, REVISION);
});

test("command-line quickstart infers the revision in a clean Git checkout", async (context) => {
  const root = await temporaryDirectory(context, "erca-protocol-git-");
  const script = path.resolve("scripts/new-protocol-run.mjs");
  await writeFile(path.join(root, "tracked.txt"), "revision fixture\n");
  const commands = [
    ["init", "--quiet"],
    ["add", "tracked.txt"],
    [
      "-c",
      "user.name=Protocol Test",
      "-c",
      "user.email=protocol-test@example.invalid",
      "commit",
      "--quiet",
      "-m",
      "test fixture",
    ],
  ];
  for (const arguments_ of commands) {
    const git = spawnSync("git", arguments_, { cwd: root, encoding: "utf8" });
    assert.equal(git.status, 0, git.stderr);
  }
  const revision = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: root,
    encoding: "utf8",
  }).stdout.trim();

  const result = spawnSync(
    process.execPath,
    [script, "minimum-reliability-pass", "runs/my-agent"],
    { cwd: root, encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(
    await readFile(path.join(root, "runs/my-agent/manifest.json"), "utf8"),
  );
  assert.equal(manifest.system.revision, revision);
});
