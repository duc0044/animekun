"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { Heart, Trash2 } from "lucide-react";

type LibraryItem = {
  slug: string;
  name: string;
  thumbUrl: string;
  posterUrl: string;
};

export function LibraryWatchlist() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  const fetchItems = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (!user) {
      // LocalStorage bookmarks
      const local = localStorage.getItem("animekun:library");
      setItems(local ? JSON.parse(local) : []);
      setLoading(false);
      return;
    }

    // Supabase bookmarks
    const { data, error } = await supabase
      .from("bookmarks")
      .select("film_slug, film_name, film_thumb_url, film_poster_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data && !error) {
      setItems(
        data.map((item: any) => ({
          slug: item.film_slug,
          name: item.film_name,
          thumbUrl: item.film_thumb_url,
          posterUrl: item.film_poster_url,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    // Listen to auth changes (this fires automatically with INITIAL_SESSION on mount)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      setLoading(true);
      if (!currentUser) {
        const local = localStorage.getItem("animekun:library");
        setItems(local ? JSON.parse(local) : []);
        setLoading(false);
      } else {
        supabase
          .from("bookmarks")
          .select("film_slug, film_name, film_thumb_url, film_poster_url")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .then(({ data, error }) => {
            if (!isMounted) return;
            if (error) {
              console.warn("Lỗi Supabase khi tải thư viện, chuyển sang LocalStorage.");
              const local = localStorage.getItem("animekun:library");
              setItems(local ? JSON.parse(local) : []);
            } else if (data) {
              setItems(
                data.map((item: any) => ({
                  slug: item.film_slug,
                  name: item.film_name,
                  thumbUrl: item.film_thumb_url,
                  posterUrl: item.film_poster_url,
                }))
              );
            }
            setLoading(false);
          });
      }
    });

    const handleLocalUpdate = () => {
      const local = localStorage.getItem("animekun:library");
      setItems(local ? JSON.parse(local) : []);
    };

    window.addEventListener("animekun:library-updated", handleLocalUpdate);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener("animekun:library-updated", handleLocalUpdate);
    };
  }, []);

  const removeBookmark = async (slug: string) => {
    if (!user) {
      const local = localStorage.getItem("animekun:library");
      let list = local ? JSON.parse(local) : [];
      list = list.filter((item: any) => item.slug !== slug);
      localStorage.setItem("animekun:library", JSON.stringify(list));
      setItems(list);
      window.dispatchEvent(new Event("animekun:library-updated"));
      return;
    }

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("film_slug", slug);

    if (!error) {
      setItems((prev) => prev.filter((item) => item.slug !== slug));
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-zinc-950/40 py-16 text-center backdrop-blur-sm">
        <Heart className="h-12 w-12 text-zinc-600" />
        <h3 className="mt-4 text-lg font-bold text-white">Thư viện trống</h3>
        <p className="mt-2 text-sm text-zinc-500 max-w-xs">
          Bạn chưa thêm bộ phim nào vào danh sách yêu thích. Hãy chọn nút "Thêm vào" khi xem phim.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-6 text-sm font-semibold text-white transition hover:bg-red-500"
        >
          Khám phá anime
        </Link>
      </div>
    );
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
        Danh Sách Yêu Thích
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {items.map((item) => (
          <div
            key={item.slug}
            className="group relative flex flex-col rounded-xl overflow-hidden bg-zinc-900/50 border border-white/5 transition duration-300 hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]"
          >
            <Link href={`/phim/${item.slug}`} className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
              {(item.thumbUrl || item.posterUrl) && (
                <Image
                  src={item.thumbUrl || item.posterUrl}
                  alt={item.name}
                  fill
                  sizes="(min-width: 1024px) 150px, 120px"
                  quality={90}
                  unoptimized
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              )}
            </Link>

            <button
              onClick={() => removeBookmark(item.slug)}
              className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-zinc-300 backdrop-blur-sm transition hover:bg-red-600 hover:text-white"
              title="Xóa khỏi thư viện"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <div className="p-3">
              <Link href={`/phim/${item.slug}`}>
                <h3 className="line-clamp-2 text-sm font-semibold text-white hover:text-red-400 transition">
                  {item.name}
                </h3>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
