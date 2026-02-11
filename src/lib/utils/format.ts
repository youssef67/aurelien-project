const priceFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

const shortDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
})

export function formatPrice(price: number): string {
  return priceFormatter.format(price)
}

export function formatDateRange(start: Date | string, end: Date | string): string {
  return `${shortDateFormatter.format(new Date(start))} - ${shortDateFormatter.format(new Date(end))}`
}

export function formatDiscount(percent: number): string {
  return `-${percent}%`
}

export function formatRelativeDate(date: Date | string): string {
  const now = new Date()
  const d = typeof date === 'string' ? new Date(date) : date
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)

  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin}min`
  if (diffH < 24) return `il y a ${diffH}h`

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dateDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((today.getTime() - dateDay.getTime()) / 86400000)

  if (diffDays === 1) return 'hier'
  if (diffDays < 7) return `il y a ${diffDays}j`

  const diffWeeks = Math.floor(diffDays / 7)
  if (diffDays < 30) return `il y a ${diffWeeks}sem`

  return shortDateFormatter.format(d)
}

const absoluteDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatAbsoluteDate(date: Date | string): string {
  return absoluteDateFormatter.format(typeof date === 'string' ? new Date(date) : date)
}
