import type { ValidationContext } from "sanity";

export const seasonLengthWeeks = {
  twoWeek: 2,
  fourWeek: 4,
  sixWeek: 6,
  eightWeek: 8,
} as const;

export type SeasonLengthKey = keyof typeof seasonLengthWeeks;

type SessionValue = {
  _key?: string;
  startDate?: string;
};

type SeasonDocument = {
  _type?: string;
  startDate?: string;
};

type ReferenceValue = {
  _ref?: string;
};

type SeasonsConfigDocument = {
  activeSeason?: ReferenceValue;
  plannedSeasons?: ReferenceValue[];
};

const dayMs = 24 * 60 * 60 * 1000;

function parseDate(value: string | undefined) {
  if (!value) return undefined;
  const time = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isNaN(time) ? undefined : time;
}

export function addDays(value: string, days: number) {
  const time = parseDate(value);
  if (time === undefined) return undefined;
  return new Date(time + days * dayMs).toISOString().slice(0, 10);
}

export function getSessionEndDate(startDate: string, lengthWeeks: number) {
  return addDays(startDate, lengthWeeks * 7 - 1);
}

export function validateSessionDateRange(
  sessions: unknown[] | undefined,
  context: ValidationContext,
  lengthKey: SeasonLengthKey,
) {
  const season = context.document as SeasonDocument | undefined;
  const seasonStart = parseDate(season?.startDate);
  if (!sessions?.length || seasonStart === undefined) return true;

  const seasonEnd = seasonStart + 55 * dayMs;
  const lengthDays = seasonLengthWeeks[lengthKey] * 7;
  const invalid = sessions.find((value) => {
    const session = value as SessionValue;
    const sessionStart = parseDate(session.startDate);
    if (sessionStart === undefined) return false;
    const sessionEnd = sessionStart + (lengthDays - 1) * dayMs;
    return sessionStart < seasonStart || sessionEnd > seasonEnd;
  });

  return invalid
    ? "Every Session must fit inside the Season's 8-week calendar"
    : true;
}

export function validateActiveSeasonMembership(
  activeSeason: ReferenceValue | undefined,
  context: ValidationContext,
) {
  const document = context.document as SeasonsConfigDocument | undefined;
  const activeRef = activeSeason?._ref;
  if (!activeRef) return true;

  const plannedRefs = new Set(
    (document?.plannedSeasons ?? []).flatMap((season) =>
      season?._ref ? [season._ref] : [],
    ),
  );

  return plannedRefs.has(activeRef)
    ? true
    : "Active Season must also be in the planning list";
}
