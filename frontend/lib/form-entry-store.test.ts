import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeEach, describe, expect, it } from "vitest";
import type { AskAboutCampEntry } from "@/lib/ask-about-camp-delivery";
import type { MemorialCardEntry } from "@/lib/form-entry";
import { deleteOldFormEntries } from "@/lib/form-entry-retention";
import { storeFormEntry } from "@/lib/form-entry-store";
import { validateMemorialCard } from "@/lib/memorial-card";
import { validDraft } from "@/test/memorial-card-draft";

const migrations = path.resolve(__dirname, "../db/migrations");

const entry: AskAboutCampEntry = {
  kind: "ask_about_camp",
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

  function memorialEntry(): MemorialCardEntry {
    const formData = new FormData();
    for (const [field, value] of Object.entries(validDraft)) formData.set(field, value);
    const checked = validateMemorialCard(formData);
    if (!checked.ok) throw new Error("The test draft is not valid");
    return {
      ...checked.request,
      kind: "memorial_card",
      submissionId: "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
      receivedAt: "2026-11-04T14:30:00.000Z",
      source: "obituary",
      page: "/donate/memorial",
    };
  }

  it("stores a memorial card entry once, with the kind memorial card and its answers", async () => {
    const memorial = memorialEntry();
    await expect(storeFormEntry(db, memorial)).resolves.toBe(true);
    await expect(storeFormEntry(db, memorial)).resolves.toBe(false);

    const entries = await db.query("select submission_id, kind, parent_name from form_entries");
    expect(entries.rows).toEqual([{ submission_id: memorial.submissionId, kind: "memorial_card", parent_name: null }]);
    const answers = await db.query(
      "select honoree_name, amount::text as amount, card_message_is_own_words, donor_email from memorial_card_entries",
    );
    expect(answers.rows).toEqual([
      { honoree_name: "Ruth Ellen Baker", amount: "1250.50", card_message_is_own_words: false, donor_email: "dana@example.com" },
    ]);
  });

  it("gives an Ask about camp request the kind ask about camp", async () => {
    await storeFormEntry(db, entry);
    const { rows } = await db.query("select kind from form_entries");
    expect(rows).toEqual([{ kind: "ask_about_camp" }]);
  });

  it("deletes a memorial card's answers with its entry when retention removes it", async () => {
    await storeFormEntry(db, memorialEntry());
    await expect(deleteOldFormEntries(db, new Date("2030-01-01T00:00:00.000Z"))).resolves.toBe(1);

    const { rows } = await db.query("select count(*)::integer as count from memorial_card_entries");
    expect(rows).toEqual([{ count: 0 }]);
  });
});
