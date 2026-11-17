import { Images } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBackgroundField } from "./shared/section-background";

const featureCardLink = defineField({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Link Text",
      type: "string",
    }),
    defineField({
      name: "url",
      title: "Destination",
      type: "customUrl",
      validation: (rule) => rule.required(),
    }),
  ],
  description: "The whole card links here.",
  validation: (rule) => rule.required(),
});

const featureCard = defineArrayMember({
  name: "featureCardItem",
  title: "Card",
  type: "object",
  fields: [
    defineField({
      name: "image",
      type: "image",
      description:
        "Use the hotspot tool to preserve the important part of the image when cropped.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Describe the image for visitors who cannot see it.",
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      type: "string",
    }),
    defineField({
      name: "text",
      type: "text",
      rows: 4,
    }),
    featureCardLink,
  ],
  preview: {
    select: { media: "image", title: "title", subtitle: "text" },
  },
});

const featureCardGroup = defineArrayMember({
  name: "featureCardGroup",
  title: "Row",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      type: "string",
      description: "Shown above the row.",
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "cards",
      type: "array",
      description:
        "Add 2 to 6 cards. The columns follow the number of cards.",
      of: [featureCard],
      validation: (rule) => rule.required().min(2).max(6),
    }),
  ],
  preview: {
    select: { title: "heading", cards: "cards" },
    prepare: ({ cards, title }) => {
      const count = Array.isArray(cards) ? cards.length : 0;
      return {
        title: title || "Untitled Row",
        subtitle: `${count} ${count === 1 ? "card" : "cards"}`,
      };
    },
  },
});

export default defineType({
  name: "featureCards",
  title: "Image Feature Cards",
  type: "object",
  icon: Images,
  description:
    "One or two rows of linked image cards with automatic numbering and columns.",
  fields: [
    sectionBackgroundField,
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Optional short label shown above the heading.",
    }),
    defineField({
      name: "title",
      title: "Heading",
      type: "minimalRichText",
      description:
        "Use italic for the phrase that gets the handwritten style.",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "groups",
      title: "Rows",
      type: "array",
      of: [featureCardGroup],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .max(2)
          .custom((groups) => {
            const missing = (groups as { heading?: string }[] | undefined)?.some(
              (group) => !group?.heading?.trim(),
            );
            return missing ? "Give every row a heading" : true;
          }),
    }),
  ],
  preview: {
    select: { eyebrow: "eyebrow", groups: "groups" },
    prepare: ({ eyebrow, groups }) => {
      const count = Array.isArray(groups) ? groups.length : 0;
      return {
        title: eyebrow || "Image Feature Cards",
        subtitle: `${count} ${count === 1 ? "row" : "rows"}`,
      };
    },
  },
});
