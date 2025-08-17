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

  // If the user is trying to access any page other than the auth page
  // and is not logged in, redirect them to the auth page.
  // We also exclude API routes and Next.js internal routes.
  if (!sessionCookie && pathname !== '/auth' && !pathname.startsWith('/api/') && !pathname.startsWith('/_next/')) {
    // Allow access to the root landing page for new users
    if (pathname === '/') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/auth', request.url));
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
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
