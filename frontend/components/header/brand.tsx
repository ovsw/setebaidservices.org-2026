import Image from "next/image";
import type { HeaderBrandModel, HeaderLogoModel } from "./model";
import type { HeaderTheme } from "./theme";

function Logo({
  alt,
  logo,
}: {
  alt: string;
  logo: HeaderLogoModel;
}) {
  return (
    <Image
      alt={alt}
      className="h-13 w-auto"
      height={logo.height}
      priority
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
  const logo =
    theme === "dark" ? (brand.dark ?? brand.light) : (brand.light ?? brand.dark);

  return (
    <span className="grid gap-[7px] whitespace-nowrap">
      {logo ? (
        <Logo alt={brand.label} logo={logo} />
      ) : (
        <span>{brand.label}</span>
      )}
    </span>
  );
}
