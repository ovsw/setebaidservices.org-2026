import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AskAboutCampEntry } from "@/lib/ask-about-camp-delivery";
import { emailNewGaps, fillFormEntryGaps } from "@/lib/form-entry-gaps";
import { storeFormEntry } from "@/lib/form-entry-store";
import { entryFromFormspark, formsparkPayload } from "@/lib/formspark-entry";
import type { FormsparkSubmission } from "@/lib/formspark-api";

const migrations = path.resolve(__dirname, "../db/migrations");
const NOW = new Date("2026-10-20T08:00:00.000Z");
const HOUR = 60 * 60 * 1000;

function entry(id: number, hoursAgo: number, extra: Partial<AskAboutCampEntry> = {}): AskAboutCampEntry {
  return {
    name: "Dana Rivera",
    phone: "(610) 555-0123",
    email: "dana@example.com",
    childAge: "9",
    bestTime: "",
    interests: [],
    submissionId: `00000000-0000-4000-8000-${String(id).padStart(12, "0")}`,
    receivedAt: new Date(NOW.getTime() - hoursAgo * HOUR).toISOString(),
    source: "chop-nurses",
    page: "/go/events",
    ...extra,
  };
}

function inFormspark(item: AskAboutCampEntry): FormsparkSubmission {
  return { id: `fs-${item.submissionId.slice(-4)}`, data: formsparkPayload(item), createdAt: item.receivedAt };
}

describe("fillFormEntryGaps", () => {
  let db: PGlite;

  beforeEach(async () => {
    db = new PGlite();
    for (const file of readdirSync(migrations).sort()) {
      await db.exec(readFileSync(path.join(migrations, file), "utf8"));
    }
  });

  async function storedIds() {
    const { rows } = await db.query<{ submission_id: string; formspark_id: string | null }>(
      "select submission_id, formspark_id from form_entries order by submission_id",
    );
    return rows;
  }

  it("copies only the Formspark entries that Neon is missing, and only when older than 3 hours", async () => {
    const stored = entry(1, 30);
    const lost = entry(2, 5, { interests: ["Cabins", "Talk with the camp director"], campaign: "fall-2026-events" });
    const stillRetrying = entry(3, 2);
    await storeFormEntry(db, stored);

    const result = await fillFormEntryGaps(
      db,
      [inFormspark(stillRetrying), inFormspark(lost), inFormspark(stored)],
      NOW,
    );

    expect(result.copied).toEqual([{ submissionId: lost.submissionId, path: "trigger", receivedAt: lost.receivedAt }]);
    expect(result.missingFromFormspark).toEqual([]);
    expect(await storedIds()).toEqual([
      { submission_id: stored.submissionId, formspark_id: "fs-0001" },
      { submission_id: lost.submissionId, formspark_id: "fs-0002" },
    ]);
    const { rows } = await db.query("select interests, campaign, best_time from form_entries where submission_id = $1", [
      lost.submissionId,
    ]);
    expect(rows).toEqual([
      { interests: ["Cabins", "Talk with the camp director"], campaign: "fall-2026-events", best_time: "" },
    ]);
  });

  it("reports Neon entries older than one day that have no Formspark copy", async () => {
    const mailed = entry(1, 30);
    const notMailed = entry(2, 30);
    const tooRecent = entry(3, 20);
    for (const item of [mailed, notMailed, tooRecent]) await storeFormEntry(db, item);

    const result = await fillFormEntryGaps(db, [inFormspark(mailed)], NOW);

    expect(result.copied).toEqual([]);
    expect(result.missingFromFormspark).toEqual([
      { submissionId: notMailed.submissionId, path: "formspark", receivedAt: notMailed.receivedAt },
    ]);
  });

  it("reports each gap one time, and the next run finds nothing new", async () => {
    const lost = entry(1, 5);
    const notMailed = entry(2, 30);
    await storeFormEntry(db, notMailed);

    await fillFormEntryGaps(db, [inFormspark(lost)], NOW);
    const again = await fillFormEntryGaps(db, [inFormspark(lost)], new Date(NOW.getTime() + 24 * HOUR));

    expect(again).toEqual({ copied: [], missingFromFormspark: [], unreadable: 0 });
    const { rows } = await db.query("select submission_id, path from delivery_gaps order by path");
    expect(rows).toEqual([
      { submission_id: notMailed.submissionId, path: "formspark" },
      { submission_id: lost.submissionId, path: "trigger" },
    ]);
  });

  it("skips Formspark submissions the Website did not send", async () => {
    const test = { id: "fs-test", data: { message: "test" }, createdAt: entry(9, 10).receivedAt };

    const result = await fillFormEntryGaps(db, [test], NOW);

    expect(result).toEqual({ copied: [], missingFromFormspark: [], unreadable: 1 });
    expect(await storedIds()).toEqual([]);
  });
});

describe("emailNewGaps", () => {
  it("emails the unsent gaps without family details, one time", async () => {
    const db = new PGlite();
    for (const file of readdirSync(migrations).sort()) {
      await db.exec(readFileSync(path.join(migrations, file), "utf8"));
    }
    await fillFormEntryGaps(db, [inFormspark(entry(1, 5))], NOW);
    const send = vi.fn(async () => {});

    await expect(emailNewGaps(db, send, NOW)).resolves.toBe(1);
    await expect(emailNewGaps(db, send, NOW)).resolves.toBe(0);

    expect(send).toHaveBeenCalledTimes(1);
    const [{ subject, text }] = send.mock.calls[0] as unknown as [{ subject: string; text: string }];
    expect(subject).toBe("Setebaid: 1 request reached only one path");
    expect(text).toContain("00000000-0000-4000-8000-000000000001");
    expect(text).not.toMatch(/Dana|555|example\.com/);
  });

  it("keeps the gaps unsent when the email fails", async () => {
    const db = new PGlite();
    for (const file of readdirSync(migrations).sort()) {
      await db.exec(readFileSync(path.join(migrations, file), "utf8"));
    }
    await fillFormEntryGaps(db, [inFormspark(entry(1, 5))], NOW);

    await expect(emailNewGaps(db, async () => Promise.reject(new Error("down")), NOW)).rejects.toThrow("down");
    await expect(emailNewGaps(db, async () => {}, NOW)).resolves.toBe(1);
  });
});

describe("entryFromFormspark", () => {
  it("reads back what the Website posted", () => {
    const sent = entry(1, 1, { bestTime: "Evenings", interests: ["Cabins"], campaign: "fall-2026-events" });
    expect(entryFromFormspark(formsparkPayload(sent))).toEqual(sent);
    const plain = entry(2, 1);
    expect(entryFromFormspark(formsparkPayload(plain))).toEqual(plain);
  });
});
