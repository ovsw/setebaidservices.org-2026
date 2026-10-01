import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("keeps design-system text utilities next to a text colour", () => {
    expect(cn("mb-5 text-eyebrow", "text-cedar")).toBe(
      "mb-5 text-eyebrow text-cedar",
    );
    expect(cn("text-label", "text-pine-night/60")).toBe(
      "text-label text-pine-night/60",
    );
  });

  it("still lets a later typography utility replace an earlier one", () => {
    expect(cn("text-title", "text-title-lg")).toBe("text-title-lg");
    expect(cn("text-sm", "text-headline")).toBe("text-headline");
  });
});
