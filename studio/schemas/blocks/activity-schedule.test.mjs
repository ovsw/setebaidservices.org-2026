import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./activity-schedule.ts", import.meta.url),
  "utf8",
);

test("keeps required featured Activity references strong", () => {
  const featuredActivities = source.slice(source.indexOf('name: "featuredActivities"'));

  assert.match(featuredActivities, /type: "reference"/);
  assert.doesNotMatch(featuredActivities, /weak:\s*true/);
});
