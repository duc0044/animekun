import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, hasValidAccess } from "./app/lib/access";

const PUBLIC_PATHS = ["/unlock", "/api/unlock"];

function getRequestOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host") || request.nextUrl.host;
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || request.nextUrl.protocol.replace(":", "");

  return `${protocol}://${host}`;
}

function redirectTo(request: NextRequest, path: string, status = 307) {
  return NextResponse.redirect(new URL(path, getRequestOrigin(request)), status);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const accessCookie = request.cookies.get(ACCESS_COOKIE)?.value;

  if (hasValidAccess(accessCookie)) {
    return NextResponse.next();
  }

  const nextPath = `${pathname}${request.nextUrl.search}`;
  const unlockPath = `/unlock?next=${encodeURIComponent(nextPath)}`;

  return redirectTo(request, unlockPath);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
