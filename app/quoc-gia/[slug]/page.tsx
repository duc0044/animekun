import { FilmBrowsePage } from "../../components/film-browse-page";
import { getPageNumber, titleFromSlug } from "../../lib/routes";

export const dynamic = "force-dynamic";

export default async function CountryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  return (
    <FilmBrowsePage
      title={`Quốc gia: ${titleFromSlug(slug)}`}
      heroLabel="Theo quốc gia"
      page={getPageNumber(query.page)}
      kind="country"
      slug={slug}
      basePath={`/quoc-gia/${slug}`}
      showHero={false}
    />
  );
}
