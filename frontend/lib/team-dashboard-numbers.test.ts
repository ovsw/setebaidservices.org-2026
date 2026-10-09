import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeEach, describe, expect, it } from "vitest";
import { dashboardRange, readDashboardNumbers } from "@/lib/team-dashboard-numbers";

const migrations = path.resolve(__dirname, "../db/migrations");

let entryCount = 0;

async function addEntry(db: PGlite, source: string, receivedAt: string) {
  entryCount += 1;
  const id = `00000000-0000-4000-8000-${String(entryCount).padStart(12, "0")}`;
  await db.query(
    `insert into form_entries (submission_id, received_at, source, page, parent_name, phone, email, child_age)
    values ($1, $2, $3, '/ask-about-camp', 'Pat Parent', '555-0100', 'pat@example.test', '9')`,
    [id, receivedAt, source],
  );
  return id;
}

async function addTotal(db: PGlite, day: string, source: string, page: string, metric: string, count: number) {
  await db.query(
    "insert into daily_totals (day, source, page, metric, count) values ($1, $2, $3, $4, $5)",
    [day, source, page, metric, count],
  );
}

describe("readDashboardNumbers", () => {
  let db: PGlite;

  beforeEach(async () => {
    db = new PGlite();
    for (const file of readdirSync(migrations).sort()) {
      await db.exec(readFileSync(path.join(migrations, file), "utf8"));
    }
  });

  it("gives one row per Source and a totals row for the period", async () => {
    // Inside the period, across pages and days.
    await addTotal(db, "2026-10-10", "chop-nurses", "/go/events", "visits", 3);
    await addTotal(db, "2026-10-11", "chop-nurses", "/ask-about-camp", "visits", 2);
    await addTotal(db, "2026-10-10", "chop-nurses", "/go/events", "scans", 3);
    await addTotal(db, "2026-10-11", "chop-nurses", "/ask-about-camp", "call_taps", 1);
    await addTotal(db, "2026-10-12", "direct", "/", "visits", 9);
    await addTotal(db, "2026-10-12", "direct", "/", "email_taps", 2);
    // Outside the period.
    await addTotal(db, "2026-10-09", "chop-nurses", "/go/events", "visits", 50);
    await addTotal(db, "2026-10-13", "direct", "/", "visits", 50);

    // 2026-10-10 00:30 and 2026-10-12 23:30 Eastern are inside; the UTC
    // days would put them outside.
    await addEntry(db, "chop-nurses", "2026-10-10T04:30:00Z");
    await addEntry(db, "chop-nurses", "2026-10-11T15:00:00Z");
    await addEntry(db, "go-events", "2026-10-13T03:30:00Z");
    // 2026-10-09 23:30 and 2026-10-13 00:30 Eastern are outside.
    await addEntry(db, "chop-nurses", "2026-10-10T03:30:00Z");
    await addEntry(db, "direct", "2026-10-13T04:30:00Z");

    const numbers = await readDashboardNumbers(db, { from: "2026-10-10", to: "2026-10-12" });

    expect(numbers.rows).toEqual([
      { source: "direct", visits: 9, scans: 0, callTaps: 0, emailTaps: 2, formRequests: 0 },
      { source: "chop-nurses", visits: 5, scans: 3, callTaps: 1, emailTaps: 0, formRequests: 2 },
      { source: "go-events", visits: 0, scans: 0, callTaps: 0, emailTaps: 0, formRequests: 1 },
    ]);
    expect(numbers.totals).toEqual({ visits: 14, scans: 3, callTaps: 1, emailTaps: 2, formRequests: 3 });
  });

  it("counts form requests from the entries, not from the daily totals", async () => {
    await addTotal(db, "2026-10-10", "chop-nurses", "/ask-about-camp", "form_requests", 7);
    await addEntry(db, "chop-nurses", "2026-10-10T15:00:00Z");

    const numbers = await readDashboardNumbers(db, { from: "2026-10-10", to: "2026-10-10" });

    expect(numbers.rows).toEqual([
      { source: "chop-nurses", visits: 0, scans: 0, callTaps: 0, emailTaps: 0, formRequests: 1 },
    ]);
    expect(numbers.totals.formRequests).toBe(1);
  });

  it("counts the missing entries of the period and gives the last copy time", async () => {
    const inside = await addEntry(db, "direct", "2026-10-10T15:00:00Z");
    const outside = await addEntry(db, "direct", "2026-10-09T15:00:00Z");
    const insertGap = (id: string, gapPath: string, receivedAt: string) =>
      db.query(
        "insert into delivery_gaps (submission_id, path, received_at, found_at) values ($1, $2, $3, now())",
        [id, gapPath, receivedAt],
      );
    await insertGap(inside, "formspark", "2026-10-10T15:00:00Z");
    await insertGap(outside, "trigger", "2026-10-09T15:00:00Z");
    await db.query("insert into job_state (job, last_success_at) values ('copy-analytics', $1)", [
      "2026-10-10T19:00:00Z",
    ]);

    const numbers = await readDashboardNumbers(db, { from: "2026-10-10", to: "2026-10-10" });

    expect(numbers.missingEntries).toBe(1);
    expect(numbers.lastUpdated).toEqual(new Date("2026-10-10T19:00:00Z"));
  });

  it("gives empty numbers for a period without data", async () => {
    const numbers = await readDashboardNumbers(db, { from: "2026-10-10", to: "2026-10-12" });

    expect(numbers).toEqual({
      rows: [],
      totals: { visits: 0, scans: 0, callTaps: 0, emailTaps: 0, formRequests: 0 },
      missingEntries: 0,
      lastUpdated: undefined,
    });
  });
});

describe("dashboardRange", () => {
  // 2026-10-09 22:00 Eastern; already 2026-10-10 in UTC.
  const now = new Date("2026-10-10T02:00:00Z");

  it("ends the presets on today's Eastern day", () => {
    expect(dashboardRange({ range: "7d" }, now).range).toEqual({ from: "2026-10-03", to: "2026-10-09" });
    expect(dashboardRange({ range: "30d" }, now).range).toEqual({ from: "2026-09-10", to: "2026-10-09" });
  });

  it("starts this season on the last September 1", () => {
    expect(dashboardRange({}, now)).toEqual({ preset: "season", range: { from: "2026-09-01", to: "2026-10-09" } });
    expect(dashboardRange({}, new Date("2027-08-31T16:00:00Z")).range.from).toBe("2026-09-01");
    expect(dashboardRange({}, new Date("2027-09-01T16:00:00Z")).range.from).toBe("2027-09-01");
  });

  it("takes a custom period of two real days, in either order", () => {
    expect(dashboardRange({ from: "2026-10-12", to: "2026-10-01" }, now)).toEqual({
      preset: "custom",
      range: { from: "2026-10-01", to: "2026-10-12" },
    });
    expect(dashboardRange({ from: "2026-02-30", to: "2026-03-01" }, now).preset).toBe("season");
    expect(dashboardRange({ from: "2026-10-01" }, now).preset).toBe("season");
  });
});
