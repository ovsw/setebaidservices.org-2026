"use client";

import Link from "next/link";
import { HeaderBrand } from "./brand";
import { CallDirectorsAction } from "./call-directors-action";
import { DesktopNav } from "./desktop-nav";
import { HeaderLink } from "./header-link";
import { MobileNav } from "./mobile-nav";
import type { HeaderModel } from "./model";
import { SiteHeaderShell } from "./site-header-shell";
import type { HeaderTheme } from "./theme";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header({
  model,
  theme = "dark",
}: {
  model: HeaderModel;
  theme?: HeaderTheme;
}) {
  return (
    <SiteHeaderShell theme={theme}>
      {(theme) => {
        const brand = <HeaderBrand brand={model.brand} theme={theme} />;
        return (
      <div className="container-content flex h-full items-center justify-between gap-3 xl:gap-5">
        <Link
          aria-label={`${model.brand.label} home page`}
          className="flex shrink-0 items-center rounded-control font-display text-[15px] font-extrabold tracking-[0.035em] focus-ring"
          href="/"
        >
          {brand}
        </Link>
        <DesktopNav navigation={model.navigation} theme={theme} />
        <div className="hidden shrink-0 items-center gap-4 xl:flex">
          {/* The last action is the bar's main call to action: marigold on
              the dark bar, camp green on the light one. The rest are
              outlined. Editors choose which by the order in Navigation. */}
          {model.navigation.actions.map((action, index, actions) => {
            const primary = index === actions.length - 1;
            return (
              <HeaderLink
                className={cn(
                  buttonVariants({
                    size: "compact",
                    variant: primary ? (theme === "dark" ? "highlight" : "primary") : "outline",
                  }),
                  "hover:translate-y-0",
                  !primary &&
                    theme === "dark" &&
                    "border-birch-bark/45 text-birch-bark hover:border-birch-bark/70 hover:bg-birch-bark/8 hover:text-birch-bark",
                )}
                data-header-cta={primary ? "" : undefined}
                key={action.key}
                link={action.link}
              />
            );
          })}
          <CallDirectorsAction theme={theme} />
        </div>
        <div className="flex shrink-0 items-center xl:hidden">
          <MobileNav brand={brand} navigation={model.navigation} theme={theme} />
        </div>
      </div>
        );
      }}
    </SiteHeaderShell>
  );
}
