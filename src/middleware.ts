import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const url = new URL(req.url);

  if (url.pathname === "/login") {
    return NextResponse.next();
  }

  const hasSession = req.headers.get("cookie")?.includes("authjs.session-token");

  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
