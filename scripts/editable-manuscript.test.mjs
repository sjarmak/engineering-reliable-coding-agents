import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  classifyEditingSection,
  composeEditingDocument,
  editingStatus,
  formatConvertedSection,
  mainMetadataMarkdown,
  overwriteErrors,
  parseEditingSections,
  sha256,
  writeEditingDocument,
} from "./editable-manuscript.mjs";

const revision = "0123456789abcdef0123456789abcdef01234567";

test("the editing document preserves ordered TeX mappings and baseline hashes", () => {
  const sections = [
    {
      path: "manuscript/abstract.tex",
      tex: "Abstract source.\n",
      markdown: "# Abstract\n\nAbstract source.\n",
    },
    {
      path: "manuscript/chapters/ch01.tex",
      tex: "\\chapter{First}\nBody.\n",
      markdown: "# Part I: Evaluation\n\n# First\n\nBody.\n",
    },
  ];

  const document = composeEditingDocument({
    version: "1.0.0-rc.14",
    revision,
    sections,
  });

  assert.match(document, /EDIT THIS FILE/);
  assert.match(document, /LaTeX remains the release source of truth/);
  assert.ok(document.indexOf("manuscript/abstract.tex") < document.indexOf("manuscript/chapters/ch01.tex"));

  const parsed = parseEditingSections(document);
  assert.equal(parsed.length, 2);
  assert.deepEqual(
    parsed.map(({ path }) => path),
    sections.map(({ path }) => path),
  );
  assert.equal(parsed[0].texSha256, sha256(sections[0].tex));
  assert.equal(parsed[0].markdownSha256, sha256(sections[0].markdown));
  assert.equal(parsed[0].markdown, sections[0].markdown);
});

test("section status distinguishes editable changes, TeX drift, and conflicts", () => {
  const tex = "\\chapter{First}\nBody.\n";
  const markdown = "# First\n\nBody.\n";
  const [baseline] = parseEditingSections(
    composeEditingDocument({
      version: "1.0.0-rc.14",
      revision,
      sections: [{ path: "manuscript/chapters/ch01.tex", tex, markdown }],
    }),
  );

  assert.equal(classifyEditingSection(baseline, tex), "synced");
  assert.equal(
    classifyEditingSection({ ...baseline, markdown: "# First\n\nEdited.\n" }, tex),
    "markdown-edited",
  );
  assert.equal(classifyEditingSection(baseline, `${tex}Changed.\n`), "tex-edited");
  assert.equal(
    classifyEditingSection(
      { ...baseline, markdown: "# First\n\nEdited.\n" },
      `${tex}Changed.\n`,
    ),
    "conflict",
  );
});

test("regeneration refuses to erase Markdown edits or conflicts", () => {
  const tex = "Source.\n";
  const [baseline] = parseEditingSections(
    composeEditingDocument({
      version: "1.0.0-rc.14",
      revision,
      sections: [{ path: "manuscript/abstract.tex", tex, markdown: "Source.\n" }],
    }),
  );
  const edited = { ...baseline, markdown: "Edited.\n" };

  assert.deepEqual(overwriteErrors([baseline], { [baseline.path]: tex }), []);
  assert.deepEqual(overwriteErrors([edited], { [baseline.path]: tex }), [
    "manuscript/abstract.tex: Markdown contains unapplied edits",
  ]);
  assert.deepEqual(overwriteErrors([edited], { [baseline.path]: "Changed source.\n" }), [
    "manuscript/abstract.tex: both Markdown and TeX changed from the baseline",
  ]);
});

test("converted TeX is normalized into readable editing sections", () => {
  assert.equal(
    formatConvertedSection({
      kind: "references",
      converted: "::: {.thebibliography}\n999\n\nFirst reference.\n\n:::\n",
    }),
    "# References\n\nFirst reference.\n",
  );
  assert.equal(
    formatConvertedSection({ kind: "abstract", converted: "Abstract body.\n" }),
    "# Abstract\n\nAbstract body.\n",
  );
  assert.equal(
    formatConvertedSection({ kind: "materials", converted: "Materials body.\n" }),
    "# Data and materials availability\n\nMaterials body.\n",
  );
  assert.equal(
    formatConvertedSection({
      kind: "body",
      converted:
        "# Chapter {#chapter-id}\n\n::: {#section-id}\n## Section\n:::\n\nFirst line  \nSecond line\n\n<embed src=\"figures/example.pdf\" />\n",
    }),
    "# Chapter\n\n## Section\n\nFirst line\\\nSecond line\n\n<embed src=\"../manuscript/figures/example.pdf\" />\n",
  );
});

test("title-page metadata is exposed without expanding the full main TeX file", () => {
  const main = String.raw`{\Huge\bfseries Engineering Reliable Coding Agents\par}
{\Large Evaluation, Recovery, Context, and Control Beyond the Model\par}
{\large Stephanie Jarmak\par}
{\large Version 1.0.0-rc.14 --- August 2026\par}`;

  assert.equal(
    mainMetadataMarkdown(main),
    "# Title-page metadata\n\n- **Title:** Engineering Reliable Coding Agents\n- **Subtitle:** Evaluation, Recovery, Context, and Control Beyond the Model\n- **Author:** Stephanie Jarmak\n- **Version line:** Version 1.0.0-rc.14 --- August 2026\n",
  );
  assert.throws(() => mainMetadataMarkdown("\\begin{document}"), /title-page metadata/);
});

test("the write and status workflow protects an edited Markdown file", async (context) => {
  const root = await mkdtemp(path.join(tmpdir(), "erca-editing-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "manuscript"), { recursive: true });
  await writeFile(path.join(root, "manuscript", "sample.tex"), "\\chapter{Sample}\nBody.\n");
  await writeFile(
    path.join(root, "release-metadata.json"),
    JSON.stringify({ version: "1.0.0-test" }),
  );
  const options = {
    outputPath: "editing/sample.md",
    specs: [{ path: "manuscript/sample.tex", kind: "body" }],
    converter: () => "# Sample\n\nBody.\n",
    revisionProvider: () => revision,
  };

  const written = await writeEditingDocument(root, options);
  assert.equal(written.sectionCount, 1);
  const output = await readFile(path.join(root, options.outputPath), "utf8");
  assert.match(output, /Baseline: version `1\.0\.0-test`/);
  assert.deepEqual(
    await editingStatus(root, { ...options, log: () => {} }),
    [{ path: "manuscript/sample.tex", status: "synced" }],
  );

  await writeFile(path.join(root, options.outputPath), output.replace("Body.", "Edited body."));
  await assert.rejects(
    writeEditingDocument(root, options),
    /Markdown contains unapplied edits/,
  );

  await writeFile(
    path.join(root, options.outputPath),
    output.replace(/<!-- tex-sync:start [^\n]+ -->\n/, ""),
  );
  await assert.rejects(
    writeEditingDocument(root, options),
    /mapped section structure does not match/,
  );

  await writeFile(
    path.join(root, options.outputPath),
    output.replaceAll("manuscript/sample.tex", "manuscript/unknown.tex"),
  );
  await assert.rejects(
    writeEditingDocument(root, options),
    /mapped section structure does not match/,
  );
  await assert.rejects(
    editingStatus(root, { ...options, log: () => {} }),
    /mapped section structure does not match/,
  );
});

test("write and status reject missing, reordered, or renamed mappings", async (context) => {
  const root = await mkdtemp(path.join(tmpdir(), "erca-editing-structure-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "manuscript"), { recursive: true });
  await writeFile(path.join(root, "manuscript/first.tex"), "First.\n");
  await writeFile(path.join(root, "manuscript/second.tex"), "Second.\n");
  await writeFile(
    path.join(root, "release-metadata.json"),
    JSON.stringify({ version: "1.0.0-test" }),
  );
  const options = {
    outputPath: "editing/sample.md",
    specs: [
      { path: "manuscript/first.tex", kind: "body" },
      { path: "manuscript/second.tex", kind: "body" },
    ],
    converter: (_root, sourcePath) =>
      sourcePath === "manuscript/first.tex" ? "First.\n" : "Second.\n",
    revisionProvider: () => revision,
  };

  await writeEditingDocument(root, options);
  const outputPath = path.join(root, options.outputPath);
  const output = await readFile(outputPath, "utf8");
  const blocks = [...output.matchAll(/<!-- tex-sync:start [^\n]+ -->\n[\s\S]*?<!-- tex-sync:end -->/g)].map(
    (match) => match[0],
  );
  assert.equal(blocks.length, 2);
  const firstStart = output.indexOf(blocks[0]);
  const secondEnd = output.indexOf(blocks[1]) + blocks[1].length;
  const corruptions = [
    output.replace(blocks[1], ""),
    `${output.slice(0, firstStart)}${blocks[1]}\n\n${blocks[0]}${output.slice(secondEnd)}`,
    output.replace("manuscript/first.tex", "manuscript/unknown.tex"),
  ];

  for (const corrupted of corruptions) {
    await writeFile(outputPath, corrupted);
    await assert.rejects(
      writeEditingDocument(root, options),
      /mapped section structure does not match/,
    );
    await assert.rejects(
      editingStatus(root, { ...options, log: () => {} }),
      /mapped section structure does not match/,
    );
  }
});
