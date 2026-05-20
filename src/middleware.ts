import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const url = new URL(req.url);
  const isAuthPage = url.pathname.startsWith("/login");
  const hasSession = req.headers.get("cookie")?.includes("authjs.session-token");

  if (isAuthPage) {
    if (hasSession) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
