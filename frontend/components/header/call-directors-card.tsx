import { Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { MouseEventHandler } from "react";
import { cn } from "@/lib/utils";
import { CALL_DIRECTORS } from "./call-directors";
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
  if (!CALL_DIRECTORS) return null;
  const { href, label, phone, portrait } = CALL_DIRECTORS;
  const dark = theme === "dark";

  return (
    <Link
      aria-label={`${label} at ${phone}`}
      className={cn(
        "group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[var(--radius-lg)] border p-4 transition-[background-color,border-color] motion-base focus-ring motion-reduce:transition-none",
        dark
          ? "border-birch-bark/12 bg-forest-panel hover:border-birch-bark/28"
          : "border-pine-night/10 bg-birch-bark-bright hover:border-cedar/45",
        className,
      )}
      href={href}
      onClick={onClick}
    >
      <Image
        alt=""
        className={cn(
          "size-14 rounded-full border-2 object-cover",
          dark ? "border-birch-bark/25" : "border-pine-night/15",
        )}
        height={56}
        src={portrait}
        width={56}
      />
      <span className="grid min-w-0 gap-1 text-left">
        <strong className="text-base leading-tight font-bold">
          {label}
        </strong>
        <span
          className={cn(
            "font-mono text-[22px] leading-none font-bold tracking-[0.01em]",
            dark ? "text-campfire-amber" : "text-cedar",
          )}
        >
          {phone}
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
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-campfire-amber text-pine-night transition-colors motion-base group-hover:bg-campfire-amber-deep motion-reduce:transition-none"
      >
        <Phone className="size-5" strokeWidth={2.25} />
      </span>
    </Link>
  );
}
