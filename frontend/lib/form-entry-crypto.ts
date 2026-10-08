import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type { AskAboutCampEntry } from "@/lib/ask-about-camp-delivery";

/**
 * A form entry as it travels to the store task. Only the Website and the
 * task hold the key, so Trigger.dev's run history keeps nothing readable.
 * The submission ID is a random UUID, not a family detail; it stays readable
 * so a run can be matched to its Formspark copy, and it is bound to the
 * ciphertext so it cannot be swapped.
 */
export type EncryptedFormEntry = {
  submissionId: string;
  iv: string;
  ciphertext: string;
  tag: string;
};

const ALGORITHM = "aes-256-gcm";

/** The key is 32 random bytes in base64, as setup section g makes it. */
function readKey(keyBase64: string) {
  const key = Buffer.from(keyBase64, "base64");
  if (key.length !== 32) throw new Error("The form encryption key is missing or is not 32 bytes of base64.");
  return key;
}

export function encryptFormEntry(entry: AskAboutCampEntry, keyBase64: string): EncryptedFormEntry {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, readKey(keyBase64), iv);
  cipher.setAAD(Buffer.from(entry.submissionId));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(entry), "utf8"), cipher.final()]);
  return {
    submissionId: entry.submissionId,
    iv: iv.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
}

/** Throws when the key is wrong or the payload was changed. */
export function decryptFormEntry(payload: EncryptedFormEntry, keyBase64: string): AskAboutCampEntry {
  const decipher = createDecipheriv(ALGORITHM, readKey(keyBase64), Buffer.from(payload.iv, "base64"));
  decipher.setAAD(Buffer.from(payload.submissionId));
  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64")),
    decipher.final(),
  ]);
  return JSON.parse(plaintext.toString("utf8")) as AskAboutCampEntry;
}
