import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("attendify-token")?.value;
  const { pathname } = request.nextUrl;

  // Public routes — always accessible
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname === "/" ||
    pathname === "/unauthorized"
  ) {
    return NextResponse.next();
  }

  // Protected routes — require token
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
