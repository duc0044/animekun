import { FilmBrowsePage } from "../../components/film-browse-page";
import { getPageNumber, titleFromSlug } from "../../lib/routes";

export const dynamic = "force-dynamic";

export default async function ListPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  return (
    <FilmBrowsePage
      title={titleFromSlug(slug)}
      heroLabel="Danh sách phim"
      page={getPageNumber(query.page)}
      kind="list"
      slug={slug}
      basePath={`/danh-sach/${slug}`}
      showHero={false}
    />
  );
}
