import { describe, expect, it } from "vitest";
import { createFooterModel, type RawFooter } from "./model";

const rawLink = (
  key: string,
  label: string,
  href: string,
  openInNewTab = false,
) => ({ _key: key, label, destination: { href, openInNewTab } });

const rawFooter: RawFooter = {
  _id: "footer",
  heading: "Until next summer,",
  accent: "see you on the island",
  actions: [rawLink("enroll", "Enroll", "https://example.com", true)],
  logos: [
    {
      _key: "site",
      alt: "Setebaid Services",
      image: {
        asset: {
          _id: "image-4477c44717fcc82a76174b8fa4bc4dc323b05c6b-2182x1006-png",
          metadata: { dimensions: { width: 2182, height: 1006 } },
        },
      },
      destination: { href: "/", openInNewTab: false },
    },
  ],
  contactLinks: [
    {
      _key: "address",
      icon: "pin",
      label: "10 Main Street\nExample City",
      destination: { href: "https://maps.example.com", openInNewTab: true },
    },
  ],
  columns: [
    {
      _key: "company",
      heading: "Company",
      links: [
        rawLink("about", "About", "about"),
        rawLink("unsafe", "Unsafe", "javascript:alert(1)"),
      ],
    },
  ],
  legalLinks: [rawLink("privacy", "Privacy", "/privacy")],
  copyrightStartYear: 2024,
  copyrightOwner: "Northline Studio",
};

describe("createFooterModel", () => {
  it("builds the footer from authored links, logos, and contact rows", () => {
    const model = createFooterModel(rawFooter, 2026);

    expect(model?.columns[0]?.links).toEqual([
      {
        href: "/about",
        key: "about",
        label: "About",
        openInNewTab: false,
      },
    ]);
    expect(model?.siteLogo.alt).toBe("Setebaid Services");
    expect(model?.contactLinks[0]?.link.label).toBe(
      "10 Main Street\nExample City",
    );
    expect(model?.actions[0]?.openInNewTab).toBe(true);
    expect(model?.copyrightYears).toBe("2024-2026");
  });

  it("drops links whose target is Hidden (the query yields no href for them)", () => {
    const hiddenTarget = { _key: "campaigns", label: "Campaigns", destination: { href: null, openInNewTab: false } };
    const model = createFooterModel(
      {
        ...rawFooter,
        actions: [hiddenTarget, ...rawFooter.actions!],
        columns: [
          { _key: "give", heading: "Give", links: [hiddenTarget, rawLink("donate", "Donate", "/donate")] },
        ],
        legalLinks: [hiddenTarget, ...rawFooter.legalLinks!],
      },
      2026,
    );

    expect(model?.actions.map((action) => action.key)).toEqual(["enroll"]);
    expect(model?.columns[0]?.links.map((link) => link.key)).toEqual(["donate"]);
    expect(model?.legalLinks.map((link) => link.key)).toEqual(["privacy"]);
  });

  it("keeps live seals among the marks and drops ones without an https image", () => {
    const seal = (key: string, imageUrl: string) => ({
      _key: key,
      _type: "footerSeal",
      alt: "Candid Platinum Transparency Seal",
      imageUrl,
      destination: { href: "https://app.candid.org/profile/1", openInNewTab: true },
    });
    const model = createFooterModel(
      {
        ...rawFooter,
        logos: [
          ...rawFooter.logos!,
          seal("candid", "https://widgets.example.org/seal/svg"),
          seal("insecure", "http://widgets.example.org/seal/svg"),
        ],
      },
      2026,
    );

    expect(model?.markLogos).toEqual([
      {
        kind: "seal",
        key: "candid",
        alt: "Candid Platinum Transparency Seal",
        src: "https://widgets.example.org/seal/svg",
        link: {
          key: "candid",
          label: "Candid Platinum Transparency Seal",
          href: "https://app.candid.org/profile/1",
          openInNewTab: true,
        },
      },
    ]);
  });

  it("returns unavailable when the first logo item is not an image logo", () => {
    const seal = {
      _key: "candid",
      _type: "footerSeal",
      alt: "Candid seal",
      imageUrl: "https://widgets.example.org/seal/svg",
      destination: { href: "https://app.candid.org/profile/1", openInNewTab: true },
    };
    expect(
      createFooterModel({ ...rawFooter, logos: [seal, ...rawFooter.logos!] }, 2026),
    ).toBeNull();
  });

  it("returns unavailable when required footer data is missing", () => {
    expect(createFooterModel(null, 2026)).toBeNull();
    expect(
      createFooterModel({ ...rawFooter, copyrightOwner: null }, 2026),
    ).toBeNull();
    expect(createFooterModel({ ...rawFooter, logos: [] }, 2026)).toBeNull();
  });
});
