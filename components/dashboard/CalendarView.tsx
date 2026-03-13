'use client'

import { useState, useMemo } from 'react'
import type { ICalReservation } from '@/app/(app)/[tenant]/dashboard/calendrier/page'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Booking {
  id: string
  property_id: string
  guest_name: string
  check_in: string
  check_out: string
  status: 'confirmed' | 'pending' | 'cancelled'
  total_price: number
  guest_phone?: string
}

interface Property {
  id: string
  name: string
}

interface BlockedDate {
  property_id: string
  date: string
}

interface CalendarViewProps {
  bookings: Booking[]
  properties: Property[]
  blockedDates: BlockedDate[]
  icalReservations: ICalReservation[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#0097b2',
  pending:   '#f59e0b',
  cancelled: '#9ca3af',
}

const ICAL_SOURCE_CONFIG = {
  airbnb:  { color: '#FF5A5F', label: 'Airbnb' },
  booking: { color: '#003580', label: 'Booking.com' },
  other:   { color: '#6b7280', label: 'Bloqué' },
} as const

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS_FR   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toYMD(d: Date): string {
  return d.toISOString().split('T')[0]
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function buildCalendarGrid(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7 // Mon = 0
  const grid: Date[][] = []
  let week: Date[] = []

  for (let i = startOffset - 1; i >= 0; i--) week.push(addDays(first, -(i + 1)))

  const cur = new Date(first)
  while (cur.getMonth() === month) {
    week.push(new Date(cur))
    if (week.length === 7) { grid.push(week); week = [] }
    cur.setDate(cur.getDate() + 1)
  }

  if (week.length > 0) {
    while (week.length < 7) week.push(addDays(week[week.length - 1], 1))
    grid.push(week)
  }
  return grid
}

// Build a map YMD → list of bookings that span this day
function buildBookingDayMap(items: Booking[]): Map<string, Booking[]> {
  const m = new Map<string, Booking[]>()
  for (const item of items) {
    const cur = new Date(item.check_in)
    const end = new Date(item.check_out)
    while (cur <= end) {
      const ymd = toYMD(cur)
      if (!m.has(ymd)) m.set(ymd, [])
      if (!m.get(ymd)!.find(x => x.id === item.id)) m.get(ymd)!.push(item)
      cur.setDate(cur.getDate() + 1)
    }
  }
  return m
}

// Build a map YMD → list of iCal reservations that span this day
function buildICalDayMap(items: ICalReservation[]): Map<string, ICalReservation[]> {
  const m = new Map<string, ICalReservation[]>()
  for (const item of items) {
    const cur = new Date(item.check_in)
    const end = new Date(item.check_out)
    const key = `${item.property_id}-${item.booking_ref || item.check_in}`
    while (cur <= end) {
      const ymd = toYMD(cur)
      if (!m.has(ymd)) m.set(ymd, [])
      const k2 = `${item.property_id}-${item.booking_ref || item.check_in}`
      if (!m.get(ymd)!.find(x => `${x.property_id}-${x.booking_ref || x.check_in}` === k2)) m.get(ymd)!.push(item)
      cur.setDate(cur.getDate() + 1)
    }
    void key
  }
  return m
}

// ─── Popups ───────────────────────────────────────────────────────────────────

function BookingPopup({
  booking,
  property,
  onClose,
}: {
  booking: Booking
  property?: Property
  onClose: () => void
}) {
  const color = STATUS_COLORS[booking.status]
  const statusLabel = { confirmed: 'Confirmée', pending: 'En attente', cancelled: 'Annulée' }[booking.status]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: color }} />
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="mt-2 mb-4 flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>
            {statusLabel}
          </span>
          {property && <span className="text-xs text-gray-500 font-medium">{property.name}</span>}
        </div>
        <h3 className="font-semibold text-lg mb-3" style={{ color: '#00243f' }}>{booking.guest_name}</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>
              {new Date(booking.check_in).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              {' → '}
              {new Date(booking.check_out).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          {booking.guest_phone && (
            <div className="flex items-center gap-2">
              <span>📞</span>
              <a href={`tel:${booking.guest_phone}`} className="hover:underline" style={{ color: '#0097b2' }}>
                {booking.guest_phone}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span>💰</span>
            <span className="font-semibold text-base" style={{ color: '#00243f' }}>
              {booking.total_price?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ICalPopup({
  reservation,
  property,
  onClose,
}: {
  reservation: ICalReservation
  property?: Property
  onClose: () => void
}) {
  const cfg = ICAL_SOURCE_CONFIG[reservation.source] ?? ICAL_SOURCE_CONFIG.other
  const sourceLabel = { airbnb: 'Réservation Airbnb', booking: 'Réservation Booking.com', other: 'Créneau bloqué' }[reservation.source]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: cfg.color }} />
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="mt-2 mb-4 flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white" style={{ backgroundColor: cfg.color }}>
            {cfg.label}
          </span>
          {property && <span className="text-xs text-gray-500 font-medium">{property.name}</span>}
        </div>
        <h3 className="font-semibold text-lg mb-3" style={{ color: '#00243f' }}>{sourceLabel}</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>
              {new Date(reservation.check_in).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              {' → '}
              {new Date(reservation.check_out).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          {reservation.booking_ref && (
            <div className="flex items-center gap-2">
              <span>🔖</span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{reservation.booking_ref}</span>
            </div>
          )}
          {reservation.phone4 && (
            <div className="flex items-center gap-2">
              <span>📞</span>
              <span>4 derniers chiffres : <strong>{reservation.phone4}</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Day Cell ─────────────────────────────────────────────────────────────────

interface DayEvent {
  kind: 'booking'
  data: Booking
  isStart: boolean
}
interface DayICalEvent {
  kind: 'ical'
  data: ICalReservation
  isStart: boolean
}
type AnyEvent = DayEvent | DayICalEvent

function EventChip({
  event,
  property,
  onClick,
}: {
  event: AnyEvent
  property?: Property
  onClick: () => void
}) {
  if (event.kind === 'booking') {
    const b = event.data
    const color = STATUS_COLORS[b.status]
    return (
      <button
        onClick={onClick}
        title={`${b.guest_name} — ${property?.name || ''}`}
        className="w-full text-left text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md truncate transition-opacity hover:opacity-80 leading-tight"
        style={{ backgroundColor: color }}
      >
        {event.isStart ? (
          <span className="truncate block">
            {b.guest_name.split(' ')[0]}
            {property && <span className="opacity-75"> · {property.name}</span>}
          </span>
        ) : (
          <span className="opacity-0 select-none">·</span>
        )}
      </button>
    )
  }

  // iCal
  const r = event.data
  const cfg = ICAL_SOURCE_CONFIG[r.source] ?? ICAL_SOURCE_CONFIG.other
  const label = r.source === 'airbnb'
    ? `Airbnb${r.booking_ref ? ' #' + r.booking_ref.slice(0, 6) : ''}`
    : cfg.label

  return (
    <button
      onClick={onClick}
      title={`${cfg.label} — ${property?.name || ''}`}
      className="w-full text-left text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md truncate transition-opacity hover:opacity-80 leading-tight"
      style={{ backgroundColor: cfg.color }}
    >
      {event.isStart ? (
        <span className="truncate block">{label}</span>
      ) : (
        <span className="opacity-0 select-none">·</span>
      )}
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CalendarView({
  bookings,
  properties,
  blockedDates,
  icalReservations,
}: CalendarViewProps) {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedProperty, setSelectedProperty] = useState<string>('all')
  const [selectedBooking, setSelectedBooking]     = useState<Booking | null>(null)
  const [selectedIcal, setSelectedIcal]           = useState<ICalReservation | null>(null)

  const filteredBookings = useMemo(() =>
    selectedProperty === 'all' ? bookings : bookings.filter(b => b.property_id === selectedProperty),
    [bookings, selectedProperty]
  )

  const filteredIcal = useMemo(() =>
    selectedProperty === 'all' ? icalReservations : icalReservations.filter(r => r.property_id === selectedProperty),
    [icalReservations, selectedProperty]
  )

  const filteredBlocked = useMemo(() =>
    selectedProperty === 'all' ? blockedDates : blockedDates.filter(b => b.property_id === selectedProperty),
    [blockedDates, selectedProperty]
  )

  const blockedSet = useMemo(() => new Set(filteredBlocked.map(b => b.date)), [filteredBlocked])

  const grid = useMemo(() => buildCalendarGrid(year, month), [year, month])

  const bookingDayMap = useMemo(() => buildBookingDayMap(filteredBookings), [filteredBookings])
  const icalDayMap    = useMemo(() => buildICalDayMap(filteredIcal), [filteredIcal])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
  }

  const today = toYMD(new Date())

  // Check if we have any iCal data to show in legend
  const hasAirbnb  = icalReservations.some(r => r.source === 'airbnb')
  const hasBooking = icalReservations.some(r => r.source === 'booking')
  const hasBlocked = blockedDates.length > 0

  return (
    <div className="space-y-4">

      {/* ── Controls ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white transition-colors text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="font-[var(--font-suez)] text-xl min-w-[180px] text-center" style={{ color: '#00243f' }}>
            {MONTHS_FR[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white transition-colors text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()) }}
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-white"
            style={{ borderColor: '#0097b2', color: '#0097b2' }}
          >
            Aujourd'hui
          </button>
        </div>

        <select
          value={selectedProperty}
          onChange={e => setSelectedProperty(e.target.value)}
          className="text-sm border rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2"
          style={{ borderColor: '#e5e7eb', color: '#00243f' }}
        >
          <option value="all">🏘 Tous les logements</option>
          {properties.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* ── Calendar grid ── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border" style={{ borderColor: '#e9e3da' }}>
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b" style={{ borderColor: '#e9e3da' }}>
          {DAYS_FR.map(d => (
            <div key={d} className="py-3 text-center text-xs font-semibold uppercase tracking-wide" style={{ color: '#979797' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {grid.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b last:border-b-0" style={{ borderColor: '#e9e3da' }}>
            {week.map((day, di) => {
              const ymd = toYMD(day)
              const isCurrentMonth = day.getMonth() === month
              const isToday = ymd === today
              const isBlocked = blockedSet.has(ymd)
              const dayBookings  = bookingDayMap.get(ymd) || []
              const dayIcal      = icalDayMap.get(ymd) || []

              // Merge events: bookings first, then iCal
              const events: AnyEvent[] = [
                ...dayBookings.map(b => ({
                  kind: 'booking' as const,
                  data: b,
                  isStart: toYMD(new Date(b.check_in)) === ymd,
                })),
                ...dayIcal.map(r => ({
                  kind: 'ical' as const,
                  data: r,
                  isStart: toYMD(new Date(r.check_in)) === ymd,
                })),
              ]

              return (
                <div
                  key={di}
                  className="min-h-[100px] p-1.5 border-r last:border-r-0 relative"
                  style={{
                    borderColor: '#e9e3da',
                    backgroundColor: isBlocked ? undefined : isCurrentMonth ? 'white' : '#fafaf9',
                    backgroundImage: isBlocked
                      ? 'repeating-linear-gradient(45deg, #fee2e2 0px, #fee2e2 2px, transparent 2px, transparent 8px)'
                      : undefined,
                  }}
                >
                  {/* Day number */}
                  <div className="flex justify-end mb-1">
                    <span
                      className="text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full"
                      style={{
                        backgroundColor: isToday ? '#0097b2' : undefined,
                        color: isToday ? 'white' : isCurrentMonth ? '#00243f' : '#9ca3af',
                        opacity: isCurrentMonth || isToday ? 1 : 0.35,
                      }}
                    >
                      {day.getDate()}
                    </span>
                  </div>

                  {/* Event chips */}
                  <div className="space-y-0.5">
                    {events.slice(0, 3).map((event, ei) => (
                      <EventChip
                        key={ei}
                        event={event}
                        property={properties.find(p => p.id === event.data.property_id)}
                        onClick={() => {
                          if (event.kind === 'booking') setSelectedBooking(event.data)
                          else setSelectedIcal(event.data)
                        }}
                      />
                    ))}
                    {events.length > 3 && (
                      <p className="text-[10px] text-gray-400 px-1">+{events.length - 3}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: '#0097b2' }} />
          Confirmée
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: '#f59e0b' }} />
          En attente
        </span>
        {hasAirbnb && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: '#FF5A5F' }} />
            Airbnb
          </span>
        )}
        {hasBooking && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: '#003580' }} />
            Booking.com
          </span>
        )}
        {hasBlocked && (
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{
                background: 'repeating-linear-gradient(45deg, #fca5a5 0px, #fca5a5 2px, transparent 2px, transparent 6px)',
                border: '1px solid #fca5a5',
              }}
            />
            Bloqué iCal
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: '#9ca3af' }} />
          Annulée
        </span>
      </div>

      {/* ── Popups ── */}
      {selectedBooking && (
        <BookingPopup
          booking={selectedBooking}
          property={properties.find(p => p.id === selectedBooking.property_id)}
          onClose={() => setSelectedBooking(null)}
        />
      )}
      {selectedIcal && (
        <ICalPopup
          reservation={selectedIcal}
          property={properties.find(p => p.id === selectedIcal.property_id)}
          onClose={() => setSelectedIcal(null)}
        />
      )}
    </div>
  )
}
