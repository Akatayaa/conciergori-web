import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  // TODO: Lister les tenants de l'utilisateur connecté
  return NextResponse.json({ tenants: [] })
}

export async function POST(req: NextRequest) {
  // TODO: Créer un nouveau tenant + init Stripe customer
  const body = await req.json()
  return NextResponse.json({ tenant: body })
}
