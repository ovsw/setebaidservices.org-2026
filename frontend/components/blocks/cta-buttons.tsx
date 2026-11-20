import { Button } from "@/components/ui/button";
import { givingLink } from "@/lib/giving";
import { getSafeLinkHref } from "@/lib/safe-href";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { stegaClean } from "next-sanity";
import Link from "next/link";
import { buttonVariantAt } from "./section-parts";

type CtaButton = {
  _key?: string | null;
  href?: string | null;
  openInNewTab?: boolean | null;
  text?: string | null;
};

/**
 * The one or two actions of the closing band and the in-page nudge: the
 * first is the main action, the second an outline. Buttons stack on phones.
 */
export function CtaButtons({
  buttons,
  dataAttribute,
  giving,
  onDark,
}: Readonly<{
  buttons?: CtaButton[] | null;
  dataAttribute?: (path: string) => string | undefined;
  giving?: boolean;
  onDark: boolean;
}>) {
  const actions = (buttons ?? []).slice(0, 2).flatMap((button, index) => {
    const href = getSafeLinkHref(button.href);
    if (!href) return [];
    return [
      {
        href,
        key: button._key ?? `${href}-${index}`,
        label: stegaClean(button.text)?.trim() || "Learn more",
        openInNewTab: Boolean(stegaClean(button.openInNewTab)),
        path: `buttons[_key=="${button._key}"]`,
      },
    ];
  }).map((action, index) => ({
    ...action,
    primary: index === 0,
    variant: buttonVariantAt(["primary", "outline"], index, giving),
  }));

  if (!actions.length) return null;

  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
      data-sanity={dataAttribute?.("buttons")}
    >
      {actions.map((action) => (
        <Button
          asChild
          // Phones stack full-width buttons, and a label can be an email
          // address wider than the screen. There the label wraps and the
          // button grows past its standard height instead of overflowing.
          className="w-full max-sm:h-auto max-sm:min-h-(--control-height) max-sm:py-3 max-sm:text-center max-sm:whitespace-normal max-sm:wrap-anywhere sm:w-auto"
          key={action.key}
          onDark={onDark}
          variant={action.variant}
        >
          <Link
            data-sanity={dataAttribute?.(action.path)}
            {...givingLink(action.href)}
            rel={action.openInNewTab ? "noopener noreferrer" : undefined}
            target={action.openInNewTab ? "_blank" : undefined}
          >
            {action.label}
            {action.openInNewTab ? (
              <ArrowUpRight aria-hidden="true" className="size-4" />
            ) : action.primary ? (
              <ArrowRight aria-hidden="true" className="size-4" />
            ) : null}
          </Link>
        </Button>
      ))}
    </div>
  );
}
