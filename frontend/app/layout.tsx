import type { Metadata } from "next";
import { Bricolage_Grotesque, Archivo, Caveat } from "next/font/google";
import { siteUrl } from "@/lib/site-url";
import { siteName } from "@/lib/site-name";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const isProduction = process.env.NEXT_PUBLIC_SITE_ENV === "production";

/**
 * Display font — headlines, hero, section openers.
 * Variable font with optical-size axis for sharper rendering at large sizes.
 */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
  axes: ["opsz"],
});

/** Body font — paragraphs, buttons, navigation links. */
const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});

/** Script/accent font — the handwritten aside in headlines. */
const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: `%s | ${siteName}`,
    default: siteName,
  },
  openGraph: {
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/og-image.jpg`,
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: !isProduction ? "noindex, nofollow" : "index, follow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${archivo.variable} ${caveat.variable}`}
    >
      <link rel="icon" href="/favicon.ico" />
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
