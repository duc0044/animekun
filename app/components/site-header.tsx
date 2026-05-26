import { cookies } from "next/headers";
import { FILM_API_SOURCE_COOKIE, type FilmApiSource } from "../lib/api/provider";
import { createClient } from "../lib/supabase/server";
import { SiteHeaderClient } from "./site-header-client";

const SOURCE_OPTIONS: FilmApiSource[] = ["ophim", "nguonc", "kkphim"];

export async function SiteHeader({ keyword = "" }: { keyword?: string }) {
  const cookieStore = await cookies();
  const source = cookieStore.get(FILM_API_SOURCE_COOKIE)?.value;
  const initialSource = SOURCE_OPTIONS.includes(source as FilmApiSource)
    ? (source as FilmApiSource)
    : "ophim";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <SiteHeaderClient keyword={keyword} initialSource={initialSource} user={user} />;
}
