type FilmListPathInput = {
  apiPage: number;
  kind: string;
  slug: string;
  keyword: string;
};

const buildDanhSachPath = (slug: string, apiPage: number): string =>
  `/films/danh-sach/${encodeURIComponent(slug || "hoat-hinh")}?page=${apiPage}`;

export function getNguoncFilmListPath({
  apiPage,
  kind,
  slug,
  keyword,
}: FilmListPathInput): string {
  const encodedKeyword = encodeURIComponent(keyword);
  const animeListSlugs = new Set([
    "phim-dang-chieu",
    "phim-bo",
    "phim-le",
    "phim-sap-chieu",
    "hoat-hinh",
  ]);

  if (keyword.trim() !== "") {
    return `/films/search?keyword=${encodedKeyword}&page=${apiPage}`;
  }

  if (kind === "list" && slug) {
    return buildDanhSachPath(animeListSlugs.has(slug) ? "hoat-hinh" : slug, apiPage);
  }

  if (kind === "genre" && slug) {
    return `${buildDanhSachPath("hoat-hinh", apiPage)}&category=${encodeURIComponent(slug)}`;
  }

  if (kind === "country" && slug) {
    return `${buildDanhSachPath("hoat-hinh", apiPage)}&country=${encodeURIComponent(slug)}`;
  }

  if (kind === "year" && slug) {
    return `${buildDanhSachPath("hoat-hinh", apiPage)}&year=${encodeURIComponent(slug)}`;
  }

  return buildDanhSachPath("hoat-hinh", apiPage);
}

export function getNguoncFilmDetailPath(slug: string): string {
  return `/film/${encodeURIComponent(slug)}`;
}
