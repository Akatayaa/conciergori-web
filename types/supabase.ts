// Types générés depuis le schéma Supabase — à régénérer avec `supabase gen types`
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      bookings: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      properties: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
    }
  }
}
