import { defineField, type FieldDefinition } from "sanity";

/**
 * A photo with a hotspot and its own alt text. The alt text belongs to this
 * use of the photo, not to the asset: the same photo means different things in
 * different places.
 */
export function photoField({
  description,
  extraFields = [],
  name = "image",
  required = false,
  title = "Photo",
}: {
  description?: string;
  extraFields?: FieldDefinition[];
  name?: string;
  required?: boolean;
  title?: string;
}) {
  return defineField({
    name,
    title,
    type: "image",
    description,
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        title: "Alternative Text",
        type: "string",
      }),
      ...extraFields,
    ],
    validation: (rule) =>
      rule.custom((value) => {
        const photo = value as { asset?: unknown } | undefined;
        return required && !photo?.asset ? "Add a photo" : true;
      }),
  });
}
