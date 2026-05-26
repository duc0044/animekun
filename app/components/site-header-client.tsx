"use client";

import { type User } from "@supabase/supabase-js";
import { Calendar, ChevronDown, Clapperboard, Home, LogOut, Play, Search, Tv, UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navGroups } from "../lib/navigation";
import { type FilmApiSource } from "../lib/api/provider";
import { signOut } from "../auth/actions";

const SOURCE_OPTIONS = [
  { label: "OPhim", value: "ophim" },
  { label: "NguonC", value: "nguonc" },
  { label: "KKPhim", value: "kkphim" },
] as const;

type SourceValue = (typeof SOURCE_OPTIONS)[number]["value"];

export function SiteHeaderClient({
  keyword = "",
  initialSource = "ophim",
  user,
}: {
  keyword?: string;
  initialSource?: FilmApiSource;
  user?: User | null;
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeNavGroup, setActiveNavGroup] = useState<string | null>(null);
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeSource] = useState<SourceValue>(initialSource as SourceValue);
  const pathname = usePathname();
  const mobileNavItems = [
    { label: "Trang chủ", href: "/", Icon: Home },
    { label: "Hoạt hình", href: "/the-loai/hoat-hinh", Icon: Tv },
    { label: "Hành động", href: "/the-loai/hanh-dong", Icon: Clapperboard },
    { label: "Lịch chiếu", href: "/lich-chieu", Icon: Calendar },
  ];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-[96rem] items-center gap-3 px-4 py-3 sm:px-6 md:gap-5 md:py-4 lg:px-6 2xl:px-4">
          <div className="flex min-w-0 flex-1 items-center justify-center gap-5 md:flex-none md:justify-start">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/70 text-white">
                <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
              </span>
              <span className="text-2xl font-black tracking-tight">
                <span className="text-red-500">ANIME</span>
                <span className="text-white">KUN</span>
              </span>
            </Link>

            <div className="relative hidden md:block">
              <button
                type="button"
                aria-label="Chọn nguồn phim"
                aria-expanded={isSourceOpen}
                onClick={() => {
                  setIsSourceOpen((value) => !value);
                  setActiveNavGroup(null);
                }}
                className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 hover:text-white"
              >
                Nguồn: {SOURCE_OPTIONS.find((item) => item.value === activeSource)?.label || "OPhim"}
                <ChevronDown className={`h-4 w-4 transition ${isSourceOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>

              {isSourceOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Đóng chọn nguồn"
                    className="fixed inset-0 z-30 cursor-default"
                    onClick={() => setIsSourceOpen(false)}
                  />
                  <div className="absolute left-0 top-12 z-40 w-44 overflow-hidden rounded-lg border border-white/10 bg-zinc-950 py-2 text-sm font-medium text-zinc-200 shadow-2xl shadow-black/70">
                    {SOURCE_OPTIONS.map((item) => (
                      <form key={item.value} action="/api/source" method="post">
                        <input type="hidden" name="source" value={item.value} />
                        <input type="hidden" name="next" value={pathname} />
                        <button
                          type="submit"
                          className={`block w-full px-4 py-3 text-left transition hover:bg-white/10 hover:text-white ${activeSource === item.value ? "text-red-400" : ""}`}
                        >
                          {item.label}
                        </button>
                      </form>
                    ))}
                  </div>
                </>
              )}
            </div>

            <nav className="hidden items-center gap-1 md:flex">
              {navGroups.map((group) => {
                const isActive = activeNavGroup === group.label;

                return (
                  <div key={group.label} className="relative">
                    <button
                      type="button"
                      aria-label={`Mở ${group.label}`}
                      aria-expanded={isActive}
                      onClick={() => setActiveNavGroup(isActive ? null : group.label)}
                      className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white lg:text-base"
                    >
                      {group.label}
                      <ChevronDown
                        className={`h-4 w-4 transition ${isActive ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </button>

                    {isActive && (
                      <>
                        <button
                          type="button"
                          aria-label={`Đóng ${group.label}`}
                          className="fixed inset-0 z-30 cursor-default"
                          onClick={() => setActiveNavGroup(null)}
                        />
                        <div className="absolute left-0 top-12 z-40 w-56 overflow-hidden rounded-lg border border-white/10 bg-zinc-950 py-2 text-sm font-medium text-zinc-200 shadow-2xl shadow-black/70">
                          {group.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setActiveNavGroup(null)}
                              className="block px-4 py-3 transition hover:bg-white/10 hover:text-white"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <form
            action="/tim-kiem"
            className="ml-auto hidden w-full items-center gap-2 md:flex md:max-w-xs"
          >
            <input
              name="q"
              defaultValue={keyword}
              placeholder="Tìm anime hoặc hoạt hình..."
              className="h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-red-500"
            />
            <button className="h-10 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-500">
              Tìm
            </button>
          </form>

          <div className="relative hidden md:block">
            {user ? (
              <>
                <button
                  type="button"
                  aria-label="Menu người dùng"
                  aria-expanded={isUserMenuOpen}
                  onClick={() => {
                    setIsUserMenuOpen((v) => !v);
                    setActiveNavGroup(null);
                    setIsSourceOpen(false);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-200 transition hover:bg-white/10 hover:text-white"
                >
                  <UserIcon className="h-5 w-5" />
                </button>

                {isUserMenuOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Đóng menu"
                      className="fixed inset-0 z-30 cursor-default"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-12 z-40 w-56 overflow-hidden rounded-lg border border-white/10 bg-zinc-950 py-2 text-sm font-medium text-zinc-200 shadow-2xl shadow-black/70">
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="truncate text-xs text-zinc-400">{user.email}</p>
                      </div>
                      <form action={signOut}>
                        <button
                          type="submit"
                          className="flex w-full items-center gap-2 px-4 py-3 text-left transition hover:bg-white/10 hover:text-white"
                        >
                          <LogOut className="h-4 w-4" />
                          Đăng xuất
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </>
            ) : (
              <Link
                href="/auth/login"
                className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 hover:text-white"
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden lg:inline">Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <form
        action="/tim-kiem"
        className={`fixed inset-x-4 top-[76px] z-50 rounded-2xl border border-white/10 bg-zinc-950/95 p-3 shadow-2xl shadow-black/70 backdrop-blur-md transition md:hidden ${isSearchOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
          }`}
      >
        <div className="flex items-center gap-3">
          <input
            name="q"
            defaultValue={keyword}
            placeholder="Tìm anime hoặc hoạt hình..."
            className="h-12 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/10 px-4 text-base text-white outline-none placeholder:text-zinc-500 focus:border-red-500"
          />
          <button className="h-12 rounded-lg bg-red-600 px-5 text-base font-bold text-white transition hover:bg-red-500">
            Tìm
          </button>
        </div>
      </form>

      {isSearchOpen && (
        <button
          type="button"
          aria-label="Đóng tìm kiếm"
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px] md:hidden"
          onClick={() => setIsSearchOpen(false)}
        />
      )}

      <nav className="fixed inset-x-4 bottom-3 z-40 grid h-14 grid-cols-4 items-center rounded-full border border-red-500/20 bg-zinc-950/95 px-2 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur-md md:hidden">
        {mobileNavItems.map(({ label, href, Icon }) => {
          const isActive =
            !isSearchOpen && (href === "/" ? pathname === href : pathname.startsWith(href));

          if (isActive) {
            return (
              <button
                key={href}
                type="button"
                aria-label={label}
                aria-current="page"
                className="flex h-11 items-center justify-center rounded-full bg-red-600 text-white transition"
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </button>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              onClick={() => {
                setIsSearchOpen(false);
              }}
              className="flex h-11 items-center justify-center rounded-full text-zinc-400 transition hover:text-red-400"
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </Link>
          );
        })}
        <button
          type="button"
          aria-label="Mở tìm kiếm"
          aria-expanded={isSearchOpen}
          onClick={() => setIsSearchOpen((value) => !value)}
          className={`flex h-11 items-center justify-center rounded-full transition ${isSearchOpen
              ? "bg-red-600 text-white shadow-[0_0_0_2px_rgba(255,255,255,.85)]"
              : "text-zinc-400 hover:text-red-400"
            }`}
        >
          <Search className="h-5 w-5" aria-hidden="true" />
        </button>
      </nav>
    </>
  );
}
