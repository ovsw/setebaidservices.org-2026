import { neon } from "@neondatabase/serverless";
import { schedules } from "@trigger.dev/sdk";
import { ANALYTICS_JOB, copyAnalytics, vercelWebAnalytics } from "../lib/analytics-copy";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set in Trigger.dev.`);
  return value;
}

/**
 * Every hour, copy the page views and the QR scan, call and email tap counts
 * from Vercel Web Analytics into Neon as daily totals, so the history stays
 * ours whatever Vercel keeps. A failed hour is caught up by the next one.
 */
export const copyAnalyticsTask = schedules.task({
  id: ANALYTICS_JOB,
  cron: "0 * * * *",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 30_000,
    maxTimeoutInMs: 5 * 60_000,
    randomize: true,
  },
  run: async () => {
    const db = neon(requiredEnv("DATABASE_URL"), { fullResults: true });
    const analytics = vercelWebAnalytics({
      token: requiredEnv("VERCEL_ANALYTICS_TOKEN"),
      projectId: requiredEnv("VERCEL_PROJECT_ID"),
      teamId: requiredEnv("VERCEL_TEAM_ID"),
    });
    return copyAnalytics(db, analytics);
  },
});
