import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if there is a token in the cookies
  const token = request.cookies.get('token')?.value;

  // The paths we want to protect (essentially everything except auth routes)
  // Let's assume all dashboard routes are restricted, but auth routes are public.
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/reset') ||
                      request.nextUrl.pathname.startsWith('/new-password') ||
                      request.nextUrl.pathname.startsWith('/verify');

  if (!token && !isAuthRoute) {
    // If no token and trying to access a protected route, redirect to login
    // If the root path "/" is accessed without token, also redirect out
    if (request.nextUrl.pathname !== '/') {
        return NextResponse.redirect(new URL('/login', request.url));
    } else {
        return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (token && isAuthRoute) {
    // If there is a token and trying to access an auth route, redirect to typical dashboard home
    return NextResponse.redirect(new URL('/overview', request.url)); // adjust as needed
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
