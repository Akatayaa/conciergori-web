/**
 * Lit une URL iCal et retourne les dates bloquées (VEVENT avec STATUS=CONFIRMED ou DTSTART/DTEND)
 */
export interface BlockedRange {
  start: Date
  end: Date
}

export async function fetchBlockedDates(icalUrl: string): Promise<BlockedRange[]> {
  try {
    const res = await fetch(icalUrl, { next: { revalidate: 3600 } }) // cache 1h
    if (!res.ok) return []
    const text = await res.text()
    return parseIcal(text)
  } catch {
    return []
  }
}

function parseIcal(text: string): BlockedRange[] {
  const blocked: BlockedRange[] = []
  const events = text.split('BEGIN:VEVENT')
  
  for (const event of events.slice(1)) {
    const dtstart = event.match(/DTSTART(?:;VALUE=DATE)?(?:;TZID=[^\n]+)?:(\d{8})/)?.[1]
    const dtend   = event.match(/DTEND(?:;VALUE=DATE)?(?:;TZID=[^\n]+)?:(\d{8})/)?.[1]
    if (!dtstart || !dtend) continue

    const start = parseIcalDate(dtstart)
    const end   = parseIcalDate(dtend)
    if (start && end) blocked.push({ start, end })
  }
  return blocked
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
