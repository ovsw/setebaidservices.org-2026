import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  checkHiddenLinkTarget,
  HIDDEN_LINK_TARGET_WARNING,
  hiddenLinkTargetWarning,
} from "./hidden-link-target.ts";

function createContext({ hidden = false, parent = {} } = {}) {
  const calls = [];
  return {
    calls,
    parent,
    getClient: () => ({
      withConfig: (config) => ({
        fetch: async (query, params) => {
          calls.push({ config, params, query });
          return hidden;
        },
      }),
    }),
  };
}

/** Records how the schema builds the rule, as Sanity's Rule would. */
function createRule() {
  const rule = {
    custom(validator) {
      rule.validator = validator;
      return {
        warning() {
          rule.level = "warning";
          return rule;
        },
        error() {
          rule.level = "error";
          return rule;
        },
      };
    },
  };
  return rule;
}

test("the hidden-target check is a warning, never an error", () => {
  const rule = hiddenLinkTargetWarning(createRule());
  assert.equal(rule.level, "warning");
});

test("warns when the linked document is Hidden", async () => {
  const context = createContext({ hidden: true });
  const result = await checkHiddenLinkTarget({ _ref: "drafts.page-campaigns" }, context);

  assert.equal(result, HIDDEN_LINK_TARGET_WARNING);
  assert.match(result, /404 on the public Website until the page is made visible/);
  assert.equal(context.calls[0].config.perspective, "raw");
  assert.deepEqual(context.calls[0].params, {
    draftId: "drafts.page-campaigns",
    id: "page-campaigns",
  });
});

test("passes a visible target and an empty reference", async () => {
  assert.equal(await checkHiddenLinkTarget({ _ref: "page-about" }, createContext()), true);

  const context = createContext({ hidden: true });
  assert.equal(await checkHiddenLinkTarget(undefined, context), true);
  assert.equal(context.calls.length, 0);
});

test("skips a reference the link does not use", async () => {
  const rule = hiddenLinkTargetWarning(
    createRule(),
    (context) => context.parent.kind === "internal",
  );
  const context = createContext({ hidden: true, parent: { kind: "external" } });

  assert.equal(await rule.validator({ _ref: "page-campaigns" }, context), true);
  assert.equal(context.calls.length, 0);
});

test("customUrl, link and the navigation and footer destination carry the warning", () => {
  for (const file of ["custom-url.ts", "link.ts", "destination.ts"]) {
    const source = readFileSync(
      new URL(`../blocks/shared/${file}`, import.meta.url),
      "utf8",
    );
    assert.match(
      source,
      /name: "(internal|internalLink)",[\s\S]*?type: "reference",[\s\S]*?hiddenLinkTargetWarning\(\s*rule,/,
      file,
    );
  }
});
