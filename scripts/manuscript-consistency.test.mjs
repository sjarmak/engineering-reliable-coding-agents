import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

test("reader-facing prose distinguishes catalog records, gated practices, and leads", async () => {
  const paths = [
    "README.md",
    "SUBMISSION.md",
    "companion/LEARNINGS.md",
    "companion/README.md",
    "manuscript/abstract.tex",
    "manuscript/frontmatter.tex",
  ];
  const exactTaxonomy =
    /206 reliability records: 193 gated practices, including 56 developed in depth, plus 13 research leads/;
  const obsoleteTaxonomy =
    /206 reliability practices|all 206 practices|206 bounded practice records|206 practice records/;

  for (const relativePath of paths) {
    const prose = await read(relativePath);
    assert.match(prose, exactTaxonomy, `${relativePath} must state the complete record taxonomy`);
    assert.doesNotMatch(prose, obsoleteTaxonomy, `${relativePath} uses the obsolete taxonomy`);
  }

  const frontmatter = await read("manuscript/frontmatter.tex");
  assert.ok(
    [...frontmatter.matchAll(new RegExp(exactTaxonomy.source, "g"))].length >= 2,
    "the contributions and companion sections must each state the complete record taxonomy",
  );

  const appendix = await read("manuscript/appendix-practices.tex");
  assert.match(
    appendix,
    /206 reliability records: 193 gated practices, including 56 developed in the main chapters, plus 13 research leads/,
  );
  assert.doesNotMatch(appendix, obsoleteTaxonomy);
});

test("the introduction counts the concluding chapter separately from practice development", async () => {
  const frontmatter = await read("manuscript/frontmatter.tex");

  assert.match(frontmatter, /The monograph has six parts and twenty chapters\./);
  assert.match(frontmatter, /The resulting 56 practices receive full treatment in the 19 chapters/);
  assert.match(
    frontmatter,
    /\\textbf\{Closing\} & \\mbox\{20\} & The evidence chain behind reliable agents \\\\/,
  );
});

test("the editable organization table preserves chapter numbers 1 through 20", async () => {
  const editing = await read("editing/engineering-reliable-coding-agents.md");
  const caption = editing.indexOf("Parts and chapters in the dependency-chain order");
  const tableEnd = editing.indexOf("</table>", caption);
  assert.ok(caption >= 0 && tableEnd > caption, "could not locate the organization table");
  const table = editing.slice(caption, tableEnd);

  for (let chapter = 1; chapter <= 20; chapter += 1) {
    assert.match(
      table,
      new RegExp(`<td style="text-align: left;">${chapter}</td>`),
      `editable organization table is missing Chapter ${chapter}`,
    );
  }
});

test("the appendix begins only after the final Chapter 20 page has shipped", async () => {
  const main = await read("manuscript/main.tex");

  assert.match(
    main,
    /\\gdef\\currentparttitle\{Closing\}\s+\\input\{chapters\/closing\}\s+\\clearpage\s+\\appendix\s+\\gdef\\currentparttitle\{Appendix\}/,
  );
});

test("the release preview keeps the Closing header through Chapter 20 sources", () => {
  const preview = path.join(
    repositoryRoot,
    "dist",
    "engineering-reliable-coding-agents-preview.pdf",
  );
  const extracted = spawnSync("pdftotext", ["-layout", preview, "-"], {
    encoding: "utf8",
  });
  assert.equal(extracted.status, 0, extracted.stderr);

  const pages = extracted.stdout.split("\f");
  const sourcePage = pages.find((page) =>
    page.includes("part-level and chapter-level evidence shares restated above"),
  );
  assert.ok(sourcePage, "could not locate the final Chapter 20 sources page");
  assert.match(sourcePage, /^Chapter 20\s+Closing/m);
  assert.doesNotMatch(sourcePage, /^Chapter 20\s+Appendix/m);
});

test("the Bainbridge source note uses a web DOI URL", async () => {
  const chapter = await read(
    "manuscript/chapters/ch16-verification-interfaces-risk-based-escalation.tex",
  );

  assert.match(chapter, /\\url\{https:\/\/doi\.org\/10\.1016\/0005-1098\(83\)90046-8\}/);
  assert.doesNotMatch(chapter, /\\url\{doi:10\.1016\/0005-1098\(83\)90046-8\}/);
});
