import type { Metadata } from "next";
import { Work_Sans, Merriweather, Caveat } from "next/font/google";
import { siteUrl } from "@/lib/site-url";
import { siteName } from "@/lib/site-name";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const isProduction = process.env.NEXT_PUBLIC_SITE_ENV === "production";

/**
 * Headline and interface font — headings, buttons, navigation, labels.
 * See DESIGN.md § Typography.
 */
const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
});

/**
 * Sentence font — every paragraph. The optical-size axis keeps 15–20px text
 * sturdy.
 */
const merriweather = Merriweather({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-merriweather",
  axes: ["opsz"],
});

/** Handwritten notes — captions, signatures, margin asides. */
const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  weight: ["600"],
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
      className={`${workSans.variable} ${merriweather.variable} ${caveat.variable}`}
    >
      <link rel="icon" href="/favicon.ico" />
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
