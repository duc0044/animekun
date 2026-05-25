type FilmListPathInput = {
  apiPage: number;
  kind: string;
  slug: string;
  keyword: string;
};

const buildListPath = (path: string, apiPage: number): string =>
  `${path}?page=${apiPage}&limit=24`;

export function getKkphimFilmListPath({
  apiPage,
  kind,
  slug,
  keyword,
}: FilmListPathInput): string {
  const encodedKeyword = encodeURIComponent(keyword);
  const encodedSlug = encodeURIComponent(slug);

  if (keyword.trim() !== "") {
    return `${buildListPath("/v1/api/tim-kiem", apiPage)}&keyword=${encodedKeyword}`;
  }

  if (kind === "list" && slug) {
    return buildListPath(`/v1/api/danh-sach/${encodedSlug}`, apiPage);
  }

  if (kind === "genre" && slug) {
    return buildListPath(`/v1/api/the-loai/${encodedSlug}`, apiPage);
  }

  if (kind === "country" && slug) {
    return buildListPath(`/v1/api/quoc-gia/${encodedSlug}`, apiPage);
  }

  if (kind === "year" && slug) {
    return buildListPath(`/v1/api/nam/${encodedSlug}`, apiPage);
  }

  return buildListPath("/v1/api/danh-sach/hoat-hinh", apiPage);
}

export function getKkphimFilmDetailPath(slug: string): string {
  return `/phim/${encodeURIComponent(slug)}`;
}
