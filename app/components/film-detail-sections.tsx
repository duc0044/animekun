"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Episode, FilmDetail } from "../lib/types/film";
import { formatEpisodeName } from "../lib/episode-utils";

export function EpisodeList({
  episodes,
  filmSlug,
  selectedEpisodeSlug,
  watchMode = false,
}: {
  episodes: Episode[];
  filmSlug: string;
  selectedEpisodeSlug?: string;
  watchMode?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleEpisodes = isExpanded ? episodes : episodes.slice(0, 12);
  const hasMore = episodes.length > visibleEpisodes.length;

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Danh sách tập</h2>
        {episodes.length > 12 && (
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-zinc-100 ring-1 ring-white/10 transition hover:bg-white/20"
          >
            {isExpanded ? "Ẩn bớt" : `Hiển thị ${episodes.length} tập`}
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-4">
        {visibleEpisodes.map((episode) => {
          const isActive = episode.slug === selectedEpisodeSlug;

          return (
            <Link
              key={`${episode.serverName}-${episode.slug}`}
              href={watchMode ? `/xem/${filmSlug}?ep=${episode.slug}` : `/phim/${filmSlug}?ep=${episode.slug}`}
              className={`flex h-10 items-center justify-center rounded-lg px-2 text-center text-sm font-medium ${
                isActive
                  ? "bg-red-600 text-white"
                  : "bg-white/10 text-zinc-200 hover:bg-white/20"
              }`}
            >
              {formatEpisodeName(episode.name)}
            </Link>
          );
        })}
      </div>

      {hasMore && !isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="mt-3 w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-100 ring-1 ring-white/10 transition hover:bg-zinc-800"
        >
          Xem thêm tập
        </button>
      )}
    </section>
  );
}

export function FilmSynopsis({ film }: { film: FilmDetail }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="grid gap-6 rounded-lg border border-white/10 bg-zinc-950 p-4 sm:p-5 md:grid-cols-[180px_1fr]">
      <div className="relative mx-auto aspect-[2/3] w-40 overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-white/10 sm:w-48 md:mx-0 md:w-full md:max-w-48">
        {film.thumbUrl && (
          <Image
            src={film.thumbUrl}
            alt={film.name}
            fill
            sizes="192px"
            quality={95}
            unoptimized
            className="object-cover"
          />
        )}
      </div>
      <div className="text-center md:text-left">
        <p className="text-sm font-medium uppercase text-red-400">
          {film.currentEpisode || "Thông tin phim"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold leading-[1.18] sm:text-3xl">
          {film.name}
        </h2>
        <p className="mt-2 text-zinc-400">{film.originalName}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm font-medium md:justify-start">
          {[film.quality, film.language, film.time, `${film.totalEpisodes} tập`]
            .filter((item) => item && item !== " tập")
            .map((item) => (
              <span key={item} className="rounded-md bg-white/10 px-3 py-1.5 ring-1 ring-white/10">
                {item}
              </span>
            ))}
        </div>
        <p
          className={`mt-5 text-justify text-base leading-7 text-zinc-200 ${
            isExpanded ? "" : "line-clamp-4"
          }`}
        >
          {film.description}
        </p>
        {film.description.length > 180 && (
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            className="mt-3 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-zinc-100 ring-1 ring-white/10 transition hover:bg-white/20"
          >
            {isExpanded ? "Thu gọn" : "Xem thêm"}
          </button>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
          {film.categories.slice(0, 8).map((category) => (
            <span
              key={category}
              className="rounded-lg border border-white/10 px-3 py-1 text-sm text-zinc-300"
            >
              {category}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
