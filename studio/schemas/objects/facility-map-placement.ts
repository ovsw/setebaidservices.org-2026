import { LocateFixed } from "lucide-react";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "facilityMapPlacement",
  title: "Facility Placement",
  type: "object",
  icon: LocateFixed,
  fields: [
    defineField({
      name: "facility",
      type: "reference",
      to: [{ type: "facility" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "x",
      title: "Horizontal Position",
      type: "number",
      description: "Percentage from the left edge of the map.",
      validation: (rule) => rule.required().min(0).max(100),
    }),
    defineField({
      name: "y",
      title: "Vertical Position",
      type: "number",
      description: "Percentage from the top edge of the map.",
      validation: (rule) => rule.required().min(0).max(100),
    }),
    defineField({
      name: "labelPosition",
      title: "Label Position",
      type: "string",
      initialValue: "auto",
      options: {
        layout: "radio",
        list: [
          { title: "Automatic", value: "auto" },
          { title: "Above", value: "above" },
          { title: "Below", value: "below" },
          { title: "Left", value: "left" },
          { title: "Right", value: "right" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "prominent",
      title: "Prominent Marker",
      type: "boolean",
      description: "Give this Facility a larger marker on the map.",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "facility.name",
      x: "x",
      y: "y",
    },
    prepare: ({ title, x, y }) => ({
      title: title || "Choose a Facility",
      subtitle:
        typeof x === "number" && typeof y === "number"
          ? `${x.toFixed(1)}% × ${y.toFixed(1)}%`
          : "Position not set",
    }),
  },
});
