import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_ROUTES = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
  if (!isAdminRoute) return NextResponse.next();

  const sessionCookie = request.cookies.get('admin_session')?.value;

  if (!sessionCookie) {
    // No login page — redirect unauthorized users to home
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
