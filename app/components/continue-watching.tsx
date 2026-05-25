"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  clearWatchHistory,
  readWatchHistory,
  type WatchHistoryItem,
} from "./watch-history-recorder";
import { formatEpisodeName } from "../lib/episode-utils";

export function ContinueWatching() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    const syncHistory = () => setHistory(readWatchHistory());

    syncHistory();
    window.addEventListener("storage", syncHistory);
    window.addEventListener("netphim:watch-history-updated", syncHistory);

    return () => {
      window.removeEventListener("storage", syncHistory);
      window.removeEventListener("netphim:watch-history-updated", syncHistory);
    };
  }, []);

  if (history.length === 0) {
    return null;
  }

  return (
    <section className="mt-20">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-white">Tiếp Tục Xem</h2>
        <button
          type="button"
          aria-label="Xóa lịch sử xem"
          onClick={() => {
            clearWatchHistory();
            setHistory([]);
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-zinc-300 transition hover:border-red-500/60 hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="no-scrollbar smooth-scroll-x -mx-4 mt-5 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        {history.slice(0, 8).map((item) => (
          <Link
            key={`${item.slug}-${item.episodeSlug}`}
            href={`/xem/${item.slug}?ep=${item.episodeSlug}`}
            className="group w-36 shrink-0 snap-start text-center transition hover:-translate-y-1 sm:w-40"
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-white/10">
              {(item.thumbUrl || item.posterUrl) && (
                <Image
                  src={item.thumbUrl || item.posterUrl}
                  alt={item.name}
                  fill
                  sizes="160px"
                  quality={90}
                  unoptimized
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute left-2 top-2 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
                {formatEpisodeName(item.episodeName)}
              </div>
              <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-[11px] font-bold text-white">
                Tiếp tục
              </div>
            </div>
            <h3 className="mt-3 line-clamp-1 text-sm font-bold text-white">{item.name}</h3>
            <p className="mt-1 text-xs text-zinc-400">{formatEpisodeName(item.episodeName)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
