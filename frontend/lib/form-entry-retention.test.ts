import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";
import type { AskAboutCampEntry } from "@/lib/ask-about-camp-delivery";
import {
  deleteOldFormEntries,
  deleteOldFormsparkSubmissions,
  retentionCutoff,
} from "@/lib/form-entry-retention";
import { storeFormEntry } from "@/lib/form-entry-store";
import type { FormsparkApi, FormsparkSubmission } from "@/lib/formspark-api";

const migrations = path.resolve(__dirname, "../db/migrations");

function entry(id: number, receivedAt: string): AskAboutCampEntry {
  return {
    name: "Dana Rivera",
    phone: "(610) 555-0123",
    email: "dana@example.com",
    childAge: "9",
    bestTime: "",
    interests: [],
    submissionId: `00000000-0000-4000-8000-${String(id).padStart(12, "0")}`,
    receivedAt,
    source: "direct",
    page: "/ask-about-camp",
  };
}

describe("retentionCutoff", () => {
  it("is the same moment exactly three years earlier", () => {
    expect(retentionCutoff(new Date("2026-10-09T04:30:00.000Z")).toISOString()).toBe("2023-10-09T04:30:00.000Z");
  });

  it("is February 28 when today is February 29", () => {
    expect(retentionCutoff(new Date("2028-02-29T09:00:00.000Z")).toISOString()).toBe("2025-02-28T09:00:00.000Z");
  });

  it("matches Postgres's three-year interval", async () => {
    const db = new PGlite();
    for (const now of ["2026-10-09T04:30:00.000Z", "2028-02-29T09:00:00.000Z", "2026-12-31T23:59:59.999Z"]) {
      const { rows } = await db.query<{ cutoff: Date }>(
        "select ($1::timestamptz at time zone 'UTC' - interval '3 years') at time zone 'UTC' as cutoff",
        [now],
      );
      expect(retentionCutoff(new Date(now))).toEqual(rows[0].cutoff);
    }
  });
});

describe("deleteOldFormEntries", () => {
  it("deletes entries received before the cutoff and keeps the one received at it", async () => {
    const db = new PGlite();
    for (const file of readdirSync(migrations).sort()) {
      await db.exec(readFileSync(path.join(migrations, file), "utf8"));
    }
    const cutoff = retentionCutoff(new Date("2026-10-09T04:30:00.000Z"));
    await storeFormEntry(db, entry(1, "2023-10-09T04:29:59.999Z"));
    await storeFormEntry(db, entry(2, "2023-10-09T04:30:00.000Z"));
    await db.query(
      "insert into delivery_gaps (submission_id, path, received_at, found_at) values ($1, 'trigger', $2, $2)",
      [entry(1, "").submissionId, "2023-10-09T04:29:59.999Z"],
    );

    await expect(deleteOldFormEntries(db, cutoff)).resolves.toBe(1);

    const { rows } = await db.query("select submission_id from form_entries");
    expect(rows).toEqual([{ submission_id: entry(2, "").submissionId }]);
    const gaps = await db.query("select * from delivery_gaps");
    expect(gaps.rows).toEqual([]);
  });
});

describe("deleteOldFormsparkSubmissions", () => {
  it("deletes only the submissions received before the cutoff, from every page", async () => {
    const submissions: FormsparkSubmission[] = [
      { id: "new", data: {}, createdAt: "2026-01-01T00:00:00.000Z" },
      { id: "at-cutoff", data: {}, createdAt: "2023-10-09T04:30:00.000Z" },
      { id: "old", data: {}, createdAt: "2023-10-09T04:29:59.999Z" },
      { id: "older", data: {}, createdAt: "2022-05-01T00:00:00.000Z" },
    ];
    const deleted: string[] = [];
    const api: FormsparkApi = {
      async *submissions() {
        yield* submissions;
      },
      async deleteSubmission(id) {
        deleted.push(id);
      },
    };

    await expect(
      deleteOldFormsparkSubmissions(api, new Date("2023-10-09T04:30:00.000Z")),
    ).resolves.toBe(2);
    expect(deleted).toEqual(["old", "older"]);
  });
});
