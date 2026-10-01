import { ListChecks } from "lucide-react";
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

/**
 * Packing checklist: the kit list as a tick-off checklist grouped by kind.
 *
 * Each group is one card; each item is one checkbox. A "leave at home" group
 * renders marked, never as checkboxes. Ticks live in the visitor's browser,
 * not in Sanity, so the content model holds only the list itself.
 */

const item = defineArrayMember({
  name: "packingChecklistItem",
  title: "Item",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      description: "Written to the camper: what to pack, in a few words.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "quantity",
      type: "string",
      description:
        "Optional. A count or measure, such as 14, 2 pairs, or several.",
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "quantity" },
    prepare: ({ title, subtitle }) => ({
      title: title || "Untitled item",
      subtitle: subtitle ? `× ${subtitle}` : undefined,
    }),
  },
});

const group = defineArrayMember({
  name: "packingChecklistGroup",
  title: "Group",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tone",
      type: "string",
      description:
        "Normal groups are checkboxes. A leave-at-home group lists what stays behind and cannot be ticked.",
      initialValue: "normal",
      options: {
        layout: "radio",
        list: [
          { title: "Pack this", value: "normal" },
          { title: "Leave at home", value: "leaveAtHome" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "items",
      type: "array",
      of: [item],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "title", tone: "tone", items: "items" },
    prepare: ({ title, tone, items }) => {
      const count = Array.isArray(items) ? items.length : 0;
      return {
        title: title || "Untitled group",
        subtitle: `${tone === "leaveAtHome" ? "Leave at home · " : ""}${count} ${
          count === 1 ? "item" : "items"
        }`,
      };
    },
  },
});

export default defineType({
  name: "packingChecklist",
  title: "Packing Checklist",
  type: "object",
  icon: ListChecks,
  fields: [
    sectionBackgroundField,
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Small label above the heading, such as What to pack.",
    }),
    defineField({
      name: "title",
      title: "Heading",
      type: "minimalRichText",
      description: "Italic text gets the handwritten accent.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Intro line",
      type: "text",
      rows: 3,
      description: "One or two sentences to the camper, above the buttons.",
    }),
    defineField({
      name: "groups",
      type: "array",
      of: [group],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "note",
      type: "simpleRichText",
      description:
        "Beside the list: the bag rule and what the tuck shop sells if something is forgotten.",
    }),
    defineField({
      name: "pdf",
      title: "PDF version",
      type: "file",
      description: "Optional. Linked under the list for download.",
      options: { accept: "application/pdf" },
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      description:
        "Optional. Use the hotspot tool to preserve the important part of the image when cropped.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description: "Describe the image for visitors who cannot see it.",
          validation: (rule) =>
            rule.custom((value, context) => {
              const parent = context.parent as { asset?: unknown } | undefined;
              return parent?.asset && !value?.trim()
                ? "Alt text is required when an image is set"
                : true;
            }),
        }),
      ],
    }),
  ],
  preview: {
    select: { eyebrow: "eyebrow", title: "title", groups: "groups" },
    prepare: ({ eyebrow, title, groups }) => {
      const count = Array.isArray(groups) ? groups.length : 0;
      return {
        title: richTextToPlainText(title) || eyebrow || "Packing Checklist",
        subtitle: `Packing Checklist · ${count} ${count === 1 ? "group" : "groups"}`,
      };
    },
  },
});
