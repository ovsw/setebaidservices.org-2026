import { beforeEach, describe, expect, it, vi } from "vitest";

const cookie = vi.hoisted(() => ({ value: undefined as string | undefined }));
const copyAnalyticsIfStale = vi.hoisted(() => vi.fn());
const refresh = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => (cookie.value ? { value: cookie.value } : undefined) }),
}));
vi.mock("next/cache", () => ({ refresh }));
vi.mock("@neondatabase/serverless", () => ({ neon: () => ({ query: vi.fn() }) }));
vi.mock("@/lib/analytics-copy", () => ({
  copyAnalyticsIfStale,
  vercelWebAnalytics: () => ({}),
}));
vi.mock("@/lib/team-dashboard-session", () => ({
  TEAM_DASHBOARD_COOKIE: "team-dashboard-session",
  readTeamDashboardSession: (value: string | undefined) =>
    value === "valid" ? { userId: "pMember1", expiresAt: 1 } : null,
}));

import { updateNumbersNow } from "./actions";

const submit = () => updateNumbersNow();

describe("updateNumbersNow", () => {
  beforeEach(() => {
    copyAnalyticsIfStale.mockReset();
    refresh.mockReset();
    vi.stubEnv("DATABASE_URL", "postgres://test");
    vi.stubEnv("VERCEL_ANALYTICS_TOKEN", "token");
    vi.stubEnv("VERCEL_PROJECT_ID", "prj_1");
    vi.stubEnv("VERCEL_TEAM_ID", "team_1");
  });

  it("refuses a missing or forged session without touching Vercel", async () => {
    for (const value of [undefined, "forged"]) {
      cookie.value = value;
      expect(await submit()).toEqual({ ok: false, message: "Open this from the Studio." });
    }
    expect(copyAnalyticsIfStale).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("copies for a valid session and shows the page again", async () => {
    cookie.value = "valid";
    copyAnalyticsIfStale.mockResolvedValue({ copied: true, days: 2, totals: 3 });

    expect(await submit()).toEqual({ ok: true, message: "Updated." });
    expect(copyAnalyticsIfStale).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("says so when the last copy is fresh, and when the copy fails", async () => {
    cookie.value = "valid";
    copyAnalyticsIfStale.mockResolvedValueOnce({ copied: false, lastSuccessAt: new Date() });
    expect(await submit()).toEqual({ ok: true, message: "Updated less than two minutes ago." });

    vi.spyOn(console, "error").mockImplementation(() => {});
    copyAnalyticsIfStale.mockRejectedValueOnce(new Error("Vercel answered 500"));
    expect((await submit()).ok).toBe(false);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("refuses to run without the Vercel keys", async () => {
    cookie.value = "valid";
    vi.stubEnv("VERCEL_TEAM_ID", "");
    expect((await submit()).ok).toBe(false);
    expect(copyAnalyticsIfStale).not.toHaveBeenCalled();
  });
});
