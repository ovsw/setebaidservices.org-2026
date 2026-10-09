import type { Database } from "@/lib/database";
import { lastSuccessAt, recordJobSuccess } from "@/lib/job-state";
import { untaggedSource } from "@/lib/visit-source";

export const ANALYTICS_JOB = "copy-analytics";

/** Setebaid is in Pennsylvania: a day in the daily totals is an Eastern day. */
export const ANALYTICS_TIME_ZONE = "America/New_York";

type AnalyticsMetric = "visits" | "scans" | "call_taps" | "email_taps";

/**
 * One Web Analytics query for one day. The API breaks results down by at
 * most two dimensions, so each query reads one metric by Source and page.
 */
export type AnalyticsQuery = {
  metric: AnalyticsMetric;
  kind: "visits" | "events";
  by: string[];
  filter: string;
  /**
   * Past 100 groups the API folds the rest into one "Others" row. Only a
   * query whose folded rows all share one Source may keep that row.
   */
  othersAllowed?: true;
};

export type AnalyticsRow = Record<string, string | number | undefined>;

/** The part of Vercel Web Analytics the copy reads. */
export type WebAnalytics = {
  /** When Web Analytics was enabled: no data exists before it. */
  startedAt(): Promise<Date>;
  rows(query: AnalyticsQuery, window: { since: string; until: string }): Promise<AnalyticsRow[]>;
};

type DailyTotal = {
  day: string;
  source: string;
  page: string;
  metric: AnalyticsMetric;
  count: number;
};

const production = (filter: string) => `environment eq 'production' and ${filter}`;

const event = (metric: AnalyticsMetric, name: string): AnalyticsQuery => ({
  metric,
  kind: "events",
  by: ["eventData/source", "eventData/page"],
  filter: production(`eventName eq '${name}'`),
});

/**
 * Page views are split so that the many untagged pages cannot push the few QR
 * landings or untagged `/go` visits into the "Others" row.
 */
export const ANALYTICS_QUERIES: AnalyticsQuery[] = [
  {
    metric: "visits",
    kind: "visits",
    by: ["utmSource", "requestPath"],
    filter: production("utmSource ne ''"),
  },
  {
    metric: "visits",
    kind: "visits",
    by: ["requestPath"],
    filter: production("utmSource eq '' and startswith(requestPath, '/go/')"),
  },
  {
    metric: "visits",
    kind: "visits",
    by: ["requestPath"],
    filter: production("utmSource eq '' and not startswith(requestPath, '/go/')"),
    // Every page here has the Source `direct`; only the page detail is lost.
    othersAllowed: true,
  },
  event("scans", "qr_scan"),
  event("call_taps", "call_tap"),
  event("email_taps", "email_tap"),
];

const OTHERS = "Others";

function label(value: AnalyticsRow[string]) {
  if (value === OTHERS) return "other";
  return typeof value === "string" ? value : "";
}

function readRow(query: AnalyticsQuery, row: AnalyticsRow) {
  if (!query.othersAllowed && Object.values(row).includes(OTHERS)) {
    // Failing keeps the stored numbers, and the failed run alerts Ovi.
    throw new Error(`Web Analytics folded ${query.metric} rows into "Others"; their Source is unknown.`);
  }
  if (query.kind === "visits") {
    const page = label(row.requestPath);
    // An untagged page view gets the Source an untagged landing gets.
    return { source: label(row.utmSource) || untaggedSource(page), page, count: Number(row.pageviews) };
  }
  return {
    source: label(row["eventData/source"]) || "unknown",
    page: label(row["eventData/page"]),
    count: Number(row.count),
  };
}

/** Map one day's API rows to daily totals, one per Source, page and metric. */
function toDailyTotals(
  day: string,
  results: { query: AnalyticsQuery; rows: AnalyticsRow[] }[],
): DailyTotal[] {
  const totals = new Map<string, DailyTotal>();
  for (const { query, rows } of results) {
    for (const row of rows) {
      const { source, page, count } = readRow(query, row);
      if (!(count > 0)) continue;
      const key = JSON.stringify([source, page, query.metric]);
      const total = totals.get(key);
      if (total) total.count += count;
      else totals.set(key, { day, source, page, metric: query.metric, count });
    }
  }
  return [...totals.values()];
}

const dayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: ANALYTICS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** The Eastern day of a moment, as `YYYY-MM-DD`. */
export function analyticsDay(at: Date) {
  return dayFormat.format(at);
}

export function addDays(day: string, days: number) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const clockFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: ANALYTICS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const pad = (value: number) => String(value).padStart(2, "0");

/** A clock time of an Eastern day. Eastern is 4 hours behind UTC in summer time and 5 in winter. */
function easternTime(day: string, hour: number, minute: number) {
  const [year, month, date] = day.split("-").map(Number);
  for (const offset of [4, 5]) {
    const at = new Date(Date.UTC(year, month - 1, date, hour + offset, minute));
    if (clockFormat.format(at) === `${day}, ${pad(hour)}:${pad(minute)}`) return at;
  }
  throw new Error(`No Eastern ${pad(hour)}:${pad(minute)} found on ${day}.`);
}

function midnight(day: string) {
  return easternTime(day, 0, 0);
}

/** When the nightly copy runs, Eastern time: after midnight, before the gap-filler at 04:00. */
export const ANALYTICS_SCHEDULE = { hour: 3, minute: 0 };

/** The first run of the nightly copy after `now`, for the dashboard's "Next automatic update". */
export function nextScheduledCopy(now = new Date()) {
  const today = analyticsDay(now);
  for (const day of [today, addDays(today, 1)]) {
    const at = easternTime(day, ANALYTICS_SCHEDULE.hour, ANALYTICS_SCHEDULE.minute);
    if (at > now) return at;
  }
  throw new Error("No next scheduled copy found.");
}

/**
 * The query window of one Eastern day. The API includes the hour that
 * `until` falls in, so `until` is the last millisecond before the next day.
 */
function dayWindow(day: string) {
  return {
    since: midnight(day).toISOString(),
    until: new Date(midnight(addDays(day, 1)).getTime() - 1).toISOString(),
  };
}

/**
 * Replace the analytics totals of the given days in one statement: new
 * numbers overwrite old ones and rows that no longer exist go, so a re-run
 * never doubles a count. Form requests are counted from the entries and are
 * left alone.
 */
async function replaceDailyTotals(db: Database, days: string[], totals: DailyTotal[]) {
  await db.query(
    `with fresh as (
      select * from unnest($1::date[], $2::text[], $3::text[], $4::text[], $5::integer[])
        as t(day, source, page, metric, count)
    ), stale as (
      delete from daily_totals d
      where d.day = any($6::date[])
        and d.metric = any($7::text[])
        and not exists (
          select 1 from fresh f
          where (f.day, f.source, f.page, f.metric) = (d.day, d.source, d.page, d.metric)
        )
    )
    insert into daily_totals (day, source, page, metric, count)
    select day, source, page, metric, count from fresh
    on conflict (day, source, page, metric) do update set count = excluded.count`,
    [
      totals.map((total) => total.day),
      totals.map((total) => total.source),
      totals.map((total) => total.page),
      totals.map((total) => total.metric),
      totals.map((total) => total.count),
      days,
      [...new Set(ANALYTICS_QUERIES.map((query) => query.metric))],
    ],
  );
}

/**
 * Copy the daily totals from Web Analytics into Neon. The first run copies
 * every day since Web Analytics was enabled; later runs copy from the day
 * before the last success, so late page views and a stopped job are caught up.
 */
export async function copyAnalytics(db: Database, analytics: WebAnalytics, now = new Date()) {
  const last = await lastSuccessAt(db, ANALYTICS_JOB);
  const today = analyticsDay(now);
  const days: string[] = [];
  let day = last ? addDays(analyticsDay(last), -1) : analyticsDay(await analytics.startedAt());
  for (; day <= today; day = addDays(day, 1)) days.push(day);

  const totals: DailyTotal[] = [];
  for (const day of days) {
    const window = dayWindow(day);
    const results = await Promise.all(
      ANALYTICS_QUERIES.map(async (query) => ({ query, rows: await analytics.rows(query, window) })),
    );
    totals.push(...toDailyTotals(day, results));
  }

  await replaceDailyTotals(db, days, totals);
  await recordJobSuccess(db, ANALYTICS_JOB, now);
  return { days: days.length, totals: totals.length };
}

/** Two minutes: enough to stop a double click, short enough to watch a test scan arrive. */
export const COPY_INTERVAL_MS = 2 * 60_000;

/**
 * The copy behind the dashboard's "Update now" button. A copy that finished
 * less than two minutes ago is kept instead of repeated.
 */
export async function copyAnalyticsIfStale(db: Database, analytics: WebAnalytics, now = new Date()) {
  const last = await lastSuccessAt(db, ANALYTICS_JOB);
  if (last && now.getTime() - last.getTime() < COPY_INTERVAL_MS) {
    return { copied: false as const, lastSuccessAt: last };
  }
  return { copied: true as const, ...(await copyAnalytics(db, analytics, now)) };
}

/** Web Analytics of one Vercel project, read with an API token. */
export function vercelWebAnalytics({
  token,
  projectId,
  teamId,
}: {
  token: string;
  projectId: string;
  teamId: string;
}): WebAnalytics {
  async function get(path: string, params: Record<string, string | string[]> = {}) {
    const url = new URL(path, "https://api.vercel.com");
    url.searchParams.set("teamId", teamId);
    for (const [name, value] of Object.entries(params)) {
      for (const item of [value].flat()) url.searchParams.append(name, item);
    }
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error(`Vercel answered ${response.status} for ${url.pathname}.`);
    return response.json();
  }

  return {
    async startedAt() {
      const project = await get(`/v9/projects/${projectId}`);
      const enabledAt = project.webAnalytics?.enabledAt;
      if (typeof enabledAt !== "number") throw new Error("Web Analytics is not enabled.");
      return new Date(enabledAt);
    },
    async rows(query, { since, until }) {
      const body = await get(`/v1/query/web-analytics/${query.kind}/aggregate`, {
        projectId,
        since,
        until,
        by: query.by,
        filter: query.filter,
        limit: "100",
      });
      return body.data;
    },
  };
}
