/**
 * Parser iCal enrichi — extrait les réservations et blocages depuis Airbnb/Booking
 */

export interface BlockedRange {
  start: Date
  end: Date
}

export interface IcalEvent {
  start: Date
  end: Date
  summary: string
  description?: string
  uid?: string
  // Données extraites
  bookingRef?: string      // ex: HMFKN8A9KN
  phone4?: string          // 4 derniers chiffres téléphone
  source?: 'airbnb' | 'booking' | 'blocked' | 'other'
  isReservation: boolean   // true = vraie résa, false = simple blocage
}

export async function fetchIcalEvents(icalUrl: string): Promise<IcalEvent[]> {
  try {
    const res = await fetch(icalUrl, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const text = await res.text()
    return parseIcalFull(text)
  } catch {
    return []
  }
}

// Rétrocompat — retourne juste les ranges bloqués
export async function fetchBlockedDates(icalUrl: string): Promise<BlockedRange[]> {
  const events = await fetchIcalEvents(icalUrl)
  return events.map(e => ({ start: e.start, end: e.end }))
}

function parseIcalFull(text: string): IcalEvent[] {
  const events: IcalEvent[] = []
  const rawEvents = text.split('BEGIN:VEVENT')

  for (const raw of rawEvents.slice(1)) {
    const dtstart = raw.match(/DTSTART(?:;VALUE=DATE)?(?:;TZID=[^\n\r]+)?:(\d{8})/)?.[1]
    const dtend   = raw.match(/DTEND(?:;VALUE=DATE)?(?:;TZID=[^\n\r]+)?:(\d{8})/)?.[1]
    if (!dtstart || !dtend) continue

    const start = parseIcalDate(dtstart)
    const end   = parseIcalDate(dtend)
    if (!start || !end) continue

    // Concatener les lignes repliées (RFC 5545)
    const unfolded = raw.replace(/\r?\n[ \t]/g, '')

    const summary     = unfolded.match(/SUMMARY:([^\r\n]*)/)?.[1]?.trim() ?? ''
    const description = unfolded.match(/DESCRIPTION:([^\r\n]*)/)?.[1]?.trim()
    const uid         = unfolded.match(/UID:([^\r\n]*)/)?.[1]?.trim()

    // Extraire la référence de réservation Airbnb
    const bookingRef = description?.match(/reservations\/details\/([A-Z0-9]+)/)?.[1]
      ?? description?.match(/Ref:\s*([A-Z0-9]+)/i)?.[1]

    // 4 derniers chiffres téléphone
    const phone4 = description?.match(/Phone Number \(Last 4 Digits\):\s*(\d{4})/)?.[1]

    // Détecter la source
    let source: IcalEvent['source'] = 'other'
    let isReservation = false

    if (uid?.includes('airbnb.com') || summary.toLowerCase().includes('airbnb')) {
      if (summary === 'Reserved' || bookingRef) {
        source = 'airbnb'
        isReservation = true
      } else {
        source = 'blocked'
      }
    } else if (uid?.includes('booking.com') || description?.includes('booking.com')) {
      source = 'booking'
      isReservation = true
    } else if (summary === 'Reserved' || bookingRef) {
      isReservation = true
    }

    events.push({ start, end, summary, description, uid, bookingRef, phone4, source, isReservation })
  }

  return events
}

function parseIcalDate(s: string): Date | null {
  if (s.length < 8) return null
  return new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}T00:00:00Z`)
}

export function isDateBlocked(date: Date, blocked: BlockedRange[]): boolean {
  return blocked.some(r => date >= r.start && date < r.end)
}

export function getBlockedDateStrings(blocked: BlockedRange[]): string[] {
  const dates: string[] = []
  for (const range of blocked) {
    const d = new Date(range.start)
    while (d < range.end) {
      dates.push(d.toISOString().split('T')[0])
      d.setDate(d.getDate() + 1)
    }
  }
  return [...new Set(dates)]
}
