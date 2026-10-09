import type { Database } from "@/lib/form-entry-store";
import type { FormsparkApi } from "@/lib/formspark-api";

/** The privacy policy keeps a request for three years. */
const RETENTION_YEARS = 3;

/**
 * The same UTC time three calendar years earlier. On February 29 the cutoff
 * is February 28, as Postgres counts `interval '3 years'`.
 */
export function retentionCutoff(now: Date) {
  const cutoff = new Date(now);
  cutoff.setUTCDate(1);
  cutoff.setUTCFullYear(now.getUTCFullYear() - RETENTION_YEARS);
  const lastDay = new Date(Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth() + 1, 0)).getUTCDate();
  cutoff.setUTCDate(Math.min(now.getUTCDate(), lastDay));
  return cutoff;
}

/** Deletes the entries received before the cutoff, and their delivery gaps. */
export async function deleteOldFormEntries(db: Database, cutoff: Date) {
  const { rows } = await db.query(
    "delete from form_entries where received_at < $1 returning submission_id",
    [cutoff.toISOString()],
  );
  return rows.length;
}

/** Deletes the Formspark submissions received before the cutoff. */
export async function deleteOldFormsparkSubmissions(api: FormsparkApi, cutoff: Date) {
  // Read every page first: deleting while paging could move the cursor.
  const old: string[] = [];
  for await (const submission of api.submissions()) {
    if (new Date(submission.createdAt) < cutoff) old.push(submission.id);
  }
  for (const id of old) await api.deleteSubmission(id);
  return old.length;
}
