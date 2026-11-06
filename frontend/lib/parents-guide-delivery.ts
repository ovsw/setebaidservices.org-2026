import "server-only";
import { type FormDefinition, type FormDeliveryDeps, submitFormEntry } from "@/lib/form-delivery";
import {
  type ParentsGuideErrors,
  type ParentsGuideRequest,
  type ParentsGuideResult,
  validateParentsGuide,
} from "@/lib/parents-guide";

const parentsGuideForm: FormDefinition<ParentsGuideRequest, ParentsGuideErrors> = {
  kind: "parents_guide",
  validate: validateParentsGuide,
  toEntry: (request, meta) => ({ ...request, ...meta, kind: "parents_guide" }),
};

/** Check a parent's guide request and deliver it on both paths. */
export function submitParentsGuide(
  formData: FormData,
  visitor: string,
  deps: FormDeliveryDeps,
): Promise<ParentsGuideResult> {
  return submitFormEntry(parentsGuideForm, formData, visitor, deps);
}
