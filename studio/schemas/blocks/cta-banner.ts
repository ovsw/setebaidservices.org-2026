import { Megaphone } from "lucide-react";
import { defineType } from "sanity";
import { ctaButtonsField, ctaDescriptionField, ctaTitleField } from "./shared/cta-fields";
import { sectionBackgroundField } from "./shared/section-background";

export default defineType({
  name: "ctaBanner",
  title: "Call to Action",
  type: "object",
  icon: Megaphone,
  description:
    "The full-width closing band that ends a page: a heading, a supporting line and up to two actions.",
  fields: [sectionBackgroundField, ctaTitleField, ctaDescriptionField, ctaButtonsField],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({
      title: title || "Untitled Call to Action",
      subtitle: "Call to Action · closing band",
    }),
  },
});
