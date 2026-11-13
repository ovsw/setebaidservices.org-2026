#!/usr/bin/env node
// Run Studio's own validation rules on one document: schema rules, custom
// rules, and warnings such as "two calls to action in a row". Content written
// by script or MCP never passes through Studio, so nothing else runs them.
// Checks the draft when one exists, else the published document.
// Exits 1 on any error or warning.
// Usage: pnpm page:check <document id>
//   pnpm page:check page-parents-guide

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { getCliClient } from "sanity/cli";

const id = process.argv[2]?.replace(/^drafts\./, "");
if (!id) {
  console.error("Usage: pnpm page:check <document id>");
  process.exit(1);
}

const client = getCliClient({ apiVersion: "2026-03-23" });
const documents = await client.fetch(
  "*[_id in [$draft, $id]]",
  { draft: `drafts.${id}`, id },
  { perspective: "raw" },
);
const document =
  documents.find((candidate) => candidate._id.startsWith("drafts.")) ??
  documents[0];
if (!document) {
  console.error(`No document with the id "${id}", draft or published.`);
  process.exit(1);
}
console.log(`Checking ${document._id} (${document._type})`);

const directory = mkdtempSync(path.join(os.tmpdir(), "page-check-"));
const file = path.join(directory, "document.ndjson");
writeFileSync(file, `${JSON.stringify(document)}\n`);
try {
  const result = spawnSync(
    "pnpm",
    ["exec", "sanity", "documents", "validate", "--file", file, "--level", "warning", "--format", "ndjson", "--yes"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  );
  if (result.error) throw result.error;
  const markers = result.stdout
    .split("\n")
    .filter((line) => line.startsWith("{"))
    .flatMap((line) => JSON.parse(line).markers ?? []);
  for (const marker of markers) {
    const where = (marker.path ?? [])
      .map((segment) => (typeof segment === "object" ? `[${segment._key}]` : segment))
      .join(".");
    console.log(`${marker.level}: ${where || "(document)"}: ${marker.message}`);
  }
  if (result.status !== 0 && markers.length === 0) {
    console.error(result.stdout);
    process.exit(result.status ?? 1);
  }
  if (markers.length > 0) {
    console.error(`${markers.length} problem(s). Fix every one before handing the draft over.`);
    process.exit(1);
  }
  console.log("Valid: no errors, no warnings.");
} finally {
  rmSync(directory, { recursive: true, force: true });
}
