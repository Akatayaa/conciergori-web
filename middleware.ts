import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || ''
  const url = req.nextUrl.clone()

  // White-label: résolution tenant via domaine custom
  const isAppDomain = hostname.endsWith('.conciergori.com') || hostname === 'localhost:3000'

  if (!isAppDomain) {
    // TODO: lookup tenant par custom_domain en DB
    // Injecter x-tenant-id dans les headers
    const response = NextResponse.next()
    response.headers.set('x-tenant-domain', hostname)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
