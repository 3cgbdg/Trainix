import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/today",
  "/dashboard",
  "/workout-plan",
  "/ai-analysis",
  "/progress",
  "/profile",
  "/nutrition-plan",
  "/workout",
];
const AUTH_PATHS = ["/auth/login", "/auth/signup"];
// signed-in visitors land on "/" too (e.g. an old bookmark) -- send them
// straight into the app instead of showing the marketing page
const REDIRECT_WHEN_AUTHED = ["/", ...AUTH_PATHS];

// This is a presence-only check (no signature verification) so that unauthenticated
// requests never receive the protected app shell's HTML in the first place — the
// backend still verifies the JWT on every API call, so this is purely a UX/SSR gate,
// not the source of truth for auth.
function hasSession(request: NextRequest): boolean {
  return Boolean(request.cookies.get("access-token") || request.cookies.get("refresh-token"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = hasSession(request);

  if (!authed && PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (authed && REDIRECT_WHEN_AUTHED.includes(pathname)) {
    return NextResponse.redirect(new URL("/today", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/today/:path*", "/dashboard/:path*", "/workout-plan/:path*", "/ai-analysis/:path*", "/progress/:path*", "/profile/:path*", "/nutrition-plan/:path*", "/workout/:path*", "/auth/login", "/auth/signup"],
};
