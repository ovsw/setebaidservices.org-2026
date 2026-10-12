"use server";

import { neon } from "@neondatabase/serverless";
import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { copyAnalyticsIfStale, vercelWebAnalytics } from "@/lib/analytics-copy";
import { isCallStatus, normalizeCallNote, saveCallStatus } from "@/lib/team-dashboard-requests";
import {
  readTeamDashboardSession,
  TEAM_DASHBOARD_COOKIE,
} from "@/lib/team-dashboard-session";

export type UpdateResult = { ok: boolean; message: string };

/**
 * The "Get the latest data" button: copy the newest visit and tap counts from Vercel
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

export type SaveCallResult = { ok: boolean; message: string };

const SUBMISSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Save a request's call status and note from its row on the dashboard.
 * Anyone can reach a server action, so the session is checked here too.
 */
export async function saveCallStatusFromRow(
  _previous: SaveCallResult | null,
  form: FormData,
): Promise<SaveCallResult> {
  const session = readTeamDashboardSession(
    (await cookies()).get(TEAM_DASHBOARD_COOKIE)?.value,
  );
  if (!session) return { ok: false, message: "Open this from the Studio." };

  const submissionId = form.get("submissionId");
  const status = form.get("status");
  if (typeof submissionId !== "string" || !SUBMISSION_ID_PATTERN.test(submissionId) || !isCallStatus(status)) {
    return { ok: false, message: "Not saved: choose a status." };
  }

  const url = process.env.DATABASE_URL;
  if (!url) return { ok: false, message: "Not saved: DATABASE_URL is missing." };

  try {
    const found = await saveCallStatus(neon(url, { fullResults: true }), {
      submissionId,
      status,
      note: normalizeCallNote(form.get("note")),
    });
    if (!found) return { ok: false, message: "Not saved: this request no longer exists." };
    refresh();
    return { ok: true, message: "Saved." };
  } catch (error) {
    console.error("Team dashboard call status failed to save.", error);
    return { ok: false, message: "Not saved. Try again in a minute." };
  }
}
