import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatPrice, formatDateRange, formatDiscount, formatRelativeDate, formatAbsoluteDate } from './format'

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

describe('formatRelativeDate', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  function setNow(isoString: string) {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(isoString))
  }

  it('returns "à l\'instant" for less than 1 minute ago', () => {
    setNow('2026-02-10T12:00:30Z')
    expect(formatRelativeDate('2026-02-10T12:00:00Z')).toBe("à l'instant")
  })

  it('returns "il y a Xmin" for less than 60 minutes ago', () => {
    setNow('2026-02-10T12:15:00Z')
    expect(formatRelativeDate('2026-02-10T12:00:00Z')).toBe('il y a 15min')
  })

  it('returns "il y a 1min" for exactly 1 minute ago', () => {
    setNow('2026-02-10T12:01:00Z')
    expect(formatRelativeDate('2026-02-10T12:00:00Z')).toBe('il y a 1min')
  })

  it('returns "il y a Xh" for less than 24 hours ago', () => {
    setNow('2026-02-10T14:00:00Z')
    expect(formatRelativeDate('2026-02-10T12:00:00Z')).toBe('il y a 2h')
  })

  it('returns "il y a 1h" for exactly 1 hour ago', () => {
    setNow('2026-02-10T13:00:00Z')
    expect(formatRelativeDate('2026-02-10T12:00:00Z')).toBe('il y a 1h')
  })

  it('returns "hier" for 1 day ago', () => {
    setNow('2026-02-11T12:00:00Z')
    expect(formatRelativeDate('2026-02-10T12:00:00Z')).toBe('hier')
  })

  it('returns "il y a Xj" for 2-6 days ago', () => {
    setNow('2026-02-13T12:00:00Z')
    expect(formatRelativeDate('2026-02-10T12:00:00Z')).toBe('il y a 3j')
  })

  it('returns "il y a Xsem" for 7-29 days ago', () => {
    setNow('2026-02-17T12:00:00Z')
    expect(formatRelativeDate('2026-02-10T12:00:00Z')).toBe('il y a 1sem')
  })

  it('returns "il y a 2sem" for 14 days ago', () => {
    setNow('2026-02-24T12:00:00Z')
    expect(formatRelativeDate('2026-02-10T12:00:00Z')).toBe('il y a 2sem')
  })

  it('returns "il y a 4sem" for 28 days ago', () => {
    setNow('2026-03-10T12:00:00Z')
    expect(formatRelativeDate('2026-02-10T12:00:00Z')).toBe('il y a 4sem')
  })

  it('returns formatted date for 30+ days ago', () => {
    setNow('2026-03-15T12:00:00Z')
    const result = formatRelativeDate('2026-02-10T12:00:00Z')
    expect(result).toMatch(/10/)
    expect(result).toMatch(/fév/i)
  })

  it('accepts Date objects', () => {
    setNow('2026-02-10T12:05:00Z')
    expect(formatRelativeDate(new Date('2026-02-10T12:00:00Z'))).toBe('il y a 5min')
  })

  it('accepts string dates', () => {
    setNow('2026-02-10T15:00:00Z')
    expect(formatRelativeDate('2026-02-10T12:00:00Z')).toBe('il y a 3h')
  })

  it('uses calendar days for "hier" boundary (47h across 2 calendar days)', () => {
    setNow('2026-02-12T07:00:00Z')
    expect(formatRelativeDate('2026-02-10T08:00:00Z')).toBe('il y a 2j')
  })
})

describe('formatAbsoluteDate', () => {
  it('formats date with day, month, and year', () => {
    const result = formatAbsoluteDate('2026-02-10T12:00:00Z')
    expect(result).toMatch(/10/)
    expect(result).toMatch(/fév/i)
    expect(result).toMatch(/2026/)
  })

  it('accepts Date objects', () => {
    const result = formatAbsoluteDate(new Date('2026-03-15T12:00:00Z'))
    expect(result).toMatch(/15/)
    expect(result).toMatch(/mars/i)
    expect(result).toMatch(/2026/)
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
