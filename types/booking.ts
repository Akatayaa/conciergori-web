export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Booking {
  id: string
  tenantId: string
  propertyId: string
  guestName: string
  guestEmail: string
  startDate: string
  endDate: string
  status: BookingStatus
  stripePaymentId?: string
  totalAmount: number
  createdAt: string
}

export interface Property {
  id: string
  tenantId: string
  name: string
  address: string
  icalUrl?: string
  description?: string
}
