import { Mail } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBackgroundField } from "./shared/section-background";

export default defineType({
  name: "memorialCardForm",
  title: "Memorial card form",
  type: "object",
  icon: Mail,
  description:
    "A four-step form for a memorial or honor gift. It sends the card details to the office by email. The form fields are fixed; links to #card-form jump to it.",
  fields: [
    sectionBackgroundField,
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      validation: (rule) => rule.required().error("Add the heading shown above the form."),
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "cardDesigns",
      title: "Card designs",
      type: "array",
      description: "The cards the office mails. Donors choose one by its picture and name.",
      of: [
        defineArrayMember({
          name: "cardDesign",
          title: "Card design",
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Name",
              type: "string",
              description: "Shown under the picture and sent to the office, for example “Dove With Sympathy”.",
              validation: (rule) => rule.required().error("Add the card's name."),
            }),
            defineField({
              name: "image",
              title: "Picture",
              type: "image",
              options: { hotspot: true },
              description: "The front of the card. The name above describes it, so no alt text is needed.",
              validation: (rule) => rule.required().error("Add a picture of the card."),
            }),
          ],
          preview: { select: { title: "name", media: "image" } },
        }),
      ],
      validation: (rule) =>
        rule.required().min(1).max(6).error("Add between 1 and 6 card designs."),
    }),
    defineField({
      name: "messages",
      title: "Preset card messages",
      type: "array",
      description:
        "The lines a donor can choose to print inside the card. The form always adds “Other” for the donor's own words.",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) =>
        rule.required().min(1).max(8).unique().error("Add between 1 and 8 different lines."),
    }),
    defineField({
      name: "givingLink",
      title: "Giving link",
      type: "url",
      description:
        "The Camp Brain giving page. The thank-you screen's “Give in Camp Brain” button opens it in a new tab.",
      validation: (rule) =>
        rule.required().uri({ scheme: ["https"] }).error("Add the https link to the Camp Brain giving page."),
    }),
    defineField({
      name: "byMailLine",
      title: "By-mail line",
      type: "text",
      rows: 3,
      description:
        "Shown on the thank-you screen: where to mail a check. Donors who chose “By check in the mail” see it first.",
      validation: (rule) => rule.required().error("Add where donors mail a check."),
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
      description:
        "Shown in place of the form once the card details are sent. The Give in Camp Brain button and the by-mail line follow it.",
      validation: (rule) => rule.required().error("Add the message donors see after the card details are sent."),
    }),
    defineField({
      name: "errorMessage",
      title: "Error message",
      type: "text",
      rows: 3,
      description:
        "Shown when the card details could not be sent. The office phone number from Global Settings follows it as a call link.",
      validation: (rule) => rule.required().error("Add the message donors see when the card details cannot be sent."),
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title: previewTitle }) => ({
      title: previewTitle || "Untitled Memorial card form",
      subtitle: "Memorial card form",
    }),
  },
});
