import { PieChart } from "lucide-react";
import { defineField, defineType } from "sanity";
import { impactStat, richTextToPlainText } from "./impact-stat";
import { sectionBackgroundField } from "./shared/section-background";

export default defineType({
  name: "impactSpotlight",
  title: "Impact Spotlight",
  type: "object",
  icon: PieChart,
  description:
    "Who paid for camp, for donors: one hero figure with up to four smaller ones beside it, then a bar that shows the family and donor shares of the cost, with a statement beside it.",
  fields: [
    sectionBackgroundField,
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: 'Small line above the headline: "Who paid for camp".',
    }),
    defineField({
      name: "title",
      title: "Headline",
      type: "minimalRichText",
      description: "Italic marks the accent phrase.",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 3,
      description: "One or two sentences under the headline.",
    }),
    defineField({
      name: "stats",
      title: "Numbers",
      type: "array",
      description: "The first number is the hero figure; the next four sit beside it.",
      of: [impactStat],
      validation: (rule) => rule.required().min(1).max(5),
    }),
    defineField({
      name: "shareTitle",
      title: "Bar title",
      type: "string",
      description: '"Who paid for camp in 2026".',
    }),
    defineField({
      name: "shareCaption",
      title: "Bar caption",
      type: "string",
      description: '"Share of the total cost of camp week".',
    }),
    defineField({
      name: "familiesShare",
      title: "Families' share (%)",
      type: "number",
      description:
        "The part of the total cost that families paid, as a whole-number percent. Donors covered the rest. Leave empty to hide the bar.",
      validation: (rule) => rule.min(0).max(100).integer(),
    }),
    defineField({
      name: "familiesLabel",
      title: "Families label",
      type: "string",
      initialValue: "Families",
    }),
    defineField({
      name: "donorsLabel",
      title: "Donors label",
      type: "string",
      initialValue: "Donors, grants and sponsors",
    }),
    defineField({
      name: "statement",
      title: "Statement",
      type: "string",
      description:
        'Set large beside the bar: "Every child gets the same camp, and nobody at camp knows who paid what."',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "button",
      description: 'Optional. A text link at the end: "Fund a campership".',
    }),
  ],
  preview: {
    select: { stats: "stats", title: "title" },
    prepare: ({ stats, title }) => {
      const count = Array.isArray(stats) ? stats.length : 0;
      return {
        title: richTextToPlainText(title) || "Untitled Impact Spotlight",
        subtitle: `Impact spotlight · ${count} ${count === 1 ? "number" : "numbers"}`,
      };
    },
  },
});
