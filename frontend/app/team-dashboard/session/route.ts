import { urlSearchParamPreviewSecret } from "@sanity/preview-url-secret/constants";
import { NextResponse } from "next/server";
import {
  startTeamDashboardSession,
  TEAM_DASHBOARD_COOKIE,
  TEAM_DASHBOARD_PATH,
  TEAM_DASHBOARD_SESSION_SECONDS,
} from "@/lib/team-dashboard-session";

// The Studio's "Team dashboard" tool opens this address with a preview secret.
// Valid or not, the person lands on the dashboard at a clean address without
// the secret; only a valid secret comes with a session.
export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get(urlSearchParamPreviewSecret);
  const session = await startTeamDashboardSession(secret);

  const response = NextResponse.redirect(new URL(TEAM_DASHBOARD_PATH, request.url), 303);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");

  if (session) {
    response.cookies.set({
      name: TEAM_DASHBOARD_COOKIE,
      value: session,
      httpOnly: true,
      maxAge: TEAM_DASHBOARD_SESSION_SECONDS,
      path: TEAM_DASHBOARD_PATH,
      // Lax, not Strict: the Studio is another site, and a Strict cookie would
      // not be sent on the redirect that follows the Studio's link.
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
