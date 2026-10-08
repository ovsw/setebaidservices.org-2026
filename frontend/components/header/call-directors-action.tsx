import Image from "next/image";
import Link from "next/link";
import type { MouseEventHandler } from "react";
import { cn } from "@/lib/utils";
import { CALL_DIRECTORS } from "./call-directors";

export function CallDirectorsAction({
  className,
  onClick,
}: {
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  if (!CALL_DIRECTORS) return null;
  const { href, label, phone, portrait } = CALL_DIRECTORS;

  return (
    <Link
      aria-label={`${label} at ${phone}`}
      className={cn(
        "group relative isolate grid min-h-11 grid-cols-[auto_1fr] items-center gap-2 rounded-control px-2 py-1 focus-ring",
        // Hover pill lives on a pseudo-element so it can extend past the
        // link's box without growing the header row.
        "before:absolute before:-inset-x-1.5 before:-inset-y-1.5 before:-z-10 before:rounded-control before:opacity-0 before:transition-opacity before:motion-fast hover:before:opacity-100 motion-reduce:before:transition-none",
        "before:bg-birch-bark/8 header-light:before:bg-cedar/10",
        className,
      )}
      href={href}
      onClick={onClick}
    >
      <Image
        alt=""
        className="size-10 rounded-full border-2 border-campfire-amber object-cover"
        height={40}
        src={portrait}
        width={40}
      />
      <span className="grid gap-1.5 text-left">
        {/* Both lines take the field's text colour. The number is the payload
            a parent dials, so it carries the weight; amber only answers hover.
            An amber number sat mid-luminance over hero photos and dropped
            below 2.5:1 on bright areas, so the accent stays on the portrait
            ring and the hover state instead. */}
        <strong
          className="text-sm leading-none font-semibold text-birch-bark/85 header-light:text-ink-soft"
        >
          {label}
        </strong>
        <span
          className={cn(
            "font-mono text-[15px] leading-none font-bold tracking-[0.01em] transition-colors motion-fast motion-reduce:transition-none",
            "text-birch-bark group-hover:text-campfire-amber",
            "header-light:text-pine-night header-light:group-hover:text-cedar",
          )}
        >
          {phone}
        </span>
      </span>
    </Link>
  );
}
