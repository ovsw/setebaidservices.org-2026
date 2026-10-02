import { Images } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { photoField } from "./shared/photo-field";
import { sectionBackgroundField } from "./shared/section-background";

const isBento = (parent: unknown) =>
  (parent as { layout?: string } | undefined)?.layout === "bento";

const captionField = defineField({
  name: "caption",
  type: "string",
  description: "Bento layout only. Short handwritten caption on the photo.",
});

const imageCollagePoint = defineArrayMember({
  name: "imageCollageFeaturePoint",
  title: "Point",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: "The short lead shown in bold.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      type: "text",
      rows: 3,
      description: "The explanation that follows the lead.",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "body" },
  },
});

const imageCollageCta = defineField({
  name: "cta",
  title: "Call to Action",
  type: "object",
  description: "Optional link shown after the supporting points.",
  fields: [
    defineField({
      name: "text",
      title: "Link Text",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "Destination",
      type: "customUrl",
      validation: (rule) => rule.required(),
    }),
  ],
});

export default defineType({
  name: "imageCollageFeature",
  title: "Image Collage Feature",
  type: "object",
  icon: Images,
  description:
    "A reusable story section with supporting points and two overlapping photos.",
  fields: [
    sectionBackgroundField,
    defineField({
      name: "layout",
      type: "string",
      description:
        "Collage: text and points beside two overlapping photos. Bento: a text card with buttons and three captioned photos in a grid.",
      initialValue: "collage",
      options: {
        layout: "radio",
        list: [
          { title: "Collage", value: "collage" },
          { title: "Bento", value: "bento" },
        ],
      },
    }),
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Optional short label shown above the heading.",
    }),
    defineField({
      name: "title",
      title: "Heading",
      type: "minimalRichText",
      description:
        "The main heading. Use italic for the phrase that gets the handwritten style.",
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: "body",
      title: "Supporting Message",
      type: "text",
      rows: 5,
      description: "One paragraph shown below the heading.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "points",
      title: "Supporting Points",
      type: "array",
      description: "Add points in the order visitors should read them.",
      of: [imageCollagePoint],
      hidden: ({ parent }) => isBento(parent),
      validation: (rule) =>
        rule.custom((points, context) =>
          isBento(context.parent) || (Array.isArray(points) && points.length > 0)
            ? true
            : "Add at least one point",
        ),
    }),
    defineField({
      name: "primaryImage",
      title: "Primary Image",
      type: "image",
      description:
        "The large background photo. Use the hotspot tool to preserve its focal point when cropped.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Describe the image for visitors who cannot see it.",
        }),
        captionField,
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "secondaryImage",
      title: "Secondary Image",
      type: "image",
      description:
        "The smaller overlapping photo. Use the hotspot tool to preserve its focal point when cropped.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          description: "Describe the image for visitors who cannot see it.",
        }),
        captionField,
      ],
      validation: (rule) => rule.required(),
    }),
    photoField({
      name: "tertiaryImage",
      title: "Third Image",
      description: "Bento layout only. The second small photo.",
      extraFields: [captionField],
      requiredWhen: isBento,
      showWhen: isBento,
    }),
    defineField({
      name: "buttons",
      type: "array",
      description: "Bento layout only. Up to two buttons in the text card. The first is the main action.",
      of: [defineArrayMember({ type: "button" })],
      hidden: ({ parent }) => !isBento(parent),
      validation: (rule) => rule.max(2),
    }),
    { ...imageCollageCta, hidden: ({ parent }: { parent?: unknown }) => isBento(parent) },
  ],
  preview: {
    select: { eyebrow: "eyebrow", media: "primaryImage" },
    prepare: ({ eyebrow, media }) => ({
      title: eyebrow || "Image Collage Feature",
      subtitle: "Image Collage Feature",
      media,
    }),
  },
});
