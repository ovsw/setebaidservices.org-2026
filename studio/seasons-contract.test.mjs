import assert from "node:assert/strict";
import test from "node:test";

import { contentPageBuilderBlockTypes } from "./schemas/blocks/page-builder.ts";
import season from "./schemas/documents/season.ts";
import seasonsConfig from "./schemas/documents/seasons-config.ts";
import {
  getSessionEndDate,
  validateActiveSeasonMembership,
  validateSessionDateRange,
} from "./schemas/validation/season-rules.ts";
import { singletonDocumentTypes } from "./singletons.ts";

const seasonFields = Object.fromEntries(
  season.fields.map((field) => [field.name, field]),
);
const configFields = Object.fromEntries(
  seasonsConfig.fields.map((field) => [field.name, field]),
);

test("Seasons are managed through a singleton config and page section", () => {
  assert.equal(singletonDocumentTypes.has("seasonsConfig"), true);
  assert.equal(contentPageBuilderBlockTypes.includes("datesRatesSection"), true);
  assert.equal(seasonsConfig.name, "seasonsConfig");
  assert.equal(season.name, "season");
  assert.equal(configFields.activeSeason.type, "reference");
  assert.equal(configFields.plannedSeasons.type, "array");
});

test("Season length configurations have fixed Session limits", () => {
  const expectations = [
    ["twoWeek", 1, 4],
    ["fourWeek", 1, 2],
    ["sixWeek", 1, 2],
    ["eightWeek", 1, 1],
  ];

  for (const [fieldName, min, max] of expectations) {
    const config = seasonFields[fieldName];
    const sessions = config.fields.find((field) => field.name === "sessions");
    const validation = sessions.validation({
      required: () => ({
        min: (receivedMin) => ({
          max: (receivedMax) => ({
            custom: () => ({ receivedMin, receivedMax }),
          }),
        }),
      }),
    });

    assert.equal(validation.receivedMin, min);
    assert.equal(validation.receivedMax, max);
  }
});

test("Session end dates are calculated from inherited length", () => {
  assert.equal(getSessionEndDate("2027-06-28", 2), "2027-07-11");
  assert.equal(getSessionEndDate("2027-06-28", 8), "2027-08-22");
});

test("Session date validation allows overlap and rejects only out-of-season dates", () => {
  const context = { document: { _type: "season", startDate: "2027-06-28" } };

  assert.equal(
    validateSessionDateRange(
      [
        { _key: "a", startDate: "2027-06-28" },
        { _key: "b", startDate: "2027-07-01" },
      ],
      context,
      "twoWeek",
    ),
    true,
  );
  assert.match(
    validateSessionDateRange(
      [{ _key: "late", startDate: "2027-08-18" }],
      context,
      "twoWeek",
    ),
    /fit inside/,
  );
});

test("Active Season must be present in the planning list", () => {
  assert.equal(
    validateActiveSeasonMembership(
      { _ref: "season-2027" },
      {
        document: {
          plannedSeasons: [{ _ref: "season-2027" }],
        },
      },
    ),
    true,
  );
  assert.match(
    validateActiveSeasonMembership(
      { _ref: "season-2028" },
      {
        document: {
          plannedSeasons: [{ _ref: "season-2027" }],
        },
      },
    ),
    /planning list/,
  );
});
