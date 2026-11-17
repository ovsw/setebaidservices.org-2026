import { MessageCircle } from "lucide-react";
import { defineType } from "sanity";
import { ctaButtonsField, ctaDescriptionField, ctaTitleField } from "./shared/cta-fields";
import { sectionBackgroundField } from "./shared/section-background";

export default defineType({
  name: "nudgeBanner",
  title: "In-page nudge",
  type: "object",
  icon: MessageCircle,
  description:
    "A quiet card between sections for “not sure yet?” moments: a heading, a supporting line and up to two actions.",
  fields: [sectionBackgroundField, ctaTitleField, ctaDescriptionField, ctaButtonsField],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({
      title: title || "Untitled In-page nudge",
      subtitle: "In-page nudge",
    }),
  },
});
