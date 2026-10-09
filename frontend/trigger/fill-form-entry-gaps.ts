import { neon } from "@neondatabase/serverless";
import { logger, schedules } from "@trigger.dev/sdk";
import { emailNewGaps, FORMSPARK_LOOKBACK_MS, fillFormEntryGaps } from "../lib/form-entry-gaps";
import { createFormsparkApi, submissionsSince } from "../lib/formspark-api";
import { recordJobSuccess } from "../lib/job-state";
import { createReportSender } from "../lib/report-email";
import { requiredEnv } from "./required-env";

/**
 * Nightly: copy into Neon the requests that reached only Formspark, record
 * each request that reached only one path, and email Ovi the new ones. The
 * run history holds counts only.
 */
export const fillFormEntryGapsTask = schedules.task({
  id: "fill-form-entry-gaps",
  cron: { pattern: "0 4 * * *", timezone: "America/New_York", environments: ["PRODUCTION"] },
  maxDuration: 300,
  retry: { maxAttempts: 4, factor: 2, minTimeoutInMs: 60_000, maxTimeoutInMs: 30 * 60_000 },
  run: async () => {
    const now = new Date();
    const db = neon(requiredEnv("DATABASE_URL"), { fullResults: true });
    const formspark = createFormsparkApi(requiredEnv("FORMSPARK_API_TOKEN"), requiredEnv("FORMSPARK_FORM_ID"));

    const submissions = await submissionsSince(formspark, new Date(now.getTime() - FORMSPARK_LOOKBACK_MS));
    const { copied, missingFromFormspark, unreadable } = await fillFormEntryGaps(db, submissions, now);
    await recordJobSuccess(db, "fill-form-entry-gaps", now);

    const result = {
      checked: submissions.length,
      copied: copied.length,
      missingFromFormspark: missingFromFormspark.length,
      unreadable,
    };
    logger.info("Gap check done", result);

    // The gaps are recorded before the email, so a failed email is sent next run.
    const send = createReportSender(requiredEnv("RESEND_API_KEY"), requiredEnv("REPORT_EMAIL_TO"));
    return { ...result, emailed: await emailNewGaps(db, send, new Date()) };
  },
});
