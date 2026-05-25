import type { NextRequest } from "next/server";
import { decodeProxyUrl, encodeProxyUrl } from "../../../../lib/server/proxy-url";

export const dynamic = "force-dynamic";

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);
const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function isBlockedUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();

    return (
      !["http:", "https:"].includes(url.protocol) ||
      BLOCKED_HOSTS.has(hostname) ||
      hostname.endsWith(".local")
    );
  } catch {
    return true;
  }
}

function copyResponseHeaders(source: Headers): Headers {
  const headers = new Headers();

  source.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();

    if (!HOP_BY_HOP_HEADERS.has(normalizedKey)) {
      headers.set(key, value);
    }
  });

  headers.set("cache-control", "public, max-age=300, s-maxage=300");
  headers.delete("content-security-policy");
  headers.delete("x-frame-options");

  return headers;
}

function rewritePlaylist(body: string, sourceUrl: string): string {
  return body
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        return line;
      }

      if (trimmed.startsWith("#")) {
        return line.replace(/URI="([^"]+)"/g, (_match, uri: string) => {
          try {
            return `URI="${encodeProxyUrl(new URL(uri, sourceUrl).toString())}"`;
          } catch {
            return `URI="${uri}"`;
          }
        });
      }

      try {
        return encodeProxyUrl(new URL(trimmed, sourceUrl).toString());
      } catch {
        return line;
      }
    })
    .join("\n");
}

export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/proxy/media/[token]">,
) {
  const { token } = await context.params;
  const sourceUrl = decodeProxyUrl(token);

  if (!sourceUrl || isBlockedUrl(sourceUrl)) {
    return new Response("Invalid media proxy token", { status: 400 });
  }

  const upstream = await fetch(sourceUrl, {
    headers: {
      accept: request.headers.get("accept") || "*/*",
      range: request.headers.get("range") || "",
      referer: new URL(sourceUrl).origin,
      "user-agent": request.headers.get("user-agent") || "Mozilla/5.0",
    },
    cache: "no-store",
  });
  const headers = copyResponseHeaders(upstream.headers);
  const contentType = upstream.headers.get("content-type") || "";
  const isPlaylist =
    contentType.includes("mpegurl") ||
    sourceUrl.toLowerCase().includes(".m3u8");

  if (isPlaylist) {
    const playlist = rewritePlaylist(await upstream.text(), sourceUrl);
    headers.set("content-type", "application/vnd.apple.mpegurl; charset=utf-8");
    headers.delete("content-length");

    return new Response(playlist, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}
