#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const DEFAULT_CANDIDATES = fileURLToPath(
  new URL("./candidate-records.json", import.meta.url),
);
const DEFAULT_OUTPUT = fileURLToPath(
  new URL("./tse-scix-doi-coverage.json", import.meta.url),
);
const DEFAULT_VENUE = "IEEE Transactions on Software Engineering";

function normalizeDoi(value) {
  if (typeof value !== "string") return null;
  let normalized = value.trim();
  normalized = normalized.replace(/^https?:\/\/doi\.org\//i, "");
  normalized = normalized.replace(/^doi:/i, "");
  normalized = normalized.toLowerCase();
  if (!/^10\.\d{4,9}\/[-._;()/:a-z0-9]+$/i.test(normalized)) {
    throw new Error("Invalid DOI in candidate set: " + value);
  }
  return normalized;
}

function sqlLiteral(value) {
  return "'" + value.replaceAll("'", "''") + "'";
}

export function buildExactDoiQuery(dois) {
  const normalized = [...new Set(dois.map(normalizeDoi).filter(Boolean))].sort();
  if (normalized.length === 0) throw new Error("No DOI-bearing candidates to audit");
  const storedVariants = [
    ...new Set(
      normalized.flatMap(function (doi) {
        return [doi, doi.replace("/tse.", "/TSE.")];
      }),
    ),
  ].sort();
  return [
    "SELECT COALESCE(json_agg(row_to_json(matches) ORDER BY matches.doi), '[]'::json)",
    "FROM (",
    "  SELECT DISTINCT p.bibcode, p.title, lower(d) AS doi",
    "  FROM papers p",
    "  CROSS JOIN LATERAL unnest(p.doi) AS d",
    "  WHERE p.doi && ARRAY[" +
      storedVariants.map(sqlLiteral).join(",") +
      "]::text[]",
    "    AND lower(d) = ANY(ARRAY[" +
      normalized.map(sqlLiteral).join(",") +
      "]::text[])",
    ") AS matches;",
  ].join("\n");
}

export function buildOverlapArtifact({
  candidates,
  matches,
  venue,
  runDate,
}) {
  const venueCandidates = candidates
    .filter(function (candidate) {
      return candidate.venue === venue && normalizeDoi(candidate.doi);
    })
    .map(function (candidate) {
      return { ...candidate, doi: normalizeDoi(candidate.doi) };
    })
    .sort(function (left, right) {
      return left.doi.localeCompare(right.doi);
    });
  const matchesByDoi = new Map(
    matches.map(function (match) {
      return [normalizeDoi(match.doi), { ...match, doi: normalizeDoi(match.doi) }];
    }),
  );
  const records = venueCandidates.map(function (candidate) {
    const match = matchesByDoi.get(candidate.doi) ?? null;
    return {
      doi: candidate.doi,
      title: candidate.title,
      year: candidate.year,
      query_ids: candidate.query_ids,
      already_in_manuscript: candidate.already_in_manuscript,
      in_scix_by_exact_doi: match !== null,
      scix_match: match,
    };
  });
  const matched = records.filter(function (record) {
    return record.in_scix_by_exact_doi;
  }).length;

  return {
    schema_version: 1,
    run_date: runDate,
    source_lane: "scix_local_exact_doi",
    source_corpus:
      "SciX local corpus populated from NASA Science Explorer metadata",
    candidate_source:
      "The 2026-08-06 OpenAlex software-engineering coverage probe",
    venue,
    method:
      "Exact normalized DOI identity match against the SciX papers.doi field",
    results: {
      candidates_with_doi: records.length,
      exact_doi_matches: matched,
      exact_doi_nonmatches: records.length - matched,
      overlap_share: records.length ? matched / records.length : null,
    },
    records,
    interpretation:
      "This known-corpus audit measures whether SciX contains the DOI-bearing TSE records surfaced by the OpenAlex probe. It does not estimate topic-search recall within TSE, coverage of TSE as a whole, or equivalence to a publisher-native IEEE Xplore search.",
  };
}

function parseArguments(args) {
  const options = {
    candidatePath: DEFAULT_CANDIDATES,
    outputPath: DEFAULT_OUTPUT,
    venue: DEFAULT_VENUE,
    dsn: process.env.SCIX_DSN || "scix",
    runDate: new Date().toISOString().slice(0, 10),
  };
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === "--candidates") options.candidatePath = args[++index];
    else if (value === "--output") options.outputPath = args[++index];
    else if (value === "--venue") options.venue = args[++index];
    else if (value === "--dsn") options.dsn = args[++index];
    else if (value === "--run-date") options.runDate = args[++index];
    else throw new Error("Unknown argument: " + value);
  }
  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const candidates = JSON.parse(await readFile(options.candidatePath, "utf8"));
  const venueDois = candidates
    .filter(function (candidate) {
      return candidate.venue === options.venue && candidate.doi;
    })
    .map(function (candidate) {
      return candidate.doi;
    });
  const sql = buildExactDoiQuery(venueDois);
  const query = spawnSync(
    "psql",
    ["-X", "--no-psqlrc", "-At", "--dbname", options.dsn, "--command", sql],
    { encoding: "utf8" },
  );
  if (query.error) throw query.error;
  if (query.status !== 0) {
    throw new Error("SciX DOI query failed: " + query.stderr.trim());
  }
  const matches = JSON.parse(query.stdout.trim() || "[]");
  const artifact = buildOverlapArtifact({
    candidates,
    matches,
    venue: options.venue,
    runDate: options.runDate,
  });
  await writeFile(options.outputPath, JSON.stringify(artifact, null, 2) + "\n");
  process.stdout.write(
    "Wrote " +
      options.outputPath +
      ": " +
      artifact.results.exact_doi_matches +
      "/" +
      artifact.results.candidates_with_doi +
      " exact DOI matches.\n",
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
