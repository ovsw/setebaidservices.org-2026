import { describe, expect, it } from "vitest";
import { OK_TO_CONTACT_VALUE, validateParentsGuide } from "@/lib/parents-guide";

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
}

const required = { firstName: "Maria", email: "maria@example.com" };

describe("validateParentsGuide", () => {
  it("accepts an empty phone and an unticked box", () => {
    expect(validateParentsGuide(formData({ ...required, phone: "" }))).toEqual({
      ok: true,
      request: { ...required, phone: "", okToContact: false },
    });
  });

  it("keeps a filled-in phone and a ticked box", () => {
    const sent = formData({ ...required, phone: " (610) 555-0123 ", okToContact: OK_TO_CONTACT_VALUE });
    expect(validateParentsGuide(sent)).toEqual({
      ok: true,
      request: { ...required, phone: "(610) 555-0123", okToContact: true },
    });
  });

  it("checks a filled-in phone", () => {
    expect(validateParentsGuide(formData({ ...required, phone: "555-01" }))).toEqual({
      ok: false,
      errors: { phone: "Enter a phone number with at least 7 digits." },
    });
    expect(validateParentsGuide(formData({ ...required, phone: "call me" }))).toEqual({
      ok: false,
      errors: { phone: "Enter a phone number with at least 7 digits." },
    });
  });
});
