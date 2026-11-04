import type { Database } from "@/lib/database";
import { FORM_LABELS, FORM_TABLES, type FormKind } from "@/lib/form-entry";
import { storeFormEntry } from "@/lib/form-entry-store";
import { entryFromFormspark } from "@/lib/formspark-entry";
import type { FormsparkSubmission } from "@/lib/formspark-api";
import type { ReportEmail } from "@/lib/report-email";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** How far back the gap-filler reads Formspark: one day more than it checks Neon. */
export const FORMSPARK_LOOKBACK_MS = 8 * DAY;
/** The store task retries for about two and a half hours; younger entries may still arrive. */
const STORE_RETRY_MS = 3 * HOUR;
/** A Neon entry this old should have its Formspark copy. */
const FORMSPARK_DELAY_MS = DAY;
/** Neon entries older than this are no longer checked. */
const NEON_LOOKBACK_MS = 7 * DAY;

/** A form entry that reached only one path. The path is the one that failed. */
export type DeliveryGap = {
  submissionId: string;
  form: FormKind;
  path: "trigger" | "formspark";
  receivedAt: string;
};

const FORM_KINDS = Object.keys(FORM_TABLES) as FormKind[];

async function recordGap(db: Database, gap: DeliveryGap, now: Date) {
  const { rows } = await db.query(
    `insert into delivery_gaps (submission_id, form, path, received_at, found_at)
    values ($1, $2, $3, $4, $5)
    on conflict (submission_id, path) do nothing
    returning submission_id`,
    [gap.submissionId, gap.form, gap.path, gap.receivedAt, now.toISOString()],
  );
  return rows.length === 1;
}

/**
 * The nightly gap check, given the Formspark submissions of the last
 * FORMSPARK_LOOKBACK_MS:
 *
 * - A Formspark entry older than three hours that its form's Neon table
 *   does not have means path A (Trigger.dev) failed. It is copied into Neon.
 * - A Neon entry between one and seven days old without a Formspark copy
 *   means path B (Formspark) failed.
 *
 * Each gap is recorded one time in delivery_gaps; the returned lists hold
 * only the gaps this run found.
 */
export async function fillFormEntryGaps(
  db: Database,
  submissions: FormsparkSubmission[],
  now: Date,
) {
  const copied: DeliveryGap[] = [];
  const missingFromFormspark: DeliveryGap[] = [];
  let unreadable = 0;

  const entries = submissions.flatMap((submission) => {
    const entry = entryFromFormspark(submission.data);
    if (!entry) unreadable += 1;
    return entry ? [{ submission, entry }] : [];
  });

  const inNeon = new Set<string>();
  for (const form of FORM_KINDS) {
    const { rows } = await db.query(
      `select submission_id from ${FORM_TABLES[form]} where submission_id = any($1::uuid[])`,
      [entries.filter(({ entry }) => entry.kind === form).map(({ entry }) => entry.submissionId)],
    );
    for (const row of rows as { submission_id: string }[]) inNeon.add(row.submission_id);
  }

  for (const { submission, entry } of entries) {
    if (inNeon.has(entry.submissionId)) continue;
    if (now.getTime() - new Date(submission.createdAt).getTime() < STORE_RETRY_MS) continue;
    if (!(await storeFormEntry(db, entry, submission.id))) continue;
    const gap: DeliveryGap = {
      submissionId: entry.submissionId,
      form: entry.kind,
      path: "trigger",
      receivedAt: entry.receivedAt,
    };
    if (await recordGap(db, gap, now)) copied.push(gap);
  }

  for (const form of FORM_KINDS) {
    const table = FORM_TABLES[form];
    const copies = entries.filter(({ entry }) => entry.kind === form);
    await db.query(
      `update ${table} set formspark_id = copy.formspark_id
      from unnest($1::uuid[], $2::text[]) as copy (submission_id, formspark_id)
      where ${table}.submission_id = copy.submission_id
        and ${table}.formspark_id is null`,
      [copies.map(({ entry }) => entry.submissionId), copies.map(({ submission }) => submission.id)],
    );

    const missing = await db.query(
      `select submission_id, received_at from ${table}
      where formspark_id is null and received_at >= $1 and received_at < $2
      order by received_at`,
      [
        new Date(now.getTime() - NEON_LOOKBACK_MS).toISOString(),
        new Date(now.getTime() - FORMSPARK_DELAY_MS).toISOString(),
      ],
    );
    for (const row of missing.rows as { submission_id: string; received_at: Date | string }[]) {
      const gap: DeliveryGap = {
        submissionId: row.submission_id,
        form,
        path: "formspark",
        receivedAt: new Date(row.received_at).toISOString(),
      };
      if (await recordGap(db, gap, now)) missingFromFormspark.push(gap);
    }
  }

  return { copied, missingFromFormspark, unreadable };
}

type UnsentGap = {
  submission_id: string;
  path: DeliveryGap["path"];
  received_at: Date | string;
  source: string;
  page: string;
  form: FormKind;
};

function gapLine(gap: UnsentGap) {
  const received = new Date(gap.received_at).toISOString().slice(0, 16).replace("T", " ");
  return `- ${received} UTC · ${FORM_LABELS[gap.form] ?? gap.form} · ${gap.source} · ${gap.page} · submission ${gap.submission_id}`;
}

/** The report lists IDs, times, forms, Sources and pages only, never family details. */
export function gapReportEmail(gaps: UnsentGap[]): ReportEmail {
  const copied = gaps.filter((gap) => gap.path === "trigger");
  const missing = gaps.filter((gap) => gap.path === "formspark");
  const parts = ["The nightly check found requests that reached only one of the two paths."];
  if (copied.length) {
    parts.push(
      [
        "Copied from Formspark into Neon. Path A failed: Trigger.dev did not store them, or the Website could not reach it.",
        ...copied.map(gapLine),
      ].join("\n"),
    );
  }
  if (missing.length) {
    parts.push(
      [
        "In Neon, but not in Formspark. Path B failed: the office may not have received these by email. Their details are in Neon, in their form's table: form_entries for Ask about camp, memorial_card_entries for Memorial card.",
        ...missing.map(gapLine),
      ].join("\n"),
    );
  }
  parts.push("To find a request in Formspark, search for its submission ID.");
  const count = gaps.length;
  return {
    subject: `Setebaid: ${count} ${count === 1 ? "request" : "requests"} reached only one path`,
    text: parts.join("\n\n"),
  };
}

/**
 * Emails every recorded gap that was not emailed yet, and marks it emailed.
 * When the email fails, the gaps stay unsent for the next run.
 */
export async function emailNewGaps(
  db: Database,
  send: (email: ReportEmail) => Promise<void>,
  now: Date,
) {
  const { rows } = await db.query(
    `select gap.submission_id, gap.path, gap.received_at, gap.form, entry.source, entry.page
    from delivery_gaps gap
    join (${FORM_KINDS.map((form) => `select submission_id, source, page from ${FORM_TABLES[form]}`).join(" union all ")}) entry
      using (submission_id)
    where gap.emailed_at is null
    order by gap.received_at`,
  );
  const gaps = rows as UnsentGap[];
  if (!gaps.length) return 0;
  await send(gapReportEmail(gaps));
  await db.query(
    `update delivery_gaps set emailed_at = $1
    where emailed_at is null and submission_id = any($2::uuid[])`,
    [now.toISOString(), gaps.map((gap) => gap.submission_id)],
  );
  return gaps.length;
}
