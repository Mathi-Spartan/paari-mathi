import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './lib/auth';

export async function middleware(req: NextRequest) {
  const ok = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (ok) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith('/api/')) return new NextResponse('Locked', { status: 401 });
  return NextResponse.redirect(new URL('/lock', req.url));
}

export const config = {
  matcher: ['/((?!lock|_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest).*)'],
};
