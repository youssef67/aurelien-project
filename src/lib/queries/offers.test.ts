import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    offer: {
      findMany: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma/client'
import { getActiveOffers } from './offers'

describe('getActiveOffers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls prisma with correct filters for active non-deleted offers', async () => {
    vi.mocked(prisma.offer.findMany).mockResolvedValue([])

    await getActiveOffers()

    const callArgs = vi.mocked(prisma.offer.findMany).mock.calls[0][0]
    expect(callArgs?.where).toMatchObject({
      status: 'ACTIVE',
      deletedAt: null,
    })
    expect(callArgs?.where?.endDate).toHaveProperty('gte')
  })

  it('excludes DRAFT offers by filtering status ACTIVE', async () => {
    vi.mocked(prisma.offer.findMany).mockResolvedValue([])

    await getActiveOffers()

    const callArgs = vi.mocked(prisma.offer.findMany).mock.calls[0][0]
    expect(callArgs?.where?.status).toBe('ACTIVE')
  })

  it('excludes soft-deleted offers', async () => {
    vi.mocked(prisma.offer.findMany).mockResolvedValue([])

    await getActiveOffers()

    const callArgs = vi.mocked(prisma.offer.findMany).mock.calls[0][0]
    expect(callArgs?.where?.deletedAt).toBeNull()
  })

  it('excludes expired offers with endDate >= today filter', async () => {
    vi.mocked(prisma.offer.findMany).mockResolvedValue([])

    await getActiveOffers()

    const callArgs = vi.mocked(prisma.offer.findMany).mock.calls[0][0]
    const endDateFilter = callArgs?.where?.endDate as { gte: Date }
    expect(endDateFilter.gte).toBeInstanceOf(Date)
    // Today at UTC midnight
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    expect(endDateFilter.gte.getTime()).toBe(today.getTime())
  })

  it('includes supplier.companyName relation', async () => {
    vi.mocked(prisma.offer.findMany).mockResolvedValue([])

    await getActiveOffers()

    const callArgs = vi.mocked(prisma.offer.findMany).mock.calls[0][0]
    expect(callArgs?.include).toEqual({
      supplier: {
        select: { companyName: true },
      },
    })
  })

  it('orders by createdAt desc', async () => {
    vi.mocked(prisma.offer.findMany).mockResolvedValue([])

    await getActiveOffers()

    const callArgs = vi.mocked(prisma.offer.findMany).mock.calls[0][0]
    expect(callArgs?.orderBy).toEqual({ createdAt: 'desc' })
  })

  it('returns the offers from prisma', async () => {
    const mockOffers = [{ id: '1', name: 'Test' }]
    vi.mocked(prisma.offer.findMany).mockResolvedValue(mockOffers as never)

    const result = await getActiveOffers()

    expect(result).toEqual(mockOffers)
  })
})
