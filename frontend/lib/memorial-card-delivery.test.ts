import { describe, expect, it, vi } from "vitest";
import { createSubmitLimiter } from "@/lib/form-delivery";
import type { FormEntry, MemorialCardEntry } from "@/lib/form-entry";
import { decryptFormEntry, type EncryptedFormEntry } from "@/lib/form-entry-crypto";
import { entryFromFormspark, formsparkPayload } from "@/lib/formspark-entry";
import { submitMemorialCard } from "@/lib/memorial-card-delivery";
import { validDraft } from "@/test/memorial-card-draft";

const KEY = Buffer.alloc(32, 7).toString("base64");
const ID = "6f1c2b4e-8d3a-4c5f-9b7e-2a1d0e3f4c5b";

function validForm(extra: Record<string, string> = {}) {
  const formData = new FormData();
  const fields = { ...validDraft, source: "obituary", page: "/donate/memorial", ...extra };
  for (const [name, value] of Object.entries(fields)) formData.set(name, value);
  return formData;
}

function deps() {
  const sent: FormEntry[] = [];
  const triggered: EncryptedFormEntry[] = [];
  return {
    sent,
    triggered,
    deps: {
      trigger: vi.fn(async (payload: EncryptedFormEntry) => {
        triggered.push(payload);
      }),
      encryptionKey: KEY,
      formspark: vi.fn(async (entry: FormEntry) => {
        sent.push(entry);
      }),
      allow: createSubmitLimiter({ limit: 5, windowMs: 60_000 }),
      now: () => new Date("2026-11-04T14:30:00.000Z"),
      newId: () => ID,
    },
  };
}

describe("submitMemorialCard", () => {
  it("sends a valid entry on both paths with one submission ID and the kind memorial card", async () => {
    const { sent, triggered, deps: d } = deps();

    await expect(submitMemorialCard(validForm(), "203.0.113.7", d)).resolves.toEqual({ status: "sent" });
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      kind: "memorial_card",
      submissionId: ID,
      receivedAt: "2026-11-04T14:30:00.000Z",
      source: "obituary",
      page: "/donate/memorial",
      honoreeName: "Ruth Ellen Baker",
      amount: "1250.50",
    });
    expect(triggered).toHaveLength(1);
    expect(triggered[0].submissionId).toBe(ID);
    expect(decryptFormEntry(triggered[0], KEY)).toEqual(sent[0]);
  });

  it("gives Trigger.dev only the encrypted entry", async () => {
    const { triggered, deps: d } = deps();
    await submitMemorialCard(validForm(), "203.0.113.7", d);

    const payload = JSON.stringify(triggered[0]);
    for (const detail of ["Ruth", "Baker", "Orchard", "dana@example.com", "1250"]) {
      expect(payload).not.toContain(detail);
    }
  });

  it("refuses invalid input and sends nothing", async () => {
    const { deps: d } = deps();
    const result = await submitMemorialCard(
      validForm({ honoreeName: " ", amount: "a lot", donorEmail: "dana@" }),
      "203.0.113.7",
      d,
    );

    expect(result).toEqual({
      status: "invalid",
      errors: { honoreeName: expect.any(String), amount: expect.any(String), donorEmail: expect.any(String) },
    });
    expect(d.formspark).not.toHaveBeenCalled();
    expect(d.trigger).not.toHaveBeenCalled();
  });

  it("refuses a filled honeypot and sends nothing", async () => {
    const { deps: d } = deps();

    await expect(submitMemorialCard(validForm({ fax: "555-0100" }), "203.0.113.7", d)).resolves.toEqual({
      status: "failed",
    });
    expect(d.formspark).not.toHaveBeenCalled();
    expect(d.trigger).not.toHaveBeenCalled();
  });

  it("fails when neither path accepts the entry", async () => {
    const { deps: d } = deps();
    d.trigger.mockRejectedValueOnce(new Error("Trigger.dev answered HTTP 503"));
    d.formspark.mockRejectedValueOnce(new Error("Formspark answered HTTP 500"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(submitMemorialCard(validForm(), "203.0.113.7", d)).resolves.toEqual({ status: "failed" });
  });
});

describe("the memorial card in Formspark", () => {
  async function entry() {
    const { sent, deps: d } = deps();
    await submitMemorialCard(validForm(), "203.0.113.7", d);
    return sent[0] as MemorialCardEntry;
  }

  it("names the form and shows every answer in step order", async () => {
    const payload = formsparkPayload(await entry());

    expect(Object.keys(payload).slice(0, 22)).toEqual([
      "form",
      "in_memory_or_in_honor",
      "person_name",
      "occasion",
      "gift_amount",
      "how_they_give",
      "card_recipient_name",
      "card_recipient_street",
      "card_recipient_city",
      "card_recipient_state",
      "card_recipient_zip",
      "card_design",
      "card_message",
      "card_message_in_own_words",
      "donor_name",
      "donor_street",
      "donor_city",
      "donor_state",
      "donor_zip",
      "donor_phone",
      "donor_email",
      "source",
    ]);
    expect(payload).toMatchObject({
      form: "Memorial card",
      in_memory_or_in_honor: "In memory of",
      gift_amount: "$1250.50",
      how_they_give: "Online in Camp Brain",
    });
    expect(payload._email.subject).toBe("Memorial card: in memory of Ruth Ellen Baker");
  });

  it("reads back the same entry, so the gap-filler can copy it into Neon", async () => {
    const sent = await entry();
    expect(entryFromFormspark(formsparkPayload(sent))).toEqual(sent);
  });
});
