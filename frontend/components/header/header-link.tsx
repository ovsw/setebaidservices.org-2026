import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import type { HeaderLinkModel } from "./model";

export function HeaderLink({
  children,
  className,
  "data-header-cta": headerCta,
  link,
  onClick,
}: {
  children?: ReactNode;
  className?: string;
  /** Marks the bar's main call to action for the see-through bar style. */
  "data-header-cta"?: string;
  link: HeaderLinkModel;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      className={className}
      data-header-cta={headerCta}
      href={link.href}
      onClick={onClick}
      rel={link.openInNewTab ? "noopener noreferrer" : undefined}
      target={link.openInNewTab ? "_blank" : undefined}
    >
      {children ?? link.label}
    </Link>
  );
}
