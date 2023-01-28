// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

// List of paths that don't require authentication
const publicPaths = ['/login', '/register', '/']

// Build array of paths to match
const pathsToMatch = [
  '/api',
  '/_next/static',
  '/favicon.ico',
  '/images',
  '/sw.js',
  '/sw.js.map',
  '/workbox-',
  '/workbox-',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  '/icons',
]

export function middleware(request: NextRequest) {
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

  // Check if the pathname starts with any of the paths in the array
  const isPathToMatch = pathsToMatch.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // If the path is not in the array, check if the user is authenticated
  if (!isPathToMatch) {
    // If the user is not authenticated, redirect to the login page

    if (!request.cookies.get('token')) {
      // If the user is trying to access a public path, allow it
      if (publicPaths.includes(request.nextUrl.pathname)) {
        return
      } else {
        // Otherwise, redirect to the login page
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }
}
