import { describe, expect, it, vi } from "vitest";
import {
  type AskAboutCampEntry,
  createSubmitLimiter,
  formsparkPayload,
  submitAskAboutCamp,
} from "@/lib/ask-about-camp-delivery";

function validForm(extra: Record<string, string | string[]> = {}) {
  const formData = new FormData();
  const fields: Record<string, string | string[]> = {
    name: "Dana Rivera",
    phone: "(610) 555-0123",
    email: "dana@example.com",
    childAge: "9",
    bestTime: "Weekday evenings",
    interests: ["Cost and financial help", "Talk with the camp director"],
    source: "chop-nurses",
    campaign: "fall-2026-events",
    page: "/go/events",
    ...extra,
  };
  for (const [name, value] of Object.entries(fields)) {
    for (const item of [value].flat()) formData.append(name, item);
  }
  return formData;
}

function deps() {
  const sent: AskAboutCampEntry[] = [];
  return {
    sent,
    deps: {
      formspark: vi.fn(async (entry: AskAboutCampEntry) => {
        sent.push(entry);
      }),
      allow: createSubmitLimiter({ limit: 5, windowMs: 60_000 }),
      now: () => new Date("2026-10-17T14:30:00.000Z"),
      newId: () => "submission-1",
    },
  };
}

describe("submitAskAboutCamp", () => {
  it("sends a valid request with its ID, Source, page, campaign and time", async () => {
    const { sent, deps: d } = deps();

    await expect(submitAskAboutCamp(validForm(), "203.0.113.7", d)).resolves.toEqual({
      status: "sent",
    });
    expect(sent).toEqual([
      {
        name: "Dana Rivera",
        phone: "(610) 555-0123",
        email: "dana@example.com",
        childAge: "9",
        bestTime: "Weekday evenings",
        interests: ["Cost and financial help", "Talk with the camp director"],
        submissionId: "submission-1",
        receivedAt: "2026-10-17T14:30:00.000Z",
        source: "chop-nurses",
        campaign: "fall-2026-events",
        page: "/go/events",
      },
    ]);
  });

  it("shows the office the Source and the landing page", () => {
    const payload = formsparkPayload({
      name: "Dana Rivera",
      phone: "610-555-0123",
      email: "dana@example.com",
      childAge: "9",
      bestTime: "",
      interests: [],
      submissionId: "submission-1",
      receivedAt: "2026-10-17T14:30:00.000Z",
      source: "chop-nurses",
      page: "/go/events",
    });
    expect(payload).toMatchObject({
      source: "chop-nurses",
      landing_page: "/go/events",
      submission_id: "submission-1",
    });
    expect(payload._email.subject).toContain("chop-nurses");
    expect(payload._email.subject).toContain("/go/events");
  });

  it("refuses missing or malformed answers and sends nothing", async () => {
    const { deps: d } = deps();
    const result = await submitAskAboutCamp(
      validForm({ name: " ", phone: "call me", email: "dana@", childAge: "" }),
      "203.0.113.7",
      d,
    );

    expect(result).toEqual({
      status: "invalid",
      errors: {
        name: expect.any(String),
        phone: expect.any(String),
        email: expect.any(String),
        childAge: expect.any(String),
      },
    });
    expect(d.formspark).not.toHaveBeenCalled();
  });

  it("refuses a filled honeypot and sends nothing", async () => {
    const { deps: d } = deps();
    const result = await submitAskAboutCamp(validForm({ fax: "555-0100" }), "203.0.113.7", d);

    expect(result).toEqual({ status: "failed" });
    expect(d.formspark).not.toHaveBeenCalled();
  });

  it("stops one visitor after five sends but not another visitor", async () => {
    const { deps: d } = deps();
    for (let send = 0; send < 5; send += 1) {
      await submitAskAboutCamp(validForm(), "203.0.113.7", d);
    }

    await expect(submitAskAboutCamp(validForm(), "203.0.113.7", d)).resolves.toEqual({
      status: "failed",
    });
    await expect(submitAskAboutCamp(validForm(), "198.51.100.2", d)).resolves.toEqual({
      status: "sent",
    });
    expect(d.formspark).toHaveBeenCalledTimes(6);
  });

  it("fails when Formspark does not accept the entry", async () => {
    const { deps: d } = deps();
    d.formspark.mockRejectedValueOnce(new Error("Formspark answered HTTP 500"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(submitAskAboutCamp(validForm(), "203.0.113.7", d)).resolves.toEqual({
      status: "failed",
    });
  });

  it("falls back to safe values for a forged Source or page", async () => {
    const { sent, deps: d } = deps();
    await submitAskAboutCamp(
      validForm({ source: "<script>", campaign: "Fall 2026!", page: "https://evil.test/" }),
      "203.0.113.7",
      d,
    );

    expect(sent[0]).toMatchObject({ source: "direct", page: "unknown" });
    expect(sent[0]).not.toHaveProperty("campaign");
  });
});
