"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import type { Episode } from "../lib/types/film";
import { formatEpisodeName, uniqueServerNames } from "../lib/episode-utils";

type FilmDetailTabsProps = {
  filmSlug: string;
  episodes: Episode[];
  selectedEpisodeSlug: string;
  selectedServerName: string;
  language: string;
  casts: string;
};

const splitCasts = (casts: string): string[] =>
  casts
    .split(",")
    .map((cast) => cast.trim())
    .filter(Boolean);

export function FilmDetailTabs({
  filmSlug,
  episodes,
  selectedEpisodeSlug,
  selectedServerName,
  language,
  casts,
}: FilmDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<"episodes" | "casts">("episodes");
  const castItems = splitCasts(casts);

  const servers = useMemo(() => uniqueServerNames(episodes), [episodes]);
  const [selectedServer, setSelectedServer] = useState(selectedServerName || servers[0] || "");
  const filteredEpisodes = useMemo(
    () => (selectedServer ? episodes.filter((ep) => ep.serverName === selectedServer) : episodes),
    [episodes, selectedServer],
  );

  return (
    <>
      <div className="mt-5 grid grid-cols-2 gap-2 border-b border-white/10 text-center text-sm font-bold lg:flex lg:gap-6 lg:text-left">
        {[
          ["episodes", "Tập phim"],
          ["casts", "Diễn viên"],
        ].map(([value, label]) => {
          const isActive = activeTab === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => setActiveTab(value as "episodes" | "casts")}
              className={`pb-3 transition ${
                isActive
                  ? "border-b-2 border-red-500 text-red-400"
                  : "text-zinc-300 hover:text-white"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {activeTab === "episodes" ? (
        <div className="mt-8">
          <h2 className="text-xl font-bold">Danh sách tập</h2>

          {servers.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-2 border-b border-white/10 pb-3">
              {servers.map((server) => {
                const isActive = server === selectedServer;

                return (
                  <button
                    key={server}
                    type="button"
                    onClick={() => setSelectedServer(server)}
                    className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                      isActive
                        ? "bg-red-600 text-white shadow-[0_0_14px_rgba(220,38,38,.3)]"
                        : "bg-white/10 text-zinc-300 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    {server}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-black/20 p-3 sm:grid-cols-5 md:grid-cols-7 xl:grid-cols-10">
            {filteredEpisodes.map((episode, index) => {
              const isActive = episode.slug === selectedEpisodeSlug;

              return (
                <Link
                  key={`${episode.serverName}-${episode.slug}-${index}`}
                  href={`/xem/${filmSlug}?ep=${episode.slug}`}
                  className={`flex h-10 items-center justify-center rounded-md px-2 text-center text-sm font-bold transition ${
                    isActive
                      ? "bg-red-600 text-white shadow-[0_0_18px_rgba(220,38,38,.35)]"
                      : "bg-white/10 text-zinc-200 hover:bg-white/15"
                  }`}
                >
                  {formatEpisodeName(episode.name)}
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <h2 className="text-xl font-bold">Diễn viên</h2>
          {castItems.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2 rounded-lg border border-white/10 bg-black/20 p-3">
              {castItems.map((cast) => (
                <span
                  key={cast}
                  className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-zinc-100"
                >
                  {cast}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">
              Đang cập nhật diễn viên.
            </p>
          )}
        </div>
      )}
    </>
  );
}
