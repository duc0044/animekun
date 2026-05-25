export function makeEpisodeSlug(
  episodeSlug: string | undefined,
  episodeName: string,
  serverName: string,
  serverIndex: number,
  totalServers: number,
): string {
  const base = episodeSlug || episodeName;
  if (!serverName || totalServers <= 1) return base;
  const serverKey = serverName
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${serverKey}-${serverIndex}-${base}`;
}

export function uniqueServerNames(episodes: { serverName: string }[]): string[] {
  return [...new Set(episodes.map((ep) => ep.serverName).filter(Boolean))];
}

export function formatEpisodeName(name: string): string {
  if (!name) return "";
  const lowerName = name.toLowerCase().trim();
  if (lowerName.startsWith("tập") || lowerName.startsWith("tap")) {
    return name.trim();
  }
  return `Tập ${name.trim()}`;
}
