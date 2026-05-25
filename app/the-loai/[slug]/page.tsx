import { FilmBrowsePage } from "../../components/film-browse-page";
import { getPageNumber, titleFromSlug } from "../../lib/routes";

export const dynamic = "force-dynamic";

export default async function GenrePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  return (
    <FilmBrowsePage
      title={`Thể loại: ${titleFromSlug(slug)}`}
      heroLabel="Theo thể loại"
      page={getPageNumber(query.page)}
      kind="genre"
      slug={slug}
      basePath={`/the-loai/${slug}`}
      showHero={false}
    />
  );
}
