import { defineField, defineType } from "sanity";
import { BookA } from "lucide-react";
import meta from "../blocks/shared/meta";
import { hiddenField, withHiddenMarker } from "../blocks/shared/hidden";
import { uniqueCategorySlug } from "../validation/unique-category-slug";
import { categoryPath } from "../../../shared/content-routes.ts";

export default defineType({
  name: "category",
  title: "Category",
  type: "document",
  icon: BookA,
  groups: [
    { name: "content", title: "Content" },
    { name: "seo", title: "SEO" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      validation: (Rule) => Rule.required().custom(uniqueCategorySlug),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      group: "content",
    }),
    meta,
    hiddenField,
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
      hidden: "hidden",
    },
    prepare: ({ slug, title, hidden }) => ({
      title: title || "Untitled Category",
      subtitle: withHiddenMarker(categoryPath(slug) ?? "No slug", hidden),
    }),
  },
});
