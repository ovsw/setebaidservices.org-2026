import { HandCoins } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { richTextToPlainText } from "./shared/rich-text-preview";
import { sectionBackgroundField } from "./shared/section-background";

const tier = defineArrayMember({
  name: "pricingTier",
  title: "Tier",
  type: "object",
  fields: [
    defineField({
      name: "name",
      type: "string",
      description: 'Short uppercase name, e.g. "Tier I".',
    }),
    defineField({
      name: "label",
      type: "string",
      description: 'What the tier is, e.g. "Full cost" or "Subsidized".',
    }),
    defineField({
      name: "price",
      type: "number",
      description:
        "The fee in US dollars. The highest fee counts as the full cost: the bar shows what donors cover for every other tier.",
      validation: (rule) => rule.required().min(0).integer(),
    }),
    defineField({
      name: "buttons",
      type: "array",
      description:
        "One button. Its style follows the tier: an application tier gets the main style.",
      of: [defineArrayMember({ type: "button" })],
      validation: (rule) => rule.max(1),
    }),
    defineField({
      name: "application",
      title: "Application tier",
      type: "boolean",
      description:
        "Sets this tier apart below a dashed line, with its own colour. Use it for the tier that needs an application.",
      initialValue: false,
    }),
    defineField({
      name: "note",
      type: "text",
      rows: 2,
      description: "Optional line under the tier.",
    }),
  ],
  preview: {
    select: { name: "name", label: "label", price: "price" },
    prepare: ({ name, label, price }) => ({
      title: [name, label].filter(Boolean).join(" · ") || "Untitled tier",
      subtitle: typeof price === "number" ? `$${price.toLocaleString("en-US")}` : undefined,
    }),
  },
});

export default defineType({
  name: "pricingTiers",
  title: "Pricing Tiers",
  type: "object",
  icon: HandCoins,
  description:
    "Camp fees as tiers. Each row shows the fee, a bar of what donors cover, and a button. Prices live here, never in code.",
  fields: [
    sectionBackgroundField,
    defineField({
      name: "eyebrow",
      type: "string",
    }),
    defineField({
      name: "title",
      title: "Heading",
      type: "minimalRichText",
      description: "Use italic for the accent phrase.",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "intro",
      type: "text",
      rows: 3,
      description: "The paragraph beside the heading.",
    }),
    defineField({
      name: "panelTitle",
      title: "Panel heading",
      type: "string",
      description: 'Heading inside the price panel, e.g. "Tiers I–III: you choose".',
    }),
    defineField({
      name: "panelNote",
      title: "Panel note",
      type: "text",
      rows: 2,
      description: "One line under the panel heading.",
    }),
    defineField({
      name: "tiers",
      type: "array",
      of: [tier],
      validation: (rule) => rule.required().min(1).max(6),
    }),
    defineField({
      name: "notes",
      title: "Small print",
      type: "array",
      description: "Short lines under the panel, e.g. the deposit and the late fee.",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "link",
      type: "button",
      description: "Optional link after the small print, e.g. the refund policy.",
    }),
  ],
  preview: {
    select: { title: "title", tiers: "tiers" },
    prepare: ({ title, tiers }) => ({
      title: richTextToPlainText(title) || "Untitled Pricing Tiers",
      subtitle: `Pricing Tiers · ${Array.isArray(tiers) ? tiers.length : 0} tiers`,
    }),
  },
});
