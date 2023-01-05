// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if a user session exists
  if (!request.cookies.get('token')) {
    if (request.nextUrl.pathname != '/login') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
}

// See "Matching Paths" below to learn more
export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - favicon.ico (favicon file)
   * - /images (images folder)
   * - sw.js (service worker file)
   * - sw.js.map (service worker file)
   * - workbox-<hash>.js (workbox file)
   * - workbox-<hash>.js.map (workbox file)
   * - manifest.json (manifest file)
   */
  matcher: '/((?!api|_next/static|favicon.ico|icons/*|sw.js|sw.js.map|workbox-327c579b.js|manifest.json).*)',
}
