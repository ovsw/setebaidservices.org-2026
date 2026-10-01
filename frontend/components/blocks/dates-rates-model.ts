import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";

export type LengthKey = "twoWeek" | "fourWeek" | "sixWeek" | "eightWeek";
export type AvailabilityStatus = "open" | "limited" | "full";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type DatesRatesBlock = Extract<PageBlock, { _type: "datesRatesSection" }>;

// Response shapes come from Sanity TypeGen, so schema or query changes
// surface here as type errors instead of drifting silently.
export type ActiveSeason = NonNullable<
  DatesRatesBlock["activeSeason"]
>;
export type ConditionBlock = NonNullable<DatesRatesBlock["conditions"]>[number];
export type SeasonLengthConfig = NonNullable<ActiveSeason["twoWeek"]>;
export type SeasonSession = NonNullable<SeasonLengthConfig["sessions"]>[number];

export type LengthOption = {
  key: LengthKey;
  label: string;
  weeks: number;
};

export type PreparedSessionRow = {
  _key: string;
  availabilityNoteAttribute?: string;
  availabilityStatusAttribute?: string;
  barClass: string;
  dates: string;
  isFull: boolean;
  label: string;
  left: number;
  startDateAttribute?: string;
  status: AvailabilityStatus;
  weeksLabel: string;
  width: number;
};

export type PreparedLength = LengthOption & {
  description: string;
  descriptionAttribute?: string;
  rate: string;
  rateAttribute?: string;
  rateValue: number;
  rows: PreparedSessionRow[];
};

export type SeasonTick = {
  date: string;
  label: string;
};

export const enrollmentHref =
  "https://canadianadventurecamp.campbrainregistration.com/";

/** Maximum sessions any length option can have; drives the stable slot count. */
export const maxSessionRows = 4;

/** Season length in days (four back-to-back 2-week sessions), used for calendar bar positioning and tick dates. */
export const seasonLengthDays = 56;

export const lengthOptions = [
  { key: "twoWeek", label: "2 weeks", weeks: 2 },
  { key: "fourWeek", label: "4 weeks", weeks: 4 },
  { key: "sixWeek", label: "6 weeks", weeks: 6 },
  { key: "eightWeek", label: "8 weeks", weeks: 8 },
] as const satisfies readonly LengthOption[];

const dayMs = 24 * 60 * 60 * 1000;

function parseDate(value: string | null | undefined) {
  const cleanValue = stegaClean(value);
  if (!cleanValue) return undefined;
  const time = Date.parse(`${cleanValue}T00:00:00.000Z`);
  return Number.isNaN(time) ? undefined : time;
}

function addDays(value: string, days: number) {
  const time = parseDate(value);
  if (time === undefined) return undefined;
  return new Date(time + days * dayMs).toISOString().slice(0, 10);
}

export function getSessionEndDate(startDate: string, weeks: number) {
  return addDays(startDate, weeks * 7 - 1);
}

export function formatShortDate(value: string) {
  const time = parseDate(value);
  if (time === undefined) return "";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(time));
}

const rateFormatter = new Intl.NumberFormat("en-CA", {
  currency: "CAD",
  maximumFractionDigits: 0,
  style: "currency",
});

export function formatRate(rate: number) {
  return rateFormatter.format(rate);
}

function dayOffset(startDate: string, value: string) {
  const start = parseDate(startDate);
  const current = parseDate(value);
  if (start === undefined || current === undefined) return 0;
  return Math.max(0, Math.round((current - start) / dayMs));
}

export function availabilityLabel(status: string | null | undefined) {
  if (status === "limited") return "Limited";
  if (status === "full") return "Full";
  return "Open";
}

/** Which weeks of the season a session covers, e.g. "Weeks 1 & 2" or "Weeks 1-4". */
export function weeksLabel(startWeek: number, weeks: number) {
  const endWeek = startWeek + weeks - 1;
  return weeks === 2
    ? `Weeks ${startWeek} & ${endWeek}`
    : `Weeks ${startWeek}-${endWeek}`;
}

export function normalizeStatus(status: string | null | undefined): AvailabilityStatus {
  return status === "limited" || status === "full" ? status : "open";
}

export function getSeasonConfig(season: ActiveSeason, key: LengthKey) {
  return season[key];
}

/** Month tick labels across the calendar track: session start days, plus the season's last day at the right edge. */
export function getSeasonTicks(seasonStart: string): SeasonTick[] {
  const offsets = [0, 14, 28, 42, seasonLengthDays - 1];
  return offsets.flatMap((offset) => {
    const date = addDays(seasonStart, offset);
    if (!date) return [];
    return [{ date, label: formatShortDate(date).toUpperCase() }];
  });
}

export function prepareLengths({
  season,
  seasonDataAttribute,
}: {
  season: ActiveSeason;
  seasonDataAttribute?: (documentId: string, path: string) => string | undefined;
}) {
  const seasonStart = stegaClean(season.startDate);
  if (!seasonStart) return [];

  return lengthOptions.flatMap((option) => {
    const config = getSeasonConfig(season, option.key);
    const rateValue = config?.rate;
    if (typeof rateValue !== "number") return [];
    const rate = formatRate(rateValue);
    const description = stegaClean(config?.description)?.trim();
    const sessions = config?.sessions ?? [];
    if (!description || sessions.length === 0) return [];

    const rows = sessions.flatMap((session) => {
      const startDate = stegaClean(session.startDate);
      if (!session._key || !startDate) return [];
      const endDate = getSessionEndDate(startDate, option.weeks);
      if (!endDate) return [];

      // availabilityStatus carries invisible stega characters in preview,
      // so clean it before comparing literals.
      const status = normalizeStatus(stegaClean(session.availabilityStatus));
      const label =
        stegaClean(session.availabilityNote)?.trim() || availabilityLabel(status);
      const path = `${option.key}.sessions[_key=="${session._key}"]`;

      return [
        {
          _key: session._key,
          availabilityNoteAttribute: seasonDataAttribute?.(
            season._id,
            `${path}.availabilityNote`,
          ),
          availabilityStatusAttribute: seasonDataAttribute?.(
            season._id,
            `${path}.availabilityStatus`,
          ),
          barClass: status === "full" ? "stripedFull" : "bg-cedar",
          dates: `${formatShortDate(startDate)}-${formatShortDate(endDate)}`,
          isFull: status === "full",
          label,
          left: Math.min(
            (dayOffset(seasonStart, startDate) / seasonLengthDays) * 100,
            100 - ((option.weeks * 7) / seasonLengthDays) * 100,
          ),
          startDateAttribute: seasonDataAttribute?.(
            season._id,
            `${path}.startDate`,
          ),
          status,
          weeksLabel: weeksLabel(
            dayOffset(seasonStart, startDate) / 7 + 1,
            option.weeks,
          ),
          width: ((option.weeks * 7) / seasonLengthDays) * 100,
        },
      ];
    });

    if (rows.length === 0) return [];

    return [
      {
        ...option,
        description,
        descriptionAttribute: seasonDataAttribute?.(
          season._id,
          `${option.key}.description`,
        ),
        rate,
        rateAttribute: seasonDataAttribute?.(season._id, `${option.key}.rate`),
        rateValue,
        rows,
      },
    ];
  });
}
