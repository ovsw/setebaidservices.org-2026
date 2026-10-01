import assert from "node:assert/strict";
import test from "node:test";

import { activityScheduleQuery } from "./activity-schedule.ts";

test("limits projected featured Activities while preserving the total count", () => {
  assert.match(activityScheduleQuery, /count\(\*\[_type == "activity"\]\)/);
  assert.match(activityScheduleQuery, /featuredActivities\[0\.\.\.18\]/);
});
