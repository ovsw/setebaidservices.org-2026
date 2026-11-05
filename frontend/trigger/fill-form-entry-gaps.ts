import { neon } from "@neondatabase/serverless";
import { logger, schedules } from "@trigger.dev/sdk";
import { emailNewGaps, FORMSPARK_LOOKBACK_MS, fillFormEntryGaps } from "../lib/form-entry-gaps";
import { FORMSPARK_FORM_ID_VARIABLES, type FormKind } from "../lib/form-entry";
import { createFormsparkApi, formsparkFormIds, submissionsSince } from "../lib/formspark-api";
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
    const token = requiredEnv("FORMSPARK_API_TOKEN");
    const since = new Date(now.getTime() - FORMSPARK_LOOKBACK_MS);

    // Every form's Formspark form: each form has its own. A form that cannot
    // be read does not stop the others; its own "missing from Formspark"
    // check waits for a run that reads it, and this run fails after the email.
    const formIds = formsparkFormIds(requiredEnv);
    const reads = await Promise.allSettled(
      formIds.map((formId) => submissionsSince(createFormsparkApi(token, formId), since)),
    );
    const unreadForms = formIds.filter((_, index) => reads[index].status === "rejected");
    const submissions = reads.flatMap((read) => (read.status === "fulfilled" ? read.value : []));
    const checkedForms = (Object.keys(FORMSPARK_FORM_ID_VARIABLES) as FormKind[]).filter(
      (form) => !unreadForms.includes(requiredEnv(FORMSPARK_FORM_ID_VARIABLES[form])),
    );
    const { copied, missingFromFormspark, unreadable } = await fillFormEntryGaps(
      db,
      submissions,
      now,
      checkedForms,
    );

    const result = {
      checked: submissions.length,
      copied: copied.length,
      missingFromFormspark: missingFromFormspark.length,
      unreadable,
    };
    logger.info("Gap check done", result);

    // The gaps are recorded before the email, so a failed email is sent next
    // run. Success is recorded after it, so a failing email shows as a stale
    // "Last updated".
    const send = createReportSender(requiredEnv("RESEND_API_KEY"), requiredEnv("REPORT_EMAIL_TO"));
    const emailed = await emailNewGaps(db, send, new Date());
    const failures = reads.flatMap((read) =>
      read.status === "rejected" ? [read.reason instanceof Error ? read.reason.message : "unknown error"] : [],
    );
    if (failures.length) {
      throw new Error(`${failures.length} Formspark form(s) could not be read: ${failures.join("; ")}`);
    }
    await recordJobSuccess(db, "fill-form-entry-gaps", now);
    return { ...result, emailed };
  },
});
