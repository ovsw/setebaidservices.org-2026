import { BadgeDollarSign } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { sectionBackgroundField } from "./shared/section-background";

const defaultHeading = [
  {
    _key: "dates-rates-heading",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "dates-rates-heading-main",
        _type: "span",
        text: "Dates & rates, ",
        marks: [],
      },
      {
        _key: "dates-rates-heading-accent",
        _type: "span",
        text: "at a glance.",
        marks: ["em"],
      },
    ],
  },
];

const defaultIntroduction = [
  {
    _key: "dates-rates-intro",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "dates-rates-intro-main",
        _type: "span",
        text: "Every session includes the cabin, meals, and all 35 activities. Deposit and balance deadlines are confirmed during enrollment.",
        marks: [],
      },
    ],
  },
];

export default defineType({
  name: "datesRatesSection",
  title: "Dates and Rates",
  type: "object",
  icon: BadgeDollarSign,
  description:
    "Shows the Active Season's dates, Rates, and Availability status.",
  initialValue: {
    eyebrow: "07 · DATES & RATES",
    heading: defaultHeading,
    introduction: defaultIntroduction,
    detailsLinkText: "Full dates & rates",
    sessionIncludes: [
      { _key: "include-cabin", _type: "includeItem", label: "Cabin on the island" },
      { _key: "include-meals", _type: "includeItem", label: "All meals & snacks" },
      { _key: "include-activities", _type: "includeItem", label: "All 35 activities" },
      { _key: "include-instruction", _type: "includeItem", label: "Expert instruction" },
      { _key: "include-gear", _type: "includeItem", label: "Top-of-the-line gear" },
    ],
    conditions: [
      {
        "_key": "dates-rates-condition-siblings",
        "_type": "block",
        "style": "savings",
        "markDefs": [],
        "children": [
          {
            "_key": "siblings-label",
            "_type": "span",
            "text": "Sibling savings. ",
            "marks": [
              "strong"
            ]
          },
          {
            "_key": "siblings-text",
            "_type": "span",
            "text": "5% off the second camper and 10% off the third, applied automatically.",
            "marks": []
          }
        ]
      },
      {
        "_key": "dates-rates-condition-deposits",
        "_type": "block",
        "style": "payment",
        "markDefs": [],
        "children": [
          {
            "_key": "deposits-label",
            "_type": "span",
            "text": "Deposit & balance. ",
            "marks": [
              "strong"
            ]
          },
          {
            "_key": "deposits-text",
            "_type": "span",
            "text": "Refund and balance deadlines are confirmed during enrollment.",
            "marks": []
          }
        ]
      },
      {
        "_key": "dates-rates-condition-extras",
        "_type": "block",
        "style": "transport",
        "markDefs": [],
        "children": [
          {
            "_key": "extras-label",
            "_type": "span",
            "text": "Transport & taxes \u2014 extra. ",
            "marks": [
              "strong"
            ]
          },
          {
            "_key": "extras-text",
            "_type": "span",
            "text": "Transportation to and from camp and applicable government taxes are in addition to the session rate.",
            "marks": []
          }
        ]
      },
      {
        "_key": "dates-rates-condition-tuck-shop",
        "_type": "block",
        "style": "shop",
        "markDefs": [],
        "children": [
          {
            "_key": "tuck-shop-label",
            "_type": "span",
            "text": "Tuck shop \u2014 spending deposit. ",
            "marks": [
              "strong"
            ]
          },
          {
            "_key": "tuck-shop-text",
            "_type": "span",
            "text": "A $150 deposit is added per camper. Unused funds are fully refunded.",
            "marks": []
          }
        ]
      }
    ],
  },
  fields: [
    sectionBackgroundField,
    defineField({
      name: "eyebrow",
      type: "string",
      description:
        "Small label above the heading. Include the sequence number if you want one.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "minimalRichText",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "introduction",
      type: "minimalRichText",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "detailsLinkText",
      title: "Details Link Text",
      type: "string",
      description:
        "Optional. Links to the Dates & Rates page. Leave empty on the Dates & Rates page itself.",
    }),
    defineField({
      name: "secondaryLink",
      title: "Secondary Link",
      type: "object",
      description:
        'Optional quiet link beside the Enroll button, e.g. "Returning family? Log in" to the parent portal. Shown only when both fields are set.',
      fields: [
        defineField({
          name: "text",
          title: "Link Text",
          type: "string",
        }),
        defineField({
          name: "url",
          title: "Destination",
          type: "customUrl",
        }),
      ],
    }),
    defineField({
      name: "sessionIncludes",
      title: "Included in Your Rate",
      description: "Services covered by the session rate. Put discounts, deposits, and extra costs in the next field.",
      type: "array",
      of: [
        defineArrayMember({
          name: "includeItem",
          title: "Item",
          type: "object",
          fields: [
            defineField({
              name: "label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "label" },
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "conditions",
      title: "Discounts, Payments & Extras",
      description: "One item per paragraph. Choose its icon from the paragraph style menu and start with a short bold label. Separate savings, payment deadlines, and extra costs.",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Information icon", value: "normal" },
            { title: "Sibling savings icon", value: "savings" },
            { title: "Payment icon", value: "payment" },
            { title: "Transport icon", value: "transport" },
            { title: "Tuck shop icon", value: "shop" },
            { title: "Tax icon", value: "tax" },
            { title: "Waitlist icon", value: "waitlist" },
          ],
          lists: [],
          marks: {
            annotations: [],
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    prepare: () => ({
      title: "Dates and Rates",
      subtitle: "Uses the Active Season",
    }),
  },
});
