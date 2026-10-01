import { execFile as execFileCallback } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const expectedPageCount = 46;
const allowedDocumentFields = ["_id", "_type", "migration", "slug", "title"];

function keepLegacyReferencesWeak(value) {
  if (Array.isArray(value)) return value.map(keepLegacyReferencesWeak);
  if (!value || typeof value !== "object") return value;

  const object = Object.fromEntries(
    Object.entries(value).map(([field, fieldValue]) => [
      field,
      keepLegacyReferencesWeak(fieldValue),
    ]),
  );

  return object._type === "reference" && typeof object._ref === "string"
    ? { ...object, _weak: true }
    : object;
}

const [sourceArgument, destinationArgument] = process.argv.slice(2);

if (!sourceArgument || !destinationArgument) {
  throw new Error(
    "Usage: node scripts/build-page-migration-import.mjs <source.tar.gz> <destination.tar.gz>",
  );
}

const source = path.resolve(sourceArgument);
const destination = path.resolve(destinationArgument);
const temporaryDirectory = await mkdtemp(
  path.join(tmpdir(), "cac-page-migration-"),
);

try {
  const { stdout: archiveListing } = await execFile("tar", ["-tzf", source], {
    maxBuffer: 128 * 1024 * 1024,
  });
  const archiveRoot = archiveListing
    .split("\n")
    .find(Boolean)
    ?.split("/")[0];

  if (!archiveRoot) throw new Error("The source archive is empty");

  await execFile("tar", ["-xzf", source, "-C", temporaryDirectory]);

  const extractedRoot = path.join(temporaryDirectory, archiveRoot);
  const dataPath = path.join(extractedRoot, "data.ndjson");
  const assetsPath = path.join(extractedRoot, "assets.json");
  const sourceDocuments = (await readFile(dataPath, "utf8"))
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));

  const draftPageIds = sourceDocuments
    .filter(
      (document) =>
        document._type === "page" && document._id.startsWith("drafts."),
    )
    .map((document) => document._id);
  const sourcePages = sourceDocuments.filter(
    (document) =>
      document._type === "page" && !document._id.startsWith("drafts."),
  );

  if (sourcePages.length !== expectedPageCount) {
    throw new Error(
      `Expected ${expectedPageCount} published pages, found ${sourcePages.length}`,
    );
  }

  const transformedPages = sourcePages.map((sourcePage) => {
    if (
      typeof sourcePage.content?.title !== "string" ||
      typeof sourcePage.content?.slug?.current !== "string"
    ) {
      throw new Error(`Page ${sourcePage._id} is missing its title or slug`);
    }

    const legacyFields = keepLegacyReferencesWeak(
      Object.fromEntries(
        Object.entries(sourcePage).filter(([field]) => !field.startsWith("_")),
      ),
    );
    const document = {
      _id: sourcePage._id,
      _type: "page",
      title: sourcePage.content.title,
      slug: sourcePage.content.slug,
      migration: {
        _type: "pageMigration",
        sourceDocumentId: sourcePage._id,
        sourceDocumentType: sourcePage._type,
        legacy: {
          _type: "legacyPage",
          ...legacyFields,
        },
      },
    };
    const fields = Object.keys(document).sort();

    if (JSON.stringify(fields) !== JSON.stringify(allowedDocumentFields)) {
      throw new Error(
        `Page ${sourcePage._id} has unexpected destination fields: ${fields.join(", ")}`,
      );
    }

    return document;
  });

  const duplicateIds = transformedPages
    .map((document) => document._id)
    .filter((id, index, ids) => ids.indexOf(id) !== index);

  if (duplicateIds.length) {
    throw new Error(`Duplicate page IDs: ${duplicateIds.join(", ")}`);
  }

  const assetManifest = JSON.parse(await readFile(assetsPath, "utf8"));
  const assetCount = Object.keys(assetManifest).length;
  const archiveEntries = archiveListing.split("\n").filter(Boolean);
  const imageFileCount = archiveEntries.filter((entry) =>
    entry.includes("/images/"),
  ).length - 1;
  const fileAssetCount = archiveEntries.filter((entry) =>
    entry.includes("/files/"),
  ).length - 1;

  if (assetCount !== imageFileCount + fileAssetCount) {
    throw new Error(
      `Asset manifest has ${assetCount} entries but the archive has ${imageFileCount + fileAssetCount} files`,
    );
  }

  await writeFile(
    dataPath,
    `${transformedPages.map((document) => JSON.stringify(document)).join("\n")}\n`,
  );
  await rm(destination, { force: true });
  await execFile("tar", [
    "-czf",
    destination,
    "-C",
    temporaryDirectory,
    archiveRoot,
  ]);
  await execFile("gzip", ["-t", destination]);

  console.log(
    JSON.stringify(
      {
        destination,
        excludedDraftPageIds: draftPageIds,
        pageCount: transformedPages.length,
        assetCount,
        imageFileCount,
        fileAssetCount,
      },
      null,
      2,
    ),
  );
} finally {
  await rm(temporaryDirectory, { force: true, recursive: true });
}
