import { beforeEach, describe, expect, it, vi } from "vitest";

const cookie = vi.hoisted(() => ({ value: undefined as string | undefined }));
const saveCallStatus = vi.hoisted(() => vi.fn());
const refresh = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => (cookie.value ? { value: cookie.value } : undefined) }),
}));
vi.mock("next/cache", () => ({ refresh }));
vi.mock("@neondatabase/serverless", () => ({ neon: () => ({ query: vi.fn() }) }));
vi.mock("@/lib/team-dashboard-requests", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/team-dashboard-requests")>()),
  saveCallStatus,
}));
vi.mock("@/lib/team-dashboard-session", () => ({
  TEAM_DASHBOARD_COOKIE: "team-dashboard-session",
  readTeamDashboardSession: (value: string | undefined) =>
    value === "valid" ? { userId: "pMember1", expiresAt: 1 } : null,
}));

import { saveCallStatusFromRow } from "./actions";

const ID = "6f1c2b4e-8d3a-4c5f-9b7e-2a1d0e3f4c5b";

function row(fields: Record<string, string>) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  return saveCallStatusFromRow(null, form);
}

describe("saveCallStatusFromRow", () => {
  beforeEach(() => {
    saveCallStatus.mockReset();
    refresh.mockReset();
    vi.stubEnv("DATABASE_URL", "postgres://test");
  });

  it("refuses a missing or forged session without writing", async () => {
    for (const value of [undefined, "forged"]) {
      cookie.value = value;
      expect(await row({ submissionId: ID, status: "plans_to_register", note: "" })).toEqual({
        ok: false,
        message: "Open this from the Studio.",
      });
    }
    expect(saveCallStatus).not.toHaveBeenCalled();
  });

  it("refuses an unknown status or a malformed request ID", async () => {
    cookie.value = "valid";
    expect((await row({ submissionId: ID, status: "done", note: "" })).ok).toBe(false);
    expect((await row({ submissionId: "1 or 1=1", status: "plans_to_register", note: "" })).ok).toBe(false);
    expect(saveCallStatus).not.toHaveBeenCalled();
  });

  it("saves a trimmed, capped note and shows the page again", async () => {
    cookie.value = "valid";
    saveCallStatus.mockResolvedValue(true);

    expect(await row({ submissionId: ID, status: "no_answer", note: `  ${"x".repeat(600)} ` })).toEqual({
      ok: true,
      message: "Saved.",
    });
    expect(saveCallStatus).toHaveBeenCalledWith(expect.anything(), {
      submissionId: ID,
      status: "no_answer",
      note: "x".repeat(500),
    });
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("says so when the request is gone or the write fails", async () => {
    cookie.value = "valid";
    saveCallStatus.mockResolvedValueOnce(false);
    expect((await row({ submissionId: ID, status: "plans_to_register", note: "" })).ok).toBe(false);

    vi.spyOn(console, "error").mockImplementation(() => {});
    saveCallStatus.mockRejectedValueOnce(new Error("Neon is down"));
    expect((await row({ submissionId: ID, status: "plans_to_register", note: "" })).ok).toBe(false);
    expect(refresh).not.toHaveBeenCalled();
  });
});
