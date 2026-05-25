import { FilmBrowsePage } from "../components/film-browse-page";
import { getPageNumber, getSearchValue } from "../lib/routes";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const keyword = getSearchValue(params.q);

  return (
    <FilmBrowsePage
      title={keyword ? `Tìm kiếm: ${keyword}` : "Tìm kiếm phim"}
      heroLabel="Kết quả tìm kiếm"
      page={getPageNumber(params.page)}
      keyword={keyword}
      basePath="/tim-kiem"
      showHero={false}
    />
  );
}
