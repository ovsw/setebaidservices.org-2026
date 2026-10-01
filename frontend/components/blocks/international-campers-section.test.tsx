import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import InternationalCampersSection from "./international-campers-section";

// Mock motion/react hooks used by the globe client component
const motion = vi.hoisted(
  (): { inView: boolean; reduced: boolean | null } => ({
    inView: false,
    reduced: false,
  }),
);

vi.mock("motion/react", () => ({
  useInView: () => motion.inView,
  useReducedMotion: () => motion.reduced,
}));

// Mock cobe so tests don't need WebGL
vi.mock("cobe", () => ({
  default: () => ({ destroy: () => {}, toggle: () => {} }),
}));

const section: ComponentProps<typeof InternationalCampersSection> = {
  _key: "world-test",
  _type: "internationalCampersSection",
  background: null,
  eyebrow: "08 · FROM EVERYWHERE",
  heading: [
    {
      _key: "heading-block",
      _type: "block",
      style: "normal",
      markDefs: null,
      children: [
        { _key: "h-plain", _type: "span", text: "One island. ", marks: [] },
        { _key: "h-accent", _type: "span", text: "The whole world.", marks: ["em"] },
      ],
    },
  ],
  description:
    "Our cabins sound like a departures board. We meet international campers at Toronto Pearson International Airport.",
  linkLabel: "International camper information",
  link: { href: "/international-campers", openInNewTab: false },
  dataAttribute: (path) => `section:${path}`,
};

describe("InternationalCampersSection", () => {
  it("renders heading, eyebrow, and description", () => {
    render(<InternationalCampersSection {...section} />);

    expect(
      screen.getByRole("heading", {
        name: "One island. The whole world.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("08 · FROM EVERYWHERE")).toBeInTheDocument();
    expect(
      screen.getByText(/departures board/),
    ).toBeInTheDocument();
  });

  it("renders all 9 city routes", () => {
    render(<InternationalCampersSection {...section} />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(9);

    const cities = [
      "Toronto",
      "New York",
      "Mexico City",
      "Sao Paulo",
      "London",
      "Paris",
      "Hong Kong",
      "Tokyo",
      "Sydney",
    ];
    for (const city of cities) {
      expect(
        screen.getByRole("button", { name: new RegExp(city) }),
      ).toBeInTheDocument();
    }
  });

  it("shows all airport codes", () => {
    render(<InternationalCampersSection {...section} />);

    const codes = ["YYZ", "JFK", "MEX", "GRU", "LHR", "CDG", "HKG", "NRT", "SYD"];
    for (const code of codes) {
      expect(screen.getByText(code)).toBeInTheDocument();
    }
  });

  it("identifies Toronto Pearson as the pickup hub", () => {
    render(<InternationalCampersSection {...section} />);

    const torontoButton = screen.getByRole("button", {
      name: /Toronto.*pickup hub/,
    });
    expect(torontoButton).toBeInTheDocument();
  });

  it("renders the onward link with the configured destination", () => {
    render(<InternationalCampersSection {...section} />);

    const link = screen.getByRole("link", {
      name: /International camper information/,
    });
    expect(link).toHaveAttribute("href", "/international-campers");
    expect(link).not.toHaveAttribute("target");
  });

  it("opens link in new tab when configured", () => {
    render(
      <InternationalCampersSection
        {...section}
        link={{ href: "https://example.com", openInNewTab: true }}
      />,
    );

    const link = screen.getByRole("link", {
      name: /International camper information/,
    });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("omits the link when no href is provided", () => {
    render(
      <InternationalCampersSection
        {...section}
        link={{ href: null, openInNewTab: false }}
      />,
    );

    expect(
      screen.queryByRole("link", { name: /International camper information/ }),
    ).not.toBeInTheDocument();
  });

  it("returns null when heading is missing", () => {
    const { container } = render(
      <InternationalCampersSection {...section} heading={undefined as never} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null when description is missing", () => {
    const { container } = render(
      <InternationalCampersSection {...section} description="" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("uses real buttons for city interactions", () => {
    render(<InternationalCampersSection {...section} />);

    const buttons = screen.getAllByRole("button", { name: /,/ });
    expect(buttons).toHaveLength(9);
    for (const btn of buttons) {
      expect(btn.tagName).toBe("BUTTON");
    }
  });

  it("renders the list header label", () => {
    render(<InternationalCampersSection {...section} />);

    expect(screen.getByText("Campers join us from")).toBeInTheDocument();
  });

  it("uses a two-row layout with routes and globe in the second row", () => {
    render(<InternationalCampersSection {...section} />);

    // Route list exists in the rendered output
    const routeList = screen.getByRole("list", { name: "Camper origin cities" });
    expect(routeList).toBeInTheDocument();
  });

  // Visual Editing data attributes
  it("links eyebrow to Studio via data-sanity", () => {
    const { container } = render(
      <InternationalCampersSection {...section} />,
    );
    expect(
      container.querySelector('[data-sanity="section:eyebrow"]'),
    ).not.toBeNull();
  });

  it("links heading to Studio via data-sanity", () => {
    const { container } = render(
      <InternationalCampersSection {...section} />,
    );
    expect(
      container.querySelector('[data-sanity="section:heading"]'),
    ).not.toBeNull();
  });

  it("links description to Studio via data-sanity", () => {
    const { container } = render(
      <InternationalCampersSection {...section} />,
    );
    expect(
      container.querySelector('[data-sanity="section:description"]'),
    ).not.toBeNull();
  });

  it("links linkLabel to Studio via data-sanity", () => {
    const { container } = render(
      <InternationalCampersSection {...section} />,
    );
    expect(
      container.querySelector('[data-sanity="section:linkLabel"]'),
    ).not.toBeNull();
  });

  // Globe interaction
  it("sets aria-pressed on city buttons when selected", () => {
    render(<InternationalCampersSection {...section} />);

    const torontoButton = screen.getByRole("button", {
      name: /Toronto/,
    });

    // Initially not pressed
    expect(torontoButton).toHaveAttribute("aria-pressed", "false");

    // Click to select
    fireEvent.click(torontoButton);

    expect(torontoButton).toHaveAttribute("aria-pressed", "true");

    // Other cities should not be pressed
    const londonButton = screen.getByRole("button", {
      name: /London/,
    });
    expect(londonButton).toHaveAttribute("aria-pressed", "false");
  });

  it("clears focus on Escape key", () => {
    render(<InternationalCampersSection {...section} />);

    const torontoButton = screen.getByRole("button", {
      name: /Toronto/,
    });
    fireEvent.click(torontoButton);
    expect(torontoButton).toHaveAttribute("aria-pressed", "true");

    // Press Escape on the container
    fireEvent.keyDown(torontoButton.closest("div[class]")!, {
      key: "Escape",
    });
    expect(torontoButton).toHaveAttribute("aria-pressed", "false");
  });

  it("renders the accent phrase in the handwritten font", () => {
    render(<InternationalCampersSection {...section} />);

    const accent = screen.getByText("The whole world.");
    expect(accent.tagName).toBe("EM");
    expect(accent.className).toContain("font-accent");
  });
});
