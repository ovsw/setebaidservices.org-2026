"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { updateNumbersNow, type UpdateResult } from "./actions";

/** Copies the newest numbers from Vercel on request; the page then shows them. */
export function UpdateNowButton() {
  const [result, action, pending] = useActionState<UpdateResult | null>(updateNumbersNow, null);

  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <Button type="submit" size="compact" variant="outline" disabled={pending}>
        {pending ? "Updating…" : "Update now"}
      </Button>
      <p role="status">{result && !pending ? result.message : null}</p>
    </form>
  );
}
