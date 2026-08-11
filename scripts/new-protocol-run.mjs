#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROTOCOL = Object.freeze({
  id: "minimum-reliability-pass",
  source: "protocols/minimum-reliability-pass.md",
  records: Object.freeze([
    Object.freeze({
      control: "Repeated execution",
      path: "01-repeated-runs.csv",
      content:
        "task_id,attempt_id,seed,system_revision,started_at,finished_at,outcome,artifact_uri,notes\n",
    }),
    Object.freeze({
      control: "Outcome verification",
      path: "02-oracle-check.md",
      content: `# Outcome verification

Status: not run

- Task and attempt IDs:
- Candidate artifact:
- Oracle or executable check:
- Oracle revision:
- Command or procedure:
- Observed result:
- Retained output:
- Reviewer:

Do not mark this control complete from an agent completion claim alone.
`,
    }),
    Object.freeze({
      control: "Authority boundary",
      path: "03-authority-boundary.md",
      content: `# Authority boundary

Status: not run

- Ordinary identity:
- Permitted action and safe target:
- Prohibited action and safe target:
- Credential, network, and tool inventory:
- Denied ordinary-identity event:
- Bounded escalation path:
- Adjacent authority probe:
- Audit-event locations:
- Reviewer:

A lease, heartbeat, or task assignment is not evidence of write authority.
`,
    }),
    Object.freeze({
      control: "Interrupted-run recovery",
      path: "04-interrupted-run.md",
      content: `# Interrupted-run recovery

Status: not run

- Workflow revision:
- Completion claim:
- Named kill point:
- Durable state before interruption:
- Retry, idempotency, or deduplication key:
- Recovery path used:
- Terminal artifact:
- Missing or duplicate external effects:
- Invariant evaluated:
- Result and retained trace:

Record a result only for the named kill point and invariant tested.
`,
    }),
    Object.freeze({
      control: "Failure-trace review",
      path: "05-failure-trace-review.md",
      content: `# Failure-trace review

Status: not run

- Sampled trace ID:
- Raw ordered trace:
- Blinded reviewer:
- First supported upstream failure and event ID:
- Downstream effects:
- Narrowest taxonomy label:
- Original label:
- Adjudication:
- Missing evidence or observability gap:
- Schema or taxonomy change:

If the trace cannot distinguish competing causes, record an observability gap instead of an attribution.
`,
    }),
    Object.freeze({
      control: "Cost, time, and baseline",
      path: "06-cost-time-summary.csv",
      content:
        "system_role,system_revision,task_count,successful_tasks,total_cost,currency,pricing_snapshot,elapsed_seconds,p50_seconds,p95_seconds,notes\n",
    }),
  ]),
});

function currentRevision(cwd) {
  const result = spawnSync("git", ["rev-parse", "HEAD"], { cwd, encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      "Could not infer a system revision from the current directory; pass --revision <revision>",
    );
  }
  return result.stdout.trim();
}

function manifestFor({ target, revision, createdAt }) {
  return {
    schema_version: 1,
    protocol: PROTOCOL.id,
    protocol_source: PROTOCOL.source,
    created_at: createdAt,
    status: "scaffolded-not-run",
    system: { name: path.basename(target), revision },
    record_before_execution: [
      "task_family",
      "model",
      "harness_revision",
      "prompt_revision",
      "tool_policy_revision",
      "ordinary_identity",
      "pricing_snapshot",
    ],
    records: PROTOCOL.records.map(({ control, path: recordPath }) => ({
      control,
      path: recordPath,
      status: "not-run",
    })),
    interpretation:
      "This manifest and its empty records only scaffold a run. They contain no evidence that a control passed.",
  };
}

async function writeScaffold(directory, manifest) {
  const writes = PROTOCOL.records.map((record) =>
    writeFile(path.join(directory, record.path), record.content, { flag: "wx" }),
  );
  await Promise.all([
    writeFile(
      path.join(directory, "manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
      { flag: "wx" },
    ),
    ...writes,
  ]);
}

async function claimTarget(target) {
  try {
    await mkdir(target);
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new Error(`Target already exists: ${target}`, { cause: error });
    }
    throw error;
  }
}

export async function scaffoldProtocolRun({
  protocol,
  target,
  revision,
  createdAt = new Date().toISOString(),
}) {
  if (protocol !== PROTOCOL.id) {
    throw new Error(`Unsupported protocol: ${protocol}. Supported: ${PROTOCOL.id}`);
  }
  if (!target) throw new Error("A target directory is required");
  if (!revision?.trim()) throw new Error("A non-empty system revision is required");

  const resolvedTarget = path.resolve(target);
  const parent = path.dirname(resolvedTarget);
  await mkdir(parent, { recursive: true });
  const manifest = manifestFor({ target: resolvedTarget, revision: revision.trim(), createdAt });
  await claimTarget(resolvedTarget);

  try {
    await writeScaffold(resolvedTarget, manifest);
  } catch (error) {
    await rm(resolvedTarget, { recursive: true, force: true });
    throw error;
  }

  return { target: resolvedTarget, recordCount: PROTOCOL.records.length };
}

function parseArguments(argv) {
  const [protocol, target, flag, flagValue, ...extra] = argv;
  const invalid =
    !protocol ||
    !target ||
    extra.length > 0 ||
    (flag && flag !== "--revision") ||
    (flag && !flagValue);
  if (invalid) {
    throw new Error(
      "Usage: node scripts/new-protocol-run.mjs minimum-reliability-pass <output-directory> [--revision <revision>]",
    );
  }
  return { protocol, target, revision: flagValue };
}

async function main() {
  const arguments_ = parseArguments(process.argv.slice(2));
  const revision = arguments_.revision ?? currentRevision(process.cwd());
  const result = await scaffoldProtocolRun({ ...arguments_, revision });
  process.stdout.write(
    `Created ${arguments_.protocol} at ${result.target} (${result.recordCount} control records).\n`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
