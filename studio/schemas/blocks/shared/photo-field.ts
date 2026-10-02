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
      }),
      ...extraFields,
    ],
    // The alt text is checked here, not on its own field: Sanity validates
    // hidden fields too, and a photo hidden by another layout must not block
    // publishing.
    validation: (rule) =>
      rule.custom((value, context) => {
        const photo = value as { alt?: string; asset?: unknown } | undefined;
        const needed = required || (requiredWhen?.(context.parent) ?? false);
        if (needed && !photo?.asset) return "Add a photo";
        const shown = showWhen?.(context.parent) ?? true;
        return shown && photo?.asset && !photo.alt?.trim()
          ? "Describe the image for visitors who cannot see it"
          : true;
      }),
  });
}
