import assert from "node:assert/strict";
import test from "node:test";

import {
  createActivityScheduleHeadingPlan,
  headingToPlainText,
} from "./migrate-activity-schedule-headings.mjs";

test("converts every string heading without changing its words", () => {
  const document = {
    _id: "drafts.homePage",
    _rev: "revision-1",
    blocks: [
      {
        _key: "schedule-one",
        _type: "activitySchedule",
        heading: "activities. Their pick, every day.",
      },
      {
        _key: "schedule-two",
        _type: "activitySchedule",
        heading: "Choose your own day",
      },
    ],
  };

  const plan = createActivityScheduleHeadingPlan(document);

  assert.equal(plan.sections.length, 2);
  assert.deepEqual(
    plan.sections.map(({ heading }) => headingToPlainText(heading)),
    ["activities. Their pick, every day.", "Choose your own day"],
  );
  assert.deepEqual(
    plan.sections.map(({ path }) => path),
    [
      'blocks[_key=="schedule-one"].heading',
      'blocks[_key=="schedule-two"].heading',
    ],
  );
});

test("ignores documents whose Activity Schedule headings are already rich text", () => {
  const document = {
    _id: "homePage",
    _rev: "revision-2",
    blocks: [
      {
        _key: "schedule",
        _type: "activitySchedule",
        heading: [
          {
            _key: "heading-block",
            _type: "block",
            style: "normal",
            markDefs: [],
            children: [
              {
                _key: "heading-span",
                _type: "span",
                marks: [],
                text: "Already migrated",
              },
            ],
          },
        ],
      },
    ],
  };

  assert.equal(createActivityScheduleHeadingPlan(document).sections.length, 0);
});

test("rejects empty headings instead of hiding the section after migration", () => {
  assert.throws(
    () =>
      createActivityScheduleHeadingPlan({
        _id: "homePage",
        _rev: "revision-3",
        blocks: [
          {
            _key: "schedule",
            _type: "activitySchedule",
            heading: "",
          },
        ],
      }),
    /empty string heading/,
  );
});
