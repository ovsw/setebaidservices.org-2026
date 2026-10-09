"use server";

import { neon } from "@neondatabase/serverless";
import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { copyAnalyticsIfStale, vercelWebAnalytics } from "@/lib/analytics-copy";
import {
  readTeamDashboardSession,
  TEAM_DASHBOARD_COOKIE,
} from "@/lib/team-dashboard-session";

export type UpdateResult = { ok: boolean; message: string };

/**
 * The "Update now" button: copy the newest visit and tap counts from Vercel
 * into Neon, then show the page again. Anyone can reach a server action, so
 * the session is checked here as on the page.
 */
export async function updateNumbersNow(): Promise<UpdateResult> {
  const session = readTeamDashboardSession(
    (await cookies()).get(TEAM_DASHBOARD_COOKIE)?.value,
  );
  if (!session) return { ok: false, message: "Open this from the Studio." };

  const { DATABASE_URL, VERCEL_ANALYTICS_TOKEN, VERCEL_PROJECT_ID, VERCEL_TEAM_ID } = process.env;
  if (!DATABASE_URL || !VERCEL_ANALYTICS_TOKEN || !VERCEL_PROJECT_ID || !VERCEL_TEAM_ID) {
    return { ok: false, message: "The update is not connected yet: a Vercel key is missing." };
  }

  try {
    const result = await copyAnalyticsIfStale(
      neon(DATABASE_URL, { fullResults: true }),
      vercelWebAnalytics({
        token: VERCEL_ANALYTICS_TOKEN,
        projectId: VERCEL_PROJECT_ID,
        teamId: VERCEL_TEAM_ID,
      }),
    );
    if (!result.copied) return { ok: true, message: "Updated less than two minutes ago." };
    refresh();
    return { ok: true, message: "Updated." };
  } catch (error) {
    console.error("Team dashboard update failed.", error);
    return { ok: false, message: "The update failed. Try again in a minute." };
  }
}
