import { Images } from "lucide-react";
import { defineArrayMember, defineField, defineType, type Path } from "sanity";
import { sectionBackgroundField } from "./shared/section-background";

/** Whether the Feature Cards section that holds the field at `path` is tilted. */
function isTiltedSection(document: unknown, path: Path | undefined) {
  const sectionKey = (path?.[1] as { _key?: string } | undefined)?._key;
  const blocks = (document as { blocks?: { _key?: string; layout?: string }[] } | undefined)
    ?.blocks;
  return blocks?.find((block) => block._key === sectionKey)?.layout === "tilted";
}

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
  description: "Numbered grid only. The whole card links here.",
  hidden: ({ document, path }) => isTiltedSection(document, path),
  validation: (rule) =>
    rule.custom((value, context) =>
      value || isTiltedSection(context.document, context.path) ? true : "Required",
    ),
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
          validation: (rule) =>
            rule.custom((value, context) => {
              const parent = context.parent as { asset?: unknown } | undefined;
              return parent?.asset && !value?.trim()
                ? "Alt text is required when an image is set"
                : true;
            }),
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
    defineField({
      name: "buttons",
      type: "array",
      description: "Tilted photos only. Up to two buttons. The first is the main action.",
      of: [defineArrayMember({ type: "button" })],
      hidden: ({ document, path }) => !isTiltedSection(document, path),
      validation: (rule) => rule.max(2),
    }),
    defineField({
      name: "eyebrow",
      type: "string",
      description: 'Tilted layout only. Short uppercase label above the title, e.g. "Ages 7–13".',
    }),
    defineField({
      name: "badgeLabel",
      title: "Badge label",
      type: "string",
      description: 'Tilted layout only. Small text in the badge on the photo, e.g. "JUL".',
    }),
    defineField({
      name: "badgeValue",
      title: "Badge value",
      type: "string",
      description: 'Tilted layout only. Large text in the badge, e.g. "11–17".',
    }),
  ],
  preview: {
    select: { media: "image", title: "title", subtitle: "text" },
  },
});

const featureCardGroup = defineArrayMember({
  name: "featureCardGroup",
  title: "Row",
  type: "object",
  initialValue: {
    singleRowUpToFour: true,
  },
  fields: [
    defineField({
      name: "heading",
      type: "string",
      description: "Shown above the row in the numbered grid. The tilted layout does not show it.",
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "singleRowUpToFour",
      title: "Keep up to four cards in one row",
      type: "boolean",
      description:
        "When enabled, four cards stay together on one row on desktop. Turn it off for a two-by-two layout.",
      initialValue: true,
      components: {
        input: (props) =>
          props.renderDefault({ ...props, value: props.value ?? true }),
      },
    }),
    defineField({
      name: "cards",
      type: "array",
      description:
        "Add 2 to 6 cards. The layout follows the number of cards and the row setting above.",
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
      name: "layout",
      type: "string",
      description:
        "Numbered grid: linked image cards in rows. Tilted photos: large cards with a tilted photo, a date badge and up to two buttons.",
      initialValue: "grid",
      options: {
        layout: "radio",
        list: [
          { title: "Numbered grid", value: "grid" },
          { title: "Tilted photos", value: "tilted" },
        ],
      },
    }),
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
          .custom((groups, context) => {
            const layout = (context.parent as { layout?: string } | undefined)?.layout;
            if (layout === "tilted") return true;
            const missing = (groups as { heading?: string }[] | undefined)?.some(
              (group) => !group?.heading?.trim(),
            );
            return missing ? "Give every row a heading" : true;
          }),
    }),
    defineField({
      name: "link",
      type: "button",
      description: "Tilted layout only. Optional text link beside the heading.",
      hidden: ({ parent }) => (parent as { layout?: string } | undefined)?.layout !== "tilted",
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
