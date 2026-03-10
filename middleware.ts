import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SKIP_PATHS = ["/onboarding", "/api/", "/_next", "/favicon.ico"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (SKIP_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  if (!sessionCookie) {
    return NextResponse.next();
  }

  try {
    const res = await fetch(
      new URL("/api/check-onboarded", request.url),
      { headers: { cookie: request.headers.get("cookie") ?? "" } },
    );

    if (res.ok) {
      const data = await res.json();
      if (!data.onboarded) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }
  } catch {
    // If check fails, allow the request through
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
