import { LayoutDashboard } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { photoField } from "./shared/photo-field";
import { sectionBackgroundField } from "./shared/section-background";

const captionField = defineField({
  name: "caption",
  type: "string",
  description: "Short handwritten caption on the photo.",
});

export default defineType({
  name: "bentoCollage",
  title: "Bento collage",
  type: "object",
  icon: LayoutDashboard,
  description:
    "A text card with up to two buttons beside three captioned photos in a grid.",
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
        "The main heading. Use italic for the phrase that gets the handwritten style.",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "body",
      title: "Supporting Message",
      type: "text",
      rows: 5,
      description: "One paragraph shown below the heading.",
    }),
    defineField({
      name: "buttons",
      type: "array",
      description: "Up to two buttons in the text card. The first is the main action.",
      of: [defineArrayMember({ type: "button" })],
      validation: (rule) => rule.max(2),
    }),
    photoField({
      name: "primaryImage",
      title: "Large Photo",
      description: "Takes the whole right half of the grid.",
      extraFields: [captionField],
      required: true,
    }),
    photoField({
      name: "secondaryImage",
      title: "First Small Photo",
      description: "The first small photo under the text card.",
      extraFields: [captionField],
      required: true,
    }),
    photoField({
      name: "tertiaryImage",
      title: "Second Small Photo",
      description: "The second small photo under the text card.",
      extraFields: [captionField],
      required: true,
    }),
  ],
  preview: {
    select: { eyebrow: "eyebrow", media: "primaryImage" },
    prepare: ({ eyebrow, media }) => ({
      title: eyebrow || "Bento collage",
      subtitle: "Bento collage",
      media,
    }),
  },
});
