"use server";

import { headers } from "next/headers";
import { createFormsparkClient, createSubmitLimiter, createTriggerClient } from "@/lib/form-delivery";
import type { MemorialCardResult } from "@/lib/memorial-card";
import { submitMemorialCard } from "@/lib/memorial-card-delivery";

// Five cards in ten minutes is more than one donor sends.
const allow = createSubmitLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export async function sendMemorialCard(formData: FormData): Promise<MemorialCardResult> {
  const requestHeaders = await headers();
  const visitor =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown";

  // The same Formspark form as "Ask about camp": the nightly gap check and
  // the retention job read one form. A missing key fails only its own path.
  return submitMemorialCard(formData, visitor, {
    trigger: createTriggerClient(process.env.TRIGGER_SECRET_KEY),
    encryptionKey: process.env.FORM_ENCRYPTION_KEY ?? "",
    formspark: createFormsparkClient(process.env.FORMSPARK_FORM_ID),
    allow,
  });
}
