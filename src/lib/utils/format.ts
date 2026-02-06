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
