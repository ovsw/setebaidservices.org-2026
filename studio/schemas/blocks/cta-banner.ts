import { Megaphone } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { photoField } from "./shared/photo-field";
import { sectionBackgroundField } from "./shared/section-background";

const isPhoto = (parent: unknown) =>
  (parent as { variant?: string } | undefined)?.variant === "photo";

export default defineType({
  name: "ctaBanner",
  title: "Call to Action",
  type: "object",
  icon: Megaphone,
  description:
    "A clear invitation with a heading, supporting line, and up to two actions. Closing bands end a page; nudges sit quietly between sections.",
  fields: [
    sectionBackgroundField,
    defineField({
      name: "variant",
      title: "Weight",
      type: "string",
      description:
        "Closing: the full-width band that ends a page. Nudge: a quiet in-page prompt between sections. Photo band: a full-width photo with the text on a dark fade.",
      initialValue: "closing",
      options: {
        layout: "radio",
        list: [
          { title: "Closing band", value: "closing" },
          { title: "In-page nudge", value: "nudge" },
          { title: "Photo band", value: "photo" },
        ],
      },
    }),
    photoField({
      description:
        "Photo band only. Fills the band; the text sits on the lower part, so keep faces in the upper half.",
      requiredWhen: isPhoto,
      showWhen: isPhoto,
    }),
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Photo band only. Short uppercase label above the heading.",
      hidden: ({ parent }) => !isPhoto(parent),
    }),
    defineField({
      name: "title",
      type: "string",
      description: "The question or statement that prompts visitors to act.",
    }),
    defineField({
      name: "description",
      type: "string",
      description: "Optional supporting sentence shown under the heading",
    }),
    defineField({
      name: "buttons",
      type: "array",
      description:
        "One or two actions. The first is the main action; the second is secondary.",
      of: [defineArrayMember({ type: "button" })],
      validation: (rule) => rule.required().min(1).max(2),
    }),
  ],
  preview: {
    select: { title: "title", variant: "variant" },
    prepare: ({ title, variant }) => ({
      title: title || "Untitled Call to Action",
      subtitle:
        variant === "nudge"
          ? "Call to Action · nudge"
          : variant === "photo"
            ? "Call to Action · photo band"
            : "Call to Action · closing band",
    }),
  },
});
