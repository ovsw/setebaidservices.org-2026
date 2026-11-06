import { BookOpen } from "lucide-react";
import { defineField, defineType } from "sanity";
import { sectionBackgroundField } from "./shared/section-background";

export default defineType({
  name: "parentsGuideForm",
  title: "Parent's guide form",
  type: "object",
  icon: BookOpen,
  description:
    "A short form for the parent's guide. It asks for a first name and an email, emails the parent the guide, and tells the office.",
  fields: [
    sectionBackgroundField,
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      validation: (rule) => rule.required().error("Add the heading shown above the form."),
    }),
    defineField({
      name: "guide",
      title: "Guide PDF",
      type: "file",
      description:
        "The parent's guide. The reply email links to setebaidservices.org/parents-guide.pdf, which opens this file, so uploading a new PDF here replaces the guide everywhere.",
      options: { accept: "application/pdf" },
      validation: (rule) => rule.required().error("Upload the guide PDF that the reply email sends to parents."),
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "privacyLine",
      title: "Privacy line",
      type: "string",
      description: "Shown beside the Send button, followed by a link to the privacy policy.",
      validation: (rule) => rule.required().error("Add the privacy line shown beside the Send button."),
    }),
    defineField({
      name: "successMessage",
      title: "Thank-you message",
      type: "text",
      rows: 3,
      description: "Shown in place of the form once the request is sent. Say what happens next.",
      validation: (rule) => rule.required().error("Add the message parents see after their request is sent."),
    }),
    defineField({
      name: "errorMessage",
      title: "Error message",
      type: "text",
      rows: 3,
      description:
        "Shown when the request could not be sent. The office phone number from Global Settings follows it as a call link.",
      validation: (rule) => rule.required().error("Add the message parents see when their request cannot be sent."),
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title: previewTitle }) => ({
      title: previewTitle || "Untitled Parent's guide form",
      subtitle: "Parent's guide form",
    }),
  },
});
