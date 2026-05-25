import { LockKeyhole } from "lucide-react";

export const metadata = {
  title: "Mở khóa ANIMEKUN",
};

export default async function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <form
        action="/api/unlock"
        method="post"
        className="w-full max-w-sm rounded-lg border border-white/10 bg-zinc-950 p-6 shadow-2xl shadow-red-950/20"
      >
        <input type="hidden" name="next" value={next || "/"} />
        <p className="text-sm font-medium uppercase text-red-400">
          Truy cập riêng tư
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Nhập key để vào web</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Trang này đang được khóa riêng. Nhập đúng key rồi tiếp tục xem anime.
        </p>
        <label htmlFor="access-key" className="mt-6 block text-sm font-medium text-zinc-200">
          Access key
        </label>
        <input
          id="access-key"
          name="key"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          placeholder="••••••••••"
          className="mt-2 w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
        />
        {error === "1" && (
          <p className="mt-3 text-sm font-medium text-red-400">Key không đúng, thử lại nhé.</p>
        )}
        <button
          type="submit"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          <LockKeyhole className="h-4 w-4" aria-hidden="true" />
          Mở khóa
        </button>
      </form>
    </main>
  );
}
