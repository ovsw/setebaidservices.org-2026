import { LayoutGrid } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBackgroundField } from "./shared/section-background";

/** Flatten a minimalRichText value into plain text for the Studio preview. */
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

const activityCatalogueGroup = defineArrayMember({
  name: "activityCatalogueGroup",
  title: "Place",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Place",
      type: "string",
      description:
        'Where these activities happen, e.g. "On the water". Becomes a link in the jump bar.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "blurb",
      title: "One line",
      type: "string",
      description: "One line to the camper under the place name.",
    }),
    defineField({
      name: "activities",
      title: "Activities",
      type: "array",
      description: "Every Activity in this place, in the order the cards appear.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "activity" }],
        }),
      ],
      validation: (rule) => rule.required().min(1).unique(),
    }),
  ],
  preview: {
    select: { title: "title", activities: "activities" },
    prepare: ({ activities, title }) => {
      const count = Array.isArray(activities) ? activities.length : 0;
      return {
        title: title || "Untitled place",
        subtitle: `${count} ${count === 1 ? "Activity" : "Activities"}`,
      };
    },
  },
});

export default defineType({
  name: "activityCatalogue",
  title: "Activity Catalogue",
  type: "object",
  icon: LayoutGrid,
  description:
    "Every Activity as a photo card, grouped by where it happens on the island, with a sticky jump bar.",
  fields: [
    sectionBackgroundField,
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Optional short label shown above the heading.",
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "minimalRichText",
      description: "Use italic for the phrase that gets the handwritten style.",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 3,
      description: "Optional line under the heading that tells campers how to use the page.",
    }),
    defineField({
      name: "groups",
      title: "Places",
      type: "array",
      description: "Ordered places. Each becomes a jump-bar chip and a card grid.",
      of: [activityCatalogueGroup],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { heading: "heading", groups: "groups" },
    prepare: ({ groups, heading }) => {
      const count = Array.isArray(groups) ? groups.length : 0;
      return {
        title: richTextToPlainText(heading) || "Activity Catalogue",
        subtitle: `Activity Catalogue · ${count} ${count === 1 ? "place" : "places"}`,
      };
    },
  },
});
