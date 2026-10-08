import { simpleRichTextComponents } from "@/components/simple-rich-text";
import { Button } from "@/components/ui/button";
import { getSafeLinkHref } from "@/lib/safe-href";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import {
  PortableText,
  type PortableTextComponents,
  type PortableTextProps,
} from "@portabletext/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

/*
 * Parts shared by the sections built from the home page prototype: the
 * headline with its coloured accent phrase, body copy, Sanity photos, button
 * rows and the arrow link. Each part reads the field tokens, so it is right
 * on Cream, Sand and Forest.
 */

export type DataAttribute = (path: string) => string | undefined;

export function hasText(value?: string | null) {
  return Boolean(stegaClean(value)?.trim());
}

/* ---- Headline ---- */

const headingComponents: PortableTextComponents = {
  block: { normal: ({ children }) => <>{children}</> },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    // The accent phrase keeps the headline's face and only changes colour.
    em: ({ children }) => (
      <em className="heading-emphasis text-emphasis">{children}</em>
    ),
  },
};

/** A minimalRichText headline. Italic marks the accent phrase. */
export function HeadingText({ value }: { value?: PortableTextProps["value"] | null }) {
  if (!Array.isArray(value) || !value.length) return null;
  return <PortableText components={headingComponents} value={value} />;
}

/* ---- Body ---- */

const bodyComponents: PortableTextComponents = {
  ...simpleRichTextComponents,
  marks: {
    ...simpleRichTextComponents?.marks,
    // A bold phrase steps up to the headline colour, as in the prototype.
    strong: ({ children }) => (
      <strong className="font-bold text-foreground">{children}</strong>
    ),
  },
};

/** A simpleRichText body. The wrapper spaces the paragraphs. */
export function BodyText({ value }: { value?: PortableTextProps["value"] | null }) {
  if (!Array.isArray(value) || !value.length) return null;
  return <PortableText components={bodyComponents} value={value} />;
}

/* ---- Photo ---- */

export type SectionImageSource = {
  alt?: string | null;
  asset?: {
    _id?: string | null;
    mimeType?: string | null;
    metadata?: { lqip?: string | null } | null;
  } | null;
  crop?: {
    bottom?: number | null;
    left?: number | null;
    right?: number | null;
    top?: number | null;
  } | null;
  hotspot?: { x?: number | null; y?: number | null } | null;
};

export function hasImage(
  image?: SectionImageSource | null,
): image is SectionImageSource & { asset: { _id: string } } {
  return Boolean(image?.asset?._id);
}

/** The editor's hotspot as a CSS object-position, inside the crop. */
export function hotspotPosition(image: SectionImageSource) {
  if (image.hotspot?.x == null || image.hotspot.y == null) return undefined;

  const crop = image.crop;
  const visibleWidth = 1 - (crop?.left ?? 0) - (crop?.right ?? 0);
  const visibleHeight = 1 - (crop?.top ?? 0) - (crop?.bottom ?? 0);

  if (visibleWidth <= 0 || visibleHeight <= 0) return undefined;

  const x = ((image.hotspot.x - (crop?.left ?? 0)) / visibleWidth) * 100;
  const y = ((image.hotspot.y - (crop?.top ?? 0)) / visibleHeight) * 100;
  const clamp = (value: number) =>
    Number(Math.min(100, Math.max(0, value)).toFixed(4));

  return `${clamp(x)}% ${clamp(y)}%`;
}

/**
 * A Sanity photo that fills its positioned parent. The parent sets the size,
 * the radius and the clipping.
 */
export function SectionImage({
  className,
  image,
  priority,
  sizes,
  style,
  width = 1200,
}: {
  className?: string;
  image: SectionImageSource;
  priority?: boolean;
  sizes: string;
  style?: CSSProperties;
  width?: number;
}) {
  const lqip = image.asset?.metadata?.lqip || undefined;
  return (
    <Image
      alt={stegaClean(image.alt) || ""}
      blurDataURL={lqip}
      className={cn("object-cover", className)}
      draggable={false}
      fill
      placeholder={lqip ? "blur" : undefined}
      priority={priority}
      sizes={sizes}
      src={urlFor(image).width(width).url()}
      style={{ objectPosition: hotspotPosition(image), ...style }}
    />
  );
}

/* ---- Buttons ---- */

export type SectionButton = {
  _key?: string | null;
  href?: string | null;
  openInNewTab?: boolean | null;
  text?: string | null;
};

/** What the page tells its sections about their buttons. */
export type PageButtonContext = {
  /** A giving page, under /donate: each list's main action is marigold. */
  giving?: boolean;
  /** The home page. */
  homePage?: boolean;
};

export type ButtonVariant = "primary" | "highlight" | "outline" | "ghost" | "link";

/**
 * The style of the button at `index` in a section's button list. Editors
 * choose only the order; the section sets the style of each position, and
 * the last style repeats. On a giving page the main action is marigold.
 */
export function buttonVariantAt(
  variants: readonly ButtonVariant[],
  index: number,
  giving = false,
): ButtonVariant {
  if (giving && index === 0) return "highlight";
  return variants[Math.min(index, variants.length - 1)] ?? "outline";
}

export function resolveButton(button: SectionButton | null | undefined) {
  const href = getSafeLinkHref(button?.href);
  const label = stegaClean(button?.text)?.trim();
  if (!button || !href || !label) return null;
  return {
    href,
    label,
    openInNewTab: Boolean(stegaClean(button.openInNewTab)),
  };
}

/** One Sanity button. The first button in a row carries the arrow. */
export function SectionButtonLink({
  arrow = false,
  button,
  className,
  dataSanity,
  onDark,
  size = "default",
  variant = "primary",
}: {
  arrow?: boolean;
  button: SectionButton | null | undefined;
  className?: string;
  dataSanity?: string;
  onDark?: boolean;
  size?: "default" | "hero" | "compact";
  variant?: ButtonVariant;
}) {
  const action = resolveButton(button);
  if (!action) return null;
  return (
    <Button
      asChild
      className={cn(
        "max-sm:h-auto max-sm:min-h-(--control-height) max-sm:py-3 max-sm:whitespace-normal",
        className,
      )}
      onDark={onDark}
      size={size}
      variant={variant}
    >
      <Link
        data-sanity={dataSanity}
        href={action.href}
        rel={action.openInNewTab ? "noopener noreferrer" : undefined}
        target={action.openInNewTab ? "_blank" : undefined}
      >
        {action.label}
        {action.openInNewTab ? (
          <ArrowUpRight aria-hidden="true" className="size-4" />
        ) : arrow ? (
          <ArrowRight aria-hidden="true" className="size-4" />
        ) : null}
      </Link>
    </Button>
  );
}

/** A row of Sanity buttons. The first is the main action. */
export function SectionButtons({
  buttons,
  className,
  dataAttribute,
  giving,
  onDark,
  path = "buttons",
  size,
  variants = ["primary", "outline"],
}: {
  buttons?: SectionButton[] | null;
  className?: string;
  dataAttribute?: DataAttribute;
  giving?: boolean;
  onDark?: boolean;
  path?: string;
  size?: "default" | "hero" | "compact";
  variants?: readonly ButtonVariant[];
}) {
  const valid = (buttons ?? []).filter((button) => resolveButton(button));
  if (!valid.length) return null;
  return (
    <div
      className={cn("flex flex-wrap items-center gap-3", className)}
      data-sanity={dataAttribute?.(path)}
    >
      {valid.map((button, index) => (
        <SectionButtonLink
          arrow={index === 0}
          button={button}
          dataSanity={dataAttribute?.(`${path}[_key=="${button._key}"]`)}
          key={button._key ?? index}
          onDark={onDark}
          size={size}
          variant={buttonVariantAt(variants, index, giving)}
        />
      ))}
    </div>
  );
}

/** The text link with an arrow: "Compare dates & rates →". */
export function ArrowLink({
  button,
  className,
  dataSanity,
}: {
  button: SectionButton | null | undefined;
  className?: string;
  dataSanity?: string;
}) {
  const action = resolveButton(button);
  if (!action) return null;
  return (
    <Link
      className={cn(
        "focus-ring font-ui text-base font-semibold whitespace-nowrap text-link underline hover:text-foreground",
        className,
      )}
      data-sanity={dataSanity}
      href={action.href}
      rel={action.openInNewTab ? "noopener noreferrer" : undefined}
      target={action.openInNewTab ? "_blank" : undefined}
    >
      {action.label}&nbsp;→
    </Link>
  );
}
