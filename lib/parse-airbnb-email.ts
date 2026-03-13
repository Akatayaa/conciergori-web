/**
 * Parser d'emails de confirmation Airbnb
 * Extrait les données de réservation depuis les emails forwardés
 */

export interface ParsedBooking {
  source: 'airbnb' | 'booking' | 'unknown'
  guestName?: string
  guestEmail?: string
  checkIn?: string    // YYYY-MM-DD
  checkOut?: string   // YYYY-MM-DD
  propertyName?: string
  totalAmount?: number
  bookingRef?: string
  guestProfileUrl?: string
  phone?: string
  rawSubject: string
}

export function parseAirbnbEmail(subject: string, textBody: string, htmlBody?: string): ParsedBooking | null {
  const body = textBody || htmlBody?.replace(/<[^>]+>/g, ' ') || ''
  const fullText = `${subject}\n${body}`

  // Détecter la source
  let source: ParsedBooking['source'] = 'unknown'
  if (fullText.toLowerCase().includes('airbnb')) source = 'airbnb'
  else if (fullText.toLowerCase().includes('booking.com')) source = 'booking'

  // Ignorer les emails non-pertinents
  const isReservationEmail =
    subject.toLowerCase().includes('réservation') ||
    subject.toLowerCase().includes('reservation') ||
    subject.toLowerCase().includes('confirmée') ||
    subject.toLowerCase().includes('confirmed') ||
    subject.toLowerCase().includes('nouvelle réservation') ||
    subject.toLowerCase().includes('new reservation')

  if (!isReservationEmail) return null

  const result: ParsedBooking = { source, rawSubject: subject }

  // Référence de réservation Airbnb (ex: HMFKN8A9KN)
  const refMatch = body.match(/(?:code de confirmation|confirmation code|réservation\s*[:#]?\s*)([A-Z0-9]{8,12})/i)
    ?? subject.match(/([HM][A-Z0-9]{8,10})/)
  if (refMatch) result.bookingRef = refMatch[1]

  // Nom du voyageur
  const guestMatch = body.match(/(?:voyageur|guest|réservé par|booked by)[:\s]+([A-ZÀ-Ÿa-zà-ÿ\s\-]{3,40})/i)
    ?? body.match(/(?:de la part de|from)\s+([A-ZÀ-Ÿ][a-zà-ÿ\s\-]{2,30})/i)
  if (guestMatch) result.guestName = guestMatch[1].trim()

  // Dates — format FR (13 mars 2026) ou ISO (2026-03-13)
  const MONTHS_FR: Record<string, string> = {
    'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
    'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
    'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12'
  }

  // Chercher "arrivée : 13 mars 2026" et "départ : 15 mars 2026"
  const arrivalMatch = body.match(/(?:arrivée|check.?in|arrival)[:\s]+(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/i)
  const departureMatch = body.match(/(?:départ|check.?out|departure)[:\s]+(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(\d{4})/i)

  if (arrivalMatch) {
    const m = MONTHS_FR[arrivalMatch[2].toLowerCase()]
    if (m) result.checkIn = `${arrivalMatch[3]}-${m}-${arrivalMatch[1].padStart(2,'0')}`
  }
  if (departureMatch) {
    const m = MONTHS_FR[departureMatch[2].toLowerCase()]
    if (m) result.checkOut = `${departureMatch[3]}-${m}-${departureMatch[1].padStart(2,'0')}`
  }

  // Format ISO en fallback
  if (!result.checkIn) {
    const isoMatch = body.match(/(\d{4}-\d{2}-\d{2}).*?(\d{4}-\d{2}-\d{2})/)
    if (isoMatch) { result.checkIn = isoMatch[1]; result.checkOut = isoMatch[2] }
  }

  // Montant total
  const amountMatch = body.match(/(?:total|montant total|total amount)[:\s]+(?:EUR\s*)?(\d+(?:[,.]\d{2})?)\s*(?:€|EUR)/i)
    ?? body.match(/(\d+(?:[,.]\d{2})?)\s*€(?:\s*(?:EUR|total))/i)
  if (amountMatch) result.totalAmount = parseFloat(amountMatch[1].replace(',', '.'))

  // Nom du logement
  const propMatch = body.match(/(?:logement|property|appartement|studio|maison)[:\s]+([^\n\r.]{5,60})/i)
  if (propMatch) result.propertyName = propMatch[1].trim()

  // Profil voyageur
  const profileMatch = body.match(/(https:\/\/www\.airbnb\.[a-z]+\/users\/show\/\d+)/i)
  if (profileMatch) result.guestProfileUrl = profileMatch[1]

  return result
}
