import { CalendarRange } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import {
  type SeasonLengthKey,
  validateSessionDateRange,
} from "../validation/season-rules.ts";

function lengthConfigField({
  lengthKey,
  max,
  min,
  title,
}: {
  lengthKey: SeasonLengthKey;
  max: number;
  min: number;
  title: string;
}) {
  return defineField({
    name: lengthKey,
    title,
    type: "object",
    fields: [
      defineField({
        name: "rate",
        title: "Rate",
        type: "number",
        description: "One all-inclusive Rate for this Session length.",
        validation: (rule) => rule.required().min(0).precision(2),
      }),
      defineField({
        name: "description",
        type: "text",
        rows: 3,
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: "sessions",
        title: "Sessions",
        type: "array",
        of: [defineArrayMember({ type: "seasonSession" })],
        validation: (rule) =>
          rule
            .required()
            .min(min)
            .max(max)
            .custom((sessions, context) =>
              validateSessionDateRange(sessions, context, lengthKey),
            ),
      }),
    ],
    validation: (rule) => rule.required(),
  });
}

export default defineType({
  name: "season",
  title: "Season",
  type: "document",
  icon: CalendarRange,
  fields: [
    defineField({
      name: "name",
      type: "string",
      description: 'Editor-facing label, such as "2027 Season".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "startDate",
      title: "Start Date",
      type: "date",
      description: "The first day of the 8-week Season.",
      validation: (rule) => rule.required(),
    }),
    lengthConfigField({
      lengthKey: "twoWeek",
      title: "2-week configuration",
      min: 1,
      max: 4,
    }),
    lengthConfigField({
      lengthKey: "fourWeek",
      title: "4-week configuration",
      min: 1,
      max: 2,
    }),
    lengthConfigField({
      lengthKey: "sixWeek",
      title: "6-week configuration",
      min: 1,
      max: 2,
    }),
    lengthConfigField({
      lengthKey: "eightWeek",
      title: "8-week configuration",
      min: 1,
      max: 1,
    }),
  ],
  orderings: [
    {
      title: "Start Date",
      name: "startDateAsc",
      by: [{ field: "startDate", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      name: "name",
      startDate: "startDate",
    },
    prepare: ({ name, startDate }) => ({
      title: name || "Season",
      subtitle: startDate,
    }),
  },
});
