import type { Database } from "@/lib/form-entry-store";

/**
 * Records the time of a job's last successful run, keyed by its task ID. The
 * dashboard shows it, so an old time tells that a job stopped working.
 */
export async function recordJobSuccess(db: Database, job: string, at: Date) {
  await db.query(
    `insert into job_state (job, last_success_at) values ($1, $2)
    on conflict (job) do update set last_success_at = excluded.last_success_at`,
    [job, at.toISOString()],
  );
}
