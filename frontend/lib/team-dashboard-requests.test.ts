import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeEach, describe, expect, it } from "vitest";
import {
  normalizeCallNote,
  readDashboardRequests,
  saveCallStatus,
} from "@/lib/team-dashboard-requests";

const migrations = path.resolve(__dirname, "../db/migrations");

const ids = {
  oldOpen: "11111111-1111-4111-8111-111111111111",
  newOpen: "22222222-2222-4222-8222-222222222222",
  called: "33333333-3333-4333-8333-333333333333",
  noAnswer: "44444444-4444-4444-8444-444444444444",
  outside: "55555555-5555-4555-8555-555555555555",
};

const range = { from: "2026-10-10", to: "2026-10-12" };

describe("dashboard requests", () => {
  let db: PGlite;

  beforeEach(async () => {
    db = new PGlite();
    for (const file of readdirSync(migrations).sort()) {
      await db.exec(readFileSync(path.join(migrations, file), "utf8"));
    }
    const insert = (id: string, receivedAt: string, status = "to_call") =>
      db.query(
        `insert into form_entries (submission_id, received_at, source, page, parent_name,
          phone, email, child_age, best_time, interests, call_status)
        values ($1, $2, 'chop-nurses', '/go/events', 'Dana Rivera', '(610) 555-0123',
          'dana@example.com', '9', '', '{}', $3)`,
        [id, receivedAt, status],
      );
    await insert(ids.oldOpen, "2026-10-10T14:00:00Z");
    await insert(ids.newOpen, "2026-10-12T14:00:00Z");
    await insert(ids.called, "2026-10-12T15:00:00Z", "called");
    await insert(ids.noAnswer, "2026-10-11T14:00:00Z", "no_answer");
    await insert(ids.outside, "2026-10-01T14:00:00Z");
  });

  it("lists the period's requests, open first and newest first", async () => {
    const rows = await readDashboardRequests(db, range);
    expect(rows.map((row) => row.submissionId)).toEqual([
      ids.newOpen,
      ids.noAnswer,
      ids.oldOpen,
      ids.called,
    ]);
    expect(rows[0]).toMatchObject({
      parentName: "Dana Rivera",
      callStatus: "to_call",
      callNote: "",
      callStatusAt: null,
      interests: [],
    });
  });

  it("leaves out the called requests when asked for open ones", async () => {
    const rows = await readDashboardRequests(db, range, { openOnly: true });
    expect(rows.map((row) => row.submissionId)).toEqual([ids.newOpen, ids.noAnswer, ids.oldOpen]);
  });

  it("moves the change time only when the status changes", async () => {
    await expect(
      saveCallStatus(db, { submissionId: ids.newOpen, status: "no_answer", note: "Try evening" }),
    ).resolves.toBe(true);
    const [first] = (await readDashboardRequests(db, range)).filter(
      (row) => row.submissionId === ids.newOpen,
    );
    expect(first).toMatchObject({ callStatus: "no_answer", callNote: "Try evening" });
    expect(first.callStatusAt).toBeInstanceOf(Date);

    await saveCallStatus(db, { submissionId: ids.newOpen, status: "no_answer", note: "Tuesday" });
    const [second] = (await readDashboardRequests(db, range)).filter(
      (row) => row.submissionId === ids.newOpen,
    );
    expect(second.callNote).toBe("Tuesday");
    expect(second.callStatusAt).toEqual(first.callStatusAt);

    await expect(
      saveCallStatus(db, { submissionId: ids.outside, status: "called", note: "" }),
    ).resolves.toBe(true);
    await expect(
      saveCallStatus(db, { submissionId: "99999999-9999-4999-8999-999999999999", status: "called", note: "" }),
    ).resolves.toBe(false);
  });

  it("trims and caps the note", () => {
    expect(normalizeCallNote("  call back Tuesday  ")).toBe("call back Tuesday");
    expect(normalizeCallNote("x".repeat(600))).toHaveLength(500);
    expect(normalizeCallNote(undefined)).toBe("");
  });
});
