import "server-only";
import { type FormDefinition, type FormDeliveryDeps, submitFormEntry } from "@/lib/form-delivery";
import {
  type MemorialCardErrors,
  type MemorialCardRequest,
  type MemorialCardResult,
  validateMemorialCard,
} from "@/lib/memorial-card";

const memorialCardForm: FormDefinition<MemorialCardRequest, MemorialCardErrors> = {
  kind: "memorial_card",
  validate: validateMemorialCard,
  toEntry: (request, meta) => ({ ...request, ...meta, kind: "memorial_card" }),
};

/** Check a memorial card entry and deliver it on both paths. */
export function submitMemorialCard(
  formData: FormData,
  visitor: string,
  deps: FormDeliveryDeps,
): Promise<MemorialCardResult> {
  return submitFormEntry(memorialCardForm, formData, visitor, deps);
}
