import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import CalendarView from '@/components/dashboard/CalendarView'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const revalidate = 60

export interface ICalReservation {
  property_id: string
  check_in: string
  check_out: string
  source: 'airbnb' | 'booking' | 'other'
  booking_ref?: string
  phone4?: string
  summary: string
}

export default async function CalendrierPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant: tenantSlug } = await params

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', tenantSlug)
    .single()

  if (!tenant) return notFound()

  const { data: properties } = await supabase
    .from('properties')
    .select('id, name, ical_url')
    .eq('tenant_id', tenant.id)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, property_id, guest_name, check_in, check_out, status, total_price, guest_phone')
    .eq('tenant_id', tenant.id)
    .order('check_in', { ascending: true })

  // ── Fetch availability pour chaque property avec iCal ────────────────────
  const blockedDates: { property_id: string; date: string }[] = []
  const icalReservations: ICalReservation[] = []

  if (properties && properties.length > 0) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    await Promise.allSettled(
      properties
        .filter(p => p.ical_url)
        .map(async p => {
          try {
            const res = await fetch(
              `${appUrl}/api/availability?property_id=${p.id}`,
              { next: { revalidate: 300 } }
            )
            if (!res.ok) return
            const data = await res.json()

            // Dates bloquées (fond rayé)
            const blocked: string[] = data.blocked || data.blocked_dates || data.dates || []
            blocked.forEach(date => blockedDates.push({ property_id: p.id, date }))

            // Réservations iCal enrichies
            const reservations: Omit<ICalReservation, 'property_id'>[] = data.reservations || []
            reservations.forEach(r => icalReservations.push({ ...r, property_id: p.id }))
          } catch {
            // iCal indisponible — silencieux
          }
        })
    )
  }

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-[var(--font-suez)] text-3xl mb-1" style={{ color: '#00243f' }}>
            Calendrier
          </h1>
          <p className="text-sm" style={{ color: '#979797' }}>
            Vue globale de toutes vos réservations et disponibilités
          </p>
        </div>

        <CalendarView
          bookings={bookings ?? []}
          properties={properties ?? []}
          blockedDates={blockedDates}
          icalReservations={icalReservations}
        />
      </div>
    </div>
  )
}
