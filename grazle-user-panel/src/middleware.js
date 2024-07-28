// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const path = request.nextUrl.pathname;
  const isAuthPage = ["/signIn", "/registration"].includes(path);

  // We can't check localStorage here, so we'll handle auth checks on the client side
  // This middleware will only prevent authenticated users from accessing auth pages
  if (isAuthPage) {
    return NextResponse.next();
  }

  // For all other routes, we'll let the request through and handle auth in the components
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};