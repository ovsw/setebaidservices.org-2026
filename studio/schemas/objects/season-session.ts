import { CalendarDays } from "lucide-react";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "seasonSession",
  title: "Session",
  type: "object",
  icon: CalendarDays,
  fields: [
    defineField({
      name: "startDate",
      title: "Start Date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "availabilityStatus",
      title: "Availability",
      type: "string",
      initialValue: "open",
      options: {
        layout: "radio",
        list: [
          { title: "Open", value: "open" },
          { title: "Limited", value: "limited" },
          { title: "Full", value: "full" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "availabilityNote",
      title: "Public Availability Note",
      type: "string",
      description:
        'Optional visitor-facing detail, such as "Under 5 spots".',
    }),
  ],
  preview: {
    select: {
      startDate: "startDate",
      status: "availabilityStatus",
      note: "availabilityNote",
    },
    prepare: ({ note, startDate, status }) => ({
      title: startDate || "Session",
      subtitle: [note, status].filter(Boolean).join(" · "),
    }),
  },
});
