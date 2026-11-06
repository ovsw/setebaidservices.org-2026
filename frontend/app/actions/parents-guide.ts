"use server";

import { headers } from "next/headers";
import { createFormsparkClient, createSubmitLimiter, createTriggerClient } from "@/lib/form-delivery";
import type { ParentsGuideResult } from "@/lib/parents-guide";
import { submitParentsGuide } from "@/lib/parents-guide-delivery";

// Five requests in ten minutes is more than one parent sends.
const allow = createSubmitLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export async function sendParentsGuide(
  _previous: ParentsGuideResult,
  formData: FormData,
): Promise<ParentsGuideResult> {
  const requestHeaders = await headers();
  const visitor =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown";

  // Its own Formspark form. A missing key fails only its own path.
  return submitParentsGuide(formData, visitor, {
    trigger: createTriggerClient(process.env.TRIGGER_SECRET_KEY),
    encryptionKey: process.env.FORM_ENCRYPTION_KEY ?? "",
    formspark: createFormsparkClient(process.env.FORMSPARK_PARENTS_GUIDE_FORM_ID),
    allow,
  });
}
