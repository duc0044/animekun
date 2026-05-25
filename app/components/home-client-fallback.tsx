"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ContinueWatching } from "./continue-watching";
import { HeroSlider } from "./hero-slider";
import { FilmCard } from "./film-card";
import { ScheduleSection } from "./schedule-section";
import type { Film } from "../lib/types/film";

type FilmListState = {
  films: Film[];
  loading: boolean;
  error: string;
};

const OPHIM_BASE_URL = "https://ophim1.com";
const OPHIM_IMAGE_FALLBACK = "https://img.ophim.live/uploads/movies/";
const NGUONC_BASE_URL = "https://phim.nguonc.com/api";
const NGUONC_IMAGE_FALLBACK = "https://phim.nguonc.com/uploads/movies/";

function joinUrl(base: string, path: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

async function requestJson(url: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function normalizeOphimList(data: Record<string, unknown> | null): Film[] {
  const record = data || {};
  const items = Array.isArray((record as { items?: unknown[] }).items)
    ? ((record as { items?: unknown[] }).items as unknown[])
    : Array.isArray((record as { data?: { items?: unknown[] } }).data?.items)
      ? (((record as { data?: { items?: unknown[] } }).data?.items as unknown[]) || [])
      : [];
  const imageBase =
    (record as { pathImage?: string }).pathImage ||
    (record as { data?: { APP_DOMAIN_CDN_IMAGE?: string } }).data?.APP_DOMAIN_CDN_IMAGE ||
    OPHIM_IMAGE_FALLBACK;

  return items
    .map((item) => {
      const film = (item || {}) as Record<string, unknown>;
      const thumb = typeof film.thumb_url === "string" ? film.thumb_url : "";
      const poster =
        typeof film.poster_url === "string"
          ? film.poster_url
          : typeof film.thumb_url === "string"
            ? film.thumb_url
            : "";

      return {
        name: typeof film.name === "string" ? film.name : "",
        slug: typeof film.slug === "string" ? film.slug : "",
        originalName: typeof film.origin_name === "string" ? film.origin_name : "",
        thumbUrl: joinUrl(imageBase, thumb),
        posterUrl: joinUrl(imageBase, poster),
        description:
          typeof film.content === "string"
            ? film.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
            : "",
        totalEpisodes: typeof film.episode_total === "string" ? film.episode_total : "",
        currentEpisode: typeof film.episode_current === "string" ? film.episode_current : "",
        time: typeof film.time === "string" ? film.time : "",
        quality: typeof film.quality === "string" ? film.quality : "",
        language:
          typeof film.lang === "string"
            ? film.lang
            : typeof film.language === "string"
              ? film.language
              : "",
        director: "",
        casts: "",
        countries: [],
        tmdbRating: "",
        imdbRating: "",
        view: typeof film.view === "number" ? film.view : 0,
        modified:
          typeof film.modified === "object" &&
          film.modified &&
          typeof (film.modified as { time?: string }).time === "string"
            ? ((film.modified as { time?: string }).time as string)
            : "",
      } satisfies Film;
    })
    .filter((film) => film.slug && film.name);
}

function normalizeNguoncList(data: Record<string, unknown> | null): Film[] {
  const items = Array.isArray((data as { items?: unknown[] } | null)?.items)
    ? ((((data as { items?: unknown[] }) || {}).items as unknown[]) || [])
    : [];

  return items
    .map((item) => {
      const film = (item || {}) as Record<string, unknown>;
      const image =
        typeof film.thumb_url === "string"
          ? film.thumb_url
          : typeof film.image === "string"
            ? film.image
            : "";

      return {
        name: typeof film.name === "string" ? film.name : "",
        slug: typeof film.slug === "string" ? film.slug : "",
        originalName: typeof film.origin_name === "string" ? film.origin_name : "",
        thumbUrl: joinUrl(NGUONC_IMAGE_FALLBACK, image),
        posterUrl: joinUrl(NGUONC_IMAGE_FALLBACK, image),
        description: typeof film.description === "string" ? film.description : "",
        totalEpisodes: typeof film.episode_total === "string" ? film.episode_total : "",
        currentEpisode: typeof film.episode_current === "string" ? film.episode_current : "",
        time: typeof film.time === "string" ? film.time : "",
        quality: typeof film.quality === "string" ? film.quality : "HD",
        language:
          typeof film.language === "string"
            ? film.language
            : typeof film.lang === "string"
              ? film.lang
              : "Vietsub",
        director: "",
        casts: "",
        countries: [],
        tmdbRating: "",
        imdbRating: "",
        view: typeof film.view === "number" ? film.view : 0,
        modified: "",
      } satisfies Film;
    })
    .filter((film) => film.slug && film.name);
}

async function fetchAnimeFilms(): Promise<Film[]> {
  const ophim = await requestJson(`${OPHIM_BASE_URL}/v1/api/danh-sach/hoat-hinh?page=1`);
  const ophimFilms = normalizeOphimList(ophim);

  if (ophimFilms.length > 0) {
    return ophimFilms;
  }

  const nguonc = await requestJson(`${NGUONC_BASE_URL}/films/danh-sach/hoat-hinh?page=1`);
  return normalizeNguoncList(nguonc);
}

export function HomeClientFallback() {
  const [state, setState] = useState<FilmListState>({
    films: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    let cancelled = false;

    fetchAnimeFilms()
      .then((films) => {
        if (cancelled) {
          return;
        }

        setState({
          films,
          loading: false,
          error: films.length > 0 ? "" : "Không tải được dữ liệu hoạt hình từ API.",
        });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setState({
          films: [],
          loading: false,
          error: "Không tải được dữ liệu hoạt hình từ API.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const heroFilms = state.films.slice(0, 6);
  const latestFilms = state.films.slice(6, 18);

  if (state.loading) {
    return (
      <section className="mx-auto max-w-[96rem] px-4 pb-16 pt-24 sm:px-6 lg:px-6 2xl:px-4">
        <div className="rounded-lg border border-white/10 bg-zinc-950 p-8 text-zinc-300">
          Đang tải dữ liệu hoạt hình...
        </div>
      </section>
    );
  }

  if (state.films.length === 0) {
    return (
      <section className="mx-auto max-w-[96rem] px-4 pb-16 pt-24 sm:px-6 lg:px-6 2xl:px-4">
        <div className="rounded-lg border border-white/10 bg-zinc-950 p-8">
          <h1 className="text-3xl font-bold text-white">Không tải được danh sách hoạt hình</h1>
          <p className="mt-3 text-zinc-400">{state.error || "Vui lòng thử lại sau."}</p>
        </div>
      </section>
    );
  }

  return (
    <>
      {heroFilms.length > 0 && <HeroSlider films={heroFilms} />}

      <div className="mx-auto max-w-[96rem] space-y-14 px-4 pb-20 pt-8 sm:px-6 sm:pt-10 lg:space-y-12 lg:px-6 2xl:px-4">
        <ContinueWatching />
        <ScheduleSection films={state.films} />

        <section>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase text-red-400">Danh sách dự phòng</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Anime Mới Cập Nhật</h2>
            </div>
            <Link
              href="/the-loai/hoat-hinh"
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/10 transition hover:bg-white/15"
            >
              Xem toàn bộ
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {latestFilms.map((film, index) => (
              <FilmCard key={film.slug} film={film} priority={index < 2} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
