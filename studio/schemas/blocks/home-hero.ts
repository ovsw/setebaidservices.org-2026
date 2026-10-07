import { Sparkles } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { photoField } from "./shared/photo-field";

const homeHeroStat = defineArrayMember({
  name: "homeHeroStat",
  title: "Stat",
  type: "object",
  fields: [
    defineField({
      name: "value",
      type: "string",
      description: 'The bold fact, e.g. "July 11–17, 2027".',
    }),
    defineField({
      name: "label",
      type: "string",
      description: 'A short line under the fact, e.g. "Mifflinburg, PA".',
    }),
  ],
  preview: {
    select: { title: "value", subtitle: "label" },
  },
});

export default defineType({
  name: "homeHero",
  title: "Home Hero",
  type: "object",
  icon: Sparkles,
  description:
    "A calm opener for the home page and landing pages: status line, heading, short message, buttons and facts beside a round photo in the brand ring, with a play button for the camp film.",
  fields: [
    defineField({
      name: "status",
      title: "Status line",
      type: "string",
      description:
        'One short line above the heading, with a marigold dot, e.g. "Registration for summer 2027 is open".',
    }),
    defineField({
      name: "title",
      title: "Heading",
      type: "minimalRichText",
      description: "The main heading. Use italic for the accent word or phrase.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Supporting Message",
      type: "simpleRichText",
      description: "One or two sentences under the heading.",
    }),
    defineField({
      name: "buttons",
      type: "array",
      description: "Up to two buttons. The first is the main action.",
      of: [defineArrayMember({ type: "button" })],
      validation: (rule) => rule.max(2),
    }),
    photoField({
      required: true,
      description: "Shown round, inside the brand ring. Use the hotspot to keep faces in the circle.",
    }),
    defineField({
      name: "filmButton",
      title: "Film Button",
      type: "object",
      description:
        "The round play button on the photo opens the camp film. The label is the handwritten note beside it. Leave the URL empty to hide both.",
      fields: [
        defineField({
          name: "label",
          title: "Label",
          type: "string",
          description: 'Handwritten note, e.g. "watch a week at camp".',
        }),
        defineField({
          name: "url",
          title: "Film URL",
          type: "url",
          description: "YouTube link to the film.",
          validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
        }),
      ],
    }),
    defineField({
      name: "stats",
      title: "Facts",
      type: "array",
      description: "Two short facts under the buttons. Each has a bold value and a label.",
      of: [homeHeroStat],
      validation: (rule) => rule.max(3),
    }),
  ],
  preview: {
    select: { media: "image", status: "status" },
    prepare: ({ media, status }) => ({
      title: "Home Hero",
      subtitle: status || "Home Hero",
      media,
    }),
  },
});
