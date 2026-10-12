"use client";

import { ChevronDown } from "lucide-react";
import { type FormEvent, type ReactNode, useActionState, useEffect, useRef, useState, startTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CALL_NOTE_MAX_LENGTH,
  CALL_STATUS_LABELS,
  CALL_STATUSES,
  type CallStatus,
  isCallStatus,
} from "@/lib/call-status";
import { cn } from "@/lib/utils";
import { type SaveCallResult, saveCallStatusFromRow } from "./actions";

/** The status control is also the status display, so each status has its own look. */
const STATUS_LOOK: Record<CallStatus, string> = {
  to_call: "border-transparent bg-primary text-primary-foreground",
  no_answer: "border-transparent bg-secondary text-secondary-foreground",
  called: "border-input bg-transparent text-foreground",
};

const ARROW_COLOR: Record<CallStatus, string> = {
  to_call: "text-primary-foreground",
  no_answer: "text-secondary-foreground",
  called: "text-foreground",
};

/**
 * One request on the dashboard: the family's details from the server, and
 * the status and note the caller changes. Picking a status saves at once;
 * the note saves with the button. The form also works before the page's
 * scripts load, through the button.
 */
export function RequestRow({
  submissionId,
  parentName,
  status: savedStatus,
  note: savedNote,
  contact,
  details,
}: {
  submissionId: string;
  parentName: string;
  status: CallStatus;
  note: string;
  contact: ReactNode;
  details: ReactNode;
}) {
  const [result, action, pending] = useActionState<SaveCallResult | null, FormData>(
    saveCallStatusFromRow,
    null,
  );
  const [status, setStatus] = useState(savedStatus);
  const [note, setNote] = useState(savedNote);

  // When the saved values change (after a save, or another person's save on
  // the next load), show them.
  const [shown, setShown] = useState({ savedStatus, savedNote });
  if (shown.savedStatus !== savedStatus || shown.savedNote !== savedNote) {
    setShown({ savedStatus, savedNote });
    setStatus(savedStatus);
    setNote(savedNote);
  }

  // A failed save must not leave an unsaved status on display.
  const lastResult = useRef(result);
  useEffect(() => {
    if (result !== lastResult.current && result && !result.ok) setStatus(savedStatus);
    lastResult.current = result;
  }, [result, savedStatus]);

  const formRef = useRef<HTMLFormElement>(null);

  // Submitting through React's own form action resets the form afterwards;
  // the reset would bring back the status the page first loaded with. So the
  // save is dispatched here instead.
  function save(next: { status?: CallStatus } = {}) {
    if (!formRef.current) return;
    const form = new FormData(formRef.current);
    if (next.status) form.set("status", next.status);
    startTransition(() => action(form));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save();
  }

  const id = `request-${submissionId}`;

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={onSubmit}
      className="grid gap-6 py-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]"
    >
      <input type="hidden" name="submissionId" value={submissionId} />

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">{parentName}</h3>
        <div className="space-y-2">{contact}</div>
        <div className="grid max-w-60 gap-1">
          <Label htmlFor={`${id}-status`}>Status</Label>
          <div className="relative">
            <select
              id={`${id}-status`}
              name="status"
              value={status}
              disabled={pending}
              onChange={(event) => {
                const next = event.target.value;
                if (!isCallStatus(next)) return;
                setStatus(next);
                save({ status: next });
              }}
              className={cn(
                "min-h-(--control-height) w-full cursor-pointer appearance-none rounded-control border py-2 pr-10 pl-3 text-base font-semibold focus-ring disabled:cursor-wait",
                STATUS_LOOK[status],
              )}
            >
              {CALL_STATUSES.map((value) => (
                <option key={value} value={value} className="bg-background font-normal text-foreground">
                  {CALL_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden
              className={cn(
                "pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2",
                ARROW_COLOR[status],
              )}
            />
          </div>
        </div>
      </div>

      {details}

      <div className="grid content-start gap-3">
        <div className="grid gap-1">
          <Label htmlFor={`${id}-note`}>Note</Label>
          <textarea
            id={`${id}-note`}
            name="note"
            rows={2}
            maxLength={CALL_NOTE_MAX_LENGTH}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="For example: call back Tuesday evening"
            className="w-full rounded-control border border-input bg-transparent px-3 py-2 text-base focus-ring"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="compact" variant="outline" disabled={pending}>
            {pending ? "Saving…" : "Save note"}
          </Button>
          <p role="status" className={result && !result.ok ? "text-destructive" : undefined}>
            {result && !pending ? result.message : null}
          </p>
        </div>
      </div>
    </form>
  );
}
