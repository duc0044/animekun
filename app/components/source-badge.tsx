import { cookies } from "next/headers";

export async function SourceBadge() {
  const store = await cookies();
  const source = store.get("web-film-source")?.value || "ophim";
  const labels: Record<string, string> = { ophim: "OPhim", nguonc: "NguonC", kkphim: "KKPhim" };

  return (
    <div className="fixed bottom-[76px] left-4 md:bottom-4 md:left-4 z-50 rounded-md bg-zinc-900/80 px-3 py-1.5 text-xs font-bold text-zinc-400 ring-1 ring-white/10 backdrop-blur transition-all duration-300">
      Nguồn: <span className="text-red-400">{labels[source] || source}</span>
    </div>
  );
}
