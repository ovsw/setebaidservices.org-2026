#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
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

const API_VERSION = "2026-08-24";
const EXPECTED_DATASET = "production";
const EXPECTED_POST_COUNT = 54;
const EXPECTED_POST_FINGERPRINT =
  "8c80d7ec1fb1e9bbdaecd08c2d5f958bf2535bee94838d34f4386f14e7da2be3";
const EXPECTED_PROJECT_ID = "bf76qlx9";
const IMAGE_DIRECTIVE = /^image@file:\/\/\.\/images\/([^/]+)$/;

const ARCHIVE_CATEGORY = {
  _id: "cac-blog-archive",
  _type: "category",
  description: "Posts imported from the previous Canadian Adventure Camp website.",
  slug: { _type: "slug", current: "archive" },
  title: "Archive",
};

const EXPECTED_AUTHORS = [
  {
    _id: "1e0b4c24-36b1-404c-8c83-e95b29a167e6",
    name: "Anna Brady",
    slug: "anna-brady",
  },
  {
    _id: "3100e2cf-5d72-43cb-9336-72da91cf9928",
    name: "Justin Gerson",
    slug: "justin-gerson",
  },
  {
    _id: "e4e6a7b4-4063-4aad-9595-a3a180b6b520",
    name: "Anna Gerson",
    slug: "anna-gerson",
  },
];
const EXPECTED_AUTHOR_BY_ID = new Map(
  EXPECTED_AUTHORS.map((author) => [author._id, author]),
);
const SUPPORTED_BLOCK_STYLES = new Set([
  "normal",
  "h2",
  "h3",
  "h4",
  "blockquote",
]);

function argumentValue(name) {
  return process.argv
    .find((argument) => argument.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function readArchive(source) {
  const temporaryDirectory = mkdtempSync(path.join(tmpdir(), "cac-blog-import-"));

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

    return { assetMetadata, documents, extractedRoot, temporaryDirectory };
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

function transformLink(markDefinition, postId) {
  if (markDefinition._type !== "link") {
    throw new Error(`${postId}: unsupported annotation ${markDefinition._type}`);
  }
  if (typeof markDefinition.href !== "string" || !markDefinition.href.trim()) {
    throw new Error(`${postId}: link ${markDefinition._key} is missing href`);
  }

  return {
    _key: markDefinition._key,
    _type: "customLink",
    customLink: {
      _type: "customUrl",
      external: markDefinition.href,
      openInNewTab: markDefinition.blank === true,
      type: "external",
    },
  };
}

function transformBody(body, postId) {
  if (!Array.isArray(body)) throw new Error(`${postId}: missing content.body`);

  return body.map((block) => {
    if (block?._type !== "block") {
      throw new Error(`${postId}: unsupported body block ${block?._type}`);
    }

    const style = block.style || "normal";
    if (!SUPPORTED_BLOCK_STYLES.has(style)) {
      throw new Error(`${postId}: unsupported block style ${style}`);
    }

    return {
      ...block,
      markDefs: (block.markDefs ?? []).map((markDefinition) =>
        transformLink(markDefinition, postId),
      ),
      style,
    };
  });
}

function transformExcerpt(excerpt, postId) {
  if (typeof excerpt !== "string" || !excerpt.trim()) {
    throw new Error(`${postId}: missing content.excerpt`);
  }

  return [
    {
      _key: "excerpt-block",
      _type: "block",
      children: [
        {
          _key: "excerpt-span",
          _type: "span",
          marks: [],
          text: excerpt,
        },
      ],
      markDefs: [],
      style: "normal",
    },
  ];
}

function transformAuthor(sourceAuthor) {
  const expected = EXPECTED_AUTHOR_BY_ID.get(sourceAuthor._id);
  if (!expected || sourceAuthor.name !== expected.name) {
    throw new Error(`Unexpected author ${sourceAuthor._id}: ${sourceAuthor.name}`);
  }

  return {
    _id: sourceAuthor._id,
    _type: "author",
    name: sourceAuthor.name,
    slug: { _type: "slug", current: expected.slug },
  };
}

function requireString(value, path, postId) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${postId}: missing ${path}`);
  }
  return value;
}

function transformPost(sourcePost) {
  const postId = sourcePost._id;
  const content = sourcePost.content;
  if (sourcePost._type !== "post") throw new Error(`${postId}: expected post`);
  if (!content || typeof content !== "object") {
    throw new Error(`${postId}: missing content`);
  }

  const title = requireString(content.title, "content.title", postId);
  if (title.length > 96) throw new Error(`${postId}: title exceeds 96 characters`);
  const slug = requireString(content.slug?.current, "content.slug.current", postId);
  const publishedAt = requireString(
    content.publishedAt,
    "content.publishedAt",
    postId,
  );
  if (!content.image || typeof content.image !== "object") {
    throw new Error(`${postId}: missing content.image`);
  }
  if (typeof content.image._sanityAsset !== "string") {
    throw new Error(`${postId}: image asset directive is missing`);
  }
  requireString(content.image.alt, "content.image.alt", postId);

  const authorRef = content.author?._ref;
  if (authorRef && !EXPECTED_AUTHOR_BY_ID.has(authorRef)) {
    throw new Error(`${postId}: unexpected author reference ${authorRef}`);
  }

  return {
    _id: postId,
    _type: "post",
    ...(authorRef
      ? { author: { _ref: authorRef, _type: "reference" } }
      : {}),
    body: transformBody(content.body, postId),
    category: { _ref: ARCHIVE_CATEGORY._id, _type: "reference" },
    excerpt: transformExcerpt(content.excerpt, postId),
    image: { ...content.image, _type: "image" },
    publishedAt,
    slug: { ...content.slug, _type: "slug" },
    title,
  };
}

function postFingerprint(posts) {
  const inventory = posts
    .map((post) => `${post._id}|${post.content?.slug?.current ?? ""}`)
    .sort()
    .join("\n");
  return createHash("sha256").update(inventory).digest("hex");
}

function sourceDocumentsFrom(documents) {
  const postDrafts = documents.filter(
    (document) => document._type === "post" && document._id.startsWith("drafts."),
  );
  const authorDrafts = documents.filter(
    (document) => document._type === "author" && document._id.startsWith("drafts."),
  );
  if (postDrafts.length || authorDrafts.length) {
    throw new Error(
      `Expected no post or author drafts, found ${postDrafts.length + authorDrafts.length}`,
    );
  }

  const sourcePosts = documents
    .filter(
      (document) =>
        document._type === "post" && !document._id.startsWith("drafts."),
    )
    .sort((left, right) => left._id.localeCompare(right._id));
  if (sourcePosts.length !== EXPECTED_POST_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_POST_COUNT} posts, found ${sourcePosts.length}`,
    );
  }
  const fingerprint = postFingerprint(sourcePosts);
  if (fingerprint !== EXPECTED_POST_FINGERPRINT) {
    throw new Error(`Post inventory fingerprint differs: ${fingerprint}`);
  }

  const sourceAuthors = documents
    .filter(
      (document) =>
        document._type === "author" && !document._id.startsWith("drafts."),
    )
    .sort((left, right) => left._id.localeCompare(right._id));
  if (sourceAuthors.length !== EXPECTED_AUTHORS.length) {
    throw new Error(
      `Expected ${EXPECTED_AUTHORS.length} authors, found ${sourceAuthors.length}`,
    );
  }

  const posts = sourcePosts.map(transformPost);
  const slugs = posts.map((post) => post.slug.current);
  if (new Set(slugs).size !== slugs.length) throw new Error("Post slugs are not unique");

  return [
    ARCHIVE_CATEGORY,
    ...sourceAuthors.map(transformAuthor),
    ...posts,
  ];
}

function build() {
  const source = argumentValue("--source");
  const destination = argumentValue("--destination");
  if (!source || !destination) {
    throw new Error(
      "Usage: node scripts/import-blog-posts.mjs --build --source=/path/source.tar.gz --destination=/path/destination.tar.gz",
    );
  }

  const archive = readArchive(resolve(source));
  try {
    const transformed = sourceDocumentsFrom(archive.documents);
    const filenames = [...collectImageFilenames(transformed)].sort();
    if (filenames.length !== EXPECTED_POST_COUNT) {
      throw new Error(
        `Expected ${EXPECTED_POST_COUNT} image files, found ${filenames.length}`,
      );
    }

    const destinationPath = resolve(destination);
    const outputRoot = path.join(archive.temporaryDirectory, "blog-post-import");
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
      "blog-post-import",
    ]);
    execFileSync("gzip", ["-t", destinationPath]);

    console.log(
      JSON.stringify(
        {
          authors: EXPECTED_AUTHORS.length,
          category: ARCHIVE_CATEGORY.slug.current,
          destination: destinationPath,
          documents: transformed.length,
          imageFiles: filenames.length,
          mode: "build",
          posts: EXPECTED_POST_COUNT,
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
      "Usage: node scripts/import-blog-posts.mjs --preflight --source=/path/source.tar.gz",
    );
  }

  const archive = readArchive(resolve(source));
  try {
    const transformed = sourceDocumentsFrom(archive.documents);
    const posts = transformed.filter((document) => document._type === "post");
    const authors = transformed.filter((document) => document._type === "author");
    const client = getClient();
    const collisions = await client.fetch(
      `{
        "idCollisions": *[_id in $ids]{_id, _type},
        "postSlugCollisions": *[
          _type == "post" &&
          slug.current in $postSlugs &&
          !(_id in path("drafts.**")) &&
          !(_id in path("versions.**"))
        ]{_id, "slug": slug.current},
        "authorSlugCollisions": *[
          _type == "author" &&
          slug.current in $authorSlugs &&
          !(_id in path("drafts.**")) &&
          !(_id in path("versions.**"))
        ]{_id, "slug": slug.current},
        "categorySlugCollisions": *[
          _type == "category" &&
          slug.current == $categorySlug &&
          !(_id in path("drafts.**")) &&
          !(_id in path("versions.**"))
        ]{_id, "slug": slug.current},
        "targetPostCount": count(*[
          _type == "post" &&
          !(_id in path("drafts.**")) &&
          !(_id in path("versions.**"))
        ])
      }`,
      {
        authorSlugs: authors.map((author) => author.slug.current),
        categorySlug: ARCHIVE_CATEGORY.slug.current,
        ids: transformed.map((document) => document._id),
        postSlugs: posts.map((post) => post.slug.current),
      },
      { perspective: "raw" },
    );

    for (const [name, values] of Object.entries(collisions)) {
      if (Array.isArray(values) && values.length) {
        throw new Error(
          `${name}: ${values.map(({ _id, slug }) => slug ? `${slug} (${_id})` : _id).join(", ")}`,
        );
      }
    }
    if (collisions.targetPostCount !== 0) {
      throw new Error(
        `Expected an empty target post collection, found ${collisions.targetPostCount}`,
      );
    }

    console.log(
      JSON.stringify(
        {
          authors: authors.length,
          category: ARCHIVE_CATEGORY.slug.current,
          dataset: EXPECTED_DATASET,
          idCollisions: 0,
          mode: "preflight",
          posts: posts.length,
          projectId: EXPECTED_PROJECT_ID,
          slugCollisions: 0,
        },
        null,
        2,
      ),
    );
  } finally {
    rmSync(archive.temporaryDirectory, { force: true, recursive: true });
  }
}

function comparablePost(document) {
  const { asset, _sanityAsset, ...image } = document.image ?? {};
  return {
    _id: document._id,
    _type: document._type,
    author: document.author ?? undefined,
    body: document.body,
    category: document.category,
    excerpt: document.excerpt,
    image,
    publishedAt: document.publishedAt,
    slug: document.slug,
    title: document.title,
  };
}

async function audit() {
  const source = argumentValue("--source");
  if (!source) {
    throw new Error(
      "Usage: node scripts/import-blog-posts.mjs --audit --source=/path/source.tar.gz",
    );
  }

  const archive = readArchive(resolve(source));
  try {
    const expected = sourceDocumentsFrom(archive.documents);
    const client = getClient();
    const actual = await client.fetch(
      `*[_id in $ids] | order(_id asc) {
        _id,
        _type,
        name,
        title,
        slug,
        description,
        excerpt,
        author,
        publishedAt,
        image,
        category,
        body,
        "hasMeta": defined(meta)
      }`,
      { ids: expected.map((document) => document._id) },
      { perspective: "raw" },
    );
    const actualById = new Map(actual.map((document) => [document._id, document]));
    const imageAssetRefs = new Set();

    for (const expectedDocument of expected) {
      const actualDocument = actualById.get(expectedDocument._id);
      if (!actualDocument) throw new Error(`${expectedDocument._id}: missing`);
      if (actualDocument.hasMeta) {
        throw new Error(`${expectedDocument._id}: unexpected meta field`);
      }

      if (expectedDocument._type === "post") {
        if (
          !isDeepStrictEqual(
            comparablePost(actualDocument),
            comparablePost(expectedDocument),
          )
        ) {
          throw new Error(`${expectedDocument._id}: imported post differs`);
        }
        if (typeof actualDocument.image?.asset?._ref !== "string") {
          throw new Error(`${expectedDocument._id}: image asset is missing`);
        }
        imageAssetRefs.add(actualDocument.image.asset._ref);
        continue;
      }

      const comparableActual =
        expectedDocument._type === "author"
          ? {
              _id: actualDocument._id,
              _type: actualDocument._type,
              name: actualDocument.name,
              slug: actualDocument.slug,
            }
          : {
              _id: actualDocument._id,
              _type: actualDocument._type,
              description: actualDocument.description,
              slug: actualDocument.slug,
              title: actualDocument.title,
            };
      if (!isDeepStrictEqual(comparableActual, expectedDocument)) {
        throw new Error(`${expectedDocument._id}: imported document differs`);
      }
    }

    if (imageAssetRefs.size !== EXPECTED_POST_COUNT) {
      throw new Error(
        `Expected ${EXPECTED_POST_COUNT} unique post images, found ${imageAssetRefs.size}`,
      );
    }

    console.log(
      JSON.stringify(
        {
          authors: actual.filter((document) => document._type === "author").length,
          categories: actual.filter((document) => document._type === "category")
            .length,
          dataset: EXPECTED_DATASET,
          documents: actual.length,
          imageAssets: imageAssetRefs.size,
          mode: "audit",
          posts: actual.filter((document) => document._type === "post").length,
          projectId: EXPECTED_PROJECT_ID,
        },
        null,
        2,
      ),
    );
  } finally {
    rmSync(archive.temporaryDirectory, { force: true, recursive: true });
  }
}

export {
  ARCHIVE_CATEGORY,
  collectImageFilenames,
  sourceDocumentsFrom,
  transformAuthor,
  transformBody,
  transformExcerpt,
  transformLink,
  transformPost,
};

const isMain = process.argv[1]
  ? resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isMain) {
  if (process.argv.includes("--build")) build();
  else if (process.argv.includes("--preflight")) await preflight();
  else if (process.argv.includes("--audit")) await audit();
  else throw new Error("Pass one mode: --build, --preflight, or --audit");
}
