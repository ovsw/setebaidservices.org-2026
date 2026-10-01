import { Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { MouseEventHandler } from "react";
import { cn } from "@/lib/utils";
import {
  CALL_DIRECTORS_HREF,
  CALL_DIRECTORS_LABEL,
  CALL_DIRECTORS_PHONE,
} from "./call-directors";
import type { HeaderTheme } from "./theme";

/*
 * The mobile menu's version of the director call. The header row uses the
 * compact CallDirectorsAction; the sheet has room for a full panel that
 * reads as the one warm door in the menu, so it gets the amber phone dial.
 */
export function CallDirectorsCard({
  className,
  onClick,
  theme,
}: {
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  theme: HeaderTheme;
}) {
  const dark = theme === "dark";

  return (
    <Link
      aria-label={`${CALL_DIRECTORS_LABEL} at ${CALL_DIRECTORS_PHONE}`}
      className={cn(
        "group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[var(--radius-lg)] border p-4 transition-[background-color,border-color,translate] motion-base hover:-translate-y-0.5 active:translate-y-0 focus-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        dark
          ? "border-birch-bark/12 bg-forest-panel hover:border-birch-bark/28"
          : "border-pine-night/10 bg-birch-bark-bright hover:border-cedar/45",
        className,
      )}
      href={CALL_DIRECTORS_HREF}
      onClick={onClick}
    >
      <Image
        alt=""
        className={cn(
          "size-14 rounded-full border-2 object-cover transition-transform motion-base group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100",
          dark ? "border-birch-bark/25" : "border-pine-night/15",
        )}
        height={56}
        src="/images/justin-anna-gerson-thumbnail.jpg"
        width={56}
      />
      <span className="grid min-w-0 gap-1 text-left">
        <strong className="text-base leading-tight font-bold">
          {CALL_DIRECTORS_LABEL}
        </strong>
        <span
          className={cn(
            "font-mono text-[22px] leading-none font-bold tracking-[0.01em]",
            dark ? "text-campfire-amber" : "text-cedar",
          )}
        >
          {CALL_DIRECTORS_PHONE}
        </span>
        <span
          className={cn(
            "text-[14px] leading-snug",
            dark ? "text-birch-bark/70" : "text-ink-muted",
          )}
        >
          Ask about fit, dates, or travel.
        </span>
      </span>
      <span
        aria-hidden="true"
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-campfire-amber text-pine-night transition-[background-color,transform] motion-base group-hover:bg-campfire-amber-deep group-hover:-rotate-12 motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
      >
        <Phone className="size-5" strokeWidth={2.25} />
      </span>
    </Link>
  );
}
