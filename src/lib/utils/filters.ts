export type DateFilterValue = 'all' | 'this-week' | 'this-month'

export function getWeekRange(): { start: Date; end: Date } {
  const now = new Date()
  const day = now.getUTCDay() // 0 = dimanche
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() - ((day + 6) % 7))
  monday.setUTCHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  sunday.setUTCHours(23, 59, 59, 999)
  return { start: monday, end: sunday }
}

export function getMonthRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999))
  return { start, end }
}

export function dateRangesOverlap(
  offerStart: string,
  offerEnd: string,
  filterStart: Date,
  filterEnd: Date
): boolean {
  const oStart = new Date(offerStart)
  const oEnd = new Date(offerEnd)
  return oStart <= filterEnd && oEnd >= filterStart
}
