import { MessageSquareText } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBackgroundField } from "./shared/section-background";

export default defineType({
  name: "askAboutCampForm",
  title: "Ask about camp form",
  type: "object",
  icon: MessageSquareText,
  description:
    "A form that sends a parent's request to the office by email. The form fields are fixed; it asks for no medical details.",
  fields: [
    sectionBackgroundField,
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "topics",
      title: "Choices for “What would you like to know?”",
      type: "array",
      description: "Parents may tick any of these. The director choice below is always added last.",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.max(10).unique(),
    }),
    defineField({
      name: "directorTopic",
      title: "Director choice",
      type: "string",
      description:
        "A link to #talk-to-the-director, on this page or after this page's address, opens the form with this choice ticked.",
      initialValue: "Talk with the camp director",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "privacyLine",
      title: "Privacy line",
      type: "string",
      description: "Shown beside the Send button, followed by a link to the privacy policy.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "successMessage",
      title: "Thank-you message",
      type: "text",
      rows: 3,
      description: "Shown in place of the form once the request is sent. Say what happens next.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "errorMessage",
      title: "Error message",
      type: "text",
      rows: 3,
      description:
        "Shown when the request could not be sent. The office phone number from Global Settings follows it as a call link.",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title: previewTitle }) => ({
      title: previewTitle || "Untitled Ask about camp form",
      subtitle: "Ask about camp form",
    }),
  },
});
