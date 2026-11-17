import { GalleryHorizontal } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBackgroundField } from "./shared/section-background";

const tiltedFeatureCard = defineArrayMember({
  name: "tiltedFeatureCard",
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
      name: "badgeLabel",
      title: "Badge label",
      type: "string",
      description: 'Small text in the badge on the photo, e.g. "JUL".',
    }),
    defineField({
      name: "badgeValue",
      title: "Badge value",
      type: "string",
      description: 'Large text in the badge, e.g. "11–17".',
    }),
    defineField({
      name: "eyebrow",
      type: "string",
      description: 'Short uppercase label above the title, e.g. "Ages 7–13".',
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
    defineField({
      name: "buttons",
      type: "array",
      description: "Up to two buttons. The first is the main action.",
      of: [defineArrayMember({ type: "button" })],
      validation: (rule) => rule.max(2),
    }),
  ],
  preview: {
    select: { media: "image", title: "title", subtitle: "eyebrow" },
  },
});

export default defineType({
  name: "tiltedFeatureCards",
  title: "Tilted feature cards",
  type: "object",
  icon: GalleryHorizontal,
  description:
    "Large photo cards, two across, each with a date badge on the photo and up to two buttons.",
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
      name: "cards",
      type: "array",
      description: "Add 2 to 6 cards, two to a row.",
      of: [tiltedFeatureCard],
      validation: (rule) => rule.required().min(2).max(6),
    }),
  ],
  preview: {
    select: { cards: "cards" },
    prepare: ({ cards }) => {
      const count = Array.isArray(cards) ? cards.length : 0;
      return {
        title: "Tilted feature cards",
        subtitle: `${count} ${count === 1 ? "card" : "cards"}`,
      };
    },
  },
});
