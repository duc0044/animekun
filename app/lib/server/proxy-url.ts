import { createHmac } from "crypto";

const PROXY_SECRET = process.env.MEDIA_PROXY_SECRET || "netphim-local-media-proxy";

const toBase64Url = (value: string): string =>
  Buffer.from(value, "utf8").toString("base64url");

const fromBase64Url = (value: string): string =>
  Buffer.from(value, "base64url").toString("utf8");

const sign = (payload: string): string =>
  createHmac("sha256", PROXY_SECRET).update(payload).digest("base64url").slice(0, 32);

export function encodeProxyUrl(url: string): string {
  if (!url) return "";

  const payload = toBase64Url(url);
  return `/api/proxy/media/${payload}.${sign(payload)}`;
}

export function decodeProxyUrl(token: string): string | null {
  const [payload, signature] = token.split(".");

  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  try {
    return fromBase64Url(payload);
  } catch {
    return null;
  }
}

