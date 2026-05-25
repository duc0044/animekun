import type { Metadata } from "next";

export const siteConfig = {
  name: "ANIMEKUN",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://phim.ngthanhvu.io.vn",
  title: "ANIMEKUN - Xem anime và hoạt hình cập nhật nhanh",
  description:
    "Kho anime và hoạt hình online miễn phí, cập nhật nhanh với giao diện tối hiện đại.",
  ogImage: "/og-image.png",
};

type SeoInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
};

export function createSeoMetadata({
  title = siteConfig.title,
  description = siteConfig.description,
  path = "/",
  image = siteConfig.ogImage,
}: SeoInput = {}): Metadata {
  const url = new URL(path, siteConfig.url).toString();

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
