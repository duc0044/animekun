type FilmListPathInput = {
  apiPage: number;
  kind: string;
  slug: string;
  keyword: string;
};

export function getFilmListPath({
  apiPage,
  kind,
  slug,
  keyword,
}: FilmListPathInput): string {
  const encodedKeyword = encodeURIComponent(keyword);
  const encodedSlug = encodeURIComponent(slug);

  if (keyword.trim() !== "") {
    return `/v1/api/tim-kiem?keyword=${encodedKeyword}&page=${apiPage}`;
  }

  if (kind === "list" && slug) {
    return `/v1/api/danh-sach/hoat-hinh?page=${apiPage}`;
  }

  if (kind === "genre" && slug) {
    return `/v1/api/danh-sach/hoat-hinh?category=${encodedSlug}&page=${apiPage}`;
  }

  if (kind === "country" && slug) {
    return `/v1/api/danh-sach/hoat-hinh?country=${encodedSlug}&page=${apiPage}`;
  }

  if (kind === "year" && slug) {
    return `/v1/api/danh-sach/hoat-hinh?year=${encodedSlug}&page=${apiPage}`;
  }

  return `/v1/api/danh-sach/hoat-hinh?page=${apiPage}`;
}

export function getFilmDetailPath(slug: string): string {
  return `/phim/${encodeURIComponent(slug)}`;
}
