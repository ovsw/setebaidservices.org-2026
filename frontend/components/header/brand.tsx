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
  // The header-light variant picks the one in view, so the right logo shows
  // from the first paint; both load at once, as either may be the one.
  const pair =
    brand.light && brand.dark && brand.light.src !== brand.dark.src
      ? { dark: brand.dark, light: brand.light }
      : null;
  const logos = pair ? [pair.light, pair.dark] : active ? [active] : [];

  return (
    <span className="grid gap-[7px] whitespace-nowrap">
      {logos.length ? (
        <span className="grid">
          {logos.map((logo) => (
            <Logo
              alt={logo === active ? brand.label : ""}
              className={cn(
                "col-start-1 row-start-1",
                pair && logo === pair.dark && "header-light:opacity-0",
                pair && logo === pair.light && "opacity-0 header-light:opacity-100",
              )}
              key={logo.src}
              logo={logo}
              priority
            />
          ))}
        </span>
      ) : (
        <span>{brand.label}</span>
      )}
    </span>
  );
}
