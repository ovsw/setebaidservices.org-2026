import { defineType } from "sanity";

export const BUTTON_VARIANTS = [
  { title: "Primary (green)", value: "default" },
  { title: "Highlight (marigold, for giving)", value: "highlight" },
  { title: "Outline", value: "outline" },
  { title: "Secondary (outline)", value: "secondary" },
  { title: "Ghost", value: "ghost" },
  { title: "Link", value: "link" },
  { title: "Destructive", value: "destructive" },
];

export const buttonVariant = defineType({
  name: "button-variant",
  title: "Button Variant",
  type: "string",
  options: {
    list: BUTTON_VARIANTS.map(({ title, value }) => ({ title, value })),
    layout: "radio",
  },
  initialValue: "default",
});
