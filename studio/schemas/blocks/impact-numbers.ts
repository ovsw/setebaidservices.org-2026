import { Hash } from "lucide-react";
import { defineField, defineType } from "sanity";
import { impactStat, richTextToPlainText } from "./impact-stat";
import { sectionBackgroundField } from "./shared/section-background";

export default defineType({
  name: "impactNumbers",
  title: "Impact Numbers",
  type: "object",
  icon: Hash,
  description:
    "Last season in numbers for donors: a headline with a handwritten season note, then four to six large figures in a row.",
  fields: [
    sectionBackgroundField,
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: 'Small line above the headline: "Last summer in numbers".',
    }),
    defineField({
      name: "title",
      title: "Headline",
      type: "minimalRichText",
      description: "Italic marks the accent phrase.",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "season",
      title: "Season note",
      type: "string",
      description:
        'Optional. A handwritten note after the headline that names the season: "in 2026". Keep it to a few words.',
      validation: (rule) => rule.max(20),
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 3,
      description: "One or two sentences under the headline: where the numbers come from.",
    }),
    defineField({
      name: "stats",
      title: "Numbers",
      type: "array",
      description: "Four to six. The first one takes the accent colour.",
      of: [impactStat],
      validation: (rule) => rule.required().min(1).max(6),
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "button",
      description: 'Optional. A text link under the numbers: "Where your money goes".',
    }),
  ],
  preview: {
    select: { stats: "stats", title: "title" },
    prepare: ({ stats, title }) => {
      const count = Array.isArray(stats) ? stats.length : 0;
      return {
        title: richTextToPlainText(title) || "Untitled Impact Numbers",
        subtitle: `Impact numbers · ${count} ${count === 1 ? "number" : "numbers"}`,
      };
    },
  },
});
