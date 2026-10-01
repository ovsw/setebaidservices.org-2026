import { ImageIcon } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBackgroundField } from "./shared/section-background";

export default defineType({
  name: "directorCta",
  title: "Director CTA",
  type: "object",
  icon: ImageIcon,
  description:
    "A closing invitation to speak with the camp directors, with their portrait beside the copy.",
  fields: [
    sectionBackgroundField,
    defineField({
      name: "title",
      title: "Heading",
      type: "minimalRichText",
      description:
        "Use italic for the handwritten amber phrase in the heading.",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "description",
      title: "Supporting Message",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Director Portrait",
      type: "image",
      description:
        "A transparent, full-height portrait. Keep the transparent edges; this section does not crop the image.",
      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "buttons",
      title: "Actions",
      type: "array",
      description: "Up to two actions shown under the message.",
      of: [defineArrayMember({ type: "button" })],
      validation: (rule) => rule.required().min(1).max(2),
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title: previewTitle }) => ({
      title: previewTitle?.[0]?.children?.[0]?.text || "Untitled Director CTA",
      subtitle: "Director CTA",
    }),
  },
});
