import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { OfferCardSkeleton, OfferListSkeleton } from './offer-card-skeleton'

describe('OfferCardSkeleton', () => {
  it('renders skeleton elements', () => {
    const { container } = render(<OfferCardSkeleton />)

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})

describe('OfferListSkeleton', () => {
  it('renders 3 skeleton cards', () => {
    const { container } = render(<OfferListSkeleton />)

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    // Each OfferCardSkeleton has 6 skeleton elements, 3 cards = 18
    expect(skeletons.length).toBe(18)
  })
})
