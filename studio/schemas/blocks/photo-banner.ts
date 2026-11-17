import { ImageIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { ctaButtonsField, ctaDescriptionField, ctaTitleField } from "./shared/cta-fields";
import { photoField } from "./shared/photo-field";

/** Fills itself with a dark photo, so it has no background choice. */
export default defineType({
  name: "photoBanner",
  title: "Photo band",
  type: "object",
  icon: ImageIcon,
  description:
    "A full-width photo with the heading, a supporting line and up to two actions on a dark fade.",
  fields: [
    photoField({
      description:
        "Fills the band; the text sits on the lower part, so keep faces in the upper half.",
      required: true,
    }),
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Short uppercase label above the heading.",
    }),
    ctaTitleField,
    ctaDescriptionField,
    ctaButtonsField,
  ],
  preview: {
    select: { title: "title", media: "image" },
    prepare: ({ title, media }) => ({
      title: title || "Untitled Photo band",
      subtitle: "Photo band",
      media,
    }),
  },
});
