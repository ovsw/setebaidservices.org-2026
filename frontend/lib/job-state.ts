import type { Database } from "@/lib/database";

/** When the job last finished without an error, or undefined if it never did. */
export async function lastSuccessAt(db: Database, job: string) {
  const { rows } = await db.query("select last_success_at from job_state where job = $1", [job]);
  const row = rows[0] as { last_success_at: string | Date } | undefined;
  return row ? new Date(row.last_success_at) : undefined;
}

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
