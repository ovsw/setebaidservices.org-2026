#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path, { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { getCliClient } from "sanity/cli";

const API_VERSION = "2026-03-23";
const EXPECTED_DATASET = "production";
const EXPECTED_PROJECT_ID = "bf76qlx9";
const EXPECTED_PAGES = [
  {
    _id: "3b3575d2-50b7-4b00-a3fb-aec97049151d",
    slug: "terms-and-conditions",
  },
  {
    _id: "4acbf47a-8a52-4d70-bcd6-440d0bdb4b1b",
    slug: "privacy-policy",
  },
  {
    _id: "638944a2-c341-4eec-ab28-d79cdca538fc",
    slug: "website-accessibility-policy",
  },
  {
    _id: "d3c9e613-97eb-4728-a148-e2a95508e356",
    slug: "contact",
  },
];
const EXPECTED_IDS = new Set(EXPECTED_PAGES.map((page) => page._id));
const EXPECTED_SLUGS = new Set(EXPECTED_PAGES.map((page) => page.slug));
const IMAGE_DIRECTIVE = /^image@file:\/\/\.\/images\/([^/]+)$/;

function argumentValue(name) {
  return process.argv
    .find((argument) => argument.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function readArchive(source) {
  const temporaryDirectory = mkdtempSync(path.join(tmpdir(), "cac-page-simple-"));

  try {
    const archiveListing = execFileSync("tar", ["-tzf", source], {
      encoding: "utf8",
      maxBuffer: 128 * 1024 * 1024,
    });
    const archiveRoot = archiveListing
      .split("\n")
      .find(Boolean)
      ?.split("/")[0];

    if (!archiveRoot) throw new Error("The source archive is empty");

    execFileSync("tar", ["-xzf", source, "-C", temporaryDirectory]);

    const extractedRoot = path.join(temporaryDirectory, archiveRoot);
    const documents = readFileSync(path.join(extractedRoot, "data.ndjson"), "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    const assetMetadata = JSON.parse(
      readFileSync(path.join(extractedRoot, "assets.json"), "utf8"),
    );

    return { archiveRoot, assetMetadata, documents, extractedRoot, temporaryDirectory };
  } catch (error) {
    rmSync(temporaryDirectory, { force: true, recursive: true });
    throw error;
  }
}

function collectImageFilenames(value, filenames = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectImageFilenames(item, filenames);
    return filenames;
  }
  if (!value || typeof value !== "object") return filenames;

  if (typeof value._sanityAsset === "string") {
    const filename = value._sanityAsset.match(IMAGE_DIRECTIVE)?.[1];
    if (filename) filenames.add(filename);
  }

  for (const item of Object.values(value)) collectImageFilenames(item, filenames);
  return filenames;
}

function transformPage(sourcePage) {
  if (!EXPECTED_IDS.has(sourcePage._id)) {
    throw new Error(`Unexpected pageSimple id: ${sourcePage._id}`);
  }
  if (sourcePage._type !== "pageSimple") {
    throw new Error(`${sourcePage._id}: expected pageSimple`);
  }
  if (typeof sourcePage.content?.title !== "string") {
    throw new Error(`${sourcePage._id}: missing content.title`);
  }
  if (typeof sourcePage.content?.slug?.current !== "string") {
    throw new Error(`${sourcePage._id}: missing content.slug.current`);
  }
  if (!EXPECTED_SLUGS.has(sourcePage.content.slug.current)) {
    throw new Error(
      `${sourcePage._id}: unexpected slug ${sourcePage.content.slug.current}`,
    );
  }
  if (!Array.isArray(sourcePage.content.body)) {
    throw new Error(`${sourcePage._id}: missing content.body`);
  }
  if (!sourcePage.content.image || typeof sourcePage.content.image !== "object") {
    throw new Error(`${sourcePage._id}: missing content.image`);
  }

  return {
    _id: sourcePage._id,
    _type: "page",
    title: sourcePage.content.title,
    slug: sourcePage.content.slug,
    migration: {
      _type: "pageMigration",
      sourceDocumentId: sourcePage._id,
      sourceDocumentType: "pageSimple",
      legacy: {
        _type: "legacyPage",
        content: {
          _type: "legacyPageContent",
          body: sourcePage.content.body,
          image: sourcePage.content.image,
        },
      },
    },
  };
}

function sourcePagesFrom(documents) {
  const drafts = documents.filter(
    (document) =>
      document._type === "pageSimple" && document._id.startsWith("drafts."),
  );
  const sourcePages = documents
    .filter(
      (document) =>
        document._type === "pageSimple" && !document._id.startsWith("drafts."),
    )
    .sort((left, right) => left._id.localeCompare(right._id));

  if (drafts.length !== 0) {
    throw new Error(`Expected no pageSimple drafts, found ${drafts.length}`);
  }
  if (sourcePages.length !== EXPECTED_PAGES.length) {
    throw new Error(
      `Expected ${EXPECTED_PAGES.length} pageSimple documents, found ${sourcePages.length}`,
    );
  }

  const transformed = sourcePages.map(transformPage);
  const actualIds = transformed.map((document) => document._id).sort();
  const expectedIds = [...EXPECTED_IDS].sort();
  if (!isDeepStrictEqual(actualIds, expectedIds)) {
    throw new Error(`pageSimple ids differ: ${actualIds.join(", ")}`);
  }

  return transformed;
}

function build() {
  const source = argumentValue("--source");
  const destination = argumentValue("--destination");
  if (!source || !destination) {
    throw new Error(
      "Usage: node scripts/import-page-simple.mjs --build --source=/path/source.tar.gz --destination=/path/destination.tar.gz",
    );
  }

  const archive = readArchive(resolve(source));
  try {
    const transformed = sourcePagesFrom(archive.documents);
    const filenames = [...collectImageFilenames(transformed)].sort();
    const destinationPath = resolve(destination);
    const outputRoot = path.join(archive.temporaryDirectory, "page-simple-import");

    rmSync(outputRoot, { force: true, recursive: true });
    mkdirSync(path.join(outputRoot, "images"), { recursive: true });
    writeFileSync(
      path.join(outputRoot, "data.ndjson"),
      `${transformed.map((document) => JSON.stringify(document)).join("\n")}\n`,
    );
    writeFileSync(path.join(outputRoot, "assets.json"), "{}\n");

    for (const filename of filenames) {
      cpSync(
        path.join(archive.extractedRoot, "images", filename),
        path.join(outputRoot, "images", filename),
      );
    }

    rmSync(destinationPath, { force: true });
    execFileSync("tar", [
      "-czf",
      destinationPath,
      "-C",
      archive.temporaryDirectory,
      "page-simple-import",
    ]);
    execFileSync("gzip", ["-t", destinationPath]);

    console.log(
      JSON.stringify(
        {
          mode: "build",
          destination: destinationPath,
          documents: transformed.length,
          imageFiles: filenames.length,
          ids: transformed.map((document) => document._id),
          slugs: transformed.map((document) => document.slug.current),
        },
        null,
        2,
      ),
    );
  } finally {
    rmSync(archive.temporaryDirectory, { force: true, recursive: true });
  }
}

function loadStudioEnv() {
  process.loadEnvFile(fileURLToPath(new URL("../.env.local", import.meta.url)));
}

function getClient() {
  loadStudioEnv();
  const client = getCliClient({ apiVersion: API_VERSION });
  const { dataset, projectId } = client.config();
  if (projectId !== EXPECTED_PROJECT_ID || dataset !== EXPECTED_DATASET) {
    throw new Error(
      `Refusing to run against ${projectId}/${dataset}; expected ${EXPECTED_PROJECT_ID}/${EXPECTED_DATASET}`,
    );
  }
  return client;
}

async function preflight() {
  const source = argumentValue("--source");
  if (!source) {
    throw new Error(
      "Usage: node scripts/import-page-simple.mjs --preflight --source=/path/source.tar.gz",
    );
  }

  const archive = readArchive(resolve(source));
  try {
    const transformed = sourcePagesFrom(archive.documents);
    const client = getClient();
    const collisions = await client.fetch(
      `{
        "idCollisions": *[_id in $ids]{_id, _type, "slug": slug.current},
        "slugCollisions": *[
          _type == "page" &&
          slug.current in $slugs &&
          !(_id in $ids) &&
          !(_id in path("drafts.**")) &&
          !(_id in path("versions.**"))
        ]{_id, _type, "slug": slug.current},
        "pageSimpleDrafts": count(*[
          _type == "pageSimple" &&
          _id in path("drafts.**")
        ])
      }`,
      {
        ids: transformed.map((document) => document._id),
        slugs: transformed.map((document) => document.slug.current),
      },
      { perspective: "raw" },
    );

    if (collisions.idCollisions.length) {
      throw new Error(
        `ID collisions: ${collisions.idCollisions.map(({ _id }) => _id).join(", ")}`,
      );
    }
    if (collisions.slugCollisions.length) {
      throw new Error(
        `Slug collisions: ${collisions.slugCollisions
          .map(({ _id, slug }) => `${slug} (${_id})`)
          .join(", ")}`,
      );
    }
    if (collisions.pageSimpleDrafts !== 0) {
      throw new Error(
        `Expected no pageSimple drafts in target, found ${collisions.pageSimpleDrafts}`,
      );
    }

    console.log(
      JSON.stringify(
        {
          mode: "preflight",
          projectId: EXPECTED_PROJECT_ID,
          dataset: EXPECTED_DATASET,
          documents: transformed.length,
          idCollisions: 0,
          slugCollisions: 0,
          pageSimpleDrafts: 0,
        },
        null,
        2,
      ),
    );
  } finally {
    rmSync(archive.temporaryDirectory, { force: true, recursive: true });
  }
}

async function audit() {
  const source = argumentValue("--source");
  if (!source) {
    throw new Error(
      "Usage: node scripts/import-page-simple.mjs --audit --source=/path/source.tar.gz",
    );
  }

  const archive = readArchive(resolve(source));
  try {
    const expected = sourcePagesFrom(archive.documents);
    const client = getClient();
    const actual = await client.fetch(
      `*[_id in $ids] | order(_id asc) {
        _id,
        _type,
        title,
        slug,
        "hasDescription": defined(description),
        "hasBlocks": defined(blocks),
        "hasMeta": defined(meta),
        migration
      }`,
      { ids: expected.map((document) => document._id) },
      { perspective: "raw" },
    );
    const actualById = new Map(actual.map((document) => [document._id, document]));

    for (const expectedDocument of expected) {
      const actualDocument = actualById.get(expectedDocument._id);
      if (!actualDocument) throw new Error(`${expectedDocument._id}: missing`);
      if (actualDocument._type !== "page") {
        throw new Error(`${expectedDocument._id}: expected _type page`);
      }
      if (actualDocument.title !== expectedDocument.title) {
        throw new Error(`${expectedDocument._id}: title differs`);
      }
      if (!isDeepStrictEqual(actualDocument.slug, expectedDocument.slug)) {
        throw new Error(`${expectedDocument._id}: slug differs`);
      }
      if (actualDocument.hasDescription) {
        throw new Error(`${expectedDocument._id}: description was set`);
      }
      if (actualDocument.hasBlocks) {
        throw new Error(`${expectedDocument._id}: blocks was set`);
      }
      if (actualDocument.hasMeta) {
        throw new Error(`${expectedDocument._id}: meta was set`);
      }

      const expectedMigration = expectedDocument.migration;
      const actualMigration = actualDocument.migration;
      const expectedImage = expectedMigration.legacy.content.image;
      const actualImage = actualMigration?.legacy?.content?.image;

      if (
        actualMigration?.sourceDocumentId !== expectedMigration.sourceDocumentId ||
        actualMigration?.sourceDocumentType !== "pageSimple"
      ) {
        throw new Error(`${expectedDocument._id}: migration source differs`);
      }
      if (
        !isDeepStrictEqual(
          actualMigration?.legacy?.content?.body,
          expectedMigration.legacy.content.body,
        )
      ) {
        throw new Error(`${expectedDocument._id}: legacy body differs`);
      }
      if (expectedImage._type !== actualImage?._type) {
        throw new Error(`${expectedDocument._id}: legacy image type differs`);
      }
      if (expectedImage.crop && !isDeepStrictEqual(actualImage.crop, expectedImage.crop)) {
        throw new Error(`${expectedDocument._id}: legacy image crop differs`);
      }
      if (
        expectedImage.hotspot &&
        !isDeepStrictEqual(actualImage.hotspot, expectedImage.hotspot)
      ) {
        throw new Error(`${expectedDocument._id}: legacy image hotspot differs`);
      }
      if (typeof actualImage.asset?._ref !== "string") {
        throw new Error(`${expectedDocument._id}: legacy image asset is missing`);
      }
    }

    console.log(
      JSON.stringify(
        {
          mode: "audit",
          projectId: EXPECTED_PROJECT_ID,
          dataset: EXPECTED_DATASET,
          documents: actual.length,
          ids: actual.map((document) => document._id),
          slugs: actual.map((document) => document.slug.current),
        },
        null,
        2,
      ),
    );
  } finally {
    rmSync(archive.temporaryDirectory, { force: true, recursive: true });
  }
}

if (process.argv.includes("--build")) build();
else if (process.argv.includes("--preflight")) await preflight();
else if (process.argv.includes("--audit")) await audit();
else {
  throw new Error(
    "Pass one mode: --build, --preflight, or --audit",
  );
}
