// Parse et sync des flux iCal (Airbnb, Booking...)

export interface CalendarEvent {
  id: string
  summary: string
  start: Date
  end: Date
}

export async function parseIcalUrl(url: string): Promise<CalendarEvent[]> {
  // TODO: fetch URL + parse avec ical.js
  return []
}
