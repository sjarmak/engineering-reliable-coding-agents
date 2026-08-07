#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

export const DBLP_SPARQL_ENDPOINT = "https://sparql.dblp.org/sparql";

const DEFAULT_PLAN = fileURLToPath(
  new URL("./plans/erca_dblp_title_census_plan_2026-08.json", import.meta.url),
);
const DEFAULT_OUTPUT = fileURLToPath(
  new URL("./dblp-title-census-2026-08.json", import.meta.url),
);
const DEFAULT_REFERENCE_METADATA = fileURLToPath(
  new URL("../../reference-metadata.json", import.meta.url),
);
const DEFAULT_OPENALEX_PROBE = fileURLToPath(new URL("./candidate-records.json", import.meta.url));
const DOI_PATTERN = /^10\.\d{4,9}\/[-._;()/:a-z0-9]+$/i;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sparqlString(value) {
  return JSON.stringify(value);
}

function regexPattern(phrases) {
  return phrases
    .map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
}

function assertUniqueIds(items, label) {
  const ids = items.map((item) => item.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error(`DBLP plan contains a duplicate ${label} id`);
  }
}

function validatePlan(plan) {
  if (plan?.schema_version !== 1) throw new Error("DBLP plan schema_version must be 1");
  if (plan?.source_lane !== "open_bibliography_dblp_title_census") {
    throw new Error("DBLP plan source_lane is invalid");
  }
  if (!Array.isArray(plan?.years) || plan.years.length !== 2) {
    throw new Error("DBLP plan years must contain start and end years");
  }
  if (!plan.years.every(Number.isInteger)) {
    throw new Error("DBLP plan years must be integers");
  }
  if (plan.years[0] > plan.years[1]) {
    throw new Error("DBLP plan years must be ordered from start to end");
  }
  if (!Array.isArray(plan?.topics) || plan.topics.length === 0) {
    throw new Error("DBLP plan must contain topics");
  }
  if (!Array.isArray(plan?.venues) || plan.venues.length === 0) {
    throw new Error("DBLP plan must contain venues");
  }
  assertUniqueIds(plan.topics, "topic");
  assertUniqueIds(plan.venues, "venue");
  for (const topic of plan.topics) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic.id)) {
      throw new Error("DBLP plan contains an invalid topic id");
    }
    if (!Array.isArray(topic.required_title_groups) || topic.required_title_groups.length === 0) {
      throw new Error("Every DBLP topic requires an id and title groups");
    }
    if (topic.required_title_groups.some((group) => !Array.isArray(group) || group.length === 0)) {
      throw new Error(`DBLP topic ${topic.id} contains an empty title group`);
    }
  }
  for (const venue of plan.venues) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(venue.id)) {
      throw new Error("DBLP plan contains an invalid venue id");
    }
    if (!Array.isArray(venue.streams) || venue.streams.length === 0) {
      throw new Error("Every DBLP venue requires an id and streams");
    }
    if (
      venue.streams.some(
        (stream) =>
          typeof stream !== "string" ||
          !/^https:\/\/dblp\.org\/streams\/[A-Za-z0-9._~!$&'()*+,;=:@%/-]+$/.test(stream),
      )
    ) {
      throw new Error(`DBLP venue ${venue.id} contains an invalid stream`);
    }
  }
}

function topicValues(plan, maximumGroups) {
  return plan.topics.map((topic) => {
    const patterns = topic.required_title_groups.map(regexPattern);
    const padded = [...patterns, ...Array(maximumGroups - patterns.length).fill("")];
    return `    (${sparqlString(topic.id)} ${padded.map(sparqlString).join(" ")})`;
  });
}

function venueValues(plan) {
  return plan.venues.flatMap((venue) =>
    venue.streams.map((stream) => `    (${sparqlString(venue.id)} <${stream}>)`),
  );
}

export function buildDblpSparqlQuery(plan) {
  validatePlan(plan);
  const maximumGroups = Math.max(
    ...plan.topics.map((topic) => topic.required_title_groups.length),
  );
  const groupVariables = Array.from({ length: maximumGroups }, (_, index) => `?group${index + 1}`);
  const groupFilters = groupVariables.map(
    (variable) => `    FILTER (${variable} = "" || regex(str(?title), ${variable}, "i"))`,
  );
  const [startYear, endYear] = plan.years;
  return [
    "PREFIX dblp: <https://dblp.org/rdf/schema#>",
    "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
    "SELECT DISTINCT ?topic ?venue ?publication ?title ?year ?doi WHERE {",
    `  VALUES (?topic ${groupVariables.join(" ")}) {`,
    ...topicValues(plan, maximumGroups),
    "  }",
    "  VALUES (?venue ?stream) {",
    ...venueValues(plan),
    "  }",
    "  ?publication dblp:publishedInStream ?stream ;",
    "               dblp:title ?title ;",
    "               dblp:yearOfPublication ?year .",
    "  OPTIONAL { ?publication dblp:doi ?doi }",
    `  FILTER (?year >= "${startYear}"^^xsd:gYear && ?year <= "${endYear}"^^xsd:gYear)`,
    ...groupFilters,
    "}",
    "ORDER BY ?topic ?venue ?year ?publication",
  ].join("\n");
}

function requiredBinding(binding, name) {
  const value = binding?.[name]?.value;
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`DBLP provider row is missing required fields: ${name}`);
  }
  return value;
}

function normalizeDoi(value) {
  if (!value) return null;
  const normalized = value.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "").toLowerCase();
  if (!DOI_PATTERN.test(normalized)) throw new Error(`DBLP provider returned invalid DOI: ${value}`);
  return normalized;
}

function parseBinding(binding, plan) {
  const topic = requiredBinding(binding, "topic");
  const venue = requiredBinding(binding, "venue");
  const publication = requiredBinding(binding, "publication");
  const year = Number(requiredBinding(binding, "year"));
  if (!plan.topics.some((candidate) => candidate.id === topic)) {
    throw new Error(`DBLP provider returned unknown topic: ${topic}`);
  }
  if (!plan.venues.some((candidate) => candidate.id === venue)) {
    throw new Error(`DBLP provider returned unknown venue: ${venue}`);
  }
  if (!Number.isInteger(year) || year < plan.years[0] || year > plan.years[1]) {
    throw new Error(`DBLP provider returned invalid year: ${year}`);
  }
  return {
    topic,
    venue,
    publication,
    title: requiredBinding(binding, "title"),
    year,
    doi: normalizeDoi(binding?.doi?.value),
  };
}

function deduplicateRecords(records) {
  const sorted = records.toSorted((left, right) =>
      `${left.topic}\0${left.venue}\0${left.publication}`.localeCompare(
        `${right.topic}\0${right.venue}\0${right.publication}`,
      ),
    );
  return sorted.filter((record, index) => {
    if (index === 0) return true;
    const previous = sorted[index - 1];
    const sameKey =
      record.topic === previous.topic &&
      record.venue === previous.venue &&
      record.publication === previous.publication;
    if (!sameKey) return true;
    if (
      record.title !== previous.title ||
      record.year !== previous.year ||
      record.doi !== previous.doi
    ) {
      throw new Error(
        `DBLP provider returned a conflicting duplicate for ${record.topic}/${record.venue}/${record.publication}`,
      );
    }
    return false;
  });
}

function countUniquePublications(records, include = () => true) {
  return new Set(
    records.filter(include).map((record) => record.publication),
  ).size;
}

export function buildDblpArtifact({
  plan,
  bindings,
  referenceDois = [],
  probeDois = [],
  inputHashes = {},
  runDate,
  responseDate,
  query,
}) {
  validatePlan(plan);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(runDate)) throw new Error("runDate must use YYYY-MM-DD");
  if (!Array.isArray(bindings)) throw new Error("DBLP response bindings must be an array");
  const referenceSet = new Set(referenceDois.map(normalizeDoi).filter(Boolean));
  const probeSet = new Set(probeDois.map(normalizeDoi).filter(Boolean));
  const records = deduplicateRecords(bindings.map((binding) => parseBinding(binding, plan))).map(
    (record) => ({
      ...record,
      already_in_reference_metadata: record.doi ? referenceSet.has(record.doi) : false,
      already_in_openalex_probe: record.doi ? probeSet.has(record.doi) : false,
    }),
  );
  const cells = plan.topics.flatMap((topic) =>
    plan.venues.map((venue) => ({
      id: `${topic.id}--${venue.id}`,
      topic: topic.id,
      venue: venue.id,
      matches: records.filter(
        (record) => record.topic === topic.id && record.venue === venue.id,
      ).length,
    })),
  );
  return {
    schema_version: 1,
    run_date: runDate,
    source_lane: plan.source_lane,
    source: {
      provider: "dblp computer science bibliography",
      endpoint: DBLP_SPARQL_ENDPOINT,
      response_date: responseDate || null,
      metadata_license: "CC0-1.0",
      snapshot_boundary:
        "Live SPARQL service; exact returned result bindings, their hash, and the query hash are preserved here.",
      response_binding_count: bindings.length,
      response_bindings_sha256: sha256(JSON.stringify(bindings)),
      response_bindings: bindings,
    },
    query: {
      sha256: sha256(query),
      sparql: query,
      years: plan.years,
    },
    comparison_inputs: inputHashes,
    results: {
      query_cells: cells.length,
      cells_with_matches: cells.filter((cell) => cell.matches > 0).length,
      record_cell_matches: records.length,
      unique_publications: countUniquePublications(records),
      already_in_reference_metadata: countUniquePublications(
        records,
        (record) => record.already_in_reference_metadata,
      ),
      already_in_openalex_probe: countUniquePublications(
        records,
        (record) => record.already_in_openalex_probe,
      ),
      new_to_both_prior_sets: countUniquePublications(
        records,
        (record) =>
          !record.already_in_reference_metadata && !record.already_in_openalex_probe,
      ),
    },
    cells,
    records,
    interpretation:
      "This credential-free DBLP lane is a title-only census over named venue streams. It broadens and audits venue coverage, but it is not a publisher-native ACM or IEEE search, is not equivalent to Scopus title/abstract/keyword retrieval, and does not establish exhaustive recall. Zero-match cells are preserved rather than silently omitted.",
  };
}

export async function fetchDblpBindings(query, fetchImplementation = fetch) {
  const response = await fetchImplementation(DBLP_SPARQL_ENDPOINT, {
    method: "POST",
    headers: {
      accept: "application/sparql-results+json",
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": "Engineering-Reliable-Coding-Agents/1.0 literature audit",
    },
    body: new URLSearchParams({ query, format: "application/sparql-results+json" }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) {
    throw new Error(`DBLP SPARQL request failed with HTTP ${response.status}`);
  }
  const payload = await response.json();
  if (!Array.isArray(payload?.results?.bindings)) {
    throw new Error("DBLP SPARQL response is missing results.bindings");
  }
  return {
    bindings: payload.results.bindings,
    responseDate: response.headers.get("date"),
  };
}

function parseArguments(args) {
  const defaults = {
    planPath: DEFAULT_PLAN,
    outputPath: DEFAULT_OUTPUT,
    runDate: new Date().toISOString().slice(0, 10),
  };
  return args.reduce((options, value, index) => {
    if (index > 0 && args[index - 1].startsWith("--")) return options;
    const next = args[index + 1];
    if (value === "--plan" && next) return { ...options, planPath: next };
    if (value === "--output" && next) return { ...options, outputPath: next };
    if (value === "--run-date" && next) return { ...options, runDate: next };
    throw new Error(`Unknown or incomplete argument: ${value}`);
  }, defaults);
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const [planContent, referenceContent, probeContent] = await Promise.all([
    readFile(options.planPath, "utf8"),
    readFile(DEFAULT_REFERENCE_METADATA, "utf8"),
    readFile(DEFAULT_OPENALEX_PROBE, "utf8"),
  ]);
  const plan = JSON.parse(planContent);
  const referenceMetadata = JSON.parse(referenceContent);
  const probe = JSON.parse(probeContent);
  const query = buildDblpSparqlQuery(plan);
  const { bindings, responseDate } = await fetchDblpBindings(query);
  const artifact = buildDblpArtifact({
    plan,
    bindings,
    referenceDois: referenceMetadata.dois.map((record) => record.doi),
    probeDois: probe.map((record) => record.doi).filter(Boolean),
    inputHashes: {
      plan_sha256: sha256(planContent),
      reference_metadata_sha256: sha256(referenceContent),
      openalex_probe_sha256: sha256(probeContent),
    },
    runDate: options.runDate,
    responseDate,
    query,
  });
  await writeFile(options.outputPath, `${JSON.stringify(artifact, null, 2)}\n`);
  process.stdout.write(
    `Wrote ${options.outputPath}: ${artifact.results.unique_publications} unique publications across ${artifact.results.cells_with_matches}/${artifact.results.query_cells} nonempty cells.\n`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
