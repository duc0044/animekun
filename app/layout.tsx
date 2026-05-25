import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { ScrollToTop } from "./components/scroll-to-top";
import { SiteFooter } from "./components/site-footer";
import { createSeoMetadata, siteConfig } from "./lib/seo";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  ...createSeoMetadata(),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body suppressHydrationWarning className="min-h-full bg-black">
        {children}
        <SiteFooter />
        <ScrollToTop />
      </body>
    </html>
  );
}
