"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CALL_NOTE_MAX_LENGTH,
  CALL_STATUS_LABELS,
  CALL_STATUSES,
  type CallStatus,
} from "@/lib/call-status";
import { type SaveCallResult, saveCallStatusFromRow } from "./actions";

const control =
  "w-full rounded-control border border-input bg-transparent px-3 py-2 text-base focus-ring";

/** One request's status and note. Works before the page's scripts load. */
export function CallStatusForm({
  submissionId,
  status,
  note,
}: {
  submissionId: string;
  status: CallStatus;
  note: string;
}) {
  const [result, action, pending] = useActionState<SaveCallResult | null, FormData>(
    saveCallStatusFromRow,
    null,
  );
  const id = `request-${submissionId}`;

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="submissionId" value={submissionId} />
      <div className="grid gap-1">
        <Label htmlFor={`${id}-status`}>Status</Label>
        <select
          id={`${id}-status`}
          name="status"
          defaultValue={status}
          className={`${control} min-h-(--control-height)`}
        >
          {CALL_STATUSES.map((value) => (
            <option key={value} value={value}>
              {CALL_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1">
        <Label htmlFor={`${id}-note`}>Note</Label>
        <textarea
          id={`${id}-note`}
          name="note"
          rows={2}
          maxLength={CALL_NOTE_MAX_LENGTH}
          defaultValue={note}
          placeholder="For example: call back Tuesday evening"
          className={control}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="compact" variant="outline" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <p role="status" className={result && !result.ok ? "text-destructive" : undefined}>
          {result && !pending ? result.message : null}
        </p>
      </div>
    </form>
  );
}
