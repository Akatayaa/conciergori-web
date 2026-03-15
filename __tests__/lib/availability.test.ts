import { describe, it, expect } from 'vitest'

/**
 * Tests de la logique de disponibilité / détection de conflit.
 * La fonction isConflict détermine si deux séjours se chevauchent.
 * Règle : check-out le jour J = check-in le jour J autorisé (pas de chevauchement).
 */

function isConflict(
  newCheckIn: Date, newCheckOut: Date,
  existingCheckIn: Date, existingCheckOut: Date
): boolean {
  // Chevauchement si newIn < existingOut ET newOut > existingIn
  return newCheckIn < existingCheckOut && newCheckOut > existingCheckIn
}

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day)

describe('isConflict — détection de chevauchement', () => {
  it('chevauchement total : nouvelle résa incluse dans existante', () => {
    expect(isConflict(d(2025, 6, 5), d(2025, 6, 8), d(2025, 6, 3), d(2025, 6, 10))).toBe(true)
  })

  it('chevauchement partiel début', () => {
    expect(isConflict(d(2025, 6, 1), d(2025, 6, 6), d(2025, 6, 4), d(2025, 6, 10))).toBe(true)
  })

  it('chevauchement partiel fin', () => {
    expect(isConflict(d(2025, 6, 7), d(2025, 6, 12), d(2025, 6, 3), d(2025, 6, 9))).toBe(true)
  })

  it('pas de conflit : séjours consécutifs (checkout = checkin suivant)', () => {
    // Voyageur A part le 10, voyageur B arrive le 10 → OK
    expect(isConflict(d(2025, 6, 10), d(2025, 6, 13), d(2025, 6, 7), d(2025, 6, 10))).toBe(false)
  })

  it('pas de conflit : séjour avant', () => {
    expect(isConflict(d(2025, 6, 15), d(2025, 6, 18), d(2025, 6, 7), d(2025, 6, 10))).toBe(false)
  })

  it('pas de conflit : séjour après', () => {
    expect(isConflict(d(2025, 6, 1), d(2025, 6, 4), d(2025, 6, 10), d(2025, 6, 15))).toBe(false)
  })

  it('séjour identique = conflit', () => {
    expect(isConflict(d(2025, 7, 1), d(2025, 7, 7), d(2025, 7, 1), d(2025, 7, 7))).toBe(true)
  })
})
