import { LoaderCircle } from "lucide-react";

export function PageLoading() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-3 sm:px-6 md:py-4 lg:px-8">
          <div className="h-8 w-36 rounded bg-red-600/80" />
          <div className="hidden h-8 w-64 rounded bg-white/10 md:block" />
          <div className="ml-auto hidden h-10 w-80 rounded-lg bg-white/10 md:block" />
        </div>
      </div>

      <section className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(39,39,42,.5),#000_72%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <div className="flex max-w-xl flex-col gap-4">
            <div className="h-5 w-32 animate-pulse rounded bg-red-600/70" />
            <div className="h-12 w-full animate-pulse rounded bg-white/15" />
            <div className="h-12 w-3/4 animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-white/10" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-white/10" />
            <div className="mt-4 flex items-center gap-3 text-sm font-medium text-zinc-300">
              <LoaderCircle className="h-5 w-5 animate-spin text-red-500" aria-hidden="true" />
              Đang tải dữ liệu phim...
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-5 px-4 pb-20 sm:px-6 lg:px-8">
        <div className="h-8 w-48 animate-pulse rounded bg-white/15" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg bg-zinc-950 ring-1 ring-white/10"
            >
              <div className="aspect-[2/3] animate-pulse bg-white/10" />
              <div className="space-y-2 p-3">
                <div className="h-4 animate-pulse rounded bg-white/15" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
