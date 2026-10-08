import { beforeEach, describe, expect, it } from "vitest";
import {
  currentVisitSource,
  parseVisitSource,
  recordVisitSource,
  resolveVisitSource,
} from "./visit-source";

const origin = "https://www.example.com";
const qrLanding =
  "/go/events?utm_source=chop-nurses&utm_medium=qr-card&utm_campaign=fall-2026-events";

function at(path: string) {
  return new URL(path, origin);
}

describe("resolveVisitSource", () => {
  it("gives a tagged landing its source and removes the tags", () => {
    expect(resolveVisitSource(at(qrLanding), null)).toEqual({
      visit: {
        source: "chop-nurses",
        medium: "qr-card",
        campaign: "fall-2026-events",
      },
      cleanedPath: "/go/events",
      qrScan: true,
    });
  });

  it("keeps other query values and the hash when it removes the tags", () => {
    const resolved = resolveVisitSource(
      at("/ask-about-camp?utm_source=newsletter&utm_medium=email&utm_content=x&ref=a#form"),
      null,
    );

    expect(resolved.cleanedPath).toBe("/ask-about-camp?ref=a#form");
    expect(resolved.visit).toEqual({ source: "newsletter", medium: "email" });
    expect(resolved.qrScan).toBe(false);
  });

  it("gives an untagged /go page the page's name", () => {
    expect(resolveVisitSource(at("/go/events"), null)).toEqual({
      visit: { source: "go-events" },
      cleanedPath: undefined,
      qrScan: false,
    });
  });

  it("gives any other untagged visit the source direct", () => {
    expect(resolveVisitSource(at("/dates-and-prices"), null).visit).toEqual({
      source: "direct",
    });
    expect(resolveVisitSource(at("/go"), null).visit).toEqual({ source: "direct" });
  });

  it("keeps the tab's source on later untagged pages", () => {
    const stored = { source: "chop-nurses", medium: "qr-card" };

    expect(resolveVisitSource(at("/ask-about-camp"), stored).visit).toBe(stored);
    expect(resolveVisitSource(at("/go/doctor"), stored).visit).toBe(stored);
  });

  it("lets a newer tagged landing replace an older one", () => {
    const stored = { source: "chop-nurses", medium: "qr-card" };
    const resolved = resolveVisitSource(
      at("/go/events?utm_source=t1d-summit&utm_medium=qr-card"),
      stored,
    );

    expect(resolved.visit).toEqual({ source: "t1d-summit", medium: "qr-card" });
    expect(resolved.qrScan).toBe(true);
  });

  it("names an unreadable source unknown and drops unreadable tags", () => {
    const resolved = resolveVisitSource(
      at("/?utm_source=%3Cscript%3E&utm_medium=qr-card&utm_campaign=Fall%202026"),
      null,
    );

    expect(resolved.visit).toEqual({ source: "unknown", medium: "qr-card" });
    expect(resolved.cleanedPath).toBe("/");
  });

  it("removes tags without a source but keeps the tab's source", () => {
    const resolved = resolveVisitSource(at("/donate?utm_medium=qr-card"), null);

    expect(resolved).toEqual({
      visit: { source: "direct" },
      cleanedPath: "/donate",
      qrScan: false,
    });
  });
});

describe("parseVisitSource", () => {
  it("reads a stored source", () => {
    expect(
      parseVisitSource('{"source":"t1d-summit","medium":"qr-card","campaign":"fall-2026-events"}'),
    ).toEqual({
      source: "t1d-summit",
      medium: "qr-card",
      campaign: "fall-2026-events",
    });
  });

  it.each([null, "", "not json", "null", '{"source":"Bad Source"}', '{"medium":"qr-card"}'])(
    "treats %s as no source",
    (raw) => {
      expect(parseVisitSource(raw)).toBeNull();
    },
  );
});

describe("recordVisitSource", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("remembers a tagged landing for the rest of the tab", () => {
    recordVisitSource(at(qrLanding));
    recordVisitSource(at("/ask-about-camp"));

    expect(currentVisitSource()).toEqual({
      source: "chop-nurses",
      medium: "qr-card",
      campaign: "fall-2026-events",
    });
  });
});
