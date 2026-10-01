import { MapPinned } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

const isBigTopHidden = (parent: unknown) =>
  typeof parent === "object" &&
  parent !== null &&
  "showBigTop" in parent &&
  parent.showBigTop === false;

const defaultHeading = [
  {
    _key: "facilities-heading",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "facilities-heading-main",
        _type: "span",
        text: "State of the art,\n",
        marks: [],
      },
      {
        _key: "facilities-heading-accent",
        _type: "span",
        text: "on Adventure Island.",
        marks: ["em"],
      },
    ],
  },
];

const defaultBigTopBody = [
  {
    _key: "big-top-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "big-top-body-open",
        _type: "span",
        text: "Our open-sided ",
        marks: [],
      },
      {
        _key: "big-top-body-programs",
        _type: "span",
        text: "Gymnastics, Aerials and Trampoline Centre",
        marks: ["strong"],
      },
      {
        _key: "big-top-body-middle",
        _type: "span",
        text: " anchors the very centre of camp. Fully ",
        marks: [],
      },
      {
        _key: "big-top-body-upgrade",
        _type: "span",
        text: "upgraded in 2019",
        marks: ["strong"],
      },
      {
        _key: "big-top-body-close",
        _type: "span",
        text: ", it's the first place campers visit when they arrive on the island, and the last place they want to leave.",
        marks: [],
      },
    ],
  },
];

const defaultMapHeading = [
  {
    _key: "facilities-map-heading",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "facilities-map-heading-main",
        _type: "span",
        text: "Everything else is ",
        marks: [],
      },
      {
        _key: "facilities-map-heading-accent",
        _type: "span",
        text: "a wander away.",
        marks: ["em"],
      },
    ],
  },
];

export default defineType({
  name: "facilitiesMapSection",
  title: "Facilities Map",
  type: "object",
  icon: MapPinned,
  description:
    "The canonical Facilities Map with an optional Big Top feature.",
  initialValue: {
    eyebrow: "03 · THE FACILITIES",
    heading: defaultHeading,
    introduction:
      "World-class training facilities don't usually come with a lake view. Ours do, and everything is a short woodchip path from everything else.",
    showBigTop: true,
    bigTopHeading: "The Big Top",
    bigTopArea: 9000,
    bigTopUnit: "sqft",
    bigTopTagline: "under one open-sided canopy",
    bigTopBody: defaultBigTopBody,
    bigTopGallery: [
      {
        _key: "big-top-aerials",
        _type: "image",
        asset: {
          _type: "reference",
          _ref: "image-646c22c68a934c70840abd41d5797c2740e31f22-1656x950-png",
        },
        alt: "Aerialists practicing inside the Big Top",
        caption: "INSIDE THE BIG TOP · AERIALS",
      },
      {
        _key: "big-top-training-floor",
        _type: "image",
        asset: {
          _type: "reference",
          _ref: "image-96cd4851a7648f704d1b5e7222056b5f3c61d0a4-800x800-avif",
        },
        alt: "Gymnastics training floor inside the Big Top",
        caption: "THE TRAINING FLOOR · GYMNASTICS",
      },
      {
        _key: "big-top-tumbling",
        _type: "image",
        asset: {
          _type: "reference",
          _ref: "image-14a658794b7aaf86dd1f0fcbd13c7085a827c35d-800x800-avif",
        },
        alt: "Tumbling and spring floor inside the Big Top",
        caption: "TUMBLING & SPRING FLOOR",
      },
    ],
    mapHeading: defaultMapHeading,
    mapLocationLabel: "ADVENTURE ISLAND · LAKE TEMAGAMI",
    stopLabel: "STOP",
    bigTopGalleryAutoplay: true,
  },
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heading",
      type: "minimalRichText",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "introduction",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "showBigTop",
      title: "Show Big Top Feature",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "bigTopHeading",
      title: "Big Top Heading",
      type: "string",
      hidden: ({ parent }) => parent?.showBigTop === false,
      validation: (rule) =>
        rule.custom((value, { parent }) =>
          isBigTopHidden(parent) || value?.trim()
            ? true
            : "Required when the Big Top feature is shown",
        ),
    }),
    defineField({
      name: "bigTopArea",
      title: "Big Top Area",
      type: "number",
      hidden: ({ parent }) => parent?.showBigTop === false,
      validation: (rule) =>
        rule.custom((value, { parent }) =>
          isBigTopHidden(parent) ||
          (typeof value === "number" && value > 0 && Number.isInteger(value))
            ? true
            : "Enter a positive whole number when the Big Top feature is shown",
        ),
    }),
    defineField({
      name: "bigTopUnit",
      title: "Big Top Area Unit",
      type: "string",
      hidden: ({ parent }) => parent?.showBigTop === false,
      validation: (rule) =>
        rule.custom((value, { parent }) =>
          isBigTopHidden(parent) || value?.trim()
            ? true
            : "Required when the Big Top feature is shown",
        ),
    }),
    defineField({
      name: "bigTopTagline",
      title: "Big Top Area Tagline",
      type: "string",
      hidden: ({ parent }) => parent?.showBigTop === false,
      validation: (rule) =>
        rule.custom((value, { parent }) =>
          isBigTopHidden(parent) || value?.trim()
            ? true
            : "Required when the Big Top feature is shown",
        ),
    }),
    defineField({
      name: "bigTopBody",
      title: "Big Top Description",
      type: "simpleRichText",
      hidden: ({ parent }) => parent?.showBigTop === false,
      validation: (rule) =>
        rule.custom((value, { parent }) =>
          isBigTopHidden(parent) || (Array.isArray(value) && value.length > 0)
            ? true
            : "Required when the Big Top feature is shown",
        ),
    }),
    defineField({
      name: "bigTopGallery",
      title: "Big Top Gallery",
      type: "array",
      hidden: ({ parent }) => parent?.showBigTop === false,
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "caption",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "alt",
              title: "Alternative Text",
              type: "string",
            }),
          ],
        }),
      ],
      validation: (rule) => rule.max(8),
    }),
    defineField({
      name: "bigTopGalleryAutoplay",
      title: "Big Top Gallery Autoplay",
      type: "boolean",
      hidden: ({ parent }) => parent?.showBigTop === false,
      initialValue: true,
    }),
    defineField({
      name: "mapHeading",
      type: "minimalRichText",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "mapLocationLabel",
      title: "Map Location Label",
      type: "string",
      initialValue: "ADVENTURE ISLAND · LAKE TEMAGAMI",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "stopLabel",
      title: "Tour Stop Label",
      type: "string",
      initialValue: "STOP",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { eyebrow: "eyebrow", showBigTop: "showBigTop" },
    prepare: ({ eyebrow, showBigTop }) => ({
      title: eyebrow || "Facilities Map",
      subtitle: showBigTop === false ? "Map only" : "Big Top and map",
    }),
  },
});
