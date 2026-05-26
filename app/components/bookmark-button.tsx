"use client";

import { useEffect, useState } from "react";
import { Heart, Plus, Check } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import { useRouter } from "next/navigation";

type BookmarkButtonProps = {
  filmSlug: string;
  filmName: string;
  filmThumbUrl: string;
  filmPosterUrl: string;
};

export function BookmarkButton({
  filmSlug,
  filmName,
  filmThumbUrl,
  filmPosterUrl,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        // Fallback to localStorage if guest
        const local = localStorage.getItem("animekun:library");
        const list = local ? JSON.parse(local) : [];
        setIsBookmarked(list.some((item: any) => item.slug === filmSlug));
        setLoading(false);
        return;
      }

      // Check in Supabase table "bookmarks"
      const { data, error } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("film_slug", filmSlug)
        .maybeSingle();

      if (data) {
        setIsBookmarked(true);
      }
      setLoading(false);
    }
    checkStatus();
  }, [filmSlug, supabase]);

  const toggleBookmark = async () => {
    if (loading) return;

    if (!user) {
      // LocalStorage for non-authenticated users
      const local = localStorage.getItem("animekun:library");
      let list = local ? JSON.parse(local) : [];
      const exists = list.some((item: any) => item.slug === filmSlug);

      if (exists) {
        list = list.filter((item: any) => item.slug !== filmSlug);
        setIsBookmarked(false);
      } else {
        list.push({
          slug: filmSlug,
          name: filmName,
          thumbUrl: filmThumbUrl,
          posterUrl: filmPosterUrl,
          addedAt: Date.now(),
        });
        setIsBookmarked(true);
      }
      localStorage.setItem("animekun:library", JSON.stringify(list));
      window.dispatchEvent(new Event("animekun:library-updated"));
      return;
    }

    setLoading(true);
    if (isBookmarked) {
      // Delete from Supabase
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("film_slug", filmSlug);

      if (!error) {
        setIsBookmarked(false);
      }
    } else {
      // Insert to Supabase
      const { error } = await supabase.from("bookmarks").insert({
        user_id: user.id,
        film_slug: filmSlug,
        film_name: filmName,
        film_thumb_url: filmThumbUrl,
        film_poster_url: filmPosterUrl,
      });

      if (!error) {
        setIsBookmarked(true);
      } else {
        console.error("Lỗi khi thêm bookmark:", error.message);
      }
    }
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={toggleBookmark}
      className={`group inline-flex min-w-12 flex-col items-center gap-1 text-xs font-bold transition ${
        isBookmarked ? "text-red-500" : "text-white hover:text-red-400"
      }`}
      aria-label="Yêu thích"
    >
      <div className="relative">
        {isBookmarked ? (
          <Heart className="h-5 w-5 fill-current transition group-hover:scale-110" aria-hidden="true" />
        ) : (
          <Plus className="h-5 w-5 transition group-hover:scale-110" aria-hidden="true" />
        )}
      </div>
      <span>{isBookmarked ? "Đã lưu" : "Thêm vào"}</span>
    </button>
  );
}
