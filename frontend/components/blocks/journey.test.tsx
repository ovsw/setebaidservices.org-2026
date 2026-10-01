import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import Journey from "./journey";

type JourneyStop = NonNullable<ComponentProps<typeof Journey>["stops"]>[number];

const imageAsset = {
  _id: "image-bus-1200x800-jpg",
  url: "https://cdn.sanity.io/images/test-project/test/bus-1200x800.jpg",
  mimeType: "image/jpeg",
  metadata: { lqip: null, dimensions: { width: 1200, height: 800 } },
};

function stop(
  key: string,
  label: string,
  overrides: Partial<JourneyStop> = {},
): JourneyStop {
  return {
    _key: key,
    label,
    time: null,
    text: `${label} in one line.`,
    image: null,
    ...overrides,
  };
}

const stops: JourneyStop[] = [
  stop("yorkdale", "Yorkdale", {
    time: "10:00 am",
    image: {
      _type: "image",
      alt: "Campers boarding the camp bus",
      asset: imageAsset,
    } as JourneyStop["image"],
  }),
  stop("huntsville", "Huntsville", { time: "12:15 pm" }),
  stop("manito-landing", "Manito Landing"),
  stop("water-taxi", "Water taxi"),
  stop("island", "Adventure Island"),
];

const block: ComponentProps<typeof Journey> = {
  _key: "trip",
  _type: "journey",
  background: "green",
  eyebrow: "Getting there",
  title: [
    {
      _key: "heading",
      _type: "block",
      style: "normal",
      markDefs: null,
      children: [
        { _key: "plain", _type: "span", marks: [], text: "Toronto to the " },
        { _key: "accent", _type: "span", marks: ["em"], text: "island" },
      ],
    },
  ],
  intro: "One bus, one boat, camp staff the whole way.",
  stops,
  dataAttribute: (path) => `section:${path}`,
};

const stopLabels = stops.map((item) => item.label);

function getStopItems() {
  const list = screen.getByRole("list", { name: "Stops, in travel order" });
  return within(list).getAllByRole("listitem");
}

describe("Journey", () => {
  it("renders one ordered list that both layouts read in the same stop order", () => {
    render(<Journey {...block} />);

    const list = screen.getByRole("list", { name: "Stops, in travel order" });
    expect(list.tagName).toBe("OL");
    expect(list).toHaveStyle({ "--journey-stops": "5" });

    const items = getStopItems();
    const renderedLabels = items.map(
      (item) => within(item).getByRole("heading", { level: 3 }).textContent,
    );
    expect(renderedLabels).toEqual(stopLabels);
    expect(items.map((item) => item.dataset.journeyStop)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
    ]);

    // The vertical (phone) and horizontal (desktop) layouts are the same DOM
    // switched by CSS, so the sequence cannot diverge between viewports.
    const pathClass = list.className.split(" ").find((name) => /path/i.test(name));
    expect(pathClass).toBeTruthy();
    for (const item of items) {
      expect(item.className).toMatch(/stop/i);
    }
  });

  it("moves keyboard focus through the stops in travel order", async () => {
    const user = userEvent.setup();
    render(<Journey {...block} />);

    const items = getStopItems();
    const focused: string[] = [];

    for (let index = 0; index < items.length; index += 1) {
      await user.tab();
      const active = document.activeElement;
      expect(active).toBe(items[index]);
      focused.push(
        within(active as HTMLElement).getByRole("heading", { level: 3 })
          .textContent ?? "",
      );
    }

    expect(focused).toEqual(stopLabels);

    await user.tab();
    expect(getStopItems()).not.toContain(document.activeElement);
  });

  it("labels each stop, shows the time when given, and keeps editing paths keyed", () => {
    render(<Journey {...block} />);

    const items = getStopItems();
    const first = items[0];
    expect(first).toHaveAccessibleName("Yorkdale");
    expect(first).toHaveAccessibleDescription("Yorkdale in one line.");
    expect(within(first).getByText("10:00 am")).toHaveAttribute(
      "data-sanity",
      'section:stops[_key=="yorkdale"].time',
    );
    expect(within(first).getByRole("img")).toHaveAttribute(
      "alt",
      "Campers boarding the camp bus",
    );

    const manito = items[2];
    expect(within(manito).queryByRole("img")).toBeNull();
    expect(
      manito.querySelector('[data-sanity="section:stops[_key==\\"manito-landing\\"].image"]'),
    ).toHaveAttribute("aria-hidden", "true");

  });

  it("drops stops missing a label or line and renders nothing below two stops", () => {
    const { unmount } = render(
      <Journey
        {...block}
        stops={[...stops, stop("blank", "   "), stop("no-line", "No line", { text: "" })]}
      />,
    );
    expect(getStopItems()).toHaveLength(5);
    unmount();

    const { container } = render(<Journey {...block} stops={[stops[0]]} />);
    expect(container.querySelector("section")).toBeNull();
    expect(screen.queryByRole("list")).toBeNull();
  });
});
