import { NextResponse } from "next/server";

export default async function middleware(request) {
  console.log("target =========> ");
  const authToken = request.cookies.get("session");

  const isAuthPage =
    "/signIn" === request.nextUrl.pathname ||
    "/registration" === request.nextUrl.pathname
      ? // "/RegisterSeller" === request.nextUrl.pathname
        true
      : false;

  if (!authToken && !isAuthPage) {
    return NextResponse.redirect(new URL("/signIn", request.url));
  }
  if (authToken && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/signIn", "/registration"],
};
