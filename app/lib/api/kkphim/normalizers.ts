import { makeEpisodeSlug } from "../../episode-utils";
import type { Episode, Film, FilmDetail } from "../../types/film";
import { encodeProxyUrl } from "../../server/proxy-url";
import { asNumber, asRecord, asString, asStringList, type JsonRecord } from "../ophim/json";
import { KKPHIM_IMAGE_FALLBACK } from "./config";

const stripHtml = (value: string): string =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const joinUrl = (base: string, path: string): string => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};

const normalizeRating = (value: unknown): string => {
  const rating = asNumber(value);

  return rating > 0 ? rating.toFixed(1).replace(/\.0$/, "") : "";
};

const normalizeModified = (value: unknown): string => {
  const record = asRecord(value);
  return asString(record.time) || asString(value);
};

export function getKkphimImageBase(data: JsonRecord): string {
  return (
    asString(data.pathImage) ||
    asString(asRecord(data.data).APP_DOMAIN_CDN_IMAGE) ||
    KKPHIM_IMAGE_FALLBACK
  );
}

export function getKkphimPagination(data: JsonRecord): JsonRecord {
  const dataRecord = asRecord(data.data);
  const pagination = asRecord(data.pagination);
  const dataPagination = asRecord(dataRecord.pagination);
  const paramsPagination = asRecord(asRecord(dataRecord.params).pagination);

  if (Object.keys(pagination).length > 0) return pagination;
  if (Object.keys(dataPagination).length > 0) return dataPagination;

  return paramsPagination;
}

export function normalizeKkphimFilm(
  value: unknown,
  imageBase = KKPHIM_IMAGE_FALLBACK,
): Film {
  const film = asRecord(value);
  const thumb = asString(film.thumb_url || film.image);
  const poster = asString(film.poster_url || film.image || film.thumb_url);
  const tmdb = asRecord(film.tmdb);
  const imdb = asRecord(film.imdb);

  return {
    name: asString(film.name),
    slug: asString(film.slug),
    originalName: asString(film.origin_name),
    thumbUrl: joinUrl(imageBase, thumb),
    posterUrl: joinUrl(imageBase, poster),
    description: stripHtml(asString(film.content || film.description)),
    totalEpisodes: asString(film.episode_total || film.total_episodes),
    currentEpisode: asString(film.episode_current || film.current_episode),
    time: asString(film.time),
    quality: asString(film.quality),
    language: asString(film.lang || film.language),
    director: asStringList(film.director).join(", ") || asString(film.director),
    casts: asStringList(film.actor).join(", ") || asString(film.casts),
    countries: Array.isArray(film.country)
      ? film.country.map((item) => asString(asRecord(item).name)).filter(Boolean)
      : [],
    tmdbRating: normalizeRating(tmdb.vote_average),
    imdbRating: normalizeRating(imdb.vote_average),
    view: asNumber(film.view),
    modified: normalizeModified(film.modified),
  };
}

export function normalizeKkphimEpisodes(data: JsonRecord): Episode[] {
  const episodeServers = data.episodes || asRecord(data.data).episodes;

  return Array.isArray(episodeServers)
    ? episodeServers.flatMap((server, serverIndex) => {
        const serverRecord = asRecord(server);
        const serverName = asString(serverRecord.server_name);
        const items = Array.isArray(serverRecord.server_data) ? serverRecord.server_data : [];

        return items.map((item, index) => {
          const episode = asRecord(item);
          const episodeName = asString(episode.name) || String(index + 1);
          const rawM3u8 = asString(episode.link_m3u8);

          return {
            name: episodeName,
            slug: makeEpisodeSlug(
              asString(episode.slug),
              episodeName,
              serverName,
              serverIndex,
              episodeServers.length,
            ),
            embed: asString(episode.link_embed),
            m3u8: rawM3u8 ? encodeProxyUrl(rawM3u8) : "",
            rawM3u8,
            serverName,
          };
        });
      })
    : [];
}

export function normalizeKkphimFilmDetail(data: JsonRecord): FilmDetail | null {
  const imageBase = getKkphimImageBase(data);
  const rawMovie = asRecord(data.movie || asRecord(data.data).item || data.item);

  if (!rawMovie.slug) {
    return null;
  }

  const categories = Array.isArray(rawMovie.category)
    ? rawMovie.category.map((item) => asString(asRecord(item).name)).filter(Boolean)
    : [];

  return {
    ...normalizeKkphimFilm(rawMovie, imageBase),
    categories,
    episodes: normalizeKkphimEpisodes(data),
  };
}
