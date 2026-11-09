import { defineField, defineType } from "sanity";
import { hiddenLinkTargetWarning } from "../../validation/hidden-link-target";

export default defineType({
  name: "link",
  type: "object",
  title: "Link",
  fields: [
    defineField({
      name: "isExternal",
      type: "boolean",
      title: "Is External",
      initialValue: false,
    }),
    defineField({
      name: "internalLink",
      type: "reference",
      title: "Internal Link",
      to: [{ type: "homePage" }, { type: "page" }, { type: "post" }],
      hidden: ({ parent }) => parent?.isExternal,
      validation: (rule) =>
        hiddenLinkTargetWarning(
          rule,
          (context) => !(context.parent as { isExternal?: boolean } | undefined)?.isExternal,
        ),
    }),
    defineField({
      name: "title",
      type: "string",
    }),
    defineField({
      name: "href",
      title: "href",
      type: "url",
      hidden: ({ parent }) => !parent?.isExternal,
      validation: (Rule) =>
        Rule.uri({
          allowRelative: true,
          scheme: ["http", "https", "mailto", "tel"],
        }),
    }),
    defineField({
      name: "target",
      type: "boolean",
      title: "Open in new tab",
      initialValue: false,
      hidden: ({ parent }) => !parent?.isExternal,
    }),
  ],
});
