import assert from "node:assert/strict";
import test from "node:test";
import { assertSetebaidProductionTarget } from "./assert-setebaid-production-target.mjs";

test("accepts only the Setebaid production target", () => {
  assert.doesNotThrow(() =>
    assertSetebaidProductionTarget({
      dataset: "production",
      projectId: "o36mi5w4",
    }),
  );

  assert.throws(
    () =>
      assertSetebaidProductionTarget({
        dataset: "production",
        projectId: "another-project",
      }),
    /Refusing to run against another-project\/production/,
  );

  assert.throws(
    () =>
      assertSetebaidProductionTarget({
        dataset: "development",
        projectId: "o36mi5w4",
      }),
    /Refusing to run against o36mi5w4\/development/,
  );
});
