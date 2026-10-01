import { CircleDot } from "lucide-react";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "activity",
  title: "Activity",
  type: "document",
  icon: CircleDot,
  description:
    "A daily choice that campers can add to their schedule. The photo, camper line, and program link feed the Activity Catalogue cards.",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      description:
        "Shown on the catalogue card. Cards without a photo show a marked placeholder.",
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "line",
      title: "Camper line",
      type: "string",
      description:
        'One line to the camper, in second person. E.g. "Hold tight, swing wide, let go."',
      validation: (rule) => rule.max(140).warning("Keep it to one line."),
    }),
    defineField({
      name: "program",
      title: "Specialty program page",
      type: "reference",
      to: [{ type: "page" }],
      description:
        "Optional. Links the card to the specialty program that runs this activity for half the day.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "line", media: "image" },
    prepare: ({ media, subtitle, title }) => ({
      title: title || "Untitled Activity",
      subtitle,
      media,
    }),
  },
});
