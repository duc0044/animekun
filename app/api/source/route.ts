import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FILM_API_SOURCE_COOKIE, type FilmApiSource } from "../../lib/api/provider";

const SOURCES = new Set<FilmApiSource>(["ophim", "nguonc", "kkphim"]);

function getRequestOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host") || request.nextUrl.host;
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || request.nextUrl.protocol.replace(":", "");

  return `${protocol}://${host}`;
}

function redirectTo(request: NextRequest, path: string, status = 303) {
  return NextResponse.redirect(new URL(path, getRequestOrigin(request)), status);
}

function getSafeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "/";

  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function getSafeSource(value: FormDataEntryValue | null): FilmApiSource | null {
  const source = typeof value === "string" ? value.trim().toLowerCase() : "";

  return SOURCES.has(source as FilmApiSource) ? (source as FilmApiSource) : null;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const source = getSafeSource(formData.get("source"));
  const next = getSafeNext(formData.get("next"));

  if (!source) {
    return redirectTo(request, next);
  }

  const response = redirectTo(request, next);
  response.cookies.set({
    name: FILM_API_SOURCE_COOKIE,
    value: source,
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  revalidatePath("/", "layout");

  return response;
}
