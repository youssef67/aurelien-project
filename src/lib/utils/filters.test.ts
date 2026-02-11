import { describe, it, expect, vi, afterEach } from 'vitest'
import { getWeekRange, getMonthRange, dateRangesOverlap } from './filters'

describe('getWeekRange', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns monday to sunday of the current week (UTC)', () => {
    // Wednesday 2026-02-04
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-04T12:00:00Z'))

    const { start, end } = getWeekRange()

    // Monday 2026-02-02
    expect(start.getUTCFullYear()).toBe(2026)
    expect(start.getUTCMonth()).toBe(1) // February
    expect(start.getUTCDate()).toBe(2)
    expect(start.getUTCHours()).toBe(0)
    expect(start.getUTCMinutes()).toBe(0)
    expect(start.getUTCSeconds()).toBe(0)

    // Sunday 2026-02-08
    expect(end.getUTCFullYear()).toBe(2026)
    expect(end.getUTCMonth()).toBe(1)
    expect(end.getUTCDate()).toBe(8)
    expect(end.getUTCHours()).toBe(23)
    expect(end.getUTCMinutes()).toBe(59)
    expect(end.getUTCSeconds()).toBe(59)
  })

  it('handles Monday correctly', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-02T08:00:00Z')) // Monday

    const { start, end } = getWeekRange()
    expect(start.getUTCDate()).toBe(2) // Monday itself
    expect(end.getUTCDate()).toBe(8)   // Sunday
  })

  it('handles Sunday correctly', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-08T20:00:00Z')) // Sunday

    const { start, end } = getWeekRange()
    expect(start.getUTCDate()).toBe(2) // Previous Monday
    expect(end.getUTCDate()).toBe(8)   // Sunday itself
  })
})

describe('getMonthRange', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns first to last day of current month (UTC)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

    const { start, end } = getMonthRange()

    expect(start.getUTCFullYear()).toBe(2026)
    expect(start.getUTCMonth()).toBe(1)
    expect(start.getUTCDate()).toBe(1)
    expect(start.getUTCHours()).toBe(0)

    expect(end.getUTCFullYear()).toBe(2026)
    expect(end.getUTCMonth()).toBe(1)
    expect(end.getUTCDate()).toBe(28) // February 2026 is not a leap year
    expect(end.getUTCHours()).toBe(23)
    expect(end.getUTCMinutes()).toBe(59)
    expect(end.getUTCSeconds()).toBe(59)
  })

  it('handles month with 31 days', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-10T12:00:00Z'))

    const { end } = getMonthRange()
    expect(end.getUTCDate()).toBe(31)
  })

  it('handles leap year February', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2028-02-10T12:00:00Z')) // 2028 is a leap year

    const { end } = getMonthRange()
    expect(end.getUTCDate()).toBe(29)
  })
})

describe('dateRangesOverlap', () => {
  const filterStart = new Date('2026-02-10T00:00:00Z')
  const filterEnd = new Date('2026-02-16T23:59:59Z')

  it('returns true for total overlap (offer contains filter)', () => {
    expect(dateRangesOverlap(
      '2026-02-01T00:00:00Z',
      '2026-02-28T00:00:00Z',
      filterStart,
      filterEnd,
    )).toBe(true)
  })

  it('returns true for offer entirely within filter range', () => {
    expect(dateRangesOverlap(
      '2026-02-11T00:00:00Z',
      '2026-02-14T00:00:00Z',
      filterStart,
      filterEnd,
    )).toBe(true)
  })

  it('returns true for partial overlap at start', () => {
    expect(dateRangesOverlap(
      '2026-02-05T00:00:00Z',
      '2026-02-12T00:00:00Z',
      filterStart,
      filterEnd,
    )).toBe(true)
  })

  it('returns true for partial overlap at end', () => {
    expect(dateRangesOverlap(
      '2026-02-14T00:00:00Z',
      '2026-02-20T00:00:00Z',
      filterStart,
      filterEnd,
    )).toBe(true)
  })

  it('returns false for no overlap (offer before filter)', () => {
    expect(dateRangesOverlap(
      '2026-02-01T00:00:00Z',
      '2026-02-09T23:59:59Z',
      filterStart,
      filterEnd,
    )).toBe(false)
  })

  it('returns false for no overlap (offer after filter)', () => {
    expect(dateRangesOverlap(
      '2026-02-17T00:00:00Z',
      '2026-02-25T00:00:00Z',
      filterStart,
      filterEnd,
    )).toBe(false)
  })

  it('returns true for same day overlap (offer starts on filter end)', () => {
    expect(dateRangesOverlap(
      '2026-02-16T00:00:00Z',
      '2026-02-20T00:00:00Z',
      filterStart,
      filterEnd,
    )).toBe(true)
  })

  it('returns true for same day overlap (offer ends on filter start)', () => {
    expect(dateRangesOverlap(
      '2026-02-05T00:00:00Z',
      '2026-02-10T00:00:00Z',
      filterStart,
      filterEnd,
    )).toBe(true)
  })

  it('handles single-day offer within range', () => {
    expect(dateRangesOverlap(
      '2026-02-12T00:00:00Z',
      '2026-02-12T23:59:59Z',
      filterStart,
      filterEnd,
    )).toBe(true)
  })

  it('handles single-day offer outside range', () => {
    expect(dateRangesOverlap(
      '2026-02-09T00:00:00Z',
      '2026-02-09T23:59:59Z',
      filterStart,
      filterEnd,
    )).toBe(false)
  })
})
