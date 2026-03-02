import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // TODO: Fetch and parse iCal feeds (Airbnb / Booking)
  return NextResponse.json({ events: [] })
}
