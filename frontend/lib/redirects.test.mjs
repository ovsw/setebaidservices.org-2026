import assert from "node:assert/strict";
import test from "node:test";

import { compileNextRedirects } from "./redirects.mjs";

test("compiles permanent and temporary redirects without ending slashes", () => {
  assert.deepEqual(
    compileNextRedirects([
      {
        source: { current: "/old/" },
        destination: { current: "/new/" },
        permanent: "true",
        status: "active",
      },
      {
        source: { current: "/temp" },
        destination: { current: "/later" },
        permanent: "false",
        status: "active",
      },
    ]),
    [
      { source: "/old", destination: "/new", statusCode: 301 },
      { source: "/temp", destination: "/later", statusCode: 302 },
    ],
  );
});

test("allows shared destinations, ignores inactive records, and deduplicates retries", () => {
  assert.deepEqual(
    compileNextRedirects([
      { source: "/one", destination: "/target", permanent: true },
      { source: "/two", destination: "/target", permanent: true },
      { source: "/off", destination: "/target", permanent: true, status: "inactive" },
      { source: "/one/", destination: "/target/", permanent: "true" },
    ]),
    [
      { source: "/one", destination: "/target", statusCode: 301 },
      { source: "/two", destination: "/target", statusCode: 301 },
    ],
  );
});

test("rejects conflicting sources, self redirects, chains, and cycles", () => {
  assert.throws(
    () =>
      compileNextRedirects([
        { source: "/old", destination: "/one", permanent: true },
        { source: "/old/", destination: "/two", permanent: true },
      ]),
    /Conflicting redirects share the source \/old/,
  );
  assert.throws(
    () => compileNextRedirects([{ source: "/same", destination: "/same/" }]),
    /source and destination are the same/,
  );
  assert.throws(
    () =>
      compileNextRedirects([
        { source: "/a", destination: "/b" },
        { source: "/b", destination: "/c" },
      ]),
    /chain or cycle/,
  );
  assert.throws(
    () =>
      compileNextRedirects([
        { source: "/a", destination: "/b" },
        { source: "/b", destination: "/a" },
      ]),
    /chain or cycle/,
  );
});

test("rejects unsafe paths and application-owned sources", () => {
  for (const source of [
    "https://example.com/old",
    "/bad\\source",
    "/old?preview=true",
    "/api/draft-mode/enable",
    "/stories/2",
    "/contact/thanks",
  ]) {
    assert.throws(
      () => compileNextRedirects([{ source, destination: "/target" }]),
      /missing a valid internal|reserved by the application/,
      source,
    );
  }
  assert.throws(
    () => compileNextRedirects([{ source: "/source", destination: "/bad#target" }]),
    /missing a valid internal/,
  );
});

test("tags QR redirects and always makes them temporary", () => {
  assert.deepEqual(
    compileNextRedirects([
      {
        source: { current: "/go/chop-nurses" },
        destination: "/go/events",
        permanent: "true",
        utmSource: "chop-nurses",
        utmCampaign: "fall-2026-events",
      },
      {
        source: "/go/t1d-summit",
        destination: "/go/events",
        permanent: "false",
        utmSource: "t1d-summit",
        utmCampaign: "fall-2026-events",
      },
    ]),
    [
      {
        source: "/go/chop-nurses",
        destination:
          "/go/events?utm_source=chop-nurses&utm_medium=qr-card&utm_campaign=fall-2026-events",
        statusCode: 302,
      },
      {
        source: "/go/t1d-summit",
        destination:
          "/go/events?utm_source=t1d-summit&utm_medium=qr-card&utm_campaign=fall-2026-events",
        statusCode: 302,
      },
    ],
  );
});

test("rejects invalid QR tags and QR sources outside /go/", () => {
  for (const tags of [
    { utmSource: "Chop Nurses", utmCampaign: "fall-2026" },
    { utmSource: "chop&x=1", utmCampaign: "fall-2026" },
    { utmSource: "chop-nurses", utmCampaign: "fall 2026" },
    { utmSource: "chop-nurses" },
    { utmCampaign: "fall-2026" },
  ]) {
    assert.throws(
      () => compileNextRedirects([{ source: "/go/chop", destination: "/target", ...tags }]),
      /invalid source name or campaign tag/,
      JSON.stringify(tags),
    );
  }
  assert.throws(
    () =>
      compileNextRedirects([
        { source: "/chop", destination: "/target", utmSource: "chop", utmCampaign: "fall" },
      ]),
    /must start with \/go\//,
  );
});

test("keeps conflict and chain rules for QR redirects", () => {
  const qr = { utmSource: "chop", utmCampaign: "fall" };
  assert.throws(
    () =>
      compileNextRedirects([
        { source: "/go/chop", destination: "/target", ...qr },
        { source: "/go/chop", destination: "/target", ...qr, utmCampaign: "spring" },
      ]),
    /Conflicting redirects/,
  );
  assert.throws(
    () =>
      compileNextRedirects([
        { source: "/go/chop", destination: "/go/old", ...qr },
        { source: "/go/old", destination: "/target" },
      ]),
    /chain or cycle/,
  );
  assert.throws(
    () => compileNextRedirects([{ source: "/go/chop", destination: "/go/chop", ...qr }]),
    /source and destination are the same/,
  );
});
