const FULL_TEXT_HEADERS = Object.freeze([
  "publication",
  "doi",
  "title",
  "full_text_source_url",
  "source_version",
  "pages",
  "full_text_sha256",
  "verification_outcome",
  "verification_locator",
  "verified_bounded_claim",
  "verification_note",
]);
const ACCESS_EXCEPTION_HEADERS = Object.freeze([
  "publication",
  "doi",
  "title",
  "last_checked",
  "access_status",
  "checked_locations",
  "exclusion_boundary",
]);

export function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function parseCsvDocument(content) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (quoted && character === '"' && content[index + 1] === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row = [...row, field];
      field = "";
    } else if (character === "\n" && !quoted) {
      rows.push([...row, field.replace(/\r$/, "")]);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (quoted) throw new Error("unterminated quoted field");
  if (field || row.length) rows.push([...row, field]);
  const [header, ...values] = rows;
  if (!header?.length) throw new Error("missing header");
  const malformedIndex = values.findIndex((columns) => columns.length !== header.length);
  if (malformedIndex >= 0) {
    throw new Error(
      `row ${malformedIndex + 2} has ${values[malformedIndex].length} columns; expected ${header.length}`,
    );
  }
  return {
    header,
    records: values.map((columns) =>
      Object.fromEntries(header.map((name, index) => [name, columns[index]])),
    ),
  };
}

function parseCsvRows(content) {
  return parseCsvDocument(content).records;
}

function hasExactSchema(header, expected) {
  return header.length === expected.length && header.every((name, index) => name === expected[index]);
}

function packetIdentityErrors(records, packet, name) {
  const packetByPublication = new Map(packet.map((record) => [record.publication, record]));
  const matches = records.every((record) => {
    const packetRecord = packetByPublication.get(record.publication);
    return packetRecord && record.doi === packetRecord.doi && record.title === packetRecord.title;
  });
  return matches ? [] : [`${name}: DOI/title values must exactly match the author-adjudication packet`];
}

function isValidHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function adjudicationArtifactErrors(packetContent, triageContent) {
  const name =
    "companion/methodology/software-engineering-coverage/dblp-author-adjudication-2026-08.csv";
  if (!packetContent) return [`${name}: required for a stable release`];
  if (!triageContent) return [`${name}: DBLP triage source is missing`];
  let packet;
  let triage;
  try {
    packet = parseCsvRows(packetContent);
    triage = parseCsvRows(triageContent);
  } catch (error) {
    return [`${name}: invalid CSV (${error.message})`];
  }
  const expected = new Set(
    triage
      .filter((record) => record.model_recommendation === "retain_for_full_text")
      .map((record) => record.publication),
  );
  const actual = new Set(packet.map((record) => record.publication));
  const allowed = new Set(["include-full-text-verified", "defer", "exclude"]);
  const checks = [
    [packet.length === 34 && expected.size === 34, "must contain all 34 author decisions"],
    [
      packet.every((record) => record.publication?.trim()) &&
        triage.every((record) => record.publication?.trim()),
      "publication identifiers must be nonempty",
    ],
    [actual.size === packet.length, "publication identifiers must be unique"],
    [[...expected].every((id) => actual.has(id)), "does not match the retained triage set"],
    [packet.every((record) => allowed.has(record.author_decision)), "contains an invalid or blank author decision"],
    [packet.every((record) => record.author_note?.trim()), "every author decision requires a note"],
  ];
  return checks.flatMap(([passed, message]) => (passed ? [] : [`${name}: ${message}`]));
}

function fullTextRecordErrors(records, name) {
  const versions = new Set(["published_version", "accepted_manuscript", "submitted_version"]);
  const outcomes = new Set([
    "supported",
    "supported_with_version_boundary",
    "needs_narrowing",
    "position_only",
  ]);
  const checks = [
    [records.every((record) => isValidHttpsUrl(record.full_text_source_url)), "full-text sources must use valid HTTPS URLs"],
    [records.every((record) => versions.has(record.source_version)), "contains an invalid source_version"],
    [records.every((record) => Number.isInteger(Number(record.pages)) && Number(record.pages) > 0), "every record requires positive pages"],
    [records.every((record) => /^[a-f0-9]{64}$/.test(record.full_text_sha256)), "every record requires a SHA-256 digest"],
    [records.every((record) => outcomes.has(record.verification_outcome)), "contains an invalid verification_outcome"],
    [
      records.every(
        (record) =>
          record.verification_locator?.trim() &&
          record.verified_bounded_claim?.trim() &&
          record.verification_note?.trim(),
      ),
      "every record requires nonempty support fields",
    ],
  ];
  return checks.flatMap(([passed, message]) => (passed ? [] : [`${name}: ${message}`]));
}

export function fullTextArtifactErrors(content, packetContent) {
  const name =
    "companion/methodology/software-engineering-coverage/dblp-full-text-verification-2026-08.csv";
  if (!content) return [`${name}: required for a stable release`];
  if (!packetContent) return [`${name}: author-adjudication packet is missing`];
  let document;
  let packet;
  try {
    document = parseCsvDocument(content);
    packet = parseCsvRows(packetContent);
  } catch (error) {
    return [`${name}: invalid CSV (${error.message})`];
  }
  const records = document.records;
  const expected = new Set(
    packet
      .filter((record) => record.full_text_route === "open_location")
      .map((record) => record.publication),
  );
  const actual = new Set(records.map((record) => record.publication));
  const checks = [
    [hasExactSchema(document.header, FULL_TEXT_HEADERS), "schema must exactly match the full-text evidence contract"],
    [records.length === 18 && expected.size === 18, "must contain all 18 open-routed records"],
    [
      records.every((record) => record.publication?.trim()) &&
        packet.every((record) => record.publication?.trim()),
      "publication identifiers must be nonempty",
    ],
    [actual.size === records.length, "publication identifiers must be unique"],
    [[...expected].every((id) => actual.has(id)), "does not match the open-routed packet set"],
  ];
  return [
    ...checks.flatMap(([passed, message]) => (passed ? [] : [`${name}: ${message}`])),
    ...packetIdentityErrors(records, packet, name),
    ...fullTextRecordErrors(records, name),
  ];
}

export function supplementalArtifactErrors(verificationContent, exceptionContent, packetContent) {
  const verificationName =
    "companion/methodology/software-engineering-coverage/dblp-supplemental-full-text-verification-2026-08.csv";
  const exceptionName =
    "companion/methodology/software-engineering-coverage/dblp-full-text-access-exceptions-2026-08.csv";
  const missing = [
    ...(verificationContent ? [] : [`${verificationName}: required for a stable release`]),
    ...(exceptionContent ? [] : [`${exceptionName}: required for a stable release`]),
    ...(packetContent ? [] : [`${verificationName}: author-adjudication packet is missing`]),
  ];
  if (missing.length) return missing;
  let verificationDocument;
  let packet;
  try {
    verificationDocument = parseCsvDocument(verificationContent);
    packet = parseCsvRows(packetContent);
  } catch (error) {
    return [`${verificationName}: invalid CSV (${error.message})`];
  }
  let exceptionDocument;
  try {
    exceptionDocument = parseCsvDocument(exceptionContent);
  } catch (error) {
    return [`${exceptionName}: invalid CSV (${error.message})`];
  }
  const records = verificationDocument.records;
  const exceptions = exceptionDocument.records;
  const expected = new Set(
    packet
      .filter((record) => record.full_text_route === "closed_or_no_open_location")
      .map((record) => record.publication),
  );
  const recordIds = records.map((record) => record.publication);
  const exceptionIds = exceptions.map((record) => record.publication);
  const actual = new Set([...recordIds, ...exceptionIds]);
  const statuses = new Set([
    "publisher_landing_only",
    "browser_extract_without_stable_pdf_url",
    "repository_metadata_without_bitstream",
  ]);
  const verificationChecks = [
    [hasExactSchema(verificationDocument.header, FULL_TEXT_HEADERS), "schema must exactly match the full-text evidence contract"],
    [records.length === 13, "must contain 13 source-hashed supplemental records"],
    [
      [...recordIds, ...exceptionIds].every((publication) => publication?.trim()),
      "publication identifiers must be nonempty",
    ],
    [actual.size === records.length + exceptions.length, "verified records and exceptions must be unique and disjoint"],
    [
      expected.size === 16 && actual.size === 16 && [...expected].every((id) => actual.has(id)),
      "does not exactly partition the 16 closed-routed packet records",
    ],
  ];
  const exceptionChecks = [
    [hasExactSchema(exceptionDocument.header, ACCESS_EXCEPTION_HEADERS), "schema must exactly match the access-exception contract"],
    [exceptions.length === 3, "must contain three access exceptions"],
    [exceptions.every((record) => isValidIsoDate(record.last_checked)), "every exception requires a valid YYYY-MM-DD last_checked date"],
    [exceptions.every((record) => statuses.has(record.access_status)), "contains an invalid access_status"],
    [
      exceptions.every(
        (record) => record.checked_locations?.trim() && record.exclusion_boundary?.trim(),
      ),
      "every exception requires checked locations and an exclusion boundary",
    ],
  ];
  return [
    ...verificationChecks.flatMap(([passed, message]) =>
      passed ? [] : [`${verificationName}: ${message}`],
    ),
    ...exceptionChecks.flatMap(([passed, message]) =>
      passed ? [] : [`${exceptionName}: ${message}`],
    ),
    ...packetIdentityErrors(records, packet, verificationName),
    ...packetIdentityErrors(exceptions, packet, exceptionName),
    ...fullTextRecordErrors(records, verificationName),
  ];
}
