import { PanelRight } from "lucide-react";
import { defineType } from "sanity";
import { storyClosingBlocksField } from "../blocks/page-builder";
import { blogPostSidebarFields } from "../blocks/shared/blog-post-sidebar";

export default defineType({
  name: "blogPostSettings",
  title: "Blog Post Settings",
  type: "document",
  icon: PanelRight,
  description:
    "Shared content on every story page: the sidebar and the closing sections.",
  fields: [...blogPostSidebarFields, storyClosingBlocksField],
  preview: {
    prepare: () => ({ title: "Blog Post Settings" }),
  },
});
