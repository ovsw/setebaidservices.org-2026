import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeEach, describe, expect, it } from "vitest";
import type { AskAboutCampEntry } from "@/lib/ask-about-camp-delivery";
import { storeFormEntry } from "@/lib/form-entry-store";

const migrations = path.resolve(__dirname, "../db/migrations");

const entry: AskAboutCampEntry = {
  name: "Dana Rivera",
  phone: "(610) 555-0123",
  email: "dana@example.com",
  childAge: "9",
  bestTime: "",
  interests: ["Talk with the camp director"],
  submissionId: "6f1c2b4e-8d3a-4c5f-9b7e-2a1d0e3f4c5b",
  receivedAt: "2026-10-17T14:30:00.000Z",
  source: "chop-nurses",
  page: "/go/events",
};

describe("storeFormEntry", () => {
  let db: PGlite;

  beforeEach(async () => {
    db = new PGlite();
    for (const file of readdirSync(migrations).sort()) {
      await db.exec(readFileSync(path.join(migrations, file), "utf8"));
    }
  });

  it("keeps one row when the same entry is stored twice", async () => {
    await expect(storeFormEntry(db, entry)).resolves.toBe(true);
    await expect(storeFormEntry(db, entry)).resolves.toBe(false);

    const { rows } = await db.query("select submission_id, source, campaign, interests from form_entries");
    expect(rows).toEqual([
      {
        submission_id: entry.submissionId,
        source: "chop-nurses",
        campaign: null,
        interests: ["Talk with the camp director"],
      },
    ]);
  });
});
