import { neon } from "@neondatabase/serverless";
import { logger, schedules } from "@trigger.dev/sdk";
import { createFormsparkApi } from "../lib/formspark-api";
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
    const formspark = createFormsparkApi(requiredEnv("FORMSPARK_API_TOKEN"), requiredEnv("FORMSPARK_FORM_ID"));

    const neonDeleted = await deleteOldFormEntries(db, cutoff);
    const formsparkDeleted = await deleteOldFormsparkSubmissions(formspark, cutoff);
    await recordJobSuccess(db, "delete-old-form-entries", now);

    const result = { cutoff: cutoff.toISOString(), neonDeleted, formsparkDeleted };
    logger.info(
      `Deleted ${neonDeleted} entries in Neon and ${formsparkDeleted} in Formspark received before ${result.cutoff}`,
    );
    return result;
  },
});
