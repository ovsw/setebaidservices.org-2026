import { GalleryHorizontal } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { photoField } from "./shared/photo-field";
import { sectionBackgroundField } from "./shared/section-background";

export default defineType({
  name: "photoStrip",
  title: "Photo Strip",
  type: "object",
  icon: GalleryHorizontal,
  description:
    "A full-width row of five photos in staggered heights, with a handwritten caption and a link below.",
  fields: [
    sectionBackgroundField,
    defineField({
      name: "images",
      title: "Photos",
      type: "array",
      description: "Five photos read best. Phones show the first three.",
      of: [defineArrayMember({ ...photoField({}) })],
      validation: (rule) => rule.required().min(3).max(5),
    }),
    defineField({
      name: "caption",
      type: "string",
      description: "The handwritten caption under the photos.",
    }),
    defineField({
      name: "link",
      type: "button",
      description: "Optional text link at the right, e.g. the photo galleries.",
    }),
  ],
  preview: {
    select: { caption: "caption", media: "images.0" },
    prepare: ({ caption, media }) => ({
      title: caption || "Photo Strip",
      subtitle: "Photo Strip",
      media,
    }),
  },
});
