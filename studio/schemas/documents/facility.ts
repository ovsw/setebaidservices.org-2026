import { MapPin } from "lucide-react";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "facility",
  title: "Facility",
  type: "document",
  icon: MapPin,
  description: "A reusable place shown on the Facilities Map.",
  fields: [
    defineField({
      name: "name",
      type: "string",
      description: "The public name and map label.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "description",
      media: "featuredImage",
    },
    prepare: ({ media, subtitle, title }) => ({
      title: title || "Untitled Facility",
      subtitle,
      media,
    }),
  },
});
