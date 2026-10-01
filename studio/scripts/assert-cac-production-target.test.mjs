import assert from "node:assert/strict";
import test from "node:test";
import { assertCacProductionTarget } from "./assert-cac-production-target.mjs";

test("accepts only the CAC production target", () => {
  assert.doesNotThrow(() =>
    assertCacProductionTarget({
      dataset: "production",
      projectId: "bf76qlx9",
    }),
  );

  assert.throws(
    () =>
      assertCacProductionTarget({
        dataset: "production",
        projectId: "another-project",
      }),
    /Refusing to run against another-project\/production/,
  );

  assert.throws(
    () =>
      assertCacProductionTarget({
        dataset: "development",
        projectId: "bf76qlx9",
      }),
    /Refusing to run against bf76qlx9\/development/,
  );
});
