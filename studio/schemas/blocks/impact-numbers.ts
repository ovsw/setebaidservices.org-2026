import { Hash } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBackgroundField } from "./shared/section-background";

const richTextToPlainText = (value: unknown): string => {
  if (!Array.isArray(value)) return "";
  return value
    .map((block) => {
      if (!block || typeof block !== "object") return "";
      const children = (block as { children?: Array<{ text?: string }> }).children;
      return Array.isArray(children) ? children.map((child) => child.text ?? "").join("") : "";
    })
    .join(" ")
    .trim();
};

const isSpotlight = (parent: unknown) =>
  (parent as { layout?: string } | undefined)?.layout === "spotlight";

/**
 * One number with its label: "48" + "of 50" + "families paid a reduced
 * price". The office types the value as text, so "About 50", "90%+" and
 * "$3,700" all work without a format rule.
 */
const impactStat = defineArrayMember({
  name: "impactStat",
  title: "Number",
  type: "object",
  fields: [
    defineField({
      name: "value",
      title: "Number",
      type: "string",
      description: 'The big figure, as text: "50", "48", "90%+", "$3,700".',
      validation: (rule) => rule.required().max(12),
    }),
    defineField({
      name: "detail",
      title: "Detail",
      type: "string",
      description: 'Optional. A few small words right after the figure: "of 50".',
      validation: (rule) => rule.max(24),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: 'What the number counts: "campers came to camp".',
      validation: (rule) => rule.required().max(90),
    }),
  ],
  preview: {
    select: { detail: "detail", label: "label", value: "value" },
    prepare: ({ detail, label, value }) => ({
      title: [value, detail].filter(Boolean).join(" ") || "Untitled number",
      subtitle: label,
    }),
  },
});

/** One price tier and how many families chose it. */
const impactTier = defineArrayMember({
  name: "impactTier",
  title: "Tier",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Tier",
      type: "string",
      description: '"Tier I · full cost", "Tier IV · campership".',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "families",
      title: "Families",
      type: "number",
      description: "How many families chose this tier last season.",
      validation: (rule) => rule.required().min(0).integer(),
    }),
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      description: "Sets the bar colour: marigold for the full cost, lake for a reduced tier, green for the campership tier.",
      initialValue: "reduced",
      options: {
        layout: "radio",
        list: [
          { title: "Full cost", value: "full" },
          { title: "Reduced tier", value: "reduced" },
          { title: "Campership", value: "campership" },
        ],
      },
    }),
  ],
  preview: {
    select: { families: "families", name: "name" },
    prepare: ({ families, name }) => ({
      title: name || "Untitled tier",
      subtitle: typeof families === "number" ? `${families} families` : undefined,
    }),
  },
});

export default defineType({
  name: "impactNumbers",
  title: "Impact Numbers",
  type: "object",
  icon: Hash,
  description:
    "Last season in numbers for donors. Band: a row of large figures. Spotlight: one hero figure with smaller ones beside it, then a full-width card that shows who paid for camp and which tier families chose.",
  fields: [
    sectionBackgroundField,
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      description:
        "Band: four to six large figures in a row. Spotlight: the first figure set very large, the rest beside it, and the who-paid card below.",
      initialValue: "band",
      options: {
        layout: "radio",
        list: [
          { title: "Band", value: "band" },
          { title: "Spotlight", value: "spotlight" },
        ],
      },
    }),
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
      description:
        "Band: four to six. Spotlight: the first number is the hero figure, the next four sit beside it.",
      of: [impactStat],
      validation: (rule) => rule.required().min(1).max(6),
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "button",
      description: 'Optional. A text link under the numbers: "Where your money goes".',
    }),
    defineField({
      name: "share",
      title: "Who paid for camp",
      type: "object",
      description: "Spotlight layout only. The card below the numbers.",
      hidden: ({ parent }) => !isSpotlight(parent),
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "title",
          title: "Card title",
          type: "string",
          description: '"Who paid for camp in 2026".',
        }),
        defineField({
          name: "subtitle",
          title: "Bar caption",
          type: "string",
          description: '"Share of the total cost of camp week".',
        }),
        defineField({
          name: "familiesShare",
          title: "Families' share (%)",
          type: "number",
          description: "The part of the total cost that families paid, as a whole-number percent. Donors covered the rest.",
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
          name: "tiersTitle",
          title: "Tiers title",
          type: "string",
          description: '"Which price did families choose?"',
        }),
        defineField({
          name: "tiersSubtitle",
          title: "Tiers caption",
          type: "string",
          description: '"Families, by tier".',
        }),
        defineField({
          name: "tiers",
          title: "Tiers",
          type: "array",
          description: "One row per tier, highest price first.",
          of: [impactTier],
          validation: (rule) => rule.max(6),
        }),
        defineField({
          name: "note",
          title: "Note",
          type: "string",
          description: 'A closing line in the card: "Every child gets the same camp, and nobody at camp knows who paid what."',
        }),
      ],
    }),
  ],
  preview: {
    select: { layout: "layout", stats: "stats", title: "title" },
    prepare: ({ layout, stats, title }) => {
      const count = Array.isArray(stats) ? stats.length : 0;
      return {
        title: richTextToPlainText(title) || "Untitled Impact Numbers",
        subtitle: `Impact numbers · ${layout === "spotlight" ? "Spotlight" : "Band"} · ${count} ${count === 1 ? "number" : "numbers"}`,
      };
    },
  },
});
