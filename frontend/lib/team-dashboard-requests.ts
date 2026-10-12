import { ANALYTICS_TIME_ZONE } from "@/lib/analytics-copy";
import type { Database } from "@/lib/database";
import type { CallStatus } from "@/lib/call-status";
import type { DashboardRange } from "@/lib/team-dashboard-numbers";

export {
  CALL_NOTE_MAX_LENGTH,
  CALL_STATUS_LABELS,
  CALL_STATUSES,
  type CallStatus,
  isCallStatus,
  isOpenStatus,
  normalizeCallNote,
} from "@/lib/call-status";

export type DashboardRequest = {
  submissionId: string;
  receivedAt: Date;
  source: string;
  page: string;
  parentName: string;
  phone: string;
  email: string;
  childAge: string;
  bestTime: string;
  interests: string[];
  callStatus: CallStatus;
  callNote: string;
  callStatusAt: Date | null;
};

const receivedDay = `(received_at at time zone '${ANALYTICS_TIME_ZONE}')::date`;

type RequestRow = {
  submission_id: string;
  received_at: string | Date;
  source: string;
  page: string;
  parent_name: string;
  phone: string;
  email: string;
  child_age: string;
  best_time: string;
  interests: string[];
  call_status: CallStatus;
  call_note: string;
  call_status_at: string | Date | null;
};

/**
 * The requests of a period, for the people who call the families: open
 * requests (to call, no answer) first, then called ones, newest first within
 * each group. `openOnly` leaves out the called ones.
 */
export async function readDashboardRequests(
  db: Database,
  { from, to }: DashboardRange,
  { openOnly = false } = {},
): Promise<DashboardRequest[]> {
  const { rows } = await db.query(
    `select submission_id, received_at, source, page, parent_name, phone, email,
        child_age, best_time, interests, call_status, call_note, call_status_at
      from form_entries
      where ${receivedDay} between $1::date and $2::date
        and ($3::boolean = false or call_status <> 'called')
      order by (call_status = 'called'), received_at desc, submission_id`,
    [from, to, openOnly],
  );
  return (rows as RequestRow[]).map((row) => ({
    submissionId: row.submission_id,
    receivedAt: new Date(row.received_at),
    source: row.source,
    page: row.page,
    parentName: row.parent_name,
    phone: row.phone,
    email: row.email,
    childAge: row.child_age,
    bestTime: row.best_time,
    interests: row.interests ?? [],
    callStatus: row.call_status,
    callNote: row.call_note,
    callStatusAt: row.call_status_at ? new Date(row.call_status_at) : null,
  }));
}

/**
 * Store a request's status and note. The change time moves only when the
 * status itself changes, so "changed on" says when the family was last
 * tried. Returns whether the request exists.
 */
export async function saveCallStatus(
  db: Database,
  { submissionId, status, note }: { submissionId: string; status: CallStatus; note: string },
) {
  const { rows } = await db.query(
    `update form_entries
      set call_status = $2,
        call_note = $3,
        call_status_at = case when call_status <> $2 then now() else call_status_at end
      where submission_id = $1
      returning submission_id`,
    [submissionId, status, note],
  );
  return rows.length === 1;
}
