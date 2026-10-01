import { CalendarCog } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { validateActiveSeasonMembership } from "../validation/season-rules.ts";

export default defineType({
  name: "seasonsConfig",
  title: "Seasons Config",
  type: "document",
  icon: CalendarCog,
  description:
    "The authoritative Season planning list and manually selected Active Season.",
  fields: [
    defineField({
      name: "title",
      type: "string",
      initialValue: "Seasons Config",
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "plannedSeasons",
      title: "Planning List",
      type: "array",
      description:
        "Current and future Seasons. Removing a Season here does not delete its document.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "season" }],
        }),
      ],
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: "activeSeason",
      title: "Active Season",
      type: "reference",
      to: [{ type: "season" }],
      description: "The one Season visitors see. Activation is manual.",
      validation: (rule) =>
        rule.required().custom(validateActiveSeasonMembership),
    }),
  ],
  preview: {
    prepare: () => ({
      title: "Seasons Config",
      subtitle: "Active Season and planning list",
    }),
  },
});
