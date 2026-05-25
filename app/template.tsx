"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function AppTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const headings = Array.from(document.querySelectorAll("h1, h2, h3"));
    const scheduleHeading = headings.find((heading) =>
      normalizeText(heading.textContent ?? "").includes("lich chieu hoat hinh"),
    );
    const scheduleSection = scheduleHeading?.closest("section");

    if (scheduleSection instanceof HTMLElement) {
      scheduleSection.hidden = true;
    }
  }, [pathname]);

  return children;
}
