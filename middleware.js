import { NextResponse } from 'next/server'

export function middleware(request) {
  // Check if the user is accessing the dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // In a real app, you would verify the JWT token here
    // For now, we'll let the client-side handle the auth check
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}