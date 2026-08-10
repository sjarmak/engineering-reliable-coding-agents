#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PANDOC_IMAGE =
  "pandoc/core:3.7@sha256:388e8ed4db8f9586e924f6fed4be88f64cada231777d7f4b8f10a8ae438a7ec9";
const OUTPUT_PATH = "editing/engineering-reliable-coding-agents.md";

const SECTION_SPECS = Object.freeze([
  { path: "manuscript/main.tex", kind: "metadata" },
  { path: "manuscript/abstract.tex", kind: "abstract" },
  { path: "manuscript/frontmatter.tex", kind: "body" },
  {
    path: "manuscript/chapters/ch01-variance-power-paired-comparisons.tex",
    kind: "body",
    prefix: "# Part I: Evaluation measurement and experiment design",
  },
  { path: "manuscript/chapters/ch02-baselines-ablations-cost-accuracy.tex", kind: "body" },
  { path: "manuscript/chapters/ch03-contamination-oracle-workload-validity.tex", kind: "body" },
  {
    path: "manuscript/chapters/ch04-execution-correction-gates-release-tests.tex",
    kind: "body",
    prefix: "# Part II: Evaluation and grading systems",
  },
  {
    path: "manuscript/chapters/ch05-calibrating-model-graders-agreement-correctness.tex",
    kind: "body",
  },
  { path: "manuscript/chapters/ch06-proxy-gaming-layered-signals.tex", kind: "body" },
  {
    path: "manuscript/chapters/part3-software-factory-distributed-system.tex",
    kind: "body",
    prefix: "# Part III: Containment, durable execution, and recovery engineering",
  },
  {
    path: "manuscript/chapters/ch07-isolation-injection-independent-verification.tex",
    kind: "body",
  },
  {
    path: "manuscript/chapters/ch08-persistent-state-durable-workflows-idempotent-retries.tex",
    kind: "body",
  },
  { path: "manuscript/chapters/ch09-replayable-traces-fault-injection-recovery.tex", kind: "body" },
  {
    path: "manuscript/chapters/ch10-human-auditable-failure-analysis-taxonomy.tex",
    kind: "body",
  },
  {
    path: "manuscript/chapters/ch11-measuring-designing-repository-retrieval.tex",
    kind: "body",
    prefix: "# Part IV: Context engineering: retrieval, budgets, and memory",
  },
  {
    path: "manuscript/chapters/ch12-localization-funnels-repository-indexes-freshness-checks.tex",
    kind: "body",
  },
  {
    path: "manuscript/chapters/ch13-usable-context-budgets-spec-restarts-file-output.tex",
    kind: "body",
  },
  {
    path: "manuscript/chapters/ch14-cross-session-memory-raw-traces-compaction.tex",
    kind: "body",
  },
  {
    path: "manuscript/chapters/ch15-verification-interfaces-risk-based-escalation.tex",
    kind: "body",
    prefix: "# Part V: Human review and accountability engineering",
  },
  {
    path: "manuscript/chapters/ch16-autonomy-provenance-gates-accountability.tex",
    kind: "body",
  },
  {
    path: "manuscript/chapters/ch17-agent-topology-dynamic-task-allocation.tex",
    kind: "body",
    prefix: "# Part VI: Research agenda: work allocation and cost engineering",
  },
  {
    path: "manuscript/chapters/ch18-cost-aware-fleet-scheduling-model-routing.tex",
    kind: "body",
  },
  { path: "manuscript/chapters/closing.tex", kind: "body" },
  { path: "manuscript/chapters/glossary.tex", kind: "body" },
  { path: "manuscript/references.tex", kind: "references" },
  { path: "manuscript/materials.tex", kind: "materials" },
]);

function normalized(content) {
  return `${content.trimEnd()}\n`;
}

export function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

export function mainMetadataMarkdown(mainTex) {
  const title = mainTex.match(/\{\\Huge\\bfseries\s+([^{}]+?)\\par\}/)?.[1];
  const subtitle = mainTex.match(/\{\\Large\s+([^{}]+?)\\par\}/)?.[1];
  const largeLines = [...mainTex.matchAll(/\{\\large\s+([^{}]+?)\\par\}/g)].map(
    (match) => match[1],
  );
  if (!title || !subtitle || largeLines.length < 2) {
    throw new Error("manuscript/main.tex: could not locate complete title-page metadata");
  }
  return normalized(`# Title-page metadata

- **Title:** ${title}
- **Subtitle:** ${subtitle}
- **Author:** ${largeLines[0]}
- **Version line:** ${largeLines.at(-1)}
`);
}

export function formatConvertedSection({ kind, converted }) {
  let body = normalized(converted)
    .replace(/^:::\s+\{#[^}\n]+\}\n(#{1,6} .+)\n:::\n/gm, "$1\n")
    .replace(/^(#{1,6} .+?)\s+\{#[^}\n]+(?:\s+\.[^}\n]+)*\}$/gm, "$1")
    .replaceAll('src="figures/', 'src="../manuscript/figures/')
    .replace(/ {2,}\n/g, "\\\n");
  if (kind === "references") {
    body = body
      .replace(/^:::\s+\{\.thebibliography\}\n\d+\n\n?/, "")
      .replace(/\n:::\n$/, "\n");
    return normalized(`# References\n\n${body}`);
  }
  if (kind === "abstract") return normalized(`# Abstract\n\n${body}`);
  if (kind === "materials") {
    return normalized(`# Data and materials availability\n\n${body}`);
  }
  return body;
}

export function composeEditingDocument({ version, revision, sections }) {
  const header = normalized(`# Engineering Reliable Coding Agents: editable manuscript

> **EDIT THIS FILE.** This is the human-editing copy generated from the current TeX manuscript.
>
> LaTeX remains the release source of truth. After editing, run
> \`node scripts/editable-manuscript.mjs --status\` to list the sections that need to be
> transferred back to TeX. Do not regenerate this file while it contains unapplied edits.
>
> Baseline: version \`${version}\`, repository revision \`${revision}\`.

The \`tex-sync\` comments delimit exact file mappings and carry baseline hashes. Leave those
comments in place; edit the prose between them.
`);
  const renderedSections = sections.map((section) => {
    const markdown = normalized(section.markdown);
    const metadata = JSON.stringify({
      path: section.path,
      tex_sha256: sha256(section.tex),
      markdown_sha256: sha256(markdown),
    });
    return `<!-- tex-sync:start ${metadata} -->\n${markdown}<!-- tex-sync:end -->\n`;
  });
  return `${header}\n${renderedSections.join("\n")}`;
}

export function parseEditingSections(content) {
  const pattern = /<!-- tex-sync:start (\{[^\n]+\}) -->\n([\s\S]*?)<!-- tex-sync:end -->/g;
  return [...content.matchAll(pattern)].map((match) => {
    const metadata = JSON.parse(match[1]);
    return {
      path: metadata.path,
      texSha256: metadata.tex_sha256,
      markdownSha256: metadata.markdown_sha256,
      markdown: match[2],
    };
  });
}

export function classifyEditingSection(section, currentTex) {
  const markdownChanged = sha256(section.markdown) !== section.markdownSha256;
  const texChanged = sha256(currentTex) !== section.texSha256;
  if (markdownChanged && texChanged) return "conflict";
  if (markdownChanged) return "markdown-edited";
  if (texChanged) return "tex-edited";
  return "synced";
}

export function overwriteErrors(sections, texByPath) {
  return sections.flatMap((section) => {
    const status = classifyEditingSection(section, texByPath[section.path]);
    if (status === "markdown-edited") {
      return [`${section.path}: Markdown contains unapplied edits`];
    }
    if (status === "conflict") {
      return [`${section.path}: both Markdown and TeX changed from the baseline`];
    }
    return [];
  });
}

function editingStructureErrors(sections, specs) {
  const matches =
    sections.length === specs.length &&
    sections.every((section, index) => section.path === specs[index].path);
  return matches
    ? []
    : ["mapped section structure does not match the required TeX source order"];
}

function command(name, args, options = {}) {
  const result = spawnSync(name, args, {
    cwd: options.cwd,
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
    timeout: 120_000,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${name} failed with status ${result.status}\n${result.stderr}`.trim());
  }
  return result.stdout;
}

function convertTex(root, sourcePath) {
  return command("docker", [
    "run",
    "--rm",
    "--network",
    "none",
    "--volume",
    `${root}:/data:ro`,
    "--workdir",
    "/data",
    PANDOC_IMAGE,
    sourcePath,
    "--from=latex",
    "--to=commonmark_x+tex_math_dollars",
    "--wrap=none",
  ]);
}

async function loadTexByPath(root, specs = SECTION_SPECS) {
  return Object.fromEntries(
    await Promise.all(
      specs.map(async (section) => [
        section.path,
        await readFile(path.join(root, section.path), "utf8"),
      ]),
    ),
  );
}

export async function writeEditingDocument(root, options = {}) {
  const {
    converter = convertTex,
    force = false,
    outputPath: relativeOutputPath = OUTPUT_PATH,
    revisionProvider = (repositoryRoot) =>
      command("git", ["rev-parse", "HEAD"], { cwd: repositoryRoot }).trim(),
    specs = SECTION_SPECS,
  } = options;
  const outputPath = path.join(root, relativeOutputPath);
  const texByPath = await loadTexByPath(root, specs);
  if (!force) {
    const existing = await readFile(outputPath, "utf8").catch((error) => {
      if (error.code === "ENOENT") return null;
      throw error;
    });
    if (existing !== null) {
      const parsed = parseEditingSections(existing);
      const structureErrors = editingStructureErrors(parsed, specs);
      const errors = structureErrors.length
        ? structureErrors
        : overwriteErrors(parsed, texByPath);
      if (errors.length) {
        throw new Error(`refusing to overwrite the editing copy:\n- ${errors.join("\n- ")}`);
      }
    }
  }

  const manifest = JSON.parse(await readFile(path.join(root, "release-metadata.json"), "utf8"));
  const revision = revisionProvider(root);
  const sections = specs.map((spec) => {
    const converted = formatConvertedSection({
      kind: spec.kind,
      converted:
        spec.kind === "metadata"
          ? mainMetadataMarkdown(texByPath[spec.path])
          : converter(root, spec.path),
    });
    return {
      path: spec.path,
      tex: texByPath[spec.path],
      markdown: normalized(
        spec.prefix ? `${spec.prefix}\n\n${converted}` : converted,
      ),
    };
  });
  const document = composeEditingDocument({
    version: manifest.version,
    revision,
    sections,
  });
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, document);
  return { outputPath, sectionCount: sections.length };
}

export async function editingStatus(root, options = {}) {
  const {
    failOnDrift = false,
    log = console.log,
    outputPath: relativeOutputPath = OUTPUT_PATH,
    specs = SECTION_SPECS,
  } = options;
  const outputPath = path.join(root, relativeOutputPath);
  const sections = parseEditingSections(await readFile(outputPath, "utf8"));
  const structureErrors = editingStructureErrors(sections, specs);
  if (structureErrors.length) throw new Error(structureErrors.join("\n"));
  const texByPath = await loadTexByPath(root, specs);
  const statuses = sections.map((section) => ({
    path: section.path,
    status: classifyEditingSection(section, texByPath[section.path]),
  }));
  for (const entry of statuses) log(`${entry.status.padEnd(16)} ${entry.path}`);
  if (failOnDrift && statuses.some(({ status }) => status !== "synced")) process.exitCode = 1;
  return statuses;
}

async function main() {
  const rootFlag = process.argv.indexOf("--root");
  const root = path.resolve(rootFlag >= 0 ? process.argv[rootFlag + 1] : ".");
  const write = process.argv.includes("--write");
  const statusMode = process.argv.includes("--status");
  const check = process.argv.includes("--check");
  if ([write, statusMode, check].filter(Boolean).length !== 1) {
    throw new Error("choose exactly one of --write, --status, or --check");
  }
  if (write) {
    const result = await writeEditingDocument(root, {
      force: process.argv.includes("--force"),
    });
    console.log(`Wrote ${result.sectionCount} mapped sections to ${result.outputPath}`);
    return;
  }
  await editingStatus(root, { failOnDrift: check });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await main();
}
