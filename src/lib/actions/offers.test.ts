import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createOffer } from './offers'

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock Supabase
const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: {
      getUser: mockGetUser,
    },
  })),
}))

// Mock Prisma
const mockSupplierFindUnique = vi.fn()
const mockOfferCreate = vi.fn()

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    supplier: {
      findUnique: (...args: unknown[]) => mockSupplierFindUnique(...args),
    },
    offer: {
      create: (...args: unknown[]) => mockOfferCreate(...args),
    },
  },
}))

// Helper: valid input
function validInput() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)

  return {
    name: 'Nutella 1kg',
    promoPrice: 12.99,
    discountPercent: 25,
    startDate: tomorrow.toISOString().split('T')[0],
    endDate: nextWeek.toISOString().split('T')[0],
    category: 'EPICERIE' as const,
  }
}

describe('createOffer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validation', () => {
    it('returns VALIDATION_ERROR for invalid data', async () => {
      const result = await createOffer({
        name: '',
        promoPrice: -1,
        discountPercent: 200,
        startDate: '',
        endDate: '',
        category: 'EPICERIE',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
      }
    })

    it('returns VALIDATION_ERROR for negative price', async () => {
      const result = await createOffer({
        ...validInput(),
        promoPrice: -5,
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
      }
    })
  })

  describe('authentication', () => {
    it('returns UNAUTHORIZED when no user session', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const result = await createOffer(validInput())

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('UNAUTHORIZED')
        expect(result.error).toContain('authentifié')
      }
    })
  })

  describe('authorization', () => {
    it('returns FORBIDDEN when user is not a supplier', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      })
      mockSupplierFindUnique.mockResolvedValue(null)

      const result = await createOffer(validInput())

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('FORBIDDEN')
        expect(result.error).toContain('fournisseur')
      }
    })
  })

  describe('successful creation', () => {
    it('creates offer and returns offerId', async () => {
      const userId = 'supplier-uuid-123'
      mockGetUser.mockResolvedValue({
        data: { user: { id: userId } },
      })
      mockSupplierFindUnique.mockResolvedValue({
        id: userId,
        companyName: 'Test Supplier',
      })
      mockOfferCreate.mockResolvedValue({
        id: 'offer-uuid-456',
        name: 'Nutella 1kg',
      })

      const result = await createOffer(validInput())

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.offerId).toBe('offer-uuid-456')
      }
    })

    it('uses user.id as supplierId (never from input)', async () => {
      const userId = 'supplier-uuid-123'
      mockGetUser.mockResolvedValue({
        data: { user: { id: userId } },
      })
      mockSupplierFindUnique.mockResolvedValue({ id: userId })
      mockOfferCreate.mockResolvedValue({ id: 'offer-uuid-456' })

      await createOffer(validInput())

      expect(mockOfferCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          supplierId: userId,
          status: 'ACTIVE',
        }),
      })
    })

    it('sets offer status to ACTIVE', async () => {
      const userId = 'supplier-uuid-123'
      mockGetUser.mockResolvedValue({
        data: { user: { id: userId } },
      })
      mockSupplierFindUnique.mockResolvedValue({ id: userId })
      mockOfferCreate.mockResolvedValue({ id: 'offer-uuid-456' })

      await createOffer(validInput())

      expect(mockOfferCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'ACTIVE',
        }),
      })
    })

    it('passes correct data to prisma.offer.create', async () => {
      const userId = 'supplier-uuid-123'
      const input = validInput()
      mockGetUser.mockResolvedValue({
        data: { user: { id: userId } },
      })
      mockSupplierFindUnique.mockResolvedValue({ id: userId })
      mockOfferCreate.mockResolvedValue({ id: 'offer-uuid-456' })

      await createOffer(input)

      expect(mockOfferCreate).toHaveBeenCalledWith({
        data: {
          supplierId: userId,
          name: input.name,
          promoPrice: input.promoPrice,
          discountPercent: input.discountPercent,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          category: input.category,
          status: 'ACTIVE',
        },
      })
    })
  })

  describe('error handling', () => {
    it('returns SERVER_ERROR on database failure', async () => {
      const userId = 'supplier-uuid-123'
      mockGetUser.mockResolvedValue({
        data: { user: { id: userId } },
      })
      mockSupplierFindUnique.mockResolvedValue({ id: userId })
      mockOfferCreate.mockRejectedValue(new Error('DB connection failed'))

      const result = await createOffer(validInput())

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('SERVER_ERROR')
      }
    })
  })
})
