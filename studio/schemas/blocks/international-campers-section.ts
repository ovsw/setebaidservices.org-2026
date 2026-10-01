import { Globe } from "lucide-react";
import { defineField, defineType } from "sanity";

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

export const internationalCampersSection = defineType({
  name: "internationalCampersSection",
  title: "International Campers",
  type: "object",
  icon: Globe,
  description:
    "Globe and city-route list showing where campers travel from to reach Adventure Island.",
  initialValue: {
    eyebrow: "08 · FROM EVERYWHERE",
    heading: [
      {
        _type: "block",
        style: "normal",
        markDefs: [],
        children: [
          { _type: "span", text: "One island. ", marks: [] },
          { _type: "span", text: "The whole world.", marks: ["em"] },
        ],
      },
    ],
    description:
      "Our cabins sound like a departures board. We meet international campers at Toronto Pearson International Airport and travel with them all the way north, from city curb to cedar dock in one easy, supervised trip.",
    linkLabel: "International camper information",
    link: {
      type: "internal",
      openInNewTab: false,
    },
  },
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      description:
        "Small label above the heading. Include the sequence number if you want one.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heading",
      type: "minimalRichText",
      description:
        "Use italic for the phrase that gets the handwritten accent style.",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "linkLabel",
      type: "string",
      description: "Text shown on the onward link.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "link",
      title: "Link Destination",
      type: "customUrl",
      description:
        "Where the link points. Defaults to the /international-campers page.",
    }),
  ],
  preview: {
    select: { heading: "heading", eyebrow: "eyebrow" },
    prepare: ({ eyebrow, heading }) => ({
      title: richTextToPlainText(heading) || "International Campers",
      subtitle: typeof eyebrow === "string" ? eyebrow : undefined,
    }),
  },
});
