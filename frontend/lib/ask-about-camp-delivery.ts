import "server-only";
import {
  type AskAboutCampErrors,
  type AskAboutCampRequest,
  type AskAboutCampResult,
  validateAskAboutCamp,
} from "@/lib/ask-about-camp";
import { type FormDefinition, type FormDeliveryDeps, submitFormEntry } from "@/lib/form-delivery";

export type { AskAboutCampEntry } from "@/lib/form-entry";
export {
  createFormsparkClient,
  createSubmitLimiter,
  createTriggerClient,
  type FormsparkClient,
  type SubmitLimiter,
  type TriggerClient,
} from "@/lib/form-delivery";

export type AskAboutCampDeps = FormDeliveryDeps;

const askAboutCampForm: FormDefinition<AskAboutCampRequest, AskAboutCampErrors> = {
  kind: "ask_about_camp",
  validate: validateAskAboutCamp,
  toEntry: (request, meta) => ({ ...request, ...meta, kind: "ask_about_camp" }),
};

/** Check an "Ask about camp" request and deliver it on both paths. */
export function submitAskAboutCamp(
  formData: FormData,
  visitor: string,
  deps: AskAboutCampDeps,
): Promise<AskAboutCampResult> {
  return submitFormEntry(askAboutCampForm, formData, visitor, deps);
}
