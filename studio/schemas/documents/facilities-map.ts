import { MapPinned } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import FacilityMapPlacementsInput from "../inputs/facility-map-placements-input";

type PlacementValue = {
  facility?: { _ref?: string };
};

export default defineType({
  name: "facilitiesMap",
  title: "Facilities Map",
  type: "document",
  icon: MapPinned,
  description:
    "The canonical map and ordered Facility tour used by every Facilities Map section.",
  fields: [
    defineField({
      name: "title",
      type: "string",
      initialValue: "Facilities Map",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "mapImage",
      title: "Map Image",
      type: "image",
      options: { hotspot: true },
      description:
        "Changing the image or its crop moves the visible geography, so markers may need repositioning afterwards.",
      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "websiteAutoplay",
      title: "Website Auto Progression",
      type: "boolean",
      description:
        "Move through Facilities automatically on the Website. Studio previews remain paused until Play is pressed.",
      initialValue: true,
    }),
    defineField({
      name: "placements",
      title: "Facility Placements",
      type: "array",
      description:
        "Drag markers on the map and reorder this list to set the public tour order.",
      components: { input: FacilityMapPlacementsInput },
      of: [defineArrayMember({ type: "facilityMapPlacement" })],
      validation: (rule) =>
        rule
          .required()
          .min(2)
          .custom((placements: PlacementValue[] | undefined) => {
            const references = (placements ?? []).flatMap((placement) =>
              placement.facility?._ref ? [placement.facility._ref] : [],
            );
            return new Set(references).size === references.length
              ? true
              : "Add each Facility only once";
          }),
    }),
  ],
  preview: {
    select: { title: "title", placements: "placements" },
    prepare: ({ placements, title }) => {
      const count = Array.isArray(placements) ? placements.length : 0;
      return {
        title: title || "Facilities Map",
        subtitle: `${count} ${count === 1 ? "Facility" : "Facilities"}`,
      };
    },
  },
});
