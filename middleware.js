import { NextResponse } from 'next/server'

export function middleware(request) {
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '')
  const { pathname } = request.nextUrl
  const isInternalPath = pathname.startsWith('/_next') || pathname.startsWith('/__nextjs')

  // Rewrite /v1/... → ... when base path is set
  if (basePath && !isInternalPath && (pathname === basePath || pathname.startsWith(`${basePath}/`))) {
    const rewrittenUrl = request.nextUrl.clone()
    const strippedPath = pathname.slice(basePath.length)
    rewrittenUrl.pathname = strippedPath || '/'
    return NextResponse.rewrite(rewrittenUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
