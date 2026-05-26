"use client";

import { Clapperboard, Mail, ShieldCheck, Sparkles, Stars } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { signInWithEmail, signInWithProvider, signUpWithEmail } from "./actions";

type Props = {
  mode: "login" | "register";
  error?: string;
  checkEmail?: boolean;
};

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

const GithubIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

const DiscordIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 127.14 96.36" fill="currentColor">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,52.88,6.83,77.19,77.19,0,0,0,49.58,0,105.15,105.15,0,0,0,19.14,8.07C-3,41.25-3.3,93.59,19.14,96.36a107.12,107.12,0,0,0,32.44,16.4,81.13,81.13,0,0,0,6.83-11.13,71.74,71.74,0,0,1-10.75-5.12c.9-.66,1.8-1.37,2.65-2.12a76.43,76.43,0,0,0,53.48,0c.85.75,1.75,1.46,2.65,2.12a71.74,71.74,0,0,1-10.75,5.12,81.13,81.13,0,0,0,6.83,11.13,107.12,107.12,0,0,0,32.44-16.4C130.44,93.59,130.14,41.25,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.23,60,73.23,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
  </svg>
);

const PROVIDERS = [
  { provider: "google" as const, label: "Google", icon: <GoogleIcon /> },
  { provider: "github" as const, label: "GitHub", icon: <GithubIcon /> },
  { provider: "discord" as const, label: "Discord", icon: <DiscordIcon /> },
];

const HIGHLIGHTS = [
  {
    icon: <Sparkles className="h-4 w-4" />,
    title: "Anime tuyển chọn",
    description: "Theo dõi series hot, lịch phát sóng và đề xuất hợp gu.",
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    title: "Đồng bộ an toàn",
    description: "Lưu tiến độ xem và danh sách yêu thích trên mọi thiết bị.",
  },
  {
    icon: <Clapperboard className="h-4 w-4" />,
    title: "Không gian fan anime",
    description: "Quay lại nhanh các tập đang xem và khám phá nội dung mới.",
  },
];

export function AuthPageClient({ mode, error, checkEmail }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleProvider = async (provider: "google" | "github" | "discord") => {
    setLoading(provider);
    try {
      await signInWithProvider(provider);
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 " />
      <div className="pointer-events-none absolute -left-10 top-16 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-400/8 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden border border-white/8 bg-black/50 lg:grid-cols-[0.95fr_0.85fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden border-b border-white/8 p-7 sm:p-8 lg:flex lg:min-h-[700px] lg:border-b-0 lg:border-r lg:p-10">
          <div className="absolute inset-0 " />
          <div className="absolute right-7 top-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-red-200">
            <Stars className="h-7 w-7" />
          </div>

          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black tracking-[0.18em] transition hover:opacity-90 sm:text-3xl">
              <span className="rounded-2xl border border-red-400/25 bg-red-500/10 px-3 py-1 text-red-400">ANIME</span>
              <span className="text-white">KUN</span>
            </Link>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-red-400/15 bg-red-500/8 px-4 py-2 text-sm font-semibold text-red-100">
              <Sparkles className="h-4 w-4" />
              {mode === "login" ? "Nơi quay lại với series bạn đang theo dõi" : "Tạo tài khoản để bắt đầu hành trình anime"}
            </div>
            <h1 className="mt-6 max-w-lg text-4xl font-black leading-[1.08] text-white sm:text-[3.35rem]">
              {mode === "login"
                ? "Đăng nhập để tiếp tục phiên xem của bạn."
                : "Gia nhập cộng đồng yêu anime với trải nghiệm gọn và đẹp hơn."}
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-zinc-400 sm:text-base">
              {mode === "login"
                ? "Theo dõi tập mới, lưu tiến độ và đồng bộ danh sách yêu thích trong một không gian được thiết kế tập trung cho fan anime."
                : "Tạo tài khoản trong vài giây để lưu lịch sử xem, nhận gợi ý đáng xem và đồng bộ trải nghiệm trên mọi thiết bị."}
            </p>
          </div>

          <div className="relative mt-10 grid gap-4">
            {HIGHLIGHTS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 p-4 backdrop-blur-sm transition duration-200 hover:border-white/15 hover:bg-white/[0.07]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-200">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-zinc-400">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative flex min-h-full flex-col justify-center p-7 sm:p-8 lg:p-10">
          <div className="w-full">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">Tài khoản</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
                {mode === "login" ? "Đăng nhập" : "Đăng ký"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {mode === "login"
                  ? "Tiếp tục bằng tài khoản mạng xã hội hoặc email."
                  : "Chọn cách đăng ký thuận tiện nhất rồi bắt đầu ngay."}
              </p>
            </div>

            {checkEmail && (
              <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                Kiểm tra email để xác nhận tài khoản của bạn.
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {PROVIDERS.map(({ provider, label, icon }) => (
                <button
                  key={provider}
                  type="button"
                  disabled={loading !== null}
                  onClick={() => handleProvider(provider)}
                  className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                >
                  {icon}
                  <span>{loading === provider ? "Đang kết nối..." : `Tiếp tục với ${label}`}</span>
                </button>
              ))}
            </div>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] font-bold uppercase tracking-[0.32em] text-zinc-500">Hoặc với email</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <form
              action={mode === "login" ? signInWithEmail : signUpWithEmail}
              className="flex flex-col gap-5"
            >
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
                  Địa chỉ email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full min-w-0 rounded-2xl border border-white/10  px-5 py-4 text-base text-white placeholder:text-zinc-600 outline-none transition duration-200 focus:border-red-400  focus:ring-4 focus:ring-red-500/10"
                  placeholder="name@domain.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
                  Mật khẩu
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  className="w-full min-w-0 rounded-2xl border border-white/10 px-5 py-4 text-base text-white placeholder:text-zinc-600 outline-none transition duration-200 focus:border-red-400  focus:ring-4 focus:ring-red-500/10"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="mt-2 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#ff4b4b,#ff7a18)] px-4 py-3 text-base font-bold text-white shadow-[0_18px_40px_rgba(239,68,68,0.22)] transition duration-200 hover:brightness-110 active:scale-[0.99] cursor-pointer"
              >
                <Mail className="h-5 w-5" />
                {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-zinc-500">
              {mode === "login" ? (
                <>
                  Chưa có tài khoản?{" "}
                  <Link href="/auth/register" className="font-semibold text-red-400 transition hover:text-red-300">
                    Đăng ký ngay
                  </Link>
                </>
              ) : (
                <>
                  Đã có tài khoản?{" "}
                  <Link href="/auth/login" className="font-semibold text-red-400 transition hover:text-red-300 cursor-pointer">
                    Đăng nhập ngay
                  </Link>
                </>
              )}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
