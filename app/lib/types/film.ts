export type Film = {
  name: string;
  slug: string;
  originalName: string;
  thumbUrl: string;
  posterUrl: string;
  description: string;
  totalEpisodes: string;
  currentEpisode: string;
  time: string;
  quality: string;
  language: string;
  director: string;
  casts: string;
  countries: string[];
  tmdbRating: string;
  imdbRating: string;
  view: number;
  modified: string;
};

export type Episode = {
  name: string;
  slug: string;
  embed: string;
  m3u8: string;
  rawM3u8: string;
  serverName: string;
};

export type FilmDetail = Film & {
  categories: string[];
  episodes: Episode[];
};

export type FilmList = {
  films: Film[];
  page: number;
  totalPage: number;
  totalItems: number;
};
