"use server";

import { headers } from "next/headers";
import type { AskAboutCampResult } from "@/lib/ask-about-camp";
import {
  createFormsparkClient,
  createSubmitLimiter,
  submitAskAboutCamp,
} from "@/lib/ask-about-camp-delivery";

// Five requests in ten minutes is more than one family sends.
const allow = createSubmitLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export async function sendAskAboutCamp(
  _previous: AskAboutCampResult,
  formData: FormData,
): Promise<AskAboutCampResult> {
  const formId = process.env.FORMSPARK_FORM_ID;
  if (!formId) {
    console.error("Ask about camp cannot send: FORMSPARK_FORM_ID is not set.");
    return { status: "failed" };
  }

  const requestHeaders = await headers();
  const visitor =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown";

  return submitAskAboutCamp(formData, visitor, {
    formspark: createFormsparkClient(formId),
    allow,
  });
}
