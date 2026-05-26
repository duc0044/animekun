import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Clapperboard,
  Flame,
  Ghost,
  Heart,
  Info,
  MonitorPlay,
  Play,
  ScrollText,
  Shield,
  Sparkles,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { ContinueWatching } from "./components/continue-watching";
import { DragScroll } from "./components/drag-scroll";
import { HeroSlider } from "./components/hero-slider";
import { HomeClientFallback } from "./components/home-client-fallback";
import { ScheduleSection } from "./components/schedule-section";
import { SiteHeader } from "./components/site-header";
import { SourceBadge } from "./components/source-badge";
import { getFilm, getFilms } from "./lib/services/film-service";
import type { Film } from "./lib/types/film";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const genreSections = [
  { title: "Hoạt hình", slug: "hoat-hinh", accent: "Anime và hoạt họa" },
  { title: "Hành động", slug: "hanh-dong", accent: "Trận chiến và cao trào" },
  { title: "Phiêu lưu", slug: "phieu-luu", accent: "Hành trình và thế giới rộng mở" },
  { title: "Viễn tưởng", slug: "vien-tuong", accent: "Siêu năng lực và tương lai" },
  { title: "Hài hước", slug: "hai-huoc", accent: "Nhẹ nhàng và giải trí" },
];

const countrySections = [
  { title: "Anime Nhật Bản", slug: "nhat-ban", accent: "Shounen, seinen, slice of life" },
  { title: "Hoạt hình Trung Quốc", slug: "trung-quoc", accent: "Donghua nổi bật" },
];

function FilmHoverPanel({
  film,
  align = "center",
  placement = "above",
}: {
  film: Film;
  align?: "left" | "center" | "right";
  placement?: "above" | "below" | "row";
}) {
  const badges = [
    film.tmdbRating ? `IMDb ${film.tmdbRating}` : "",
    film.quality,
    film.language,
    film.time,
    film.currentEpisode,
  ].filter(Boolean);
  const meta = [film.countries[0], film.director, film.casts.split(", ")[0]]
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div
      className={`pointer-events-none absolute z-50 hidden opacity-0 transition duration-300 group-hover:opacity-100 group-focus-within:opacity-100 md:block ${placement === "row" ? "w-[340px]" : "w-[min(400px,calc(100vw-32px))]"
        } ${placement === "row"
          ? "top-10 translate-y-2 group-hover:translate-y-0 group-focus-within:translate-y-0"
          : placement === "below"
            ? "top-full mt-3 translate-y-3 group-hover:translate-y-0 group-focus-within:translate-y-0"
            : "top-0 -translate-y-10 group-hover:-translate-y-16 group-focus-within:-translate-y-16"
        } ${align === "left"
          ? "left-0"
          : align === "right"
            ? "right-0"
            : "left-1/2 -translate-x-1/2"
        }`}
    >
      <div className="overflow-hidden rounded-xl bg-[#3a1620] shadow-2xl shadow-black/70 ring-1 ring-red-300/20">
        <Link href={`/phim/${film.slug}`} className="pointer-events-auto block">
          <div className="relative aspect-video bg-zinc-900">
            {(film.posterUrl || film.thumbUrl) && (
              <Image
                src={film.posterUrl || film.thumbUrl}
                alt={film.name}
                fill
                sizes="400px"
                quality={95}
                unoptimized
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#3a1620] via-[#3a1620]/50 to-transparent" />
          </div>
        </Link>

        <div className="-mt-16 p-4 pt-0">
          <Link href={`/phim/${film.slug}`} className="pointer-events-auto relative block">
            <h3 className="line-clamp-2 text-lg font-extrabold leading-6 text-white">
              {film.name}
            </h3>
            <p className="mt-1 truncate text-sm font-medium text-red-200">
              {film.originalName || film.language || "Vietsub"}
            </p>
          </Link>

          <div className={`mt-4 grid gap-2 ${placement === "row" ? "grid-cols-[1fr_82px_82px]" : "grid-cols-[1fr_100px_100px]"}`}>
            <Link
              href={`/xem/${film.slug}`}
              className="pointer-events-auto inline-flex h-9 items-center justify-center gap-2 rounded bg-red-600 px-3 text-xs font-bold text-white transition hover:bg-red-500"
            >
              <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              Xem ngay
            </Link>
            <button
              type="button"
              aria-label="Yêu thích"
              className="pointer-events-auto inline-flex h-9 items-center justify-center rounded border border-white/55 text-white transition hover:bg-white/10"
            >
              <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
            </button>
            <Link
              href={`/phim/${film.slug}`}
              aria-label={`Thông tin ${film.name}`}
              className="pointer-events-auto inline-flex h-9 items-center justify-center rounded border border-white/55 text-white transition hover:bg-white/10"
            >
              <Info className="h-4 w-4 fill-current" aria-hidden="true" />
            </Link>
          </div>

          {badges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {badges.slice(0, 5).map((badge, index) => (
                <span
                  key={`${film.slug}-${badge}`}
                  className={`rounded px-2 py-1 text-[11px] font-bold ${index === 0
                    ? "bg-black/30 text-red-200"
                    : index === 1
                      ? "bg-red-600 text-white"
                      : "border border-white/30 text-white"
                    }`}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          {meta.length > 0 && (
            <p className="mt-3 line-clamp-1 text-xs font-bold text-white/90">
              {meta.join(" • ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
function HorizontalFilmCard({
  film,
  priority = false,
  className = "",
  hoverAlign = "center",
}: {
  film: Film;
  priority?: boolean;
  className?: string;
  hoverAlign?: "left" | "center" | "right";
}) {
  return (
    <article className={`group relative block transition duration-300 hover:z-50 hover:-translate-y-1 ${className}`}>
      <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-white/10">
        {film.posterUrl ? (
          <Image
            src={film.posterUrl}
            alt={film.name}
            fill
            sizes="(max-width: 640px) 72vw, (max-width: 1024px) 44vw, 30vw"
            priority={priority}
            quality={95}
            unoptimized
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-900 px-4 text-center text-sm text-zinc-500">
            Chưa có ảnh
          </div>
        )}
        <Link href={`/phim/${film.slug}`} className="absolute inset-0" aria-label={film.name} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3 transition group-hover:opacity-0">
          <span className="rounded bg-zinc-800/85 px-2 py-1 text-xs font-semibold text-white">
            {film.currentEpisode || film.quality || "HD"}
          </span>
        </div>
      </div>
      <FilmHoverPanel film={film} align={hoverAlign} />
      <div className="space-y-1 px-1 pt-3">
        <Link
          href={`/phim/${film.slug}`}
          className="line-clamp-1 text-sm font-semibold leading-5 text-white transition hover:text-red-400"
        >
          {film.name}
        </Link>
        <p className="truncate text-xs text-zinc-400">
          {film.originalName || film.language || "Vietsub"}
        </p>
      </div>
    </article>
  );
}

function FilmSection({
  title,
  accent,
  href,
  films,
}: {
  title: string;
  accent: string;
  href: string;
  films: Film[];
}) {
  if (films.length === 0) {
    return null;
  }

  return (
    <section className="py-2 lg:rounded-lg lg:bg-zinc-950/80 lg:px-6 lg:py-8 lg:ring-1 lg:ring-white/5">
      <div className="grid gap-4 lg:grid-cols-[180px_1fr] lg:gap-6">
        <div className="flex items-center justify-between gap-4 px-2 lg:block lg:px-0">
          <div>
            <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-4xl">
              {title}
            </h2>
          </div>
          <Link
            href={href}
            aria-label={`Xem toàn bộ ${title}`}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-100 transition hover:bg-white/10 lg:mt-8 lg:h-auto lg:w-auto lg:justify-start lg:gap-2 lg:rounded-none lg:text-sm lg:font-medium"
          >
            <span className="hidden lg:inline">Xem toàn bộ</span>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="mt-7 hidden max-w-32 text-sm font-medium uppercase leading-5 text-red-400 lg:block">
            {accent}
          </p>
        </div>

        <div className="no-scrollbar smooth-scroll-x -mx-4 flex snap-x gap-5 overflow-x-auto px-6 pb-2 pt-4 sm:-mx-6 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:px-0 lg:pt-2">
          {films.slice(0, 5).map((film, index) => (
            <HorizontalFilmCard
              key={film.slug}
              film={film}
              priority={index < 2}
              hoverAlign={index === 0 ? "left" : index === 4 ? "right" : "center"}
              className="w-[230px] shrink-0 snap-start first:pl-2.5 sm:w-80 lg:w-auto lg:first:pl-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function InterestSection({
  cards,
}: {
  cards: {
    title: string;
    href: string;
    imageUrl: string;
    Icon: LucideIcon;
    tint: string;
  }[];
}) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white">Bạn đang quan tâm gì?</h2>
      <div className="no-scrollbar smooth-scroll-x mt-5 flex snap-x gap-4 overflow-x-auto pb-2 pr-4 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pr-0 xl:grid-cols-8">
        {cards.map(({ title, href, imageUrl, Icon, tint }) => (
          <Link
            key={`${title}-${href}`}
            href={href}
            className="group relative h-32 w-56 shrink-0 snap-start overflow-hidden rounded-lg bg-zinc-900 p-4 ring-1 ring-white/10 transition hover:-translate-y-1 hover:ring-red-500/50 lg:w-auto"
          >
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={title}
                fill
                sizes="(max-width: 1024px) 224px, 12vw"
                quality={90}
                unoptimized
                className="object-cover opacity-70 transition duration-500 group-hover:scale-105"
              />
            )}
            <div className={`absolute inset-0 bg-gradient-to-br ${tint}`} />
            <div className="relative flex h-full flex-col justify-between">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-black/30 text-white ring-1 ring-white/15 backdrop-blur">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-white drop-shadow">{title}</h3>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold uppercase text-white/90">
                  Xem ngay
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TopTenSection({ films }: { films: Film[] }) {
  if (films.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center gap-3 px-1">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
          TOP 10 <span className="text-red-500">ANIMEKUN</span>
        </h2>
        <span className="hidden h-5 w-px bg-white/15 sm:block" />
        <p className="hidden text-sm font-bold uppercase tracking-[0.22em] text-zinc-500 sm:block">
          Thịnh hành hôm nay
        </p>
      </div>

      <DragScroll className="no-scrollbar smooth-scroll-x -mx-4 mt-7 flex snap-x gap-5 overflow-x-auto px-5 pb-3 sm:-mx-6 sm:px-7 lg:mx-0 lg:px-1">
        {[...films]
          .sort((first, second) => second.view - first.view)
          .slice(0, 10)
          .map((film, index) => (
            <article
              key={film.slug}
              className="group relative w-44 shrink-0 snap-start transition hover:z-50 hover:-translate-y-1 sm:w-52 lg:w-56"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-900 shadow-2xl shadow-black/40 ring-1 ring-white/10">
                {film.thumbUrl || film.posterUrl ? (
                  <Image
                    src={film.thumbUrl || film.posterUrl}
                    alt={film.name}
                    fill
                    sizes="(max-width: 640px) 176px, 224px"
                    quality={92}
                    unoptimized
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-sm text-zinc-500">
                    Chưa có ảnh
                  </div>
                )}
                <Link href={`/phim/${film.slug}`} className="absolute inset-0" aria-label={film.name} />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 transition group-hover:opacity-0">
                  <div className="flex gap-1 text-[11px] font-black">
                    {film.language && (
                      <span className="rounded bg-zinc-800/90 px-2 py-1 text-white">
                        {film.language}
                      </span>
                    )}
                    {film.quality && (
                      <span className="rounded bg-red-600 px-2 py-1 text-white">
                        {film.quality}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <FilmHoverPanel
                film={film}
                align={index < 2 ? "left" : index > 7 ? "right" : "center"}
                placement="row"
              />
              <div className="mt-3 grid grid-cols-[32px_minmax(0,1fr)] gap-2">
                <span className="text-4xl font-black italic leading-none text-red-500">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <Link
                    href={`/phim/${film.slug}`}
                    className="line-clamp-1 text-sm font-bold text-white transition hover:text-red-400"
                  >
                    {film.name}
                  </Link>
                  <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
                    {film.originalName || film.currentEpisode || "ANIMEKUN"}
                  </p>
                </div>
              </div>
            </article>
          ))}
      </DragScroll>
    </section>
  );
}


export default async function Home() {
  const [latest, ...sectionResults] = await Promise.all([
    getFilms({ page: 1, kind: "genre", slug: "hoat-hinh", pageSize: 16 }),
    ...genreSections.map((section) =>
      getFilms({ page: 1, kind: "genre", slug: section.slug, pageSize: 6 }),
    ),
    ...countrySections.map((section) =>
      getFilms({ page: 1, kind: "country", slug: section.slug, pageSize: 6 }),
    ),
  ]);
  const heroFilms = (
    await Promise.all(
      latest.films.slice(0, 4).map(async (film) => (await getFilm(film.slug)) || film),
    )
  ).filter((film) => film.slug && film.name);
  const genreResults = sectionResults.slice(0, genreSections.length);
  const countryResults = sectionResults.slice(genreSections.length);
  const interestCards = [
    {
      title: "Hot Rần Rần",
      href: "/the-loai/hoat-hinh",
      imageUrl: latest.films[4]?.posterUrl || latest.films[4]?.thumbUrl || "",
      Icon: Flame,
      tint: "from-red-700/80 via-red-600/35 to-black/10",
    },
    {
      title: "Nhật Bản",
      href: "/quoc-gia/nhat-ban",
      imageUrl: countryResults[0]?.films[0]?.posterUrl || countryResults[0]?.films[0]?.thumbUrl || "",
      Icon: Clapperboard,
      tint: "from-blue-700/80 via-indigo-600/35 to-black/10",
    },
    {
      title: "Phiêu Lưu",
      href: "/the-loai/phieu-luu",
      imageUrl: genreResults[2]?.films[0]?.posterUrl || genreResults[2]?.films[0]?.thumbUrl || "",
      Icon: ScrollText,
      tint: "from-violet-700/80 via-fuchsia-600/30 to-black/10",
    },
    {
      title: "Thuyết Minh",
      href: "/tim-kiem?q=thuy%E1%BA%BFt%20minh",
      imageUrl: genreResults[0]?.films[0]?.posterUrl || genreResults[0]?.films[0]?.thumbUrl || "",
      Icon: Volume2,
      tint: "from-emerald-700/80 via-emerald-500/35 to-black/10",
    },
    {
      title: "Hành Động",
      href: "/the-loai/hanh-dong",
      imageUrl: genreResults[1]?.films[1]?.posterUrl || genreResults[1]?.films[1]?.thumbUrl || "",
      Icon: MonitorPlay,
      tint: "from-orange-700/80 via-orange-500/35 to-black/10",
    },
    {
      title: "Viễn Tưởng",
      href: "/the-loai/vien-tuong",
      imageUrl: latest.films[5]?.posterUrl || latest.films[5]?.thumbUrl || "",
      Icon: Ghost,
      tint: "from-red-950/90 via-red-800/35 to-black/20",
    },
    {
      title: "Donghua",
      href: "/quoc-gia/trung-quoc",
      imageUrl: countryResults[1]?.films[0]?.posterUrl || countryResults[1]?.films[0]?.thumbUrl || "",
      Icon: Shield,
      tint: "from-orange-800/85 via-red-600/30 to-black/10",
    },
    {
      title: "Hoạt Hình",
      href: "/the-loai/hoat-hinh",
      imageUrl: genreResults[0]?.films[0]?.posterUrl || genreResults[0]?.films[0]?.thumbUrl || "",
      Icon: Sparkles,
      tint: "from-cyan-700/80 via-teal-500/35 to-black/10",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteHeader />
      <SourceBadge />

      {heroFilms.length > 0 ? (
        <HeroSlider films={heroFilms} />
      ) : (
        <HomeClientFallback />
      )}

      {heroFilms.length > 0 && (
        <div className="mx-auto max-w-[96rem] space-y-14 px-4 pb-20 pt-8 sm:px-6 sm:pt-10 lg:space-y-12 lg:px-6 2xl:px-4">
          <TopTenSection films={latest.films} />
          {/* <ContinueWatching /> */}
          {/* <ScheduleSection films={latest.films} /> */}
          <InterestSection cards={interestCards} />

          <FilmSection
            title="Mới cập nhật"
            accent="Anime mới lên sóng"
            href="/the-loai/hoat-hinh"
            films={latest.films.slice(4)}
          />

          {genreSections.map((section, index) => (
            <FilmSection
              key={section.slug}
              title={section.title}
              accent={section.accent}
              href={`/the-loai/${section.slug}`}
              films={genreResults[index]?.films || []}
            />
          ))}

          {countrySections.map((section, index) => (
            <FilmSection
              key={section.slug}
              title={section.title}
              accent={section.accent}
              href={`/quoc-gia/${section.slug}`}
              films={countryResults[index]?.films || []}
            />
          ))}
        </div>
      )}
    </main>
  );
}
