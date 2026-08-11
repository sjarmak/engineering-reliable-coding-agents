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
    "companion/methodology/software-engineering-coverage/publisher-coverage-status.json",
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

test("venue coverage distinguishes publisher-native and index-native lanes", async () => {
  const frontmatter = await readFile("manuscript/frontmatter.tex", "utf8");
  const abstract = await readFile("manuscript/abstract.tex", "utf8");
  const submission = await readFile("SUBMISSION.md", "utf8");

  for (const artifact of [frontmatter, submission]) {
    assert.match(artifact, /publisher- and index-native/i);
  }
  for (const artifact of [frontmatter, abstract, submission]) {
    assert.doesNotMatch(artifact, /publisher-native ACM(?: Digital Library)?, IEEE(?: Xplore)?, and Scopus/i);
  }
});

test("retrieval systems remain discovery instruments rather than evidence graders", async () => {
  const frontmatter = await readFile("manuscript/frontmatter.tex", "utf8");

  assert.match(frontmatter, /SciX.*Code Intelligence Digest.*retriev[^.]+did not assign evidence grades/s);
  assert.match(frontmatter, /author made the final inclusion, evidence-group, and practice-admission decisions/i);
});

test("the edition discloses missing external grading and releases the packet for reuse", async () => {
  const frontmatter = await readFile("manuscript/frontmatter.tex", "utf8");
  const abstract = await readFile("manuscript/abstract.tex", "utf8");
  const submission = await readFile("SUBMISSION.md", "utf8");
  const metadata = JSON.parse(await readFile("release-metadata.json", "utf8"));

  // The methods section carries the full disclosure for both open gates.
  assert.match(frontmatter, /has not commissioned external graders/i);
  assert.match(frontmatter, /does not claim independent calibration/i);
  assert.match(frontmatter, /blinded packet is released so external readers can run that pass/i);

  // The abstract states the limitation at field-typical length and defers the
  // lane-by-lane record to the methods section; it must still send the reader there.
  assert.match(abstract, /review is structured rather than exhaustive/i);
  assert.match(abstract, /methods section records which search lanes/i);
  assert.match(abstract, /which remain unexecuted/i);

  // The submission handoff still tracks both as open decisions, now explicitly
  // deferrable, and the release metadata records them as not-performed with a
  // disclosed limitation.
  assert.match(submission, /^\d+\.\s+\*\*External grading calibration[^*]*\.\*\*/m);
  assert.match(submission, /^\d+\.\s+\*\*Publisher- and index-native SE search[^*]*\.\*\*/m);
  assert.equal(
    metadata.methodology_gates.external_grading,
    "not-performed-with-disclosed-limitation",
  );
  assert.equal(
    metadata.methodology_gates.publisher_native_search,
    "not-performed-with-disclosed-source-limitations",
  );
});

test("manuscript records the IEEE lane without restating a live credential exposure", async () => {
  const frontmatter = await readFile("manuscript/frontmatter.tex", "utf8");

  assert.doesNotMatch(frontmatter, /IEEE Xplore metadata key is configured but awaits provider activation/);
  // The lane is still disclosed as not searched.
  assert.match(frontmatter, /IEEE Xplore credential returned a provider-inactive response/i);
  // The exposure/rotation sentence was removed rather than published.
  assert.doesNotMatch(frontmatter, /exposed in local diagnostic output/i);
  assert.doesNotMatch(frontmatter, /must be rotated/i);
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
