import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('appwrite-session');
  const { pathname } = request.nextUrl;

  // If the user is trying to access the auth page and is already logged in,
  // redirect them to the home page.
  if (sessionCookie && pathname === '/auth') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Allow access to all pages - auth is now optional
  // Only redirect to auth for admin-only pages if needed in the future
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
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
