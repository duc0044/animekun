import { SiteHeader } from "../components/site-header";
import { ScheduleSection } from "../components/schedule-section";

import { getFilm, getFilms } from "../lib/services/film-service";

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



export default async function SchedulePage() {
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
  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-8 lg:px-10">
      <SiteHeader />
      {heroFilms.length > 0 && (
        <div className="mt-12 w-full">
          <ScheduleSection films={latest.films} />
        </div>
      )}
    </main>
  );
}
