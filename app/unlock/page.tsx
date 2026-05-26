import { LockKeyhole, Terminal, Cpu } from "lucide-react";

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08080a] px-4 text-white">
      {/* Background Cyberpunk Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.07)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-8 left-8 text-[9px] font-mono tracking-widest text-zinc-600 select-none uppercase hidden md:block">
        // SYSTEM_STATUS: SECURE<br />
        // SECURE_SHELL_INITIALIZED
      </div>
      <div className="absolute bottom-8 right-8 text-[9px] font-mono tracking-widest text-zinc-600 select-none uppercase hidden md:block text-right">
        // DECRYPT_METHOD: AES_256<br />
        // COORD: 35.6762° N, 139.6503° E
      </div>

      {/* Cyberpunk Grid */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Glow behind the card */}
        <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 opacity-20 blur-xl pointer-events-none" />
        
        <form
          action="/api/unlock"
          method="post"
          className="relative w-full rounded-xl border border-red-500/20 bg-zinc-950/80 p-8 shadow-2xl backdrop-blur-md"
        >
          {/* Futuristic corner designs */}
          <div className="absolute -top-[1px] -left-[1px] h-4 w-4 border-t-2 border-l-2 border-red-500" />
          <div className="absolute -top-[1px] -right-[1px] h-4 w-4 border-t-2 border-r-2 border-red-500" />
          <div className="absolute -bottom-[1px] -left-[1px] h-4 w-4 border-b-2 border-l-2 border-red-500" />
          <div className="absolute -bottom-[1px] -right-[1px] h-4 w-4 border-b-2 border-r-2 border-red-500" />

          <input type="hidden" name="next" value={next || "/"} />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-red-500">
              <Cpu className="h-3.5 w-3.5 animate-pulse" />
              <span>System Lockout</span>
            </div>
            <div className="rounded-full bg-red-950/50 px-2 py-0.5 font-mono text-[9px] text-red-400 border border-red-900/30">
              v2.1
            </div>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            ANIME<span className="text-red-500">KUN</span>
          </h1>
          
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed font-sans">
            Hệ thống yêu cầu khóa bảo mật. Vui lòng cung cấp Access Key hợp lệ để giải mã dữ liệu luồng video.
          </p>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="access-key" className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                // ENTER_DECRYPT_KEY
              </label>
              <span className="text-[10px] font-mono text-zinc-600">REQUIRED</span>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
                <Terminal className="h-4 w-4" />
              </div>
              <input
                id="access-key"
                name="key"
                type="password"
                autoComplete="current-password"
                autoFocus
                required
                placeholder="Nhập khóa truy cập..."
                className="w-full rounded-lg border border-zinc-800 bg-black/60 pl-10 pr-4 py-3.5 text-white outline-none transition duration-200 placeholder:text-zinc-700 font-mono text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500/30 focus:shadow-[0_0_15px_rgba(239,68,68,0.25)]"
              />
            </div>
          </div>

          {error === "1" && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-950 bg-red-950/20 p-3 text-xs text-red-400">
              <span className="font-mono font-bold select-none">[ERR_KEY_INVALID]:</span>
              <span>Khóa không đúng hoặc đã hết hạn. Vui lòng kiểm tra lại.</span>
            </div>
          )}

          <button
            type="submit"
            className="mt-6 group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-red-600 px-4 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition duration-300 hover:bg-red-500 hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] active:scale-[0.98] cursor-pointer"
          >
            <LockKeyhole className="h-4 w-4 transition-transform group-hover:rotate-12" aria-hidden="true" />
            <span>Xác nhận mở khóa</span>
          </button>
        </form>
      </div>
    </main>
  );
}
