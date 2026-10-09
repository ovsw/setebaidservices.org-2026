import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeEach, describe, expect, it } from "vitest";
import {
  ANALYTICS_QUERIES,
  copyAnalytics,
  type AnalyticsQuery,
  type AnalyticsRow,
  type WebAnalytics,
} from "@/lib/analytics-copy";

const migrations = path.resolve(__dirname, "../db/migrations");
const [tagged, untaggedGo, untaggedOther, scans, callTaps, emailTaps] = ANALYTICS_QUERIES;

type Answers = Map<AnalyticsQuery, AnalyticsRow[]>;

/** A fake Web Analytics that answers per Eastern day and query. */
function fakeAnalytics(startedAt: string, days: Record<string, Answers>) {
  const windows: { since: string; until: string }[] = [];
  const analytics: WebAnalytics = {
    startedAt: async () => new Date(startedAt),
    rows: async (query, window) => {
      if (query === tagged) windows.push(window);
      const day = Object.keys(days).find((day) => window.since.startsWith(day));
      return (day ? days[day].get(query) : undefined) ?? [];
    },
  };
  return { analytics, windows };
}

type TotalRow = { day: string; source: string; page: string; metric: string; count: number };

async function totals(db: PGlite) {
  const { rows } = await db.query<TotalRow>(
    "select day::text, source, page, metric, count from daily_totals order by day, source, page, metric",
  );
  return rows;
}

describe("copyAnalytics", () => {
  let db: PGlite;

  beforeEach(async () => {
    db = new PGlite();
    for (const file of readdirSync(migrations).sort()) {
      await db.exec(readFileSync(path.join(migrations, file), "utf8"));
    }
  });

  it("maps Vercel rows to daily totals per Source, page and metric", async () => {
    const { analytics } = fakeAnalytics("2026-10-17T12:00:00Z", {
      "2026-10-17": new Map([
        [tagged, [{ utmSource: "chop-nurses", requestPath: "/go/events", pageviews: 3, visitors: 2 }]],
        [untaggedGo, [{ requestPath: "/go/events", pageviews: 2, visitors: 2 }]],
        [
          untaggedOther,
          [
            { requestPath: "/", pageviews: 5, visitors: 4 },
            { requestPath: "/about", pageviews: 0, visitors: 0 },
            { requestPath: "Others", pageviews: 7, visitors: 6 },
          ],
        ],
        [scans, [{ "eventData/source": "chop-nurses", "eventData/page": "/go/events", count: 3, visitors: 2 }]],
        [
          callTaps,
          [
            { "eventData/source": "chop-nurses", "eventData/page": "/ask-about-camp", count: 1, visitors: 1 },
            { "eventData/source": "Others", "eventData/page": "Others", count: 2, visitors: 2 },
          ],
        ],
        [emailTaps, [{ "eventData/source": "direct", "eventData/page": "/", count: 1, visitors: 1 }]],
      ]),
    });

    await copyAnalytics(db, analytics, new Date("2026-10-17T20:00:00Z"));

    expect(await totals(db)).toEqual([
      { day: "2026-10-17", source: "chop-nurses", page: "/ask-about-camp", metric: "call_taps", count: 1 },
      { day: "2026-10-17", source: "chop-nurses", page: "/go/events", metric: "scans", count: 3 },
      { day: "2026-10-17", source: "chop-nurses", page: "/go/events", metric: "visits", count: 3 },
      { day: "2026-10-17", source: "direct", page: "/", metric: "email_taps", count: 1 },
      { day: "2026-10-17", source: "direct", page: "/", metric: "visits", count: 5 },
      { day: "2026-10-17", source: "direct", page: "other", metric: "visits", count: 7 },
      { day: "2026-10-17", source: "go-events", page: "/go/events", metric: "visits", count: 2 },
      { day: "2026-10-17", source: "other", page: "other", metric: "call_taps", count: 2 },
    ]);
  });

  it("fills every day since analytics started, then replaces numbers on a re-run", async () => {
    const visit = (pageviews: number) => new Map([[untaggedOther, [{ requestPath: "/", pageviews, visitors: 1 }]]]);
    const first = fakeAnalytics("2026-10-08T04:17:48Z", {
      "2026-10-08": visit(1),
      "2026-10-09": visit(2),
      "2026-10-10": visit(3),
    });

    await copyAnalytics(db, first.analytics, new Date("2026-10-10T15:00:00Z"));

    // Eastern days, each ending on the last millisecond before the next one.
    expect(first.windows).toEqual([
      { since: "2026-10-08T04:00:00.000Z", until: "2026-10-09T03:59:59.999Z" },
      { since: "2026-10-09T04:00:00.000Z", until: "2026-10-10T03:59:59.999Z" },
      { since: "2026-10-10T04:00:00.000Z", until: "2026-10-11T03:59:59.999Z" },
    ]);
    expect((await totals(db)).map((row) => [row.day, row.count])).toEqual([
      ["2026-10-08", 1],
      ["2026-10-09", 2],
      ["2026-10-10", 3],
    ]);

    // An hour later the day before and today are copied again, and replaced.
    const second = fakeAnalytics("2026-10-08T04:17:48Z", {
      "2026-10-08": visit(100),
      "2026-10-09": visit(2),
      "2026-10-10": visit(4),
    });
    await copyAnalytics(db, second.analytics, new Date("2026-10-10T16:00:00Z"));

    expect(second.windows.map((window) => window.since)).toEqual([
      "2026-10-09T04:00:00.000Z",
      "2026-10-10T04:00:00.000Z",
    ]);
    expect((await totals(db)).map((row) => [row.day, row.count])).toEqual([
      ["2026-10-08", 1],
      ["2026-10-09", 2],
      ["2026-10-10", 4],
    ]);
    const { rows } = await db.query("select job, last_success_at from job_state");
    expect(rows).toEqual([{ job: "copy-analytics", last_success_at: new Date("2026-10-10T16:00:00Z") }]);
  });

  it("drops a total that is gone from Vercel and keeps form requests", async () => {
    await db.query(
      `insert into daily_totals values
        ('2026-10-17', 'chop-nurses', '/go/events', 'scans', 4),
        ('2026-10-17', 'chop-nurses', '/go/events', 'form_requests', 2)`,
    );
    const { analytics } = fakeAnalytics("2026-10-17T12:00:00Z", {});

    await copyAnalytics(db, analytics, new Date("2026-10-17T20:00:00Z"));

    expect((await totals(db)).map((row) => row.metric)).toEqual(["form_requests"]);
  });
});
