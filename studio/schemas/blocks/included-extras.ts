import { Scale } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBackgroundField } from "./shared/section-background";

const richTextToPlainText = (value: unknown): string => {
  if (!Array.isArray(value)) return "";
  return value
    .map((block) => {
      const children = (block as { children?: { text?: string }[] })?.children;
      if (!Array.isArray(children)) return "";
      return children.map((child) => child?.text ?? "").join("");
    })
    .join(" ")
    .trim();
};

const includedItem = defineArrayMember({
  name: "includedExtrasIncludedItem",
  title: "Item",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      description: 'What is included, e.g. "All 35 activities".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "detail",
      type: "string",
      description: "Optional one-line note under the label.",
    }),
  ],
  preview: { select: { title: "label", subtitle: "detail" } },
});

const priceTier = defineArrayMember({
  name: "includedExtrasPrice",
  title: "Price",
  type: "object",
  fields: [
    defineField({
      name: "name",
      type: "string",
      description: 'What the price buys, e.g. "Adult camp weekend" or "Competition 1".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "price",
      type: "string",
      description: 'The number as written, e.g. "$725" or "$1,100".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "unit",
      type: "string",
      description: 'Shown beside the number, e.g. "per person, plus tax".',
    }),
    defineField({
      name: "note",
      type: "string",
      description: 'Optional one-line note, e.g. "Sept 3 to 6, 2027. Previous season\u2019s price (camp to confirm)".',
    }),
  ],
  preview: { select: { title: "name", subtitle: "price" } },
});

const extraItem = defineArrayMember({
  name: "includedExtrasExtraItem",
  title: "Extra",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      description: 'The extra, e.g. "Camp bus from Yorkdale".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "detail",
      type: "string",
      description: "Optional one-line note. Explain camp words here.",
    }),
    defineField({
      name: "price",
      type: "string",
      description: 'Shown as written, e.g. "$265 + tax" or "Camp to confirm".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "object",
      description: "Optional. Shown under the note when both fields are set.",
      fields: [
        defineField({ name: "text", title: "Link Text", type: "string" }),
        defineField({ name: "url", title: "Destination", type: "customUrl" }),
      ],
    }),
  ],
  preview: { select: { title: "label", subtitle: "price" } },
});

export default defineType({
  name: "includedExtras",
  title: "Price, Included & Extras",
  type: "object",
  icon: Scale,
  description:
    "The price first, then two columns: a check list of what the price includes beside a priced list of what is extra.",
  fields: [
    sectionBackgroundField,
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Optional short label above the heading.",
    }),
    defineField({
      name: "title",
      title: "Heading",
      type: "minimalRichText",
      description: "Use italic for the phrase that gets the handwritten style.",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "intro",
      title: "Intro line",
      type: "text",
      rows: 2,
      description: "Optional. One or two sentences under the heading.",
    }),
    defineField({
      name: "prices",
      title: "Prices",
      type: "array",
      of: [priceTier],
      description:
        "The headline price, shown before the columns. Add up to three when the section compares options. Leave empty when the page already shows the price above.",
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: "included",
      title: "Included column",
      type: "object",
      fields: [
        defineField({
          name: "heading",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "note",
          type: "string",
          description: 'Optional line under the heading, e.g. "Same for every session length".',
        }),
        defineField({
          name: "items",
          type: "array",
          of: [includedItem],
          validation: (rule) => rule.required().min(2).max(8),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "extras",
      title: "Extras column",
      type: "object",
      fields: [
        defineField({
          name: "heading",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "note",
          type: "string",
          description: 'Optional line under the heading, e.g. "Billed with the balance".',
        }),
        defineField({
          name: "items",
          type: "array",
          of: [extraItem],
          validation: (rule) => rule.required().min(1).max(8),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "footnote",
      type: "text",
      rows: 2,
      description: "Optional small print under both columns.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      prices: "prices",
      included: "included.items",
      extras: "extras.items",
    },
    prepare: ({ title, prices, included, extras }) => ({
      title: richTextToPlainText(title) || "Price, Included & Extras",
      subtitle: `${Array.isArray(prices) ? prices.length : 0} prices · ${Array.isArray(included) ? included.length : 0} included · ${Array.isArray(extras) ? extras.length : 0} extras`,
    }),
  },
});
