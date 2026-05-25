export type FilmApiSource = "ophim" | "nguonc" | "kkphim";

export const FILM_API_SOURCE_COOKIE = "web-film-source";

const normalizeSource = (value: string | undefined): FilmApiSource => {
  const source = value?.trim().toLowerCase();

  return source === "nguonc" || source === "kkphim" ? source : "ophim";
};

export const FILM_API_SOURCE = normalizeSource(process.env.FILM_API_SOURCE);
