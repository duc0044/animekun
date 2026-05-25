"use client";

import { useMemo, useState } from "react";
import { FilmCard } from "./film-card";
import type { Film } from "../lib/types/film";

const DAYS_OF_WEEK = [
  { label: "Thứ Hai", short: "T2" },
  { label: "Thứ Ba", short: "T3" },
  { label: "Thứ Tư", short: "T4" },
  { label: "Thứ Năm", short: "T5" },
  { label: "Thứ Sáu", short: "T6" },
  { label: "Thứ Bảy", short: "T7" },
  { label: "Chủ Nhật", short: "CN" },
];

function getCurrentDayIndex(): number {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

function getDayOfWeekIndex(slug: string): number {
  let hash = 0;

  for (let index = 0; index < slug.length; index += 1) {
    hash += slug.charCodeAt(index);
  }

  return hash % 7;
}

function getAirTime(slug: string): string {
  let hash = 0;

  for (let index = 0; index < slug.length; index += 1) {
    hash += slug.charCodeAt(index) * (index + 1);
  }

  const hours = [18, 19, 20, 21, 22];
  const minutes = ["00", "15", "30", "45"];
  return `${hours[hash % hours.length]}:${minutes[hash % minutes.length]}`;
}

export function ScheduleSection({ films }: { films: Film[] }) {
  const [activeDayIndex, setActiveDayIndex] = useState(getCurrentDayIndex());
  const scheduleData = useMemo(() => {
    const buckets: Film[][] = Array.from({ length: 7 }, () => []);

    films.forEach((film) => {
      if (film.slug) {
        buckets[getDayOfWeekIndex(film.slug)].push(film);
      }
    });

    buckets.forEach((items) => {
      items.sort((first, second) => getAirTime(first.slug).localeCompare(getAirTime(second.slug)));
    });

    return buckets;
  }, [films]);
  const activeDayFilms = scheduleData[activeDayIndex] || [];

  if (films.length === 0) {
    return null;
  }

  return (
    <section className="p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase text-red-400">Cập nhật tự động</p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Lịch Chiếu Hoạt Hình</h2>
        </div>
        <p className="text-sm text-zinc-400">Lịch chiếu được phân theo ngày từ danh sách anime hiện có.</p>
      </div>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
        {DAYS_OF_WEEK.map((day, index) => {
          const isActive = activeDayIndex === index;
          const isToday = index === getCurrentDayIndex();

          return (
            <button
              key={day.short}
              type="button"
              onClick={() => setActiveDayIndex(index)}
              className={`relative shrink-0 rounded-xl px-4 py-3 text-left transition ${isActive
                ? "bg-red-600 text-white"
                : "bg-white/5 text-zinc-300 ring-1 ring-white/10 hover:bg-white/10"
                }`}
            >
              <span className="block text-xs font-bold uppercase">{day.short}</span>
              <span className="mt-1 block text-sm font-medium">{day.label}</span>
              {isToday && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-white" />}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {activeDayFilms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 bg-black/20 px-4 py-8 text-center text-zinc-400">
            Hôm nay chưa có lịch chiếu hiển thị. Hãy chọn ngày khác.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {activeDayFilms.slice(0, 12).map((film) => (
              <div key={film.slug} className="space-y-2">
                <div className="inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                  {getAirTime(film.slug)}
                </div>
                <FilmCard film={film} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
