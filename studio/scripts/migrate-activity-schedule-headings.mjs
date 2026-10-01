#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { assertCacProductionTarget } from "./assert-cac-production-target.mjs";

const API_VERSION = "2026-03-23";
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const defaultBackupPath = resolve(
  scriptDirectory,
  "../backups/activity-schedule-headings.json",
);

const createKey = (documentId, sectionKey, suffix) =>
  Buffer.from(`${documentId}:${sectionKey}:${suffix}`)
    .toString("base64url")
    .slice(0, 24);

const stringToHeading = (text, documentId, sectionKey) => [
  {
    _key: createKey(documentId, sectionKey, "block"),
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: createKey(documentId, sectionKey, "span"),
        _type: "span",
        marks: [],
        text,
      },
    ],
  },
];

export const headingToPlainText = (heading) =>
  heading
    .map((block) =>
      (block.children ?? []).map((child) => child.text ?? "").join(""),
    )
    .join("\n");

export function createActivityScheduleHeadingPlan(document) {
  const sections = (document.blocks ?? []).flatMap((section) => {
    if (section?._type !== "activitySchedule" || typeof section.heading !== "string") {
      return [];
    }
    if (!section._key || !/^[A-Za-z0-9_-]+$/.test(section._key)) {
      throw new Error(`${document._id}: Activity Schedule has an invalid _key`);
    }
    if (!section.heading.trim()) {
      throw new Error(`${document._id}: Activity Schedule has an empty string heading`);
    }

    return [
      {
        _key: section._key,
        originalHeading: section.heading,
        heading: stringToHeading(section.heading, document._id, section._key),
        path: `blocks[_key=="${section._key}"].heading`,
      },
    ];
  });

  return { _id: document._id, _rev: document._rev, sections };
}

const backupPathFromArgs = () => {
  const argument = process.argv.find((value) => value.startsWith("--backup="));
  return argument ? resolve(argument.slice("--backup=".length)) : defaultBackupPath;
};

const assertBackupMatchesPlans = (backup, plans, projectId, dataset) => {
  if (backup.projectId !== projectId || backup.dataset !== dataset) {
    throw new Error("Backup target does not match the configured Sanity dataset");
  }

  const expected = plans.map(({ _id, _rev, sections }) => ({
    _id,
    _rev,
    headings: sections.map(({ _key, originalHeading }) => ({
      _key,
      heading: originalHeading,
    })),
  }));
  if (!isDeepStrictEqual(backup.documents, expected)) {
    throw new Error("Backup does not match the current migration plan; run a new dry run");
  }
};

async function run() {
  const apply = process.argv.includes("--apply");
  const backupPath = backupPathFromArgs();
  const { getCliClient } = await import("sanity/cli");
  const client = getCliClient({ apiVersion: API_VERSION });
  const { dataset, projectId } = client.config();

  assertCacProductionTarget({ dataset, projectId });

  const documents = await client.fetch(
    `*[count(blocks[_type == "activitySchedule"]) > 0] | order(_id asc) {
      _id,
      _rev,
      blocks
    }`,
    {},
    { perspective: "raw" },
  );
  const plans = documents
    .map(createActivityScheduleHeadingPlan)
    .filter(({ sections }) => sections.length > 0);
  const summary = {
    mode: apply ? "apply" : "dry-run",
    projectId,
    dataset,
    documents: plans.length,
    headings: plans.reduce((total, plan) => total + plan.sections.length, 0),
    ids: plans.map(({ _id }) => _id),
    backupPath,
  };

  console.log(JSON.stringify(summary, null, 2));
  if (plans.length === 0) return;

  if (!apply) {
    const backup = {
      projectId,
      dataset,
      createdAt: new Date().toISOString(),
      documents: plans.map(({ _id, _rev, sections }) => ({
        _id,
        _rev,
        headings: sections.map(({ _key, originalHeading }) => ({
          _key,
          heading: originalHeading,
        })),
      })),
    };
    await mkdir(dirname(backupPath), { recursive: true });
    await writeFile(backupPath, `${JSON.stringify(backup, null, 2)}\n`, {
      flag: "wx",
    });
    console.log(`Backup written to ${backupPath}`);
    return;
  }

  const backup = JSON.parse(await readFile(backupPath, "utf8"));
  assertBackupMatchesPlans(backup, plans, projectId, dataset);

  for (const plan of plans) {
    let patch = client.patch(plan._id).ifRevisionId(plan._rev);
    for (const section of plan.sections) {
      patch = patch.set({ [section.path]: section.heading });
    }
    await patch.commit({ visibility: "sync" });
  }

  const migrated = await client.fetch(
    `*[_id in $ids] | order(_id asc) { _id, blocks }`,
    { ids: plans.map(({ _id }) => _id) },
    { perspective: "raw" },
  );
  const migratedById = new Map(migrated.map((document) => [document._id, document]));

  for (const plan of plans) {
    const document = migratedById.get(plan._id);
    if (!document) throw new Error(`${plan._id}: missing after migration`);
    for (const section of plan.sections) {
      const migratedSection = document.blocks?.find(
        (block) => block?._key === section._key && block?._type === "activitySchedule",
      );
      if (!Array.isArray(migratedSection?.heading)) {
        throw new Error(`${plan._id}/${section._key}: heading is not rich text`);
      }
      if (headingToPlainText(migratedSection.heading) !== section.originalHeading) {
        throw new Error(`${plan._id}/${section._key}: heading words changed`);
      }
    }
  }

  console.log(`Migrated and audited ${summary.headings} Activity Schedule heading(s).`);
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRun) await run();
