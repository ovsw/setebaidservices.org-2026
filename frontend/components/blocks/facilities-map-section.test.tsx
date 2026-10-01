import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import FacilitiesMapSection from "./facilities-map-section";

vi.mock("./facilities-map-interactive", () => ({
  default: () => <div>Interactive map</div>,
}));

vi.mock("./facilities-map-big-top-metric", () => ({
  default: () => <div>Big Top metric</div>,
}));

const richText = (text: string) => [
  {
    _key: text,
    _type: "block" as const,
    children: [
      { _key: `${text}-span`, _type: "span" as const, marks: [], text },
    ],
    markDefs: [],
    style: "normal" as const,
  },
];

const minimalRichText = (text: string) => [
  { ...richText(text)[0], markDefs: null },
];

const section = {
  _key: "facilities-test",
  _type: "facilitiesMapSection" as const,
  background: null,
  bigTopArea: 9000,
  bigTopBody: richText("Big Top body"),
  bigTopGallery: [
    {
      _key: "decorative-slide",
      _type: "image" as const,
      alt: "",
      asset: {
        _id: "image-abc123-1200x1200-jpg",
        mimeType: "image/jpeg",
        metadata: null,
        url: "https://cdn.sanity.io/images/test/test/abc123-1200x1200.jpg",
      },
      caption: "Decorative gallery photo",
    },
  ],
  bigTopHeading: "The Big Top",
  bigTopGalleryAutoplay: false,
  bigTopTagline: "under one canopy",
  bigTopUnit: "sqft",
  eyebrow: "Facilities",
  heading: minimalRichText("Explore the island"),
  introduction: "Tour Adventure Island.",
  map: {
    _id: "facilitiesMap",
    mapImage: {
      _type: "image" as const,
      alt: "Island map",
      asset: {
        _id: "image-def456-2000x1200-jpg",
        mimeType: "image/jpeg",
        metadata: { dimensions: { height: 1200, width: 2000 }, lqip: null },
        url: "https://cdn.sanity.io/images/test/test/def456-2000x1200.jpg",
      },
    },
    placements: [],
    title: "Facilities Map",
    websiteAutoplay: false,
  },
  mapHeading: minimalRichText("Map"),
  mapLocationLabel: "Adventure Island",
  showBigTop: true,
  stopLabel: "Stop",
} satisfies ComponentProps<typeof FacilitiesMapSection>;

describe("FacilitiesMapSection", () => {
  it("renders a gallery image with blank alternative text as decorative", () => {
    const { container } = render(<FacilitiesMapSection {...section} />);

    expect(screen.getByText("Decorative gallery photo")).toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });
});
