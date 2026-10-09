import { neon } from "@neondatabase/serverless";
import { task } from "@trigger.dev/sdk";
import { decryptFormEntry, type EncryptedFormEntry } from "../lib/form-entry-crypto";
import { storeFormEntry } from "../lib/form-entry-store";
import { requiredEnv } from "./required-env";

/**
 * Path A of an "Ask about camp" request: decrypt it and write it to Neon.
 * It retries for about two and a half hours. If a run still fails, the
 * nightly gap-filler copies the entry from Formspark and reports it. The
 * payload stays encrypted, and the run returns only the submission ID, so
 * the run history holds no family details.
 */
export const storeFormEntryTask = task({
  id: "store-form-entry",
  retry: {
    maxAttempts: 12,
    factor: 2,
    minTimeoutInMs: 5_000,
    maxTimeoutInMs: 60 * 60_000,
    randomize: true,
  },
  run: async (payload: EncryptedFormEntry) => {
    const entry = decryptFormEntry(payload, requiredEnv("FORM_ENCRYPTION_KEY"));
    const db = neon(requiredEnv("DATABASE_URL"), { fullResults: true });
    const added = await storeFormEntry(db, entry);
    return { submissionId: entry.submissionId, added };
  },
});
