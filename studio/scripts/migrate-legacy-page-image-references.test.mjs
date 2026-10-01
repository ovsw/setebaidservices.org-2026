import assert from "node:assert/strict";
import test from "node:test";
import {
  createAssetResolver,
  normalizeAssetFilename,
  transformImageReferences,
} from "./migrate-legacy-page-image-references.mjs";

const sourceAssets = {
  "image-1111111111111111111111111111111111111111": {
    originalFilename: " Lake View .JPG",
  },
  "image-2222222222222222222222222222222222222222": {
    originalFilename: "Campers Tubing.jpg",
  },
  "image-3333333333333333333333333333333333333333": {
    originalFilename: "Campers Tubing.jpeg",
  },
};

test("normalizes Raster names against legacy filenames", () => {
  assert.equal(normalizeAssetFilename(" Lake View .JPG"), "lake view");
  assert.equal(normalizeAssetFilename("lake view"), "lake view");
});

test("matches exact hashes before normalized filenames", () => {
  const exactAsset = {
    _id: "image-1111111111111111111111111111111111111111-1200x800-jpg",
    originalFilename: "Lake View",
    sha1hash: "1111111111111111111111111111111111111111",
  };
  const resolver = createAssetResolver(sourceAssets, [exactAsset]);

  assert.deepEqual(
    resolver.resolveReference(
      "image-1111111111111111111111111111111111111111-1200x800-jpg",
    ),
    {
      assetId: exactAsset._id,
      method: "exact-hash",
      sourceHash: "1111111111111111111111111111111111111111",
    },
  );
});

test("uses a unique normalized filename when Raster changed the bytes", () => {
  const rasterAsset = {
    _id: "image-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-1200x800-jpg",
    originalFilename: "Lake View",
    sha1hash: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  };
  const resolver = createAssetResolver(sourceAssets, [rasterAsset]);

  assert.equal(
    resolver.resolveReference(
      "image-1111111111111111111111111111111111111111-1200x800-jpg",
    ).assetId,
    rasterAsset._id,
  );
});

test("refuses ambiguous filename matches", () => {
  const resolver = createAssetResolver(sourceAssets, [
    {
      _id: "image-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-1200x800-jpg",
      originalFilename: "Campers Tubing",
      sha1hash: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    },
    {
      _id: "image-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb-1200x800-jpg",
      originalFilename: "Campers Tubing",
      sha1hash: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    },
  ]);

  assert.throws(
    () =>
      resolver.resolveReference(
        "image-2222222222222222222222222222222222222222-1200x800-jpg",
      ),
    /has 2 source and 2 current matches/,
  );
});

test("replaces weak legacy references and preserves surrounding values", () => {
  const targetId =
    "image-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-1200x800-jpg";
  const transformed = transformImageReferences(
    {
      caption: "Lake",
      image: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: "image-1111111111111111111111111111111111111111-1200x800-jpg",
          _weak: true,
        },
      },
    },
    () => ({
      assetId: targetId,
      method: "unique-filename",
      sourceHash: "1111111111111111111111111111111111111111",
    }),
  );

  assert.deepEqual(transformed.value, {
    caption: "Lake",
    image: {
      _type: "image",
      asset: { _type: "reference", _ref: targetId },
    },
  });
  assert.equal(transformed.imageReferences, 1);
  assert.equal(transformed.referencesChanged, 1);
});

test("leaves an already migrated strong reference unchanged", () => {
  const targetId =
    "image-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-1200x800-jpg";
  const reference = { _type: "reference", _ref: targetId };
  const transformed = transformImageReferences(reference, () => ({
    assetId: targetId,
    method: "already-current",
  }));

  assert.deepEqual(transformed.value, reference);
  assert.equal(transformed.referencesChanged, 0);
});
