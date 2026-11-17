import { GalleryHorizontalEnd } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBackgroundField } from "./shared/section-background";

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

export default defineType({
  name: "quoteTrack",
  title: "Quote track",
  type: "object",
  icon: GalleryHorizontalEnd,
  description:
    "Quote cards in two rows that run past the page edges and drag sideways. Use it only for more than twelve testimonials in one section; for fewer, use the Quote wall.",
  fields: [
    sectionBackgroundField,
    defineField({
      name: "hint",
      type: "string",
      description: 'The handwritten hint beside the heading, e.g. "drag for more stories".',
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "minimalRichText",
      description: "Use italic for the phrase that gets the handwritten style.",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      description:
        "The quotes to show, in this order.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "testimonial" }],
        }),
      ],
      validation: (rule) => [
        rule.required().min(1).error("Add at least one testimonial to this section."),
        rule.unique().error("Each testimonial can be listed only once in this section."),
      ],
    }),
  ],
  preview: {
    select: { heading: "heading", testimonials: "testimonials" },
    prepare: ({ heading, testimonials }) => {
      const count = Array.isArray(testimonials) ? testimonials.length : 0;
      return {
        title: richTextToPlainText(heading) || "Quote track",
        subtitle: `Quote track · ${count} ${count === 1 ? "quote" : "quotes"}`,
      };
    },
  },
});
