import assert from "node:assert/strict";
import test from "node:test";

import {
  buildExactDoiQuery,
  buildOverlapArtifact,
} from "./audit-scix-doi-overlap.mjs";

test("exact DOI query uses the indexed array overlap before normalization", function () {
  const sql = buildExactDoiQuery([
    "https://doi.org/10.1109/tse.2024.3403042",
    "10.1109/TSE.2024.3403042",
  ]);
  assert.match(sql, /p\.doi && ARRAY/);
  assert.match(sql, /10\.1109\/TSE\.2024\.3403042/);
  assert.match(sql, /lower\(d\) = ANY/);
});

test("overlap artifact reports known-set matches without a recall claim", function () {
  const artifact = buildOverlapArtifact({
    candidates: [
      {
        doi: "10.1109/tse.1",
        title: "One",
        year: 2024,
        venue: "TSE",
        query_ids: ["retrieval"],
        already_in_manuscript: false,
      },
      {
        doi: "10.1109/tse.2",
        title: "Two",
        year: 2024,
        venue: "TSE",
        query_ids: ["evaluation"],
        already_in_manuscript: true,
      },
    ],
    matches: [
      {
        doi: "10.1109/TSE.1",
        title: "One",
        bibcode: "2024TSE",
      },
    ],
    venue: "TSE",
    runDate: "2026-08-06",
  });
  assert.deepEqual(artifact.results, {
    candidates_with_doi: 2,
    exact_doi_matches: 1,
    exact_doi_nonmatches: 1,
    overlap_share: 0.5,
  });
  assert.match(artifact.interpretation, /does not estimate topic-search recall/);
});
