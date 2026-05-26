import { Play, Share2, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilmDetailTabs } from "../../components/film-detail-tabs";
import { SiteHeader } from "../../components/site-header";
import { SourceBadge } from "../../components/source-badge";
import { BookmarkButton } from "../../components/bookmark-button";
import { createSeoMetadata } from "../../lib/seo";
import { getFilm } from "../../lib/services/film-service";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";


const getSearchValue = (
  value: string | string[] | undefined,
  fallback = "",
): string => (Array.isArray(value) ? value[0] || fallback : value || fallback);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const film = await getFilm(slug);

  if (!film) {
    return {
      title: "Không tìm thấy anime | ANIMEKUN",
    };
  }

  return createSeoMetadata({
    title: `${film.name} | ANIMEKUN`,
    description: film.description || `Xem thông tin anime ${film.name} tại ANIMEKUN.`,
    path: `/phim/${slug}`,
    image: film.posterUrl || film.thumbUrl,
  });
}

export default async function FilmPage({
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
  const selectedEpisode =
    film.episodes.find((episode) => episode.slug === selectedEpisodeSlug) ||
    film.episodes[0];
  const bannerImage = film.posterUrl || film.thumbUrl;
  const displayRating = film.tmdbRating || film.imdbRating || "8.8";
  const watchHref = `/xem/${film.slug}${selectedEpisode ? `?ep=${selectedEpisode.slug}` : ""}`;

  return (
    <main className="min-h-screen bg-[#101013] text-white">
      <SiteHeader />
      <SourceBadge />

      <section className="relative overflow-x-hidden">
        <div className="absolute inset-x-0 top-0 h-[420px] sm:h-[500px] lg:h-[560px]">
          {bannerImage && (
            <Image
              src={bannerImage}
              alt={film.name}
              fill
              priority
              sizes="100vw"
              quality={95}
              unoptimized
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,16,19,.1)_0%,rgba(16,16,19,.45)_48%,#101013_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,16,19,.75)_0%,rgba(16,16,19,.16)_42%,rgba(16,16,19,.72)_100%)]" />
        </div>

        <div className="relative mx-auto max-w-[104rem] px-4 pb-20 pt-28 sm:px-6 sm:pt-72 lg:px-8 lg:pt-80">
          <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
            <aside className="p-0 text-center lg:rounded-xl lg:bg-[#17171b]/95 lg:p-6 lg:text-left lg:shadow-2xl lg:shadow-black/50 lg:ring-1 lg:ring-white/10 lg:backdrop-blur-md">
              <div className="relative mx-auto aspect-[2/3] w-32 overflow-hidden rounded-lg bg-zinc-900 shadow-2xl shadow-black/60 ring-1 ring-white/10 sm:w-48">
                {film.thumbUrl && (
                  <Image
                    src={film.thumbUrl}
                    alt={film.name}
                    fill
                    priority
                    sizes="(min-width: 1024px) 192px, 128px"
                    quality={95}
                    unoptimized
                    className="object-cover"
                  />
                )}
              </div>

              <h1 className="mx-auto mt-5 max-w-sm text-2xl font-bold leading-tight lg:max-w-none lg:text-3xl">
                {film.name}
              </h1>
              <p className="mt-2 text-sm font-semibold text-zinc-300 lg:mt-1 lg:text-red-400">
                {film.originalName || film.name}
              </p>

              <details className="mx-auto mt-5 max-w-sm lg:hidden">
                <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-red-400 marker:hidden">
                  Thông tin phim
                  <span aria-hidden="true">⌄</span>
                </summary>
                <div className="mt-4 rounded-lg border border-white/10 bg-black/25 p-4 text-left">
                  <p className="line-clamp-4 text-sm leading-6 text-zinc-300">
                    {film.description || "Đang cập nhật nội dung."}
                  </p>
                </div>
              </details>

              <div className="mt-4 hidden flex-wrap gap-2 text-xs font-bold lg:flex">
                {[film.quality, film.language, film.currentEpisode, film.time].filter(Boolean).map((item) => (
                  <span key={item} className="rounded bg-white/10 px-2 py-1 text-zinc-100">
                    {item}
                  </span>
                ))}
                {displayRating && (
                  <span className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-zinc-100">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                    {displayRating}
                  </span>
                )}
              </div>

              <div className="mt-4 hidden flex-wrap gap-2 lg:flex">
                {film.categories.slice(0, 6).map((category) => (
                  <span
                    key={category}
                    className="rounded bg-white/10 px-2.5 py-1 text-xs font-semibold text-zinc-200"
                  >
                    {category}
                  </span>
                ))}
              </div>

              <div className="mt-6 hidden lg:block">
                <h2 className="text-sm font-bold">Giới thiệu:</h2>
                <p className="mt-2 line-clamp-6 text-sm leading-6 text-zinc-300">
                  {film.description || "Đang cập nhật nội dung."}
                </p>
              </div>

              <dl className="mt-5 hidden space-y-3 text-sm lg:block">
                {[
                  ["Số tập", film.totalEpisodes],
                  ["Quốc gia", film.countries.join(", ")],
                  ["Đạo diễn", film.director],
                  ["Diễn viên", film.casts],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[78px_1fr] gap-3">
                    <dt className="font-bold text-white">{label}:</dt>
                    <dd className="line-clamp-1 text-zinc-300">{value || "Đang cập nhật"}</dd>
                  </div>
                ))}
              </dl>
            </aside>

            <section className="p-0 lg:min-h-[430px] lg:rounded-xl lg:bg-[#17171b]/95 lg:p-6 lg:shadow-2xl lg:shadow-black/50 lg:ring-1 lg:ring-white/10 lg:backdrop-blur-md">
              <div className="flex flex-col gap-5 border-b border-white/10 pb-5 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-4">
                <div className="flex flex-col items-center gap-5 lg:flex-row lg:flex-wrap">
                  <Link
                    href={watchHref}
                    className="inline-flex h-14 w-full max-w-[320px] items-center justify-center gap-4 rounded-full bg-gradient-to-r from-red-600 to-red-400 px-7 text-base font-bold text-white shadow-[0_0_26px_rgba(220,38,38,.32)] transition hover:scale-105 lg:h-12 lg:w-auto lg:text-sm"
                  >
                    <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                    Xem Ngay
                  </Link>

                  <div className="grid w-full max-w-[320px] grid-cols-3 items-start gap-3 lg:flex lg:w-auto lg:max-w-none lg:gap-5">
                    <BookmarkButton
                      filmSlug={film.slug}
                      filmName={film.name}
                      filmThumbUrl={film.thumbUrl}
                      filmPosterUrl={film.posterUrl || film.thumbUrl}
                    />
                    <button
                      type="button"
                      className="group inline-flex min-w-12 flex-col items-center gap-1 text-xs font-bold text-white transition hover:text-red-400"
                      aria-label="Chia sẻ"
                    >
                      <Share2 className="h-5 w-5 transition group-hover:scale-110" aria-hidden="true" />
                      <span>Chia sẻ</span>
                    </button>
                    <div className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-red-600 px-3 text-sm font-bold text-white lg:hidden">
                      <Star className="h-5 w-5 fill-white" aria-hidden="true" />
                      {displayRating}
                    </div>
                  </div>
                </div>

                <div className="hidden items-center gap-3 rounded-full bg-white/5 px-3 py-2 text-sm font-bold ring-1 ring-white/10 lg:inline-flex">
                  <span className="rounded bg-yellow-400 px-2 py-0.5 text-xs text-black">IMDb</span>
                  <span>{displayRating}</span>
                  <span className="text-xs font-semibold text-zinc-400">Đánh giá</span>
                </div>
              </div>

              <FilmDetailTabs
                filmSlug={film.slug}
                episodes={film.episodes}
                selectedEpisodeSlug={selectedEpisode?.slug || ""}
                selectedServerName={selectedEpisode?.serverName || ""}
                language={film.language}
                casts={film.casts}
              />
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
