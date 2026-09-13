import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (nextUrl.pathname.startsWith("/beds/admin") && role !== "HOSPITAL_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (nextUrl.pathname.startsWith("/doctors/admin") && role !== "DOCTOR") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/beds/reservations/:path*",
    "/beds/admin/:path*",
    "/doctors/appointments/:path*",
    "/doctors/admin/:path*",
    "/dashboard/:path*",
  ],
};
