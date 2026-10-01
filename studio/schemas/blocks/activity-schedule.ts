import { CalendarDays } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBackgroundField } from "./shared/section-background";

const defaultCamperNames = ["Maya", "Leo", "Sadie", "Finn", "Ava", "Theo"];

/** Flatten a minimalRichText value into plain text for the Studio preview. */
const richTextToPlainText = (value: unknown): string => {
  if (!Array.isArray(value)) return "";
  return value
    .map((block) => {
      const children = (block as { children?: { text?: string }[] })?.children;
      if (!Array.isArray(children)) return "";
      return children.map((child) => child?.text ?? "").join("");
    })
    .join(" ")
    .trim();
};

export default defineType({
  name: "activitySchedule",
  title: "Activity Schedule",
  type: "object",
  icon: CalendarDays,
  description:
    "An interactive sample day built from selected Activity documents.",
  initialValue: {
    heading: [
      {
        _type: "block",
        style: "normal",
        markDefs: [],
        children: [
          { _type: "span", text: "activities. ", marks: [] },
          { _type: "span", text: "Their pick, every day.", marks: ["em"] },
        ],
      },
    ],
    description:
      "No fixed timetable. Each day, campers choose their own adventure from the activity menu, so a shy first-timer and a returning thrill-seeker both get exactly the summer they want.",
    camperNames: defaultCamperNames,
  },
  fields: [
    sectionBackgroundField,
    defineField({
      name: "heading",
      title: "Heading",
      type: "minimalRichText",
      description:
        "Sits beside the big activity count. Use italic for the phrase that gets the handwritten style; it drops to its own line.",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "camperNames",
      title: "Camper Names",
      type: "array",
      description:
        "Sample names shown on the schedule. New sections start with six names that editors can replace.",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: "featuredActivities",
      title: "Featured Activities",
      type: "array",
      description:
        "Choose 10 to 18 Activities. Their order controls the order of the activity buttons.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "activity" }],
        }),
      ],
      validation: (rule) => rule.required().min(10).max(18).unique(),
    }),
  ],
  preview: {
    select: { heading: "heading", activities: "featuredActivities" },
    prepare: ({ activities, heading }) => {
      const count = Array.isArray(activities) ? activities.length : 0;
      return {
        title: richTextToPlainText(heading) || "Activity Schedule",
        subtitle: `${count} featured ${count === 1 ? "Activity" : "Activities"}`,
      };
    },
  },
});
