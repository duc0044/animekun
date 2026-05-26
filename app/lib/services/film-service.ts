import { FILM_API_SOURCE } from "../api/provider";
import { cookies } from "next/headers";
import { KKPHIM_LIST_PAGE_SIZE } from "../api/kkphim/config";
import { fetchKkphimJson } from "../api/kkphim/http";
import {
  getKkphimImageBase,
  getKkphimPagination,
  normalizeKkphimFilm,
  normalizeKkphimFilmDetail,
} from "../api/kkphim/normalizers";
import { getKkphimFilmDetailPath, getKkphimFilmListPath } from "../api/kkphim/paths";
import { NGUONC_LIST_PAGE_SIZE } from "../api/nguonc/config";
import { fetchNguoncJson } from "../api/nguonc/http";
import {
  getNguoncPagination,
  normalizeNguoncFilm,
  normalizeNguoncFilmDetail,
} from "../api/nguonc/normalizers";
import { getNguoncFilmDetailPath, getNguoncFilmListPath } from "../api/nguonc/paths";
import { OPHIM_LIST_PAGE_SIZE } from "../api/ophim/config";
import { fetchOphimJson } from "../api/ophim/http";
import { asNumber, asRecord } from "../api/ophim/json";
import { getFilmDetailPath, getFilmListPath } from "../api/ophim/paths";
import {
  getImageBase,
  getPagination,
  normalizeFilm,
  normalizeFilmDetail,
} from "../api/ophim/normalizers";
import type { Film, FilmDetail, FilmList } from "../types/film";
import type { JsonRecord } from "../api/ophim/json";
import { FILM_API_SOURCE_COOKIE, type FilmApiSource } from "../api/provider";

export type GetFilmsInput = {
  page?: number;
  kind?: string;
  slug?: string;
  keyword?: string;
  pageSize?: number;
};

const DETAIL_CHECK_BATCH_SIZE = 8;
const PLAYABLE_CANDIDATE_MULTIPLIER = 4;
const PRIMARY_SOURCE = FILM_API_SOURCE;
const ALL_SOURCES: FilmApiSource[] = ["ophim", "nguonc", "kkphim"];

const getFallbackSources = (activeSource: FilmApiSource): FilmApiSource[] =>
  ALL_SOURCES.filter((source) => source !== activeSource);

async function getActiveSource(): Promise<FilmApiSource> {
  const cookieStore = await cookies();
  const source = cookieStore.get(FILM_API_SOURCE_COOKIE)?.value;

  return ALL_SOURCES.includes(source as FilmApiSource)
    ? (source as FilmApiSource)
    : PRIMARY_SOURCE;
}

const hasPlayableEpisode = (film: FilmDetail | null): film is FilmDetail =>
  Boolean(film?.episodes.some((episode) => episode.m3u8 || episode.embed));

function getPageSizeForSource(source: FilmApiSource): number {
  if (source === "nguonc") {
    return NGUONC_LIST_PAGE_SIZE;
  }

  if (source === "kkphim") {
    return KKPHIM_LIST_PAGE_SIZE;
  }

  return OPHIM_LIST_PAGE_SIZE;
}

async function fetchListPages(
  source: FilmApiSource,
  {
    firstApiPage,
    pageCount,
    kind,
    slug,
    keyword,
  }: {
    firstApiPage: number;
    pageCount: number;
    kind: string;
    slug: string;
    keyword: string;
  },
): Promise<JsonRecord[]> {
  return Promise.all(
    Array.from({ length: pageCount }, (_, index) => {
      const apiPage = firstApiPage + index;

      if (source === "nguonc") {
        return fetchNguoncJson(
          getNguoncFilmListPath({
            apiPage,
            kind,
            slug,
            keyword,
          }),
        );
      }

      if (source === "kkphim") {
        return fetchKkphimJson(
          getKkphimFilmListPath({
            apiPage,
            kind,
            slug,
            keyword,
          }),
        );
      }

      return fetchOphimJson(
        getFilmListPath({
          apiPage,
          kind,
          slug,
          keyword,
        }),
      );
    }),
  );
}

function normalizeListPages(
  source: FilmApiSource,
  pages: JsonRecord[],
): { items: Film[]; totalItems: number; totalPages: number } {
  const firstPage = pages[0] || {};
  const pagination =
    source === "nguonc"
      ? getNguoncPagination(firstPage)
      : source === "kkphim"
        ? getKkphimPagination(firstPage)
        : getPagination(firstPage);
  const totalItems = asNumber(pagination.totalItems) || asNumber(pagination.total_items);
  const totalPages = asNumber(pagination.totalPages) || asNumber(pagination.total_pages);
  const items = pages.flatMap((data) => {
    const list = source === "nguonc" ? data.items : asRecord(data.data).items || data.items;

    if (!Array.isArray(list)) {
      return [];
    }

    if (source === "nguonc") {
      return list.map((item) => normalizeNguoncFilm(item));
    }

    if (source === "kkphim") {
      const imageBase = getKkphimImageBase(data);
      return list.map((item) => normalizeKkphimFilm(item, imageBase));
    }

    const imageBase = getImageBase(data);
    return list.map((item) => normalizeFilm(item, imageBase));
  });

  return { items, totalItems, totalPages };
}

async function getFilmBySource(
  source: FilmApiSource,
  slug: string,
): Promise<FilmDetail | null> {
  if (source === "nguonc") {
    return normalizeNguoncFilmDetail(await fetchNguoncJson(getNguoncFilmDetailPath(slug)));
  }

  if (source === "kkphim") {
    return normalizeKkphimFilmDetail(await fetchKkphimJson(getKkphimFilmDetailPath(slug)));
  }

  return normalizeFilmDetail(await fetchOphimJson(getFilmDetailPath(slug)));
}

async function getPlayableFilms(candidates: Film[], limit: number): Promise<Film[]> {
  return candidates.slice(0, limit);
}

export async function getFilms({
  page = 1,
  kind = "new",
  slug = "",
  keyword = "",
  pageSize = 10,
}: GetFilmsInput): Promise<FilmList> {
  const activeSource = await getActiveSource();
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const candidateCount = safePageSize * PLAYABLE_CANDIDATE_MULTIPLIER;
  const loadBySource = async (source: FilmApiSource) => {
    const activePageSize = getPageSizeForSource(source);
    const offset = (safePage - 1) * safePageSize;
    const firstApiPage = Math.floor(offset / activePageSize) + 1;
    const sliceStart = offset % activePageSize;
    const pageCount = Math.ceil((sliceStart + candidateCount) / activePageSize);
    const pages = await fetchListPages(source, {
      firstApiPage,
      pageCount,
      kind,
      slug,
      keyword,
    });
    const { items, totalItems, totalPages } = normalizeListPages(source, pages);

    return {
      items,
      totalItems,
      totalPages,
      sliceStart,
    };
  };

  let { items, totalItems, totalPages, sliceStart } = await loadBySource(activeSource);

  for (const source of getFallbackSources(activeSource)) {
    if (items.length > 0) {
      break;
    }

    ({ items, totalItems, totalPages, sliceStart } = await loadBySource(source));
  }

  return {
    films: await getPlayableFilms(
      items.slice(sliceStart, sliceStart + candidateCount).filter((film) => film.slug && film.name),
      safePageSize,
    ),
    page: safePage,
    totalPage: totalPages || Math.max(1, Math.ceil((totalItems || items.length) / safePageSize)),
    totalItems: totalItems || items.length,
  };
}

export async function getFilm(slug: string): Promise<FilmDetail | null> {
  const activeSource = await getActiveSource();
  const primaryFilm = await getFilmBySource(activeSource, slug);

  if (primaryFilm) {
    return primaryFilm;
  }

  for (const source of getFallbackSources(activeSource)) {
    const fallbackFilm = await getFilmBySource(source, slug);

    if (fallbackFilm) {
      return fallbackFilm;
    }
  }

  return null;
}
