import assert from "node:assert/strict";
import test from "node:test";

import {
  ARXIV_TEX_IMAGE,
  buildDockerCommand,
  compilationErrors,
  createCompilationReport,
  parsePdfInfo,
  sourceDateEpoch,
} from "./arxiv-compile.mjs";

test("the arXiv compiler is pinned to TeX Live 2025 by digest", () => {
  assert.match(ARXIV_TEX_IMAGE, /^texlive\/texlive:TL2025-historic@sha256:[a-f0-9]{64}$/);
});

test("the Docker invocation is offline and passes arguments without a shell", () => {
  assert.deepEqual(buildDockerCommand("/tmp/source", 1785974400, ["xelatex", "main.tex"]), [
    "run",
    "--rm",
    "--network",
    "none",
    "--env",
    "SOURCE_DATE_EPOCH=1785974400",
    "--env",
    "FORCE_SOURCE_DATE=1",
    "--volume",
    "/tmp/source:/work",
    "--workdir",
    "/work",
    ARXIV_TEX_IMAGE,
    "xelatex",
    "main.tex",
  ]);
});

test("the release freeze date supplies a stable UTC source epoch", () => {
  assert.equal(sourceDateEpoch("2026-08-06"), 1785974400);
  assert.throws(() => sourceDateEpoch("August 6, 2026"), /YYYY-MM-DD/);
  assert.throws(() => sourceDateEpoch("2026-02-30"), /valid/);
});

test("PDF metadata is parsed into release-contract fields", () => {
  assert.deepEqual(
    parsePdfInfo(
      "Pages:           270\nEncrypted:       no\nPage size:       612 x 792 pts (letter)\nPDF version:     1.7\n",
    ),
    {
      pages: 270,
      encrypted: false,
      page_size: "612 x 792 pts (letter)",
      pdf_version: "1.7",
    },
  );
});

test("compile validation permits underfull boxes but rejects material diagnostics", () => {
  const valid = compilationErrors({
    compilerVersion: "XeTeX 3.141592653 (TeX Live 2025)",
    log: "Underfull \\hbox (badness 10000)",
    pdf: parsePdfInfo(
      "Pages: 270\nEncrypted: no\nPage size: 612 x 792 pts (letter)\nPDF version: 1.7\n",
    ),
    expectedPages: 270,
  });
  assert.deepEqual(valid, []);

  const invalid = compilationErrors({
    compilerVersion: "XeTeX (TeX Live 2023)",
    log: [
      "! Undefined control sequence.",
      "LaTeX Warning: Citation `missing-citation' on page 1 undefined on input line 10.",
      "LaTeX Warning: Reference `missing-reference' on page 2 undefined on input line 20.",
      "LaTeX Warning: There were undefined references.",
      "Overfull \\hbox (2.0pt too wide)",
      "Missing character: There is no x in font nullfont!",
    ].join("\n"),
    pdf: { pages: 269, encrypted: true, page_size: "595 x 842 pts (A4)", pdf_version: "1.7" },
    expectedPages: 270,
  });
  for (const expectation of [
    "TeX Live 2025",
    "270 pages",
    "US letter",
    "unencrypted",
    "Undefined control sequence",
    "Citation",
    "Reference",
    "undefined references",
    "Overfull",
    "Missing character",
  ]) {
    assert.ok(invalid.some((error) => error.includes(expectation)), expectation);
  }
});

test("the report binds the compiler evidence to exact archive and PDF bytes", () => {
  const report = createCompilationReport({
    archive: Buffer.from("archive"),
    pdf: Buffer.from("pdf"),
    compilerVersion: "XeTeX 3.141592653 (TeX Live 2025)",
    pdfInfo: {
      pages: 270,
      encrypted: false,
      page_size: "612 x 792 pts (letter)",
      pdf_version: "1.7",
    },
    underfullWarnings: 17,
    sourceDateEpoch: 1785974400,
  });

  assert.equal(report.schema_version, 1);
  assert.equal(report.engine, "xelatex");
  assert.equal(report.container_image, ARXIV_TEX_IMAGE);
  assert.equal(report.source_date_epoch, 1785974400);
  assert.match(report.archive_sha256, /^[a-f0-9]{64}$/);
  assert.match(report.pdf_sha256, /^[a-f0-9]{64}$/);
  assert.equal(report.diagnostics.underfull_boxes, 17);
});
