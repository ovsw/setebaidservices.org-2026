import { Strikethrough } from "lucide-react";
import { defineField, defineType } from "sanity";
import { sectionBackgroundField } from "./shared/section-background";

export default defineType({
  name: "wordSwap",
  title: "Word Swap",
  type: "object",
  icon: Strikethrough,
  description:
    "A large crossed-out word above the word that replaces it, beside a short paragraph. Made for the story of the Setebaid name.",
  fields: [
    { ...sectionBackgroundField, initialValue: "green" },
    defineField({
      name: "struckWord",
      title: "Crossed-out word",
      type: "string",
      description: 'Shown crossed out, e.g. "diabetes".',
    }),
    defineField({
      name: "word",
      title: "Replacement word",
      type: "string",
      description: 'Shown below the crossed-out word, e.g. "setebaid".',
    }),
    defineField({
      name: "body",
      type: "simpleRichText",
      description: "The short story beside the words. Bold steps up to the headline colour.",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { struckWord: "struckWord", word: "word" },
    prepare: ({ struckWord, word }) => ({
      title: [struckWord, word].filter(Boolean).join(" → ") || "Untitled Word Swap",
      subtitle: "Word Swap",
    }),
  },
});
