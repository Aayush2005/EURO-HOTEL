import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  const { pathname } = req.nextUrl;

  // Always allow login page and auth API routes
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    if (token && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Protect everything else
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
