"use server";

import { headers } from "next/headers";
import type { AskAboutCampResult } from "@/lib/ask-about-camp";
import {
  createFormsparkClient,
  createSubmitLimiter,
  createTriggerClient,
  submitAskAboutCamp,
} from "@/lib/ask-about-camp-delivery";

// Five requests in ten minutes is more than one family sends.
const allow = createSubmitLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export async function sendAskAboutCamp(
  _previous: AskAboutCampResult,
  formData: FormData,
): Promise<AskAboutCampResult> {
  const requestHeaders = await headers();
  const visitor =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown";

  // A missing key fails only its own path; the other path still delivers.
  return submitAskAboutCamp(formData, visitor, {
    trigger: createTriggerClient(process.env.TRIGGER_SECRET_KEY),
    encryptionKey: process.env.FORM_ENCRYPTION_KEY ?? "",
    formspark: createFormsparkClient(process.env.FORMSPARK_FORM_ID),
    allow,
  });
}
