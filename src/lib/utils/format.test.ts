import { describe, it, expect } from 'vitest'
import { formatPrice, formatDateRange, formatDiscount } from './format'

describe('formatPrice', () => {
  it('formats price with French locale and EUR currency', () => {
    const result = formatPrice(12.99)
    // Intl.NumberFormat('fr-FR') uses narrow no-break space before €
    expect(result).toMatch(/12,99/)
    expect(result).toMatch(/€/)
  })

  it('formats zero price', () => {
    const result = formatPrice(0)
    expect(result).toMatch(/0,00/)
    expect(result).toMatch(/€/)
  })

  it('formats integer price with decimals', () => {
    const result = formatPrice(5)
    expect(result).toMatch(/5,00/)
  })

  it('formats large price', () => {
    const result = formatPrice(1234.56)
    expect(result).toMatch(/1[\s\u202f]?234,56/)
  })
})

describe('formatDateRange', () => {
  it('formats a date range in French short format', () => {
    const start = new Date('2026-02-15')
    const end = new Date('2026-02-28')
    const result = formatDateRange(start, end)

    expect(result).toContain(' - ')
    expect(result).toMatch(/15/)
    expect(result).toMatch(/28/)
    expect(result).toMatch(/fév/i)
  })

  it('formats date range across months', () => {
    const start = new Date('2026-01-20')
    const end = new Date('2026-02-15')
    const result = formatDateRange(start, end)

    expect(result).toContain(' - ')
    expect(result).toMatch(/20/)
    expect(result).toMatch(/15/)
  })

  it('accepts string dates', () => {
    const result = formatDateRange('2026-03-01T00:00:00.000Z', '2026-03-31T00:00:00.000Z')
    expect(result).toContain(' - ')
  })
})

describe('formatDiscount', () => {
  it('formats discount percentage', () => {
    expect(formatDiscount(25)).toBe('-25%')
  })

  it('formats zero discount', () => {
    expect(formatDiscount(0)).toBe('-0%')
  })

  it('formats small discount', () => {
    expect(formatDiscount(5)).toBe('-5%')
  })

  it('formats large discount', () => {
    expect(formatDiscount(50)).toBe('-50%')
  })
})
