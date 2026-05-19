import { auth } from "@/lib/auth-index";
import { NextResponse } from "next/server";

export default auth((req) => {
  try {
    const isLoggedIn = !!req.auth;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");

    if (isAuthPage) {
      if (isLoggedIn) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
      }
      return NextResponse.next();
    }

    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
