import { neon } from "@neondatabase/serverless";
import { schedules } from "@trigger.dev/sdk";
import {
  ANALYTICS_JOB,
  ANALYTICS_SCHEDULE,
  ANALYTICS_TIME_ZONE,
  copyAnalytics,
  vercelWebAnalytics,
} from "../lib/analytics-copy";
import { requiredEnv } from "./required-env";

/**
 * Every night, copy the page views and the QR scan, call and email tap counts
 * from Vercel Web Analytics into Neon as daily totals, so the history stays
 * ours whatever Vercel keeps. The dashboard's "Update now" button runs the
 * same copy when someone needs today's numbers. A failed night is caught up
 * by the next one.
 */
export const copyAnalyticsTask = schedules.task({
  id: ANALYTICS_JOB,
  cron: {
    pattern: `${ANALYTICS_SCHEDULE.minute} ${ANALYTICS_SCHEDULE.hour} * * *`,
    timezone: ANALYTICS_TIME_ZONE,
    environments: ["PRODUCTION"],
  },
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
