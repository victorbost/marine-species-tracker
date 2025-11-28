import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Exclude login and static public routes
  if (pathname === "/login" || pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }

  // Proxy the cookie to your backend user check
  const cookieHeader = request.headers.get("cookie") || "";
  const API_URL =
    typeof window === "undefined"
      ? process.env.INTERNAL_API_URL // server/middleware/SSR
      : process.env.NEXT_PUBLIC_API_URL; // client/browser

  const res = await fetch(`${API_URL}/api/v1/auth/profiles/me/`, {
    credentials: "include",
    headers: { Cookie: cookieHeader },
  });

  if (res.status !== 200) {
    // Not authenticated: redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
