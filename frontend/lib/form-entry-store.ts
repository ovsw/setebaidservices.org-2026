import type { AskAboutCampEntry } from "@/lib/ask-about-camp-delivery";
import type { Database } from "@/lib/database";

/**
 * Insert an entry by its submission ID. Storing the same entry again changes
 * nothing, so retries and the gap-filler never make duplicates. Returns
 * whether this call added the row.
 */
export async function storeFormEntry(db: Database, entry: AskAboutCampEntry) {
  const { rows } = await db.query(
    `insert into form_entries (
      submission_id, received_at, source, page, campaign,
      parent_name, phone, email, child_age, best_time, interests
    ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    on conflict (submission_id) do nothing
    returning submission_id`,
    [
      entry.submissionId,
      entry.receivedAt,
      entry.source,
      entry.page,
      entry.campaign ?? null,
      entry.name,
      entry.phone,
      entry.email,
      entry.childAge,
      entry.bestTime,
      entry.interests,
    ],
  );
  return rows.length === 1;
}
