import { neon } from "@neondatabase/serverless";
import { logger, schedules } from "@trigger.dev/sdk";
import { createFormsparkApi, formsparkFormIds } from "../lib/formspark-api";
import {
  deleteOldFormEntries,
  deleteOldFormsparkSubmissions,
  retentionCutoff,
} from "../lib/form-entry-retention";
import { recordJobSuccess } from "../lib/job-state";
import { requiredEnv } from "./required-env";

/**
 * Nightly: delete the requests older than three years, in Neon and in
 * Formspark, as the privacy policy says. A repeated run deletes nothing new.
 */
export const deleteOldFormEntriesTask = schedules.task({
  id: "delete-old-form-entries",
  cron: { pattern: "30 4 * * *", timezone: "America/New_York", environments: ["PRODUCTION"] },
  maxDuration: 300,
  retry: { maxAttempts: 4, factor: 2, minTimeoutInMs: 60_000, maxTimeoutInMs: 30 * 60_000 },
  run: async () => {
    const now = new Date();
    const cutoff = retentionCutoff(now);
    const db = neon(requiredEnv("DATABASE_URL"), { fullResults: true });
    const token = requiredEnv("FORMSPARK_API_TOKEN");

    const neonDeleted = await deleteOldFormEntries(db, cutoff);
    // Every form's Formspark form: each form has its own.
    let formsparkDeleted = 0;
    for (const formId of formsparkFormIds(requiredEnv)) {
      formsparkDeleted += await deleteOldFormsparkSubmissions(createFormsparkApi(token, formId), cutoff);
    }
    await recordJobSuccess(db, "delete-old-form-entries", now);

    const result = { cutoff: cutoff.toISOString(), neonDeleted, formsparkDeleted };
    logger.info(
      `Deleted ${neonDeleted} entries in Neon and ${formsparkDeleted} in Formspark received before ${result.cutoff}`,
    );
    return result;
  },
});
