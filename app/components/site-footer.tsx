import { CirclePlay, Globe2, MessageCircle, Music2, Play, Send } from "lucide-react";
import Link from "next/link";

const footerLinks = [
  ["Domain dự phòng", "/"],
  ["Hỏi-Đáp", "/"],
  ["Chính sách bảo mật", "/"],
  ["Điều khoản sử dụng", "/"],
  ["Giới thiệu", "/"],
  ["Liên hệ", "/"],
];

const socials = [
  { label: "Telegram", Icon: Send },
  { label: "Discord", Icon: MessageCircle },
  { label: "X", Icon: Globe2 },
  { label: "Facebook", Icon: MessageCircle },
  { label: "TikTok", Icon: Music2 },
  { label: "Youtube", Icon: CirclePlay },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#101013] px-4 pb-24 pt-10 text-zinc-300 sm:px-6 md:pb-10 lg:px-8">
      <div className="mx-auto max-w-[96rem]">
        <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:text-left">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/80 text-white lg:h-11 lg:w-11 lg:rounded-lg lg:border">
              <Play className="ml-0.5 h-8 w-8 fill-current lg:h-6 lg:w-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-4xl font-black leading-none tracking-tight lg:inline lg:text-3xl">
                <span className="text-red-500">ANIME</span>
                <span className="text-white">KUN</span>
              </span>
              <span className="mt-1 block text-base font-medium text-zinc-300 lg:hidden">
                Xem anime online
              </span>
            </span>
          </Link>

          <div className="hidden h-14 w-px bg-white/10 lg:block" />

          <div className="flex flex-wrap justify-center gap-3">
            {socials.map(({ label, Icon }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-white shadow-lg shadow-black/20 ring-1 ring-white/5 transition hover:-translate-y-0.5 hover:bg-red-600 lg:h-11 lg:w-11 lg:bg-red-600 lg:shadow-red-950/30 lg:hover:bg-red-500"
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>

        <nav className="mx-auto mt-10 flex max-w-md flex-wrap justify-center gap-x-7 gap-y-5 text-sm font-semibold text-white lg:mx-0 lg:grid lg:max-w-4xl lg:grid-cols-3 lg:justify-start lg:gap-x-10 lg:gap-y-4">
          {footerLinks.map(([label, href], index) => (
            <Link
              key={label}
              href={href}
              className={`transition hover:text-red-400 ${index === 0 ? "text-red-400 lg:text-white" : ""
                }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="mx-auto mt-10 max-w-xl text-center text-sm leading-7 text-zinc-300 lg:mx-0 lg:max-w-4xl lg:text-left lg:text-zinc-400">
          ANIMEKUN - Trang xem anime và hoạt hình online chất lượng cao miễn phí
          Vietsub, thuyết minh, lồng tiếng HD. Kho nội dung tập trung vào anime
          Nhật Bản, hoạt hình Trung Quốc và nhiều series hoạt họa nổi bật theo
          mùa, thể loại và năm phát hành.
        </p>

        <p className="mt-6 text-center text-sm text-zinc-400 lg:text-left">© 2026 ANIMEKUN</p>
      </div>
    </footer>
  );
}
