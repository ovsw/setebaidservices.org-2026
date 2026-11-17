import { defineField, defineType } from "sanity";
import { requiredText } from "../../validation/required-text";

export default defineType({
  name: "button",
  title: "Button",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Button Text",
      type: "string",
      validation: (rule) => requiredText(rule, "Add the button text. A button without it is not shown."),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "customUrl",
      validation: (rule) =>
        rule.required().error("Add where the button goes. A button without it is not shown."),
    }),
  ],
  preview: {
    select: { title: "text", subtitle: "url.external" },
  },
});
