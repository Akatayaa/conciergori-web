export interface PricingRule {
  id: string
  rule_type: 'last_minute' | 'period' | 'long_stay' | 'floor_price'
  params: Record<string, unknown>
  discount_pct: number | null
  markup_pct: number | null
  floor_price: number | null
  priority: number
  enabled: boolean
}

export interface PriceBreakdown {
  basePrice: number        // prix de base par nuit
  nights: number
  subtotal: number         // base × nuits
  appliedRules: { name: string; effect: string; delta: number }[]
  totalDiscount: number    // somme des réductions en €
  totalMarkup: number      // somme des suppléments en €
  finalPrice: number       // total final
  pricePerNight: number    // prix effectif par nuit
}

export function calculatePrice(
  basePrice: number,
  checkIn: Date,
  checkOut: Date,
  rules: PricingRule[]
): PriceBreakdown {
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  const subtotal = basePrice * nights
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const appliedRules: PriceBreakdown['appliedRules'] = []
  let adjustmentPct = 0  // % cumulé (négatif = réduction, positif = supplément)
  let floorPrice = 0

  // Trier par priorité
  const sorted = [...rules].filter(r => r.enabled).sort((a, b) => b.priority - a.priority)

  for (const rule of sorted) {
    if (rule.rule_type === 'last_minute') {
      const daysUntilCheckIn = Math.round((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const maxDays = rule.params.days_before as number
      if (daysUntilCheckIn >= 0 && daysUntilCheckIn <= maxDays) {
        const pct = -(rule.discount_pct ?? 0)
        adjustmentPct += pct
        appliedRules.push({
          name: `Dernière minute (−${rule.discount_pct}%)`,
          effect: `Réservation à ${daysUntilCheckIn}j`,
          delta: Math.round(subtotal * pct / 100),
        })
      }
    }

    if (rule.rule_type === 'period') {
      const from = new Date(rule.params.date_from as string)
      const to = new Date(rule.params.date_to as string)
      // S'applique si le séjour chevauche la période
      if (checkIn <= to && checkOut >= from) {
        if (rule.markup_pct) {
          adjustmentPct += rule.markup_pct
          appliedRules.push({
            name: `Période haute (+${rule.markup_pct}%)`,
            effect: `${from.toLocaleDateString('fr')} – ${to.toLocaleDateString('fr')}`,
            delta: Math.round(subtotal * rule.markup_pct / 100),
          })
        } else if (rule.discount_pct) {
          const pct = -(rule.discount_pct)
          adjustmentPct += pct
          appliedRules.push({
            name: `Période basse (−${rule.discount_pct}%)`,
            effect: `${from.toLocaleDateString('fr')} – ${to.toLocaleDateString('fr')}`,
            delta: Math.round(subtotal * pct / 100),
          })
        }
      }
    }

    if (rule.rule_type === 'long_stay') {
      const minNights = rule.params.min_nights as number
      if (nights >= minNights) {
        const pct = -(rule.discount_pct ?? 0)
        adjustmentPct += pct
        appliedRules.push({
          name: `Séjour long (−${rule.discount_pct}%)`,
          effect: `${nights} nuits ≥ ${minNights}`,
          delta: Math.round(subtotal * pct / 100),
        })
      }
    }

    if (rule.rule_type === 'floor_price') {
      floorPrice = Math.max(floorPrice, rule.floor_price ?? 0)
    }
  }

  const adjustedTotal = Math.round(subtotal * (1 + adjustmentPct / 100))
  const minTotal = floorPrice * nights
  const finalPrice = Math.max(adjustedTotal, minTotal)

  const totalDiscount = appliedRules.filter(r => r.delta < 0).reduce((s, r) => s + Math.abs(r.delta), 0)
  const totalMarkup = appliedRules.filter(r => r.delta > 0).reduce((s, r) => s + r.delta, 0)

  return {
    basePrice,
    nights,
    subtotal,
    appliedRules,
    totalDiscount,
    totalMarkup,
    finalPrice,
    pricePerNight: nights > 0 ? Math.round(finalPrice / nights) : basePrice,
  }
}
