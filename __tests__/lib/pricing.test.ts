import { describe, it, expect } from 'vitest'
import { calculatePrice } from '@/lib/pricing'
import type { PricingRule } from '@/lib/pricing'

const makeRule = (overrides: Partial<PricingRule>): PricingRule => ({
  id: 'test-rule',
  rule_type: 'last_minute',
  params: {},
  discount_pct: null,
  markup_pct: null,
  floor_price: null,
  priority: 1,
  enabled: true,
  ...overrides,
})

const d = (offsetDays: number) => {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  date.setHours(0, 0, 0, 0)
  return date
}

describe('calculatePrice — cas de base', () => {
  it('sans règles : prix = basePrice × nuits', () => {
    const result = calculatePrice(100, d(5), d(8), [])
    expect(result.nights).toBe(3)
    expect(result.subtotal).toBe(300)
    expect(result.finalPrice).toBe(300)
    expect(result.totalDiscount).toBe(0)
    expect(result.totalMarkup).toBe(0)
  })

  it('1 nuit', () => {
    const result = calculatePrice(80, d(3), d(4), [])
    expect(result.nights).toBe(1)
    expect(result.finalPrice).toBe(80)
  })

  it('règle désactivée ignorée', () => {
    const rule = makeRule({ rule_type: 'last_minute', params: { days_before: 30 }, discount_pct: 20, enabled: false })
    const result = calculatePrice(100, d(2), d(5), [rule])
    expect(result.finalPrice).toBe(300)
    expect(result.appliedRules).toHaveLength(0)
  })
})

describe('calculatePrice — last_minute', () => {
  it('applique la réduction si dans la fenêtre', () => {
    const rule = makeRule({ rule_type: 'last_minute', params: { days_before: 7 }, discount_pct: 20 })
    const result = calculatePrice(100, d(3), d(6), [rule])
    expect(result.nights).toBe(3)
    expect(result.subtotal).toBe(300)
    expect(result.totalDiscount).toBe(60) // 20% de 300
    expect(result.finalPrice).toBe(240)
  })

  it("n'applique pas si hors fenêtre", () => {
    const rule = makeRule({ rule_type: 'last_minute', params: { days_before: 3 }, discount_pct: 20 })
    const result = calculatePrice(100, d(10), d(13), [rule]) // check-in dans 10j > 3j
    expect(result.finalPrice).toBe(300)
    expect(result.appliedRules).toHaveLength(0)
  })
})

describe('calculatePrice — long_stay', () => {
  it('applique la réduction si nuits >= min_nights', () => {
    const rule = makeRule({ rule_type: 'long_stay', params: { min_nights: 7 }, discount_pct: 10 })
    const result = calculatePrice(100, d(10), d(17), [rule]) // 7 nuits
    expect(result.nights).toBe(7)
    expect(result.totalDiscount).toBe(70) // 10% de 700
    expect(result.finalPrice).toBe(630)
  })

  it("n'applique pas si nuits < min_nights", () => {
    const rule = makeRule({ rule_type: 'long_stay', params: { min_nights: 7 }, discount_pct: 10 })
    const result = calculatePrice(100, d(10), d(15), [rule]) // 5 nuits
    expect(result.finalPrice).toBe(500)
    expect(result.appliedRules).toHaveLength(0)
  })
})

describe('calculatePrice — floor_price', () => {
  it('empêche le prix de descendre sous le plancher', () => {
    const lastMinute = makeRule({ rule_type: 'last_minute', params: { days_before: 30 }, discount_pct: 50 })
    const floor = makeRule({ rule_type: 'floor_price', floor_price: 90 })
    const result = calculatePrice(100, d(1), d(4), [lastMinute, floor]) // 3 nuits × 100 = 300 → -50% = 150, mais floor 90×3=270
    expect(result.finalPrice).toBe(270)
  })

  it('ne bloque pas si le prix calculé est au-dessus du plancher', () => {
    const floor = makeRule({ rule_type: 'floor_price', floor_price: 50 })
    const result = calculatePrice(100, d(5), d(8), [floor])
    expect(result.finalPrice).toBe(300) // 100×3 > 50×3
  })
})

describe('calculatePrice — règles combinées', () => {
  it('cumuler last_minute + long_stay', () => {
    const lm = makeRule({ id: 'lm', rule_type: 'last_minute', params: { days_before: 14 }, discount_pct: 10 })
    const ls = makeRule({ id: 'ls', rule_type: 'long_stay', params: { min_nights: 5 }, discount_pct: 5 })
    const result = calculatePrice(100, d(3), d(10), [lm, ls]) // 7 nuits = 700€ − 10% − 5%
    expect(result.nights).toBe(7)
    expect(result.appliedRules).toHaveLength(2)
    expect(result.finalPrice).toBeLessThan(700)
  })

  it('résultat cohérent : finalPrice = subtotal + markups - discounts (approx)', () => {
    const lm = makeRule({ rule_type: 'last_minute', params: { days_before: 30 }, discount_pct: 20 })
    const result = calculatePrice(100, d(2), d(5), [lm])
    // finalPrice ≈ subtotal × 0.8
    expect(result.finalPrice).toBeCloseTo(result.subtotal * 0.8, 0)
  })
})

describe('calculatePrice — pricePerNight', () => {
  it('pricePerNight = finalPrice / nights', () => {
    const result = calculatePrice(100, d(5), d(8), [])
    expect(result.pricePerNight).toBe(100)
  })
})
