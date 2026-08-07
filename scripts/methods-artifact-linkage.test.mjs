import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const REPOSITORY_BLOB =
  "https://github.com/sjarmak/engineering-reliable-coding-agents/blob/main/";

test("manuscript methods link claims to concrete companion evidence artifacts", async () => {
  const frontmatter = await readFile("manuscript/frontmatter.tex", "utf8");
  const requiredPaths = [
    "companion/methodology/assembly-and-adjudication.md",
    "companion/methodology/thread-protocols.md",
    "companion/methodology/thread-source-index.csv",
    "companion/methodology/search-log.csv",
    "companion/methodology/screening-decisions.csv",
    "companion/methodology/source-snapshot.json",
    "companion/methodology/software-engineering-coverage/protocol-and-status.json",
    "companion/methodology/software-engineering-coverage/dblp-author-adjudication-2026-08.csv",
    "companion/methodology/external-grading/review-form.html",
    "companion/methodology/external-grading/analyze-grades.mjs",
    "companion/methodology/external-grading/status.json",
  ];

  for (const artifactPath of requiredPaths) {
    assert.ok(
      frontmatter.includes(`${REPOSITORY_BLOB}${artifactPath}`),
      `frontmatter does not link ${artifactPath}`,
    );
    await assert.doesNotReject(readFile(artifactPath), `${artifactPath} does not exist`);
  }
});

test("retrieval systems remain discovery instruments rather than evidence graders", async () => {
  const frontmatter = await readFile("manuscript/frontmatter.tex", "utf8");

  assert.match(frontmatter, /SciX.*Code Intelligence Digest.*retriev[^.]+did not assign evidence grades/s);
  assert.match(frontmatter, /author made the final inclusion, evidence-group, and practice-admission decisions/i);
});

test("v1 discloses that external grading was not performed without claiming calibration", async () => {
  const frontmatter = await readFile("manuscript/frontmatter.tex", "utf8");
  const abstract = await readFile("manuscript/abstract.tex", "utf8");
  const submission = await readFile("SUBMISSION.md", "utf8");

  assert.match(frontmatter, /did not commission external graders/i);
  assert.match(frontmatter, /does not claim independent calibration/i);
  assert.doesNotMatch(frontmatter, /At least two external readers must complete.*before archival v1/i);
  for (const artifact of [abstract, submission]) {
    assert.match(artifact, /External graders were not commissioned/i);
    assert.match(artifact, /makes no independent-calibration claim/i);
  }
});

test("manuscript records the exposed IEEE credential boundary", async () => {
  const frontmatter = await readFile("manuscript/frontmatter.tex", "utf8");

  assert.doesNotMatch(frontmatter, /IEEE Xplore metadata key is configured but awaits provider activation/);
  assert.match(frontmatter, /IEEE.*credential.*must be rotated.*before another API request/is);
});

test("materials statement links the release checksum and verification evidence", async () => {
  const materials = await readFile("manuscript/materials.tex", "utf8");

  for (const artifactPath of [
    "companion/SHA256SUMS",
    "companion/methodology/release-verification/arxiv-compile-report.json",
  ]) {
    assert.ok(materials.includes(`${REPOSITORY_BLOB}${artifactPath}`));
    await assert.doesNotReject(readFile(artifactPath));
  }
});
