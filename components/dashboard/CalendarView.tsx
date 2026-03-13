'use client'

import { useState, useMemo } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

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
  date: string // YYYY-MM-DD
}

interface CalendarViewProps {
  bookings: Booking[]
  properties: Property[]
  blockedDates: BlockedDate[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#0097b2',
  pending:   '#f59e0b',
  cancelled: '#9ca3af',
}

const PROPERTY_COLORS = [
  '#0097b2', '#00243f', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#ec4899',
]

function toYMD(d: Date): string {
  return d.toISOString().split('T')[0]
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const d = new Date(year, month, 1)
  while (d.getMonth() === month) {
    days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

// Returns Mon-based grid: rows of 7 days covering the full month view
function buildCalendarGrid(year: number, month: number): Date[][] {
  const days = getDaysInMonth(year, month)
  const firstDay = days[0]
  // Monday = 0, Sunday = 6
  const startOffset = (firstDay.getDay() + 6) % 7
  const grid: Date[][] = []
  let week: Date[] = []

  // Leading days from previous month
  for (let i = startOffset - 1; i >= 0; i--) {
    week.push(addDays(firstDay, -(i + 1)))
  }
  for (const d of days) {
    week.push(d)
    if (week.length === 7) {
      grid.push(week)
      week = []
    }
  }
  // Trailing days to complete last row
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(addDays(week[week.length - 1], 1))
    }
    grid.push(week)
  }
  return grid
}

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS_FR = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

// ─── Mini Popup ───────────────────────────────────────────────────────────────

function BookingPopup({
  booking,
  property,
  onClose,
}: {
  booking: Booking
  property: Property | undefined
  onClose: () => void
}) {
  const color = STATUS_COLORS[booking.status]
  const statusLabel = { confirmed: 'Confirmée', pending: 'En attente', cancelled: 'Annulée' }[booking.status]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        {/* Color bar */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: color }} />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mt-2 mb-4 flex items-center gap-2">
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white"
            style={{ backgroundColor: color }}
          >
            {statusLabel}
          </span>
          {property && (
            <span className="text-xs text-gray-500 font-medium">{property.name}</span>
          )}
        </div>

        <h3 className="font-semibold text-lg mb-1" style={{ color: '#00243f' }}>
          {booking.guest_name}
        </h3>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <span>
              {new Date(booking.check_in).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              {' → '}
              {new Date(booking.check_out).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          {booking.guest_phone && (
            <div className="flex items-center gap-2">
              <span className="text-lg">📞</span>
              <a href={`tel:${booking.guest_phone}`} className="hover:underline" style={{ color: '#0097b2' }}>
                {booking.guest_phone}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-lg">💰</span>
            <span className="font-semibold text-base" style={{ color: '#00243f' }}>
              {booking.total_price?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CalendarView({ bookings, properties, blockedDates }: CalendarViewProps) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedProperty, setSelectedProperty] = useState<string>('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const propertyColorMap = useMemo(() => {
    const m: Record<string, string> = {}
    properties.forEach((p, i) => { m[p.id] = PROPERTY_COLORS[i % PROPERTY_COLORS.length] })
    return m
  }, [properties])

  const filteredBookings = useMemo(() =>
    selectedProperty === 'all' ? bookings : bookings.filter(b => b.property_id === selectedProperty),
    [bookings, selectedProperty]
  )

  const filteredBlocked = useMemo(() =>
    selectedProperty === 'all' ? blockedDates : blockedDates.filter(b => b.property_id === selectedProperty),
    [blockedDates, selectedProperty]
  )

  const blockedSet = useMemo(() => new Set(filteredBlocked.map(b => b.date)), [filteredBlocked])

  const grid = useMemo(() => buildCalendarGrid(year, month), [year, month])

  // Build a map: YMD → list of bookings that span this day
  const dayBookingMap = useMemo(() => {
    const m: Record<string, Booking[]> = {}
    for (const b of filteredBookings) {
      const start = new Date(b.check_in)
      const end = new Date(b.check_out)
      const cur = new Date(start)
      while (cur <= end) {
        const ymd = toYMD(cur)
        if (!m[ymd]) m[ymd] = []
        if (!m[ymd].find(x => x.id === b.id)) m[ymd].push(b)
        cur.setDate(cur.getDate() + 1)
      }
    }
    return m
  }, [filteredBookings])

  // Navigate months
  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const today = toYMD(new Date())

  return (
    <div className="space-y-4">

      {/* ── Controls ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Month nav */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl hover:bg-white transition-colors text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="font-[var(--font-suez)] text-xl min-w-[180px] text-center" style={{ color: '#00243f' }}>
            {MONTHS_FR[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-white transition-colors text-gray-600"
          >
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

        {/* Property filter */}
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

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: '#0097b2' }} />
          Confirmée
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: '#f59e0b' }} />
          En attente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: '#9ca3af' }} />
          Annulée
        </span>
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
              const dayBookings = dayBookingMap[ymd] || []

              return (
                <div
                  key={di}
                  className="min-h-[100px] p-1.5 border-r last:border-r-0 relative"
                  style={{
                    borderColor: '#e9e3da',
                    backgroundColor: isBlocked
                      ? undefined
                      : isCurrentMonth ? 'white' : '#fafaf9',
                    backgroundImage: isBlocked
                      ? 'repeating-linear-gradient(45deg, #fee2e2 0px, #fee2e2 2px, transparent 2px, transparent 8px)'
                      : undefined,
                  }}
                >
                  {/* Day number */}
                  <div className="flex justify-end mb-1">
                    <span
                      className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday ? 'text-white' : isCurrentMonth ? '' : 'opacity-30'
                      }`}
                      style={{
                        backgroundColor: isToday ? '#0097b2' : undefined,
                        color: isToday ? 'white' : isCurrentMonth ? '#00243f' : '#9ca3af',
                      }}
                    >
                      {day.getDate()}
                    </span>
                  </div>

                  {/* Booking chips */}
                  <div className="space-y-0.5">
                    {dayBookings.slice(0, 3).map(booking => {
                      const checkIn = toYMD(new Date(booking.check_in))
                      const isStart = ymd === checkIn
                      const prop = properties.find(p => p.id === booking.property_id)
                      const color = STATUS_COLORS[booking.status]

                      return (
                        <button
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          title={`${booking.guest_name} — ${prop?.name || ''}`}
                          className="w-full text-left text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md truncate transition-opacity hover:opacity-80 leading-tight"
                          style={{ backgroundColor: color }}
                        >
                          {isStart ? (
                            <span className="truncate block">
                              {booking.guest_name.split(' ')[0]}
                              {prop && <span className="opacity-75"> · {prop.name}</span>}
                            </span>
                          ) : (
                            <span className="opacity-0 select-none">·</span>
                          )}
                        </button>
                      )
                    })}
                    {dayBookings.length > 3 && (
                      <p className="text-[10px] text-gray-400 px-1">+{dayBookings.length - 3}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* ── Popup ── */}
      {selectedBooking && (
        <BookingPopup
          booking={selectedBooking}
          property={properties.find(p => p.id === selectedBooking.property_id)}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  )
}
