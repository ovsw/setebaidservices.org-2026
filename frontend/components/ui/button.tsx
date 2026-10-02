import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/*
 * Button roles — see DESIGN.md § Components → Buttons.
 *
 * Roles: primary (camp green, the main action), highlight (marigold, giving),
 * outline, ghost and link; three sizes (default, compact, hero). Buttons are
 * flat at rest and lift on hover; the green action shadow is an opt-in
 * emphasis flag, not a default.
 * Call sites should not override height, padding, or radius.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold transition-[background-color,border-color,color,box-shadow,translate] motion-base hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  {
    variants: {
      variant: {
        /* `default` is the CMS's name for the primary role; both are kept so
           stored Sanity documents keep resolving. See BUTTON_VARIANTS. */
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground",
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground",
        /* Marigold with ink: Donate and other giving actions. */
        highlight:
          "bg-highlight text-highlight-foreground hover:bg-highlight-hover hover:text-highlight-foreground",
        /* `copper` is a CAC name some stored documents may carry; it renders
           as the highlight role. */
        copper:
          "bg-highlight text-highlight-foreground hover:bg-highlight-hover hover:text-highlight-foreground",
        /* `secondary` is the CMS's name for the outline role. The border and
           text follow the field, so the outline is right on Forest too. */
        secondary:
          "border-[1.5px] border-border bg-transparent text-foreground hover:border-link/50 hover:bg-card hover:text-card-foreground",
        outline:
          "border-[1.5px] border-border bg-transparent text-foreground hover:border-link/50 hover:bg-card hover:text-card-foreground",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-none",
        link: "text-link underline-offset-4 hover:underline hover:shadow-none hover:translate-y-0",
        destructive: "bg-destructive text-destructive-foreground hover:brightness-110",
      },
      size: {
        /* Rare. The one action in a section built around a monumental
           headline — see the Hero Is Earned rule in DESIGN.md. The larger
           label matters more than the taller box: at the default 14.5px a
           button reads as an afterthought beside 66px display type. */
        hero:
          "typo-button-lg h-(--control-height-hero) px-(--control-inline-hero) has-[>svg]:px-7",
        default:
          "typo-button h-(--control-height) px-(--control-inline) has-[>svg]:px-6",
        compact:
          "typo-button h-(--control-height-compact) px-(--control-inline-compact) has-[>svg]:px-4",
        icon: "typo-button size-11",
      },
      /* On a photograph, which is not a field, the outline and ghost
         variants need a light edge. On the Forest field they need nothing:
         the field tokens already turn them light. */
      onDark: {
        true: "",
        false: "",
      },
      /* Rare. Reserved for the one primary action a page is built around. */
      emphasis: {
        true: "shadow-cta hover:shadow-cta",
        false: "",
      },
      lift: {
        true:
          "hover:shadow-interactive-lift hover:[--focus-ring-keep:var(--shadow-lift)]",
        false: "hover:shadow-none",
      },
    },
    compoundVariants: [
      {
        variant: ["outline", "secondary"],
        onDark: true,
        class:
          "border-white/25 text-white hover:border-white/45 hover:bg-white/10 hover:text-white",
      },
      {
        variant: "ghost",
        onDark: true,
        class: "text-white hover:bg-white/10 hover:text-white",
      },
      {
        variant: ["highlight", "copper"],
        emphasis: true,
        class:
          "shadow-highlight hover:shadow-highlight",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "default",
      onDark: false,
      emphasis: false,
      lift: true,
    },
  }
);

function Button({
  className,
  variant,
  size,
  onDark,
  emphasis,
  lift,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, onDark, emphasis, lift, className }),
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
