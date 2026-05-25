import Image from "next/image";
import Link from "next/link";
import type { Film } from "../lib/types/film";

export function FilmCard({
  film,
  priority = false,
  className = "",
}: {
  film: Film;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/phim/${film.slug}`}
      className={`group block overflow-hidden rounded-lg bg-zinc-950 ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:ring-red-500/70 ${className}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900">
        {film.thumbUrl ? (
          <Image
            src={film.thumbUrl}
            alt={film.name}
            fill
            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 22vw, 16vw"
            priority={priority}
            quality={95}
            unoptimized
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-900 px-4 text-center text-sm text-zinc-500">
            Chưa có poster
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3">
          <span className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white">
            {film.currentEpisode || film.quality || "HD"}
          </span>
        </div>
      </div>
      <div className="space-y-1 p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-5 text-white">
          {film.name}
        </h3>
        <p className="truncate text-xs text-zinc-400">
          {film.originalName || film.language || "Vietsub"}
        </p>
      </div>
    </Link>
  );
}
