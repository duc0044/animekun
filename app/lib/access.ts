import { createHash } from "crypto";

export const ACCESS_COOKIE = "web-film-access";
export const ACCESS_KEY_ENV = "WEB_FILM_ACCESS_KEY";

export function getAccessKey() {
  return process.env[ACCESS_KEY_ENV] || "congduc";
}

export function getAccessToken() {
  return createHash("sha256").update(getAccessKey()).digest("hex");
}

export function hasValidAccess(cookieValue?: string) {
  return Boolean(cookieValue) && cookieValue === getAccessToken();
}
