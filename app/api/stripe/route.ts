import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // TODO: Create Stripe payment intent
  return NextResponse.json({ clientSecret: null })
}
