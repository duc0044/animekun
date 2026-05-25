export const getSearchValue = (
  value: string | string[] | undefined,
  fallback = "",
): string => (Array.isArray(value) ? value[0] || fallback : value || fallback);

export const getPageNumber = (value: string | string[] | undefined): number => {
  const page = Number(getSearchValue(value, "1"));
  return Number.isFinite(page) && page > 0 ? page : 1;
};

export const titleFromSlug = (slug: string): string =>
  slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
