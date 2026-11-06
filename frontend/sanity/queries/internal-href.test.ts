import { describe, expect, it } from "vitest";
import { FOOTER_QUERY } from "./footer";
import { NAVIGATION_QUERY } from "./navigation";
import {
  customLinkInternalHref,
  internalReferenceHref,
  legacyInternalLinkHref,
  linkInternalHref,
  urlInternalHref,
} from "./shared/internal-href";

function expectCanonicalBlogRoutes(query: string, reference: string) {
  expect(query).toContain(
    `${reference}->_type == "post" && defined(${reference}->slug.current) => "/stories/" + array::join(string::split(${reference}->slug.current, "/")[@ != ""], "/")`,
  );
  expect(query).toContain(
    `${reference}->_type == "category" && defined(${reference}->slug.current) => "/stories/category/" + array::join(string::split(${reference}->slug.current, "/")[@ != ""], "/")`,
  );
  expect(query).not.toContain(`${reference}->slug.current + "/"`);
}

describe("internal href queries", () => {
  it("uses canonical post and category namespaces in each shared resolver", () => {
    for (const [query, reference] of [
      [customLinkInternalHref, "customLink.internal"],
      [urlInternalHref, "url.internal"],
      [internalReferenceHref, "internal"],
      [linkInternalHref, "link.internal"],
      [legacyInternalLinkHref, "@.internalLink"],
    ] as const) {
      expectCanonicalBlogRoutes(query, reference);
    }
  });

  it("resolves the Blog index singleton from shared button URLs", () => {
    expect(urlInternalHref).toContain(
      'url.internal->_id == "blogIndex" || url.internal->_type == "blogIndex" => "/stories"',
    );
    expect(linkInternalHref).toContain(
      'link.internal->_id == "blogIndex" || link.internal->_type == "blogIndex" => "/stories"',
    );
  });

  it("uses canonical post and category namespaces in footer destinations", () => {
    expectCanonicalBlogRoutes(FOOTER_QUERY, "internal");
  });

  it("yields no href for a hidden target in every resolver", () => {
    for (const [query, reference] of [
      [customLinkInternalHref, "customLink.internal"],
      [urlInternalHref, "url.internal"],
      [internalReferenceHref, "internal"],
      [linkInternalHref, "link.internal"],
      [legacyInternalLinkHref, "@.internalLink"],
    ] as const) {
      // The guard is the first branch, so no route branch can win over it.
      expect(query).toMatch(
        new RegExp(`^select\\(\\s*!\\(${reference.replace(/[.@]/g, "\\$&")}->hidden != true\\) => null,`),
      );
    }
  });

  it("drops header and footer links to hidden targets, the stories index included", () => {
    for (const query of [NAVIGATION_QUERY, FOOTER_QUERY]) {
      expect(query).toContain('kind == "internal" => select(\n  !(internal->hidden != true) => null,');
      // No branch ahead of the guard resolves the stories index on its own.
      expect(query).not.toMatch(/kind == "internal" => select\(\s*internal->_id == "blogIndex"/);
    }
  });
});
