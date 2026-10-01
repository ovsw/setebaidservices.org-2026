import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DatesRatesSection from "./dates-rates-section";
import { getSessionEndDate } from "./dates-rates-model";

// The rate count-up animates via requestAnimationFrame; force reduced motion
// so switching lengths jumps straight to the new value in these tests.
beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      addEventListener: vi.fn(),
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      removeEventListener: vi.fn(),
    })),
  );
});

const heading = [
  {
    _key: "heading",
    _type: "block" as const,
    children: [
      {
        _key: "heading-main",
        _type: "span" as const,
        marks: [],
        text: "Dates & rates, ",
      },
      {
        _key: "heading-accent",
        _type: "span" as const,
        marks: ["em"],
        text: "at a glance.",
      },
    ],
    markDefs: null,
    style: "normal" as const,
  },
];

const introduction = [
  {
    _key: "intro",
    _type: "block" as const,
    children: [
      {
        _key: "intro-main",
        _type: "span" as const,
        marks: [],
        text: "Every session is all-inclusive.",
      },
    ],
    markDefs: null,
    style: "normal" as const,
  },
];

const section = {
  _key: "dates-test",
  _type: "datesRatesSection" as const,
  background: "cream" as const,
  activeSeason: {
    _id: "season-2027",
    name: "2027 Season",
    startDate: "2027-06-28",
    twoWeek: {
      rate: 3900,
      description: "The shortest Adventure Island stay.",
      sessions: [
        {
          _key: "session-1",
          availabilityNote: "Under 5 spots",
          availabilityStatus: "limited",
          startDate: "2027-06-28",
        },
        {
          _key: "session-2",
          availabilityNote: null,
          availabilityStatus: "full",
          startDate: "2027-07-12",
        },
      ],
    },
    fourWeek: {
      rate: 7200,
      description: "A full month at camp.",
      sessions: [
        {
          _key: "session-3",
          availabilityNote: null,
          availabilityStatus: "open",
          startDate: "2027-06-28",
        },
      ],
    },
    sixWeek: null,
    eightWeek: {
      rate: 12000,
      description: "The complete summer.",
      sessions: [
        {
          _key: "session-4",
          availabilityNote: null,
          availabilityStatus: "open",
          startDate: "2027-06-28",
        },
      ],
    },
  },
  conditions: [
    {
      _key: "condition-deposits",
      _type: "block" as const,
      style: "normal" as const,
      markDefs: null,
      children: [
        {
          _key: "condition-deposits-1",
          _type: "span" as const,
          text: "Deposits ",
          marks: [],
        },
        {
          _key: "condition-deposits-2",
          _type: "span" as const,
          text: "fully refundable",
          marks: ["strong"],
        },
        {
          _key: "condition-deposits-3",
          _type: "span" as const,
          text: " until March 31, 2026.",
          marks: [],
        },
      ],
    },
    {
      _key: "condition-siblings",
      _type: "block" as const,
      style: "normal" as const,
      markDefs: null,
      children: [
        {
          _key: "condition-siblings-1",
          _type: "span" as const,
          text: "Siblings save automatically.",
          marks: [],
        },
      ],
    },
  ],
  dataAttribute: (path) => `section:${path}`,
  detailsLinkText: "Full dates & rates",
  eyebrow: "07 · DATES & RATES",
  heading,
  introduction,
  seasonDataAttribute: (documentId, path) => `season:${documentId}:${path}`,
  secondaryLink: null,
  sessionIncludes: [
    {
      _key: "include-cabin",
      _type: "includeItem" as const,
      label: "Cabin on the island",
    },
    {
      _key: "include-meals",
      _type: "includeItem" as const,
      label: "All meals & snacks",
    },
  ],
} satisfies ComponentProps<typeof DatesRatesSection>;

describe("DatesRatesSection", () => {
  it("shows the eyebrow, heading, introduction, Rate, description, and availability", () => {
    render(<DatesRatesSection {...section} />);

    expect(screen.getByText("07 · DATES & RATES")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Dates & rates, at a glance." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Every session is all-inclusive."),
    ).toBeInTheDocument();
    expect(screen.getByText("$3,900")).toBeInTheDocument();
    expect(
      screen.getByText("The shortest Adventure Island stay."),
    ).toBeInTheDocument();
    expect(screen.getByText("Jun 28-Jul 11")).toBeInTheDocument();
    expect(screen.getByText("Under 5 spots")).toBeInTheDocument();
    expect(screen.getAllByText("Full").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: "Full dates & rates" }),
    ).toHaveAttribute("href", "/dates-and-rates/");
  });

  it("hides the details link when its text is empty", () => {
    render(<DatesRatesSection {...section} detailsLinkText={null} />);

    expect(screen.queryByRole("link", { name: "Full dates & rates" })).toBeNull();
    expect(screen.queryByText("Full dates & rates")).toBeNull();
  });

  it("renders the optional secondary link beside Enroll", () => {
    const { rerender } = render(<DatesRatesSection {...section} />);

    expect(
      screen.queryByRole("link", { name: /Returning family/ }),
    ).toBeNull();

    rerender(
      <DatesRatesSection
        {...section}
        secondaryLink={{
          href: "https://canadianadventurecamp.campbrainregistration.com/",
          openInNewTab: true,
          text: "Returning family? Log in",
        }}
      />,
    );

    const portal = screen.getByRole("link", { name: /Returning family\? Log in/ });
    expect(portal).toHaveAttribute(
      "href",
      "https://canadianadventurecamp.campbrainregistration.com/",
    );
    expect(portal).toHaveAttribute("target", "_blank");
    expect(portal).toHaveAttribute("data-sanity", "section:secondaryLink");
  });

  it("skips a half-filled secondary link", () => {
    render(
      <DatesRatesSection
        {...section}
        secondaryLink={{ href: null, openInNewTab: false, text: "Log in" }}
      />,
    );

    expect(screen.queryByRole("link", { name: "Log in" })).toBeNull();
  });

  it("does not render the season label / date range line", () => {
    render(<DatesRatesSection {...section} />);

    expect(screen.queryByText("2027 SEASON")).toBeNull();
  });

  it("renders session includes and conditions", () => {
    render(<DatesRatesSection {...section} />);

    expect(screen.getByText("Cabin on the island")).toBeInTheDocument();
    expect(screen.getByText("All meals & snacks")).toBeInTheDocument();
    expect(screen.getByText("fully refundable")).toBeInTheDocument();
    expect(screen.getByText("fully refundable").tagName).toBe("STRONG");
  });

  it("switches Session lengths", () => {
    const { container } = render(<DatesRatesSection {...section} />);

    fireEvent.click(screen.getByRole("tab", { name: "4 weeks" }));

    expect(screen.getByText("$7,200")).toBeInTheDocument();
    expect(screen.getByText("A full month at camp.")).toBeInTheDocument();
    expect(
      container.querySelector('[data-sanity*="session-3"]'),
    ).toHaveTextContent("Jun 28-Jul 25");
  });

  it("renders four stable session slots regardless of active length row count", () => {
    const { container } = render(<DatesRatesSection {...section} />);

    // Always 4 slots: 2 weeks has 2 sessions, so 2 slots collapse but stay
    // rendered (last-known content, aria-hidden) rather than unmounting.
    fireEvent.click(screen.getByRole("tab", { name: "4 weeks" }));

    // 4 weeks has 1 session; its slot is visible, 3 collapse.
    expect(container.querySelectorAll('[data-open]')).toHaveLength(4);
    expect(
      container.querySelectorAll('[data-open="true"]'),
    ).toHaveLength(1);
  });

  it("does not link Full Sessions to enrollment", () => {
    const { container } = render(<DatesRatesSection {...section} />);

    const fullRow = container.querySelector('[data-sanity*="session-2"]');
    expect(fullRow?.closest("a")).toBeNull();
    expect(fullRow?.closest("[href]")).toBeNull();
  });

  it("links section and Season fields back to Studio", () => {
    const { container } = render(<DatesRatesSection {...section} />);

    expect(container.querySelector('[data-sanity="section:eyebrow"]')).not.toBeNull();
    expect(container.querySelector('[data-sanity="section:heading"]')).not.toBeNull();
    expect(container.querySelector('[data-sanity="section:introduction"]')).not.toBeNull();
    expect(container.querySelector('[data-sanity="section:sessionIncludes"]')).not.toBeNull();
    expect(container.querySelector('[data-sanity="section:conditions"]')).not.toBeNull();
    expect(
      container.querySelector('[data-sanity="season:season-2027:twoWeek.rate"]'),
    ).not.toBeNull();
    expect(
      [...container.querySelectorAll("[data-sanity]")].some(
        (element) =>
          element.getAttribute("data-sanity") ===
          'season:season-2027:twoWeek.sessions[_key=="session-1"].startDate',
      ),
    ).toBe(true);
  });

  it("calculates inclusive Session end dates from inherited length", () => {
    expect(getSessionEndDate("2027-06-28", 2)).toBe("2027-07-11");
    expect(getSessionEndDate("2027-06-28", 8)).toBe("2027-08-22");
  });
});
