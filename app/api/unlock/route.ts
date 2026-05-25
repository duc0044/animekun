import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, getAccessKey, getAccessToken } from "../../lib/access";

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

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const key = formData.get("key");
  const next = getSafeNext(formData.get("next"));

  if (typeof key !== "string" || key !== getAccessKey()) {
    const retryPath = `/unlock?error=1&next=${encodeURIComponent(next)}`;

    return redirectTo(request, retryPath);
  }

  const response = redirectTo(request, next);
  response.cookies.set({
    name: ACCESS_COOKIE,
    value: getAccessToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
