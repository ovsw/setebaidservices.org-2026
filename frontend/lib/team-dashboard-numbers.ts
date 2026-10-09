import {
  addDays,
  ANALYTICS_JOB,
  ANALYTICS_TIME_ZONE,
  analyticsDay,
} from "@/lib/analytics-copy";
import type { Database } from "@/lib/database";
import { lastSuccessAt } from "@/lib/job-state";
import { isCardSource } from "@/lib/visit-source";

/** A period of whole Eastern days, both ends included, as `YYYY-MM-DD`. */
export type DashboardRange = { from: string; to: string };

export type DashboardPreset = "season" | "7d" | "30d" | "custom";

/**
 * A season starts on September 1: the fall outreach for the next summer's
 * camp. It ends when the next one starts.
 */
const SEASON_START = "09-01";

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isDay(value: string | undefined): value is string {
  if (!value || !DAY_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function seasonStart(today: string) {
  const year = Number(today.slice(0, 4));
  const start = `${year}-${SEASON_START}`;
  return start <= today ? start : `${year - 1}-${SEASON_START}`;
}

/**
 * The period the dashboard shows for its address parameters. Two valid days
 * give a custom period; `7d` and `30d` end today; anything else is this
 * season so far.
 */
export function dashboardRange(
  params: { range?: string; from?: string; to?: string },
  now = new Date(),
): { preset: DashboardPreset; range: DashboardRange } {
  const today = analyticsDay(now);
  const { from, to } = params;
  if (isDay(from) && isDay(to)) {
    return { preset: "custom", range: from <= to ? { from, to } : { from: to, to: from } };
  }
  if (params.range === "7d") return { preset: "7d", range: { from: addDays(today, -6), to: today } };
  if (params.range === "30d") return { preset: "30d", range: { from: addDays(today, -29), to: today } };
  return { preset: "season", range: { from: seasonStart(today), to: today } };
}

export type DashboardCounts = {
  visits: number;
  scans: number;
  callTaps: number;
  emailTaps: number;
  formRequests: number;
};

export type DashboardRow = DashboardCounts & {
  source: string;
  /** Only a card's row can have QR scans. */
  card: boolean;
};

export type DashboardNumbers = {
  rows: DashboardRow[];
  totals: DashboardCounts;
  /** Requests that reached only one of Formspark and Neon. */
  missingEntries: number;
  /** The analytics copy job's last successful run. */
  lastUpdated?: Date;
};

const COLUMNS = {
  visits: "visits",
  scans: "scans",
  call_taps: "callTaps",
  email_taps: "emailTaps",
  form_requests: "formRequests",
} as const satisfies Record<string, keyof DashboardCounts>;

const emptyCounts = (): DashboardCounts => ({
  visits: 0,
  scans: 0,
  callTaps: 0,
  emailTaps: 0,
  formRequests: 0,
});

/** The Eastern day a request arrived on, to match the days of the daily totals. */
const receivedDay = `(received_at at time zone '${ANALYTICS_TIME_ZONE}')::date`;

/**
 * The dashboard's counts for a period: one row per Source and a totals row.
 * Form requests are counted from the stored entries, so an ad blocker cannot
 * hide one; the other columns come from the daily totals. Only counts leave
 * the database, never entry details.
 */
export async function readDashboardNumbers(
  db: Database,
  { from, to }: DashboardRange,
): Promise<DashboardNumbers> {
  const [counts, gaps, lastUpdated] = await Promise.all([
    db.query(
      `select source, metric, sum(count)::integer as count
        from daily_totals
        where day between $1::date and $2::date
          and metric in ('visits', 'scans', 'call_taps', 'email_taps')
        group by source, metric
      union all
      select source, 'form_requests', count(*)::integer
        from form_entries
        where ${receivedDay} between $1::date and $2::date
        group by source`,
      [from, to],
    ),
    db.query(
      `select count(distinct submission_id)::integer as count
        from delivery_gaps
        where ${receivedDay} between $1::date and $2::date`,
      [from, to],
    ),
    lastSuccessAt(db, ANALYTICS_JOB),
  ]);

  const bySource = new Map<string, DashboardRow>();
  const totals = emptyCounts();
  for (const row of counts.rows as { source: string; metric: keyof typeof COLUMNS; count: number }[]) {
    const column = COLUMNS[row.metric];
    let sourceRow = bySource.get(row.source);
    if (!sourceRow) bySource.set(
        row.source,
        (sourceRow = { source: row.source, card: isCardSource(row.source), ...emptyCounts() }),
      );
    sourceRow[column] += row.count;
    totals[column] += row.count;
  }

  // Cards first, then the `/go` pages without a card, then `direct`; the
  // busiest first within each group.
  const group = (row: DashboardRow) => (row.card ? 0 : row.source === "direct" ? 2 : 1);
  const rows = [...bySource.values()].sort(
    (a, b) =>
      group(a) - group(b) ||
      b.visits - a.visits ||
      b.formRequests - a.formRequests ||
      a.source.localeCompare(b.source),
  );
  const missingEntries = (gaps.rows[0] as { count: number } | undefined)?.count ?? 0;
  return { rows, totals, missingEntries, lastUpdated };
}
