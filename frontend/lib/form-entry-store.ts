import type { Database } from "@/lib/database";
import type { AskAboutCampEntry, FormEntry, MemorialCardEntry } from "@/lib/form-entry";

function storeAskAboutCamp(db: Database, entry: AskAboutCampEntry, formsparkId: string | null) {
  return db.query(
    `insert into form_entries (
      submission_id, received_at, source, page, campaign, kind,
      parent_name, phone, email, child_age, best_time, interests, formspark_id
    ) values ($1, $2, $3, $4, $5, 'ask_about_camp', $6, $7, $8, $9, $10, $11, $12)
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
      formsparkId,
    ],
  );
}

/**
 * One statement writes both rows, so a memorial entry is never stored
 * without its answers. When the entry exists already, neither row is added.
 */
function storeMemorialCard(db: Database, entry: MemorialCardEntry, formsparkId: string | null) {
  return db.query(
    `with entry as (
      insert into form_entries (submission_id, received_at, source, page, campaign, kind, formspark_id)
      values ($1, $2, $3, $4, $5, 'memorial_card', $6)
      on conflict (submission_id) do nothing
      returning submission_id
    )
    insert into memorial_card_entries (
      submission_id, tribute, honoree_name, occasion, amount, give_by,
      recipient_name, recipient_street, recipient_city, recipient_state, recipient_zip,
      card_design, card_message, card_message_is_own_words,
      donor_name, donor_street, donor_city, donor_state, donor_zip, donor_phone, donor_email
    )
    select submission_id, $7, $8, $9, $10::numeric, $11,
      $12, $13, $14, $15, $16,
      $17, $18, $19::boolean,
      $20, $21, $22, $23, $24, $25, $26
    from entry
    returning submission_id`,
    [
      entry.submissionId,
      entry.receivedAt,
      entry.source,
      entry.page,
      entry.campaign ?? null,
      formsparkId,
      entry.tribute,
      entry.honoreeName,
      entry.occasion,
      entry.amount,
      entry.giveBy,
      entry.recipientName,
      entry.recipientStreet,
      entry.recipientCity,
      entry.recipientState,
      entry.recipientZip,
      entry.cardDesign,
      entry.cardMessage,
      entry.cardMessageIsOwnWords,
      entry.donorName,
      entry.donorStreet,
      entry.donorCity,
      entry.donorState,
      entry.donorZip,
      entry.donorPhone,
      entry.donorEmail,
    ],
  );
}

/**
 * Insert an entry by its submission ID. Storing the same entry again changes
 * nothing, so retries and the gap-filler never make duplicates. Returns
 * whether this call added the row. The gap-filler also gives the ID of the
 * entry's Formspark copy.
 */
export async function storeFormEntry(
  db: Database,
  entry: FormEntry,
  formsparkId: string | null = null,
) {
  const { rows } =
    entry.kind === "memorial_card"
      ? await storeMemorialCard(db, entry, formsparkId)
      : await storeAskAboutCamp(db, entry, formsparkId);
  return rows.length === 1;
}
