import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sanityFetch = vi.hoisted(() => vi.fn());
const withConfig = vi.hoisted(() => vi.fn(() => ({ fetch: sanityFetch })));
const tokenState = vi.hoisted(() => ({ value: "read-token" as string | undefined }));

vi.mock("@/sanity/lib/client", () => ({ client: { withConfig } }));
vi.mock("@/sanity/lib/token", () => ({
  get token() {
    return tokenState.value;
  },
}));

const aclFetch = vi.fn();

const member = { projectUserId: "pMember1", isRobot: false, roles: [{ name: "editor" }] };

async function loadModules() {
  vi.resetModules();
  const route = await import("./route");
  const session = await import("@/lib/team-dashboard-session");
  return { GET: route.GET, ...session };
}

function sessionRequest(query = "?sanity-preview-secret=valid-secret") {
  return new Request(`https://example.test/team-dashboard/session${query}`);
}

function sessionCookie(response: Response) {
  return response.headers.get("set-cookie");
}

function cookieValue(setCookie: string) {
  return decodeURIComponent(setCookie.split(";")[0].split("=").slice(1).join("="));
}

describe("team dashboard session route", () => {
  beforeEach(() => {
    sanityFetch.mockReset();
    withConfig.mockClear();
    aclFetch.mockReset();
    tokenState.value = "read-token";
    vi.stubGlobal("fetch", aclFetch);
    vi.stubEnv("TEAM_DASHBOARD_MEMBER_CHECK", "");
    aclFetch.mockResolvedValue(Response.json([member]));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("gives a project member a one-day session and moves to a clean address", async () => {
    sanityFetch.mockResolvedValue({ userId: "pMember1" });
    const { GET, readTeamDashboardSession } = await loadModules();

    const response = await GET(sessionRequest());

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://example.test/team-dashboard");
    expect(response.headers.get("cache-control")).toBe("private, no-store");

    const setCookie = sessionCookie(response)!;
    expect(setCookie).toMatch(/^team-dashboard-session=/);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=lax/i);
    expect(setCookie).toMatch(/Max-Age=86400/);
    expect(setCookie).toMatch(/Path=\/team-dashboard/);
    expect(readTeamDashboardSession(cookieValue(setCookie))).toMatchObject({
      userId: "pMember1",
    });

    // Only unexpired secrets from the Studio's team dashboard tool count.
    const [query, params] = sanityFetch.mock.calls[0];
    expect(query).toContain("dateTime(now()) - 3600");
    expect(params).toEqual({
      secret: "valid-secret",
      source: "team-dashboard",
      type: "sanity.previewUrlSecret",
    });
    expect(withConfig).toHaveBeenCalledWith(
      expect.objectContaining({ perspective: "raw", token: "read-token", useCdn: false }),
    );
  });

  it("refuses a request without a secret", async () => {
    const { GET } = await loadModules();

    const response = await GET(sessionRequest(""));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://example.test/team-dashboard");
    expect(sessionCookie(response)).toBeNull();
    expect(sanityFetch).not.toHaveBeenCalled();
  });

  it("refuses an expired or forged secret", async () => {
    sanityFetch.mockResolvedValue(null);
    const { GET } = await loadModules();

    const response = await GET(sessionRequest("?sanity-preview-secret=forged"));

    expect(sessionCookie(response)).toBeNull();
    expect(aclFetch).not.toHaveBeenCalled();
  });

  it("refuses someone who is not a person on the project", async () => {
    const { GET } = await loadModules();

    const cases = [
      { userId: "pStranger", acl: [member] },
      { userId: "pRobot1", acl: [{ ...member, projectUserId: "pRobot1", isRobot: true }] },
      { userId: "pFormer1", acl: [{ ...member, projectUserId: "pFormer1", roles: [] }] },
    ];

    for (const { userId, acl } of cases) {
      sanityFetch.mockResolvedValue({ userId });
      aclFetch.mockResolvedValue(Response.json(acl));

      expect(sessionCookie(await GET(sessionRequest()))).toBeNull();
    }
  });

  it("refuses everyone when the member list cannot be read", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    sanityFetch.mockResolvedValue({ userId: "pMember1" });
    aclFetch.mockResolvedValue(new Response("Forbidden", { status: 403 }));
    const { GET } = await loadModules();

    expect(sessionCookie(await GET(sessionRequest()))).toBeNull();
    errorSpy.mockRestore();
  });

  it("skips the member check only when it is switched off", async () => {
    vi.stubEnv("TEAM_DASHBOARD_MEMBER_CHECK", "off");
    sanityFetch.mockResolvedValue({ userId: "pAnyone" });
    const { GET } = await loadModules();

    expect(sessionCookie(await GET(sessionRequest()))).toMatch(/^team-dashboard-session=/);
    expect(aclFetch).not.toHaveBeenCalled();
  });

  it("refuses everyone when the read token is missing", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    tokenState.value = undefined;
    const { GET } = await loadModules();

    expect(sessionCookie(await GET(sessionRequest()))).toBeNull();
    expect(sanityFetch).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

describe("team dashboard session cookie", () => {
  beforeEach(() => {
    tokenState.value = "read-token";
    vi.stubGlobal("fetch", aclFetch);
    aclFetch.mockResolvedValue(Response.json([member]));
    sanityFetch.mockResolvedValue({ userId: "pMember1" });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("refuses a missing, tampered or expired session", async () => {
    const { startTeamDashboardSession, readTeamDashboardSession } = await loadModules();
    const now = Date.UTC(2026, 9, 8);
    const value = (await startTeamDashboardSession("valid-secret", now))!;
    const [, expiresAt, signature] = value.split(".");

    expect(readTeamDashboardSession(value, now)).toEqual({
      userId: "pMember1",
      expiresAt: now + 86_400_000,
    });
    expect(readTeamDashboardSession(undefined, now)).toBeNull();
    expect(readTeamDashboardSession(`pOther99.${expiresAt}.${signature}`, now)).toBeNull();
    expect(readTeamDashboardSession(`pMember1.${Number(expiresAt) + 1}.${signature}`, now)).toBeNull();
    expect(readTeamDashboardSession(value, now + 86_400_000)).toBeNull();
  });
});
