import Image from "next/image";
import type { HeaderBrandModel, HeaderLogoModel } from "./model";

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

export function HeaderBrand({ brand }: { brand: HeaderBrandModel }) {
  const logo = brand.light ?? brand.dark;

  return (
    <span className="grid gap-[7px] whitespace-nowrap">
      {logo ? (
        <Logo alt={brand.label} logo={logo} />
      ) : (
        <>
          <span>{brand.label}</span>
          <span className="font-mono text-[14px] leading-tight font-medium tracking-[0.01em] opacity-75 max-[520px]:hidden">
            Temagami, Ontario · Est. 1975
          </span>
        </>
      )}
    </span>
  );
}
