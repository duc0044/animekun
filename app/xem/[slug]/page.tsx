import { ChevronLeft, Heart, Play, Plus, Share2, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilmPlayer } from "../../components/film-player";
import { SiteHeader } from "../../components/site-header";
import { SourceBadge } from "../../components/source-badge";
import { WatchHistoryRecorder } from "../../components/watch-history-recorder";
import { createSeoMetadata } from "../../lib/seo";
import { getFilm } from "../../lib/services/film-service";
import { cookies } from "next/headers";
import { formatEpisodeName, uniqueServerNames } from "../../lib/episode-utils";

export const dynamic = "force-dynamic";


const getSearchValue = (
  value: string | string[] | undefined,
  fallback = "",
): string => (Array.isArray(value) ? value[0] || fallback : value || fallback);

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const film = await getFilm(slug);

  if (!film) {
    return {
      title: "Không tìm thấy anime | ANIMEKUN",
    };
  }

  const selectedEpisodeSlug = getSearchValue(query.ep);
  const selectedEpisode =
    film.episodes.find((episode) => episode.slug === selectedEpisodeSlug) ||
    film.episodes[0];
  const episodeTitle = selectedEpisode ? ` - ${formatEpisodeName(selectedEpisode.name)}` : "";
  const title = `Xem ${film.name}${episodeTitle} | ANIMEKUN`;

  return createSeoMetadata({
    title,
    description: film.description || `Xem anime ${film.name} tại ANIMEKUN.`,
    path: `/xem/${slug}${selectedEpisode ? `?ep=${selectedEpisode.slug}` : ""}`,
    image: film.posterUrl || film.thumbUrl,
  });
}

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const film = await getFilm(slug);

  if (!film) {
    notFound();
  }

  const selectedEpisodeSlug = getSearchValue(query.ep);
  const servers = uniqueServerNames(film.episodes);
  const selectedServer = getSearchValue(query.server) || servers[0] || "";
  const serverEpisodes = film.episodes.filter((ep) => ep.serverName === selectedServer);
  const selectedEpisode = selectedEpisodeSlug
    ? (serverEpisodes.find((ep) => ep.slug === selectedEpisodeSlug) ||
        film.episodes.find((ep) => ep.slug === selectedEpisodeSlug))
    : undefined;
  const resolvedEpisode = selectedEpisode || serverEpisodes[0] || film.episodes[0];
  const activeServer = resolvedEpisode?.serverName || selectedServer || servers[0] || "";
  const activeEpisodes = activeServer !== selectedServer && resolvedEpisode
    ? film.episodes.filter((ep) => ep.serverName === activeServer)
    : serverEpisodes;
  const selectedEpisodeIndex = film.episodes.findIndex(
    (ep) => ep.slug === resolvedEpisode?.slug,
  );
  const previousEpisode = selectedEpisodeIndex > 0
    ? film.episodes[selectedEpisodeIndex - 1]
    : undefined;
  const nextEpisode = selectedEpisodeIndex >= 0
    ? film.episodes[selectedEpisodeIndex + 1]
    : undefined;
  const posterUrl = film.posterUrl || film.thumbUrl;
  const displayRating = film.tmdbRating || film.imdbRating || "8.8";

  return (
    <main className="min-h-screen bg-[#101013] text-white">
      <SiteHeader />
      <SourceBadge />
      {resolvedEpisode && (
        <WatchHistoryRecorder
          item={{
            slug: film.slug,
            name: film.name,
            originalName: film.originalName,
            thumbUrl: film.thumbUrl,
            posterUrl: film.posterUrl,
            episodeName: resolvedEpisode.name,
            episodeSlug: resolvedEpisode.slug,
            watchedAt: 0,
          }}
        />
      )}

      <section className="mx-auto max-w-[104rem] px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <Link
          href={`/phim/${film.slug}`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 transition hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Chi tiết anime
        </Link>

        <div className="overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl shadow-black/60">
          <div className="aspect-video">
            <FilmPlayer
              key={resolvedEpisode?.slug || film.slug}
              title={`${film.name}${resolvedEpisode ? ` - ${formatEpisodeName(resolvedEpisode.name)}` : ""}`}
              episode={resolvedEpisode}
              previousEpisode={previousEpisode}
              previousEpisodeHref={previousEpisode ? `/xem/${film.slug}?ep=${previousEpisode.slug}` : undefined}
              nextEpisode={nextEpisode}
              nextEpisodeHref={nextEpisode ? `/xem/${film.slug}?ep=${nextEpisode.slug}` : undefined}
              posterUrl={posterUrl}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-white/10 bg-[#0d0d10] px-4 py-3 text-xs font-bold text-zinc-200">
            {[
              ["Yêu thích", Heart],
              ["Thêm vào", Plus],
              ["Chia sẻ", Share2],
            ].map(([label, Icon]) => (
              <button
                key={label as string}
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-md px-2 transition hover:bg-white/10 hover:text-red-400"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label as string}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section>
            <div className="grid gap-4 sm:grid-cols-[92px_minmax(0,1fr)]">
              <div className="relative hidden aspect-[2/3] overflow-hidden rounded-md bg-zinc-900 ring-1 ring-white/10 sm:block">
                {film.thumbUrl && (
                  <Image
                    src={film.thumbUrl}
                    alt={film.name}
                    fill
                    sizes="92px"
                    quality={90}
                    unoptimized
                    className="object-cover"
                  />
                )}
              </div>

              <div>
                <h1 className="text-2xl font-bold leading-tight">{film.name}</h1>
                <p className="mt-1 text-sm font-semibold text-red-400">
                  {film.originalName || film.name}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                  {[film.quality, film.language, film.currentEpisode, film.time].filter(Boolean).map((item) => (
                    <span key={item} className="rounded bg-white/10 px-2 py-1 text-zinc-100">
                      {item}
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-white">
                    <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                    {displayRating}
                  </span>
                </div>

                <p className="mt-4 line-clamp-4 max-w-3xl text-sm leading-6 text-zinc-300">
                  {film.description || "Đang cập nhật nội dung."}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-gradient-to-r from-red-700 to-red-500 px-4 py-3 text-sm font-bold text-white">
              Đang xem {formatEpisodeName(resolvedEpisode?.name || "1")}
            </div>

            <div className="mt-6">
              {servers.length > 1 && (
                <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
                  {servers.map((server) => {
                    const serverFirst = film.episodes.find((ep) => ep.serverName === server);
                    const isActive = server === activeServer;

                    return (
                      <Link
                        key={server}
                        href={`/xem/${film.slug}?ep=${serverFirst?.slug || ""}&server=${encodeURIComponent(server)}`}
                        className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                          isActive
                            ? "bg-red-600 text-white shadow-[0_0_14px_rgba(220,38,38,.3)]"
                            : "bg-white/10 text-zinc-300 hover:bg-white/15 hover:text-white"
                        }`}
                      >
                        {server}
                      </Link>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-black/20 p-3 sm:grid-cols-5 md:grid-cols-7 xl:grid-cols-10">
                {activeEpisodes.map((episode, index) => {
                  const isActive = episode.slug === resolvedEpisode?.slug;

                  return (
                    <Link
                      key={`${episode.serverName}-${episode.slug}-${index}`}
                      href={`/xem/${film.slug}?ep=${episode.slug}&server=${encodeURIComponent(activeServer)}`}
                      className={`flex h-10 items-center justify-center gap-2 rounded-md px-2 text-center text-sm font-bold transition ${
                        isActive
                          ? "bg-red-600 text-white shadow-[0_0_18px_rgba(220,38,38,.35)]"
                          : "bg-white/10 text-zinc-200 hover:bg-white/15"
                      }`}
                    >
                      <Play className="h-3 w-3 fill-current" aria-hidden="true" />
                      {formatEpisodeName(episode.name)}
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="rounded-lg border border-white/10 bg-white/[.04] p-5">
            <h2 className="text-lg font-bold">Thông tin anime</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Số tập", film.totalEpisodes],
                ["Quốc gia", film.countries.join(", ")],
                ["Đạo diễn", film.director],
                ["Diễn viên", film.casts],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[82px_1fr] gap-3">
                  <dt className="font-bold text-white">{label}:</dt>
                  <dd className="line-clamp-2 text-zinc-300">{value || "Đang cập nhật"}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>
    </main>
  );
}
