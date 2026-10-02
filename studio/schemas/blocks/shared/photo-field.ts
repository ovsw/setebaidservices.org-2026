import { defineField, type FieldDefinition } from "sanity";

/**
 * A photo with a hotspot and its own alt text. The alt text belongs to this
 * use of the photo, not to the asset: the same photo means different things in
 * different places.
 *
 * `showWhen` hides the field unless the parent section matches; `requiredWhen`
 * makes the photo required only for that parent (for example one layout).
 */
export function photoField({
  description,
  extraFields = [],
  name = "image",
  required = false,
  requiredWhen,
  showWhen,
  title = "Photo",
}: {
  description?: string;
  extraFields?: FieldDefinition[];
  name?: string;
  required?: boolean;
  requiredWhen?: (parent: unknown) => boolean;
  showWhen?: (parent: unknown) => boolean;
  title?: string;
}) {
  return defineField({
    name,
    title,
    type: "image",
    description,
    options: { hotspot: true },
    hidden: showWhen ? ({ parent }) => !showWhen(parent) : undefined,
    fields: [
      defineField({
        name: "alt",
        title: "Alternative Text",
        type: "string",
        validation: (rule) =>
          rule.custom((value, context) => {
            const parent = context.parent as { asset?: unknown } | undefined;
            return parent?.asset && !value
              ? "Describe the image for visitors who cannot see it"
              : true;
          }),
      }),
      ...extraFields,
    ],
    validation: (rule) =>
      rule.custom((value, context) => {
        const needed = required || (requiredWhen?.(context.parent) ?? false);
        return needed && !(value as { asset?: unknown } | undefined)?.asset
          ? "Add a photo"
          : true;
      }),
  });
}
