import Image from "next/image";
import type { HeaderBrandModel, HeaderLogoModel } from "./model";
import type { HeaderTheme } from "./theme";
import { cn } from "@/lib/utils";

function Logo({
  alt,
  className,
  logo,
  priority,
}: {
  alt: string;
  className?: string;
  logo: HeaderLogoModel;
  priority: boolean;
}) {
  return (
    <Image
      alt={alt}
      className={cn("h-13 w-auto", className)}
      height={logo.height}
      priority={priority}
      src={logo.src}
      width={logo.width}
    />
  );
}

export function HeaderBrand({
  brand,
  theme = "light",
}: {
  brand: HeaderBrandModel;
  theme?: HeaderTheme;
}) {
  // A dark header needs the logo made for dark backgrounds: the light
  // logo's dark lettering disappears on it.
  const active =
    theme === "dark" ? (brand.dark ?? brand.light) : (brand.light ?? brand.dark);

  // Both logos stay in the page, stacked, so a theme change fades between
  // two loaded images instead of blanking while the other file downloads.
  const logos =
    brand.light && brand.dark && brand.light.src !== brand.dark.src
      ? [brand.light, brand.dark]
      : active
        ? [active]
        : [];

  return (
    <span className="grid gap-[7px] whitespace-nowrap">
      {logos.length ? (
        <span className="grid">
          {logos.map((logo) => {
            const shown = logo === active;
            return (
              <Logo
                alt={shown ? brand.label : ""}
                className={cn("col-start-1 row-start-1", !shown && "opacity-0")}
                key={logo.src}
                logo={logo}
                priority={shown}
              />
            );
          })}
        </span>
      ) : (
        <span>{brand.label}</span>
      )}
    </span>
  );
}
