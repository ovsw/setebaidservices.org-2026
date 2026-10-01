import { act, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ActivityCatalogue from "./activity-catalogue";

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

const observers: { callback: ObserverCallback; targets: Element[] }[] = [];

class FakeIntersectionObserver {
  private readonly record: { callback: ObserverCallback; targets: Element[] };

  constructor(callback: IntersectionObserverCallback) {
    this.record = {
      callback: (entries) =>
        callback(
          entries as IntersectionObserverEntry[],
          this as unknown as IntersectionObserver,
        ),
      targets: [],
    };
    observers.push(this.record);
  }

  observe(target: Element) {
    this.record.targets.push(target);
  }

  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}

const catalogue: ComponentProps<typeof ActivityCatalogue> = {
  _key: "catalogue-test",
  _type: "activityCatalogue",
  background: null,
  eyebrow: "Every activity",
  heading: [
    {
      _key: "heading",
      _type: "block",
      style: "normal",
      markDefs: null,
      children: [
        { _key: "a", _type: "span", text: "Find your thing, ", marks: [] },
        { _key: "b", _type: "span", text: "by where it happens.", marks: ["em"] },
      ],
    },
  ],
  intro: "Tap a place to jump there.",
  groups: [
    {
      _key: "water",
      title: "On the water",
      blurb: "Sandy bottom, shallow entry.",

      activities: [
        {
          _key: "ref-tubing",
          _id: "activity-tubing",
          title: "Tubing",
          line: "Hold on.",

          image: null,
          programTitle: null,
          programHref: null,
        },
        {
          _key: "ref-waterski",
          _id: "activity-waterski",
          title: "Waterskiing",
          line: "First stand-up by Friday.",

          image: null,
          programTitle: "Specialty Waterski & Wakeboard Program",
          programHref: "/programs/water-ski-and-wake-boarding-specialty-program",
        },
      ],
    },
    {
      _key: "bigtop",
      title: "In the Big Top",
      blurb: null,
      activities: [
        {
          _key: "ref-trampoline",
          _id: "activity-trampoline",
          title: "Trampoline",
          line: null,

          image: null,
          programTitle: null,
          programHref: null,
        },
      ],
    },
  ],
  dataAttribute: (path) => `section:${path}`,
  activityDataAttribute: (documentId, path) => `activity:${documentId}:${path}`,
};

describe("ActivityCatalogue", () => {
  beforeEach(() => {
    observers.length = 0;
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds a jump bar of in-page links and announces the current place", () => {
    render(<ActivityCatalogue {...catalogue} />);

    const nav = screen.getByRole("navigation", {
      name: "Activity Categories",
    });
    const chips = within(nav).getAllByRole("link");
    expect(chips.map((chip) => chip.textContent)).toEqual([
      "On the water",
      "In the Big Top",
    ]);

    for (const chip of chips) {
      const href = chip.getAttribute("href") ?? "";
      expect(href.startsWith("#")).toBe(true);
      const target = document.getElementById(href.slice(1));
      expect(target).not.toBeNull();
      expect(target).toHaveAccessibleName(chip.textContent ?? "");
      expect(chip).not.toHaveAttribute("aria-current");
    }

    const bigTop = document.getElementById(chips[1].getAttribute("href")!.slice(1))!;
    expect(observers).toHaveLength(1);
    act(() => {
      observers[0].callback([
        {
          target: bigTop,
          isIntersecting: true,
          boundingClientRect: { top: 120 } as DOMRectReadOnly,
        },
      ]);
    });

    expect(chips[1]).toHaveAttribute("aria-current", "location");
    expect(chips[0]).not.toHaveAttribute("aria-current");
  });

  it("marks cards without a photo and links specialty sports to their program", () => {
    render(<ActivityCatalogue {...catalogue} />);

    expect(screen.getAllByRole("img", { name: "Photo to come" })).toHaveLength(3);
    expect(
      screen.getByRole("link", {
        name: "Specialty program: Specialty Waterski & Wakeboard Program",
      }),
    ).toHaveAttribute(
      "href",
      "/programs/water-ski-and-wake-boarding-specialty-program",
    );
    expect(screen.queryByText("Beginners welcome")).toBeNull();
    expect(
      screen.queryByRole("note", { name: "For parents" }),
    ).toBeNull();
  });
});
