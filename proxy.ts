import { NextRequest, NextResponse } from 'next/server'

export async function proxy(req: NextRequest) {
  const hostname = req.headers.get('host') || ''

  const isAppDomain = hostname.endsWith('.conciergori.com') || hostname.includes('localhost')

  if (!isAppDomain) {
    const response = NextResponse.next()
    response.headers.set('x-tenant-domain', hostname)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
