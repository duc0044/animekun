import { FilmBrowsePage } from "../../components/film-browse-page";
import { getPageNumber } from "../../lib/routes";

export const dynamic = "force-dynamic";

export default async function YearPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  return (
    <FilmBrowsePage
      title={`Năm phát hành: ${slug}`}
      heroLabel="Theo năm"
      page={getPageNumber(query.page)}
      kind="year"
      slug={slug}
      basePath={`/nam/${slug}`}
      showHero={false}
    />
  );
}
