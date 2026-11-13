import assert from "node:assert/strict";
import test from "node:test";

import {
  productionEnvProblems,
  requiredKeys,
} from "./check-production-env.mjs";

const example = `# Required
SITE=http://localhost
# COMMENTED_OUT=
FORMSPARK_FORM_ID=echo

# Optional editor tooling.
TOOL_KEY=your-key
`;

test("requires the keys set above the Optional line", () => {
  assert.deepEqual(requiredKeys(example), ["SITE", "FORMSPARK_FORM_ID"]);
});

test("reports missing keys and Formspark's test endpoint", () => {
  assert.deepEqual(productionEnvProblems(example, { SITE: " " , FORMSPARK_FORM_ID: "echo" }), [
    "SITE is not set.",
    'FORMSPARK_FORM_ID is "echo", the test endpoint. Set the real form ID.',
  ]);
  assert.deepEqual(
    productionEnvProblems(example, { SITE: "https://x", FORMSPARK_FORM_ID: "abc" }),
    [],
  );
});
