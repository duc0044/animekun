import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { createClient } from "./lib/supabase/server";
import { AuthProvider } from "./components/auth-provider";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body suppressHydrationWarning className="min-h-full bg-black">
        <AuthProvider initialUser={user}>{children}</AuthProvider>
        <SiteFooter />
        <ScrollToTop />
      </body>
    </html>
  );
}
