import { CalendarDays } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBackgroundField } from "./shared/section-background";

const dateCard = defineArrayMember({
  name: "dateCard",
  title: "Card",
  type: "object",
  fields: [
    defineField({
      name: "date",
      type: "string",
      description: "Set large at the top of the card, e.g. Jul 11 or Spring 2027.",
    }),
    defineField({
      name: "title",
      type: "string",
      description: "The name of the event or campaign.",
    }),
    defineField({
      name: "text",
      title: "One line",
      type: "string",
      description: "One sentence on what happens. Explain any camp jargon.",
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: "link",
      type: "button",
      description: "Optional. The whole card links here; the label shows at its foot.",
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      description: "Optional. Shown across the top of the card.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "What the photo shows, for screen readers.",
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title", date: "date", media: "image" },
    prepare: ({ title, date, media }) => ({
      title: title || "Untitled Card",
      subtitle: date || undefined,
      media,
    }),
  },
});

export default defineType({
  name: "dateCards",
  title: "Date cards",
  type: "object",
  icon: CalendarDays,
  description:
    "Up to three coloured cards that lead with a date set large, with an optional text link beside the heading.",
  fields: [
    sectionBackgroundField,
    defineField({
      name: "title",
      title: "Heading",
      type: "minimalRichText",
      description: "Use italic for the phrase that gets the handwritten style.",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "link",
      type: "button",
      description: "Optional text link beside the heading.",
    }),
    defineField({
      name: "items",
      title: "Cards",
      type: "array",
      description: "One to three cards, shown in the order listed here.",
      of: [dateCard],
      validation: (rule) => rule.required().min(1).max(3),
    }),
  ],
  preview: {
    select: { items: "items" },
    prepare: ({ items }) => {
      const count = Array.isArray(items) ? items.length : 0;
      return {
        title: "Date cards",
        subtitle: `${count} ${count === 1 ? "card" : "cards"}`,
      };
    },
  },
});
