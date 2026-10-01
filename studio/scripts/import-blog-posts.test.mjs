import assert from "node:assert/strict";
import test from "node:test";

import {
  ARCHIVE_CATEGORY,
  transformAuthor,
  transformBody,
  transformExcerpt,
  transformPost,
} from "./import-blog-posts.mjs";

const sourceImage = {
  _sanityAsset: "image@file://./images/header.jpg",
  _type: "mainImage",
  alt: "Campers on the dock",
};

function sourcePost(overrides = {}) {
  return {
    _id: "post-1",
    _type: "post",
    content: {
      body: [
        {
          _key: "body-block",
          _type: "block",
          children: [
            {
              _key: "span",
              _type: "span",
              marks: ["link-key"],
              text: "Read more",
            },
          ],
          markDefs: [
            {
              _key: "link-key",
              _type: "link",
              blank: true,
              href: "/dates-and-rates/",
            },
          ],
        },
      ],
      excerpt: "A short summary.",
      image: sourceImage,
      publishedAt: "2022-04-14T12:00:00.000Z",
      slug: { _type: "slug", current: "camp-news" },
      title: "Camp News",
      ...overrides,
    },
  };
}

test("transformPost flattens the legacy post and preserves missing authors", () => {
  const post = transformPost(sourcePost());

  assert.equal(post.title, "Camp News");
  assert.equal(post.slug.current, "camp-news");
  assert.equal(post.author, undefined);
  assert.deepEqual(post.category, {
    _ref: ARCHIVE_CATEGORY._id,
    _type: "reference",
  });
  assert.equal(post.image._type, "image");
  assert.equal(post.image._sanityAsset, sourceImage._sanityAsset);
  assert.equal(post.excerpt[0].children[0].text, "A short summary.");
});

test("transformBody normalizes styles and converts legacy links", () => {
  const [block] = transformBody(sourcePost().content.body, "post-1");

  assert.equal(block.style, "normal");
  assert.deepEqual(block.markDefs, [
    {
      _key: "link-key",
      _type: "customLink",
      customLink: {
        _type: "customUrl",
        external: "/dates-and-rates/",
        openInNewTab: true,
        type: "external",
      },
    },
  ]);
});

test("transformBody preserves blockquotes and rejects unused legacy blocks", () => {
  const [blockquote] = transformBody(
    [{ ...sourcePost().content.body[0], markDefs: [], style: "blockquote" }],
    "post-1",
  );
  assert.equal(blockquote.style, "blockquote");

  assert.throws(
    () => transformBody([{ _key: "video", _type: "youtube" }], "post-1"),
    /unsupported body block youtube/,
  );
});

test("transformExcerpt creates stable Portable Text keys", () => {
  assert.deepEqual(transformExcerpt("Summary", "post-1"), [
    {
      _key: "excerpt-block",
      _type: "block",
      children: [
        {
          _key: "excerpt-span",
          _type: "span",
          marks: [],
          text: "Summary",
        },
      ],
      markDefs: [],
      style: "normal",
    },
  ]);
});

test("transformAuthor adds the required target slug", () => {
  assert.deepEqual(
    transformAuthor({
      _id: "1e0b4c24-36b1-404c-8c83-e95b29a167e6",
      _type: "author",
      name: "Anna Brady",
    }),
    {
      _id: "1e0b4c24-36b1-404c-8c83-e95b29a167e6",
      _type: "author",
      name: "Anna Brady",
      slug: { _type: "slug", current: "anna-brady" },
    },
  );
});
