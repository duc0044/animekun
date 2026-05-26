import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { navItems } from "../lib/navigation";
import { getFilms } from "../lib/services/film-service";
import { FilmCard } from "./film-card";
import { SiteHeader } from "./site-header";
import { SourceBadge } from "./source-badge";


type BrowseKind = "new" | "list" | "genre" | "country" | "year";

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <p className="text-sm font-medium uppercase text-red-400">
        {subtitle}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
    </div>
  );
}

export async function FilmBrowsePage({
  title,
  heroLabel = "Đang nổi bật",
  page,
  kind = "new",
  slug = "",
  keyword = "",
  basePath = "/",
  showHero = true,
}: {
  title: string;
  heroLabel?: string;
  page: number;
  kind?: BrowseKind;
  slug?: string;
  keyword?: string;
  basePath?: string;
  showHero?: boolean;
}) {
  const { films, totalPage, totalItems } = await getFilms({
    page,
    kind,
    slug,
    keyword,
    pageSize: 24,
  });
  const hero = films[0];
  const featured = films.slice(1, 6);
  const pageHref = (nextPage: number) => {
    const query = new URLSearchParams();

    if (keyword) {
      query.set("q", keyword);
    }

    query.set("page", String(nextPage));
    return `${basePath}?${query.toString()}`;
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteHeader keyword={keyword} />
      <SourceBadge />

      {showHero && hero ? (
        <section className="relative min-h-[520px] overflow-hidden pt-20 md:min-h-[680px] md:pt-24">
          {(hero.posterUrl || hero.thumbUrl) && (
            <Image
              src={hero.posterUrl || hero.thumbUrl}
              alt={hero.name}
              fill
              priority
              sizes="100vw"
              quality={95}
              unoptimized
              className="object-cover opacity-50"
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,#000_8%,rgba(0,0,0,.45)_45%,rgba(0,0,0,.75)_100%)]" />
          <div className="relative mx-auto grid max-w-[96rem] gap-8 px-4 pb-16 pt-12 sm:px-6 md:pb-24 md:pt-24 lg:grid-cols-[1fr_420px] lg:px-6 2xl:px-4">
            <div className="max-w-3xl self-end">
              <p className="text-sm font-medium uppercase text-red-400">
                {heroLabel}
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.12] text-white sm:text-5xl lg:text-[64px]">
                {hero.name}
              </h1>
              <p className="mt-4 text-lg font-normal text-zinc-300">{hero.originalName}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-medium">
                {[hero.quality, hero.language, hero.currentEpisode, hero.time]
                  .filter(Boolean)
                  .map((item) => (
                    <span key={item} className="rounded-md bg-white/10 px-3 py-1.5 text-zinc-100 ring-1 ring-white/10">
                      {item}
                    </span>
                  ))}
              </div>
              <p className="mt-6 line-clamp-4 max-w-3xl text-base font-normal leading-8 text-zinc-200 sm:text-lg">
                {hero.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/phim/${hero.slug}`}
                  className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  Xem ngay
                </Link>
                <Link
                  href="#catalog"
                  className="rounded-lg bg-white/10 px-6 py-3 text-sm font-medium text-white ring-1 ring-white/10 transition hover:bg-white/15"
                >
                  Duyệt thư viện
                </Link>
              </div>
            </div>
            <div className="hidden self-end lg:block">
              <div className="grid grid-cols-2 gap-3">
                {featured.slice(0, 4).map((film) => (
                  <FilmCard key={film.slug} film={film} />
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : !hero ? (
        <section className="mx-auto max-w-[96rem] px-4 pb-20 pt-20 sm:px-6 md:pt-32 lg:px-6 2xl:px-4">
          <div className="rounded-lg border border-white/10 bg-zinc-950 p-8">
            <h1 className="text-3xl font-bold">Không tìm thấy nội dung</h1>
            <p className="mt-3 text-zinc-400">
              Thử từ khóa khác hoặc quay lại danh sách anime mới cập nhật.
            </p>
          </div>
        </section>
      ) : null}

      <section
        id="catalog"
        className={`mx-auto max-w-[96rem] px-4 pb-20 sm:px-6 lg:px-6 2xl:px-4 ${
          showHero ? "" : "pt-24 md:pt-28"
        }`}
      >
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionTitle
            subtitle={`${totalItems.toLocaleString("vi-VN")} tựa`}
            title={title}
          />
          <div className="smooth-scroll-x no-scrollbar flex gap-2 overflow-x-auto pb-1 text-sm font-medium text-zinc-300">
            {navItems.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-lg bg-white/10 px-3 py-2 ring-1 ring-white/10 transition hover:bg-white/20"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {films.map((film, index) => (
            <FilmCard key={film.slug} film={film} priority={index < 2} />
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          {page > 1 && (
            <Link
              href={pageHref(page - 1)}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium ring-1 ring-white/10 transition hover:bg-zinc-800"
            >
              Trang trước
            </Link>
          )}
          <span className="rounded-lg bg-white/10 px-4 py-2 text-sm text-zinc-300">
            Trang {page} / {totalPage}
          </span>
          {page < totalPage && (
            <Link
              href={pageHref(page + 1)}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium transition hover:bg-red-500"
            >
              Trang sau
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
