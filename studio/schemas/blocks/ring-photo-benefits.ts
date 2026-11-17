import { CircleUser } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { photoField } from "./shared/photo-field";
import { sectionBackgroundField } from "./shared/section-background";

const ringPhotoPoint = defineArrayMember({
  name: "ringPhotoPoint",
  title: "Point",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: "The short heading of this point.",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "simpleRichText",
      description: "A short explanation. Paragraphs support bold, italic, and links.",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({ title: title || "Untitled Point", subtitle: "Point" }),
  },
});

export default defineType({
  name: "ringPhotoBenefits",
  title: "Benefits with round photo",
  type: "object",
  icon: CircleUser,
  description:
    "A round photo in the brand ring with a handwritten caption, beside the heading and short points under coloured rules.",
  fields: [
    sectionBackgroundField,
    photoField({ required: true }),
    defineField({
      name: "caption",
      type: "string",
      description: "The handwritten caption under the photo.",
    }),
    defineField({
      name: "title",
      title: "Heading",
      type: "minimalRichText",
      description: "Use italic for the phrase that gets the handwritten style.",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "points",
      type: "array",
      description: "Add up to 6 short points. They are shown in the order listed here.",
      of: [ringPhotoPoint],
      validation: (rule) => rule.required().min(1).max(6),
    }),
    defineField({
      name: "link",
      type: "button",
      description: "Optional text link under the points.",
    }),
  ],
  preview: {
    select: { media: "image", points: "points" },
    prepare: ({ media, points }) => {
      const count = Array.isArray(points) ? points.length : 0;
      return {
        title: "Benefits with round photo",
        subtitle: `${count} ${count === 1 ? "point" : "points"}`,
        media,
      };
    },
  },
});
