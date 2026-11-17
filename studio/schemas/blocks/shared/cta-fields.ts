import { defineArrayMember, defineField } from "sanity";
import { requiredText } from "../../validation/required-text";

/** Heading, supporting line and actions shared by the three call-to-action bands. */
export const ctaTitleField = defineField({
  name: "title",
  type: "string",
  description: "The question or statement that prompts visitors to act.",
  validation: (rule) => requiredText(rule, "Add the heading. The section is not shown without it."),
});

export const ctaDescriptionField = defineField({
  name: "description",
  type: "string",
  description: "Optional supporting sentence shown under the heading",
});

export const ctaButtonsField = defineField({
  name: "buttons",
  type: "array",
  description: "One or two actions. The first is the main action; the second is secondary.",
  of: [defineArrayMember({ type: "button" })],
  validation: (rule) => rule.required().min(1).max(2),
});
