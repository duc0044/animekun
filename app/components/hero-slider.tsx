"use client";

import { ChevronLeft, ChevronRight, Heart, Info, Play, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Film } from "../lib/types/film";

const SWIPE_DISTANCE = 48;
const AUTO_PLAY_MS = 5000;

type HeroFilm = Film & {
  categories?: string[];
};

export function HeroSlider({ films }: { films: Film[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStartX = useRef<number | null>(null);
  const items = films.filter((film) => film.slug && film.name).slice(0, 6);
  const activeFilm = (items[activeIndex] || items[0]) as HeroFilm | undefined;
  const categories = Array.isArray(activeFilm?.categories)
    ? activeFilm.categories.slice(0, 3)
    : [];

  if (!activeFilm) {
    return null;
  }

  const goToPrevious = () => {
    setActiveIndex((index) => (index === 0 ? items.length - 1 : index - 1));
  };

  const goToNext = () => {
    setActiveIndex((index) => (index + 1) % items.length);
  };

  useEffect(() => {
    if (items.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % items.length);
    }, AUTO_PLAY_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [items.length]);

  useEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, items.length]);

  const handlePointerUp = (clientX: number) => {
    if (pointerStartX.current == null) {
      return;
    }

    const distance = clientX - pointerStartX.current;
    pointerStartX.current = null;

    if (Math.abs(distance) < SWIPE_DISTANCE) {
      return;
    }

    if (distance > 0) {
      goToPrevious();
    } else {
      goToNext();
    }
  };

  return (
    <section
      className="relative min-h-[560px] touch-pan-y overflow-hidden pt-20 md:min-h-[680px] md:pt-24"
      onPointerDown={(event) => {
        pointerStartX.current = event.clientX;
      }}
      onPointerCancel={() => {
        pointerStartX.current = null;
      }}
      onPointerUp={(event) => handlePointerUp(event.clientX)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,.28),transparent_35%),linear-gradient(135deg,#10060a_0%,#05070f_48%,#020202_100%)]" />
      {items.map((film, index) => (
        <div
          key={film.slug}
          className={`absolute inset-0 transition-opacity duration-700 ${index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          aria-hidden={index !== activeIndex}
        >
          {(film.posterUrl || film.thumbUrl) && (
            <Image
              src={film.posterUrl || film.thumbUrl}
              alt={film.name}
              fill
              priority={index === 0}
              sizes="100vw"
              quality={95}
              unoptimized
              className="object-cover opacity-80"
            />
          )}
        </div>
      ))}

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(5,10,20,.94)_0%,rgba(5,10,20,.74)_28%,rgba(5,10,20,.25)_64%,rgba(5,10,20,.52)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,#050505_0%,rgba(5,8,15,.82)_14%,rgba(5,8,15,.18)_58%,rgba(5,8,15,.68)_100%)]" />

      <div className="relative mx-auto flex min-h-[460px] max-w-[96rem] items-center px-6 pb-24 sm:px-8 md:min-h-[560px] md:pb-20 lg:px-10 2xl:px-4">
        <div className="max-w-xl pt-6 sm:pt-8">
          <h1 className="max-w-3xl text-[30px] font-bold leading-[1.12] text-white sm:text-4xl lg:text-5xl">
            {activeFilm.name}
          </h1>

          <p className="mt-3 text-sm font-semibold text-red-400 sm:text-base">
            {activeFilm.originalName || activeFilm.name}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-zinc-100 sm:text-sm">
            <span className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-white">
              <span>TMDb</span>
              <Star className="h-3 w-3 fill-current" aria-hidden="true" />
            </span>
            {[activeFilm.quality, activeFilm.language, activeFilm.time, activeFilm.currentEpisode]
              .filter(Boolean)
              .slice(0, 4)
              .map((item) => (
                <span
                  key={item}
                  className="rounded bg-white/10 px-2 py-1 ring-1 ring-white/30"
                >
                  {item}
                </span>
              ))}
          </div>

          {categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="rounded bg-white/10 px-2.5 py-1 text-xs font-medium text-zinc-200"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          <p className="mt-5 line-clamp-3 max-w-2xl text-sm font-medium leading-6 text-zinc-100 sm:text-base sm:leading-7">
            {activeFilm.description || activeFilm.originalName}
          </p>

          <div className="mt-8 flex items-center gap-3">
            <Link
              href={`/phim/${activeFilm.slug}`}
              aria-label={`Xem anime ${activeFilm.name}`}
              className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_0_28px_rgba(220,38,38,.35)] transition hover:scale-105 hover:bg-red-500 sm:h-16 sm:w-16"
            >
              <Play className="ml-1 h-6 w-6 fill-current sm:h-7 sm:w-7" aria-hidden="true" />
            </Link>
            <div className="inline-flex overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur">
              <button
                type="button"
                aria-label="Yêu thích"
                className="flex h-12 w-14 items-center justify-center text-white transition hover:bg-white/10"
              >
                <Heart className="h-5 w-5 fill-current" aria-hidden="true" />
              </button>
              <div className="my-3 w-px bg-white/20" />
              <Link
                href={`/phim/${activeFilm.slug}`}
                aria-label={`Thông tin ${activeFilm.name}`}
                className="flex h-12 w-14 items-center justify-center text-white transition hover:bg-white/10"
              >
                <Info className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <>
          <div className="absolute inset-y-0 left-0 right-0 z-10 hidden items-center justify-between px-4 md:flex lg:px-6">
            <button
              type="button"
              onClick={goToPrevious}
              aria-label="Slide trước"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-black/65"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Slide sau"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-black/65"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 md:hidden">
            {items.map((film, index) => (
              <button
                key={film.slug}
                type="button"
                aria-label={`Chọn ${film.name}`}
                onClick={() => setActiveIndex(index)}
                className={`h-1 rounded-full transition ${index === activeIndex ? "w-8 bg-red-600" : "w-8 bg-white/35 hover:bg-white/65"
                  }`}
              />
            ))}
          </div>

          <div className="absolute bottom-10 right-6 z-10 hidden max-w-[42rem] gap-3 md:flex lg:right-10 2xl:right-[calc((100vw-96rem)/2)]">
            {items.map((film, index) => (
              <button
                key={film.slug}
                type="button"
                aria-label={`Chọn ${film.name}`}
                onClick={() => setActiveIndex(index)}
                className={`relative h-14 w-24 overflow-hidden rounded-md bg-zinc-900 ring-2 transition ${index === activeIndex
                  ? "scale-105 ring-white"
                  : "ring-transparent opacity-75 hover:opacity-100"
                  }`}
              >
                {(film.posterUrl || film.thumbUrl) && (
                  <Image
                    src={film.posterUrl || film.thumbUrl}
                    alt=""
                    fill
                    sizes="96px"
                    quality={80}
                    unoptimized
                    className="object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
