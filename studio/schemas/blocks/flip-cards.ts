import { RefreshCcw } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBackgroundField } from "./shared/section-background";

const flipCard = defineArrayMember({
  name: "flipCard",
  title: "Card",
  type: "object",
  fields: [
    defineField({
      name: "front",
      title: "Front",
      type: "string",
      description: "The problem, set large on the front of the card.",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "back",
      title: "Back",
      type: "text",
      rows: 3,
      description: "How camp turns it around, shown when the card flips.",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "emoji",
      title: "Emoji",
      type: "string",
      description: "One emoji at the foot of the back side.",
      validation: (rule) => rule.max(4),
    }),
  ],
  preview: {
    select: { title: "front", subtitle: "back" },
  },
});

export default defineType({
  name: "flipCards",
  title: "Flip Cards",
  type: "object",
  icon: RefreshCcw,
  description:
    "A row of cards that turn over on tap: a problem on the front, the answer on the back. The colours rotate green-ink, camp green, marigold and lake.",
  fields: [
    sectionBackgroundField,
    defineField({
      name: "intro",
      type: "simpleRichText",
      description: "One sentence above the cards. Bold steps up to the headline colour.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "frontLabel",
      title: "Front label",
      type: "string",
      initialValue: "Diabetes",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "backLabel",
      title: "Back label",
      type: "string",
      initialValue: "Setebaid",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "turnLabel",
      title: "Turn hint",
      type: "string",
      description: "The handwritten hint at the foot of each front side.",
      initialValue: "turn it around",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cards",
      type: "array",
      of: [flipCard],
      validation: (rule) => rule.required().min(2).max(4),
    }),
  ],
  preview: {
    select: { cards: "cards" },
    prepare: ({ cards }) => ({
      title: "Flip Cards",
      subtitle: `${Array.isArray(cards) ? cards.length : 0} cards`,
    }),
  },
});
