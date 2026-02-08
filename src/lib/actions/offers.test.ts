import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'
import { createOffer, updateOffer, deleteOffer } from './offers'

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock Supabase
const mockGetUser = vi.fn()
const mockStorageRemove = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: {
      getUser: mockGetUser,
    },
    storage: {
      from: () => ({
        remove: mockStorageRemove,
      }),
    },
  })),
}))

// Mock Prisma
const mockSupplierFindUnique = vi.fn()
const mockOfferCreate = vi.fn()
const mockOfferFindUnique = vi.fn()
const mockOfferUpdate = vi.fn()

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    supplier: {
      findUnique: (...args: unknown[]) => mockSupplierFindUnique(...args),
    },
    offer: {
      create: (...args: unknown[]) => mockOfferCreate(...args),
      findUnique: (...args: unknown[]) => mockOfferFindUnique(...args),
      update: (...args: unknown[]) => mockOfferUpdate(...args),
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

  describe('optional fields (step 3)', () => {
    const userId = 'supplier-uuid-123'

    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: userId } },
      })
      mockSupplierFindUnique.mockResolvedValue({ id: userId })
      mockOfferCreate.mockResolvedValue({ id: 'offer-uuid-789' })
    })

    it('creates offer with optional fields when provided', async () => {
      const input = {
        ...validInput(),
        subcategory: 'Bio',
        margin: 15.5,
        volume: '2 palettes',
        conditions: 'Franco 500€',
        animation: 'PLV tête de gondole',
        photoUrl: 'https://example.com/photo.jpg',
      }

      const result = await createOffer(input)

      expect(result.success).toBe(true)
      expect(mockOfferCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          subcategory: 'Bio',
          margin: 15.5,
          volume: '2 palettes',
          conditions: 'Franco 500€',
          animation: 'PLV tête de gondole',
          photoUrl: 'https://example.com/photo.jpg',
        }),
      })
    })

    it('creates offer without optional fields (backward compat)', async () => {
      const result = await createOffer(validInput())

      expect(result.success).toBe(true)
      expect(mockOfferCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Nutella 1kg',
          supplierId: userId,
        }),
      })
      // Optional fields should not be set (undefined → Prisma ignores them)
      const callData = mockOfferCreate.mock.calls[0][0].data
      expect(callData.subcategory).toBeUndefined()
      expect(callData.margin).toBeUndefined()
      expect(callData.volume).toBeUndefined()
      expect(callData.conditions).toBeUndefined()
      expect(callData.animation).toBeUndefined()
      expect(callData.photoUrl).toBeUndefined()
    })

    it('transforms empty strings to undefined', async () => {
      const input = {
        ...validInput(),
        subcategory: '',
        volume: '',
        conditions: '',
        animation: '',
        photoUrl: '',
      }

      const result = await createOffer(input)

      expect(result.success).toBe(true)
      const callData = mockOfferCreate.mock.calls[0][0].data
      expect(callData.subcategory).toBeUndefined()
      expect(callData.volume).toBeUndefined()
      expect(callData.conditions).toBeUndefined()
      expect(callData.animation).toBeUndefined()
      expect(callData.photoUrl).toBeUndefined()
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

// ============================================
// updateOffer
// ============================================

function validUpdateInput() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)

  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Nutella 1kg Updated',
    promoPrice: 11.99,
    discountPercent: 30,
    startDate: tomorrow.toISOString().split('T')[0],
    endDate: nextWeek.toISOString().split('T')[0],
    category: 'EPICERIE' as const,
  }
}

function mockExistingOffer(userId: string, overrides: Record<string, unknown> = {}) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    supplierId: userId,
    name: 'Nutella 1kg',
    startDate: tomorrow,
    photoUrl: null,
    deletedAt: null,
    ...overrides,
  }
}

describe('updateOffer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validation', () => {
    it('returns VALIDATION_ERROR for invalid data', async () => {
      const result = await updateOffer({
        id: 'not-a-uuid',
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
  })

  describe('authentication', () => {
    it('returns UNAUTHORIZED when no user session', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const result = await updateOffer(validUpdateInput())

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

      const result = await updateOffer(validUpdateInput())

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('FORBIDDEN')
        expect(result.error).toContain('fournisseur')
      }
    })

    it('returns FORBIDDEN when offer belongs to another supplier', async () => {
      const userId = 'supplier-uuid-123'
      mockGetUser.mockResolvedValue({
        data: { user: { id: userId } },
      })
      mockSupplierFindUnique.mockResolvedValue({ id: userId })
      mockOfferFindUnique.mockResolvedValue({
        ...mockExistingOffer('other-supplier-id'),
      })

      const result = await updateOffer(validUpdateInput())

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('FORBIDDEN')
        expect(result.error).toContain('interdit')
      }
    })
  })

  describe('offer not found', () => {
    it('returns NOT_FOUND when offer does not exist', async () => {
      const userId = 'supplier-uuid-123'
      mockGetUser.mockResolvedValue({
        data: { user: { id: userId } },
      })
      mockSupplierFindUnique.mockResolvedValue({ id: userId })
      mockOfferFindUnique.mockResolvedValue(null)

      const result = await updateOffer(validUpdateInput())

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('NOT_FOUND')
        expect(result.error).toContain('introuvable')
      }
    })

    it('returns NOT_FOUND when offer is soft-deleted', async () => {
      const userId = 'supplier-uuid-123'
      mockGetUser.mockResolvedValue({
        data: { user: { id: userId } },
      })
      mockSupplierFindUnique.mockResolvedValue({ id: userId })
      mockOfferFindUnique.mockResolvedValue({
        ...mockExistingOffer(userId),
        deletedAt: new Date(),
      })

      const result = await updateOffer(validUpdateInput())

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('NOT_FOUND')
      }
    })
  })

  describe('successful update', () => {
    const userId = 'supplier-uuid-123'

    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: userId } },
      })
      mockSupplierFindUnique.mockResolvedValue({ id: userId })
      mockOfferFindUnique.mockResolvedValue(mockExistingOffer(userId))
      mockOfferUpdate.mockResolvedValue({ id: '550e8400-e29b-41d4-a716-446655440000' })
    })

    it('updates offer and returns offerId', async () => {
      const result = await updateOffer(validUpdateInput())

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.offerId).toBe('550e8400-e29b-41d4-a716-446655440000')
      }
    })

    it('passes correct data to prisma.offer.update', async () => {
      const input = validUpdateInput()
      await updateOffer(input)

      expect(mockOfferUpdate).toHaveBeenCalledWith({
        where: { id: input.id },
        data: {
          name: input.name,
          promoPrice: input.promoPrice,
          discountPercent: input.discountPercent,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          category: input.category,
          subcategory: null,
          margin: null,
          volume: null,
          conditions: null,
          animation: null,
          photoUrl: null,
        },
      })
    })

    it('calls revalidatePath for dashboard, offers, and offer detail', async () => {
      const input = validUpdateInput()
      await updateOffer(input)

      expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(revalidatePath).toHaveBeenCalledWith('/offers')
      expect(revalidatePath).toHaveBeenCalledWith(`/offers/${input.id}`)
    })

    it('updates offer with optional fields when provided', async () => {
      const input = {
        ...validUpdateInput(),
        subcategory: 'Bio',
        margin: 15.5,
        volume: '2 palettes',
        conditions: 'Franco 500€',
        animation: 'PLV fournie',
        photoUrl: 'https://example.com/photo.jpg',
      }

      const result = await updateOffer(input)

      expect(result.success).toBe(true)
      expect(mockOfferUpdate).toHaveBeenCalledWith({
        where: { id: input.id },
        data: expect.objectContaining({
          subcategory: 'Bio',
          margin: 15.5,
          volume: '2 palettes',
          conditions: 'Franco 500€',
          animation: 'PLV fournie',
          photoUrl: 'https://example.com/photo.jpg',
        }),
      })
    })

    it('sets empty optional strings to null', async () => {
      const input = {
        ...validUpdateInput(),
        subcategory: '',
        volume: '',
        conditions: '',
        animation: '',
        photoUrl: '',
      }

      await updateOffer(input)

      const callData = mockOfferUpdate.mock.calls[0][0].data
      expect(callData.subcategory).toBeNull()
      expect(callData.volume).toBeNull()
      expect(callData.conditions).toBeNull()
      expect(callData.animation).toBeNull()
      expect(callData.photoUrl).toBeNull()
    })
  })

  describe('error handling', () => {
    it('returns SERVER_ERROR on database failure', async () => {
      const userId = 'supplier-uuid-123'
      mockGetUser.mockResolvedValue({
        data: { user: { id: userId } },
      })
      mockSupplierFindUnique.mockResolvedValue({ id: userId })
      mockOfferFindUnique.mockResolvedValue(mockExistingOffer(userId))
      mockOfferUpdate.mockRejectedValue(new Error('DB connection failed'))

      const result = await updateOffer(validUpdateInput())

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('SERVER_ERROR')
      }
    })
  })

  describe('AC7 startDate validation', () => {
    const userId = 'supplier-uuid-123'

    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: { id: userId } } })
      mockSupplierFindUnique.mockResolvedValue({ id: userId })
      mockOfferUpdate.mockResolvedValue({ id: '550e8400-e29b-41d4-a716-446655440000' })
      mockStorageRemove.mockResolvedValue({ error: null })
    })

    it('rejects past startDate when offer has not started yet', async () => {
      const futureStart = new Date()
      futureStart.setDate(futureStart.getDate() + 5)
      mockOfferFindUnique.mockResolvedValue(mockExistingOffer(userId, { startDate: futureStart }))

      const pastStart = new Date()
      pastStart.setDate(pastStart.getDate() - 2)
      const input = {
        ...validUpdateInput(),
        startDate: pastStart.toISOString().split('T')[0],
      }

      const result = await updateOffer(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
        expect(result.error).toContain("aujourd'hui")
      }
    })

    it('allows past startDate when offer has already started', async () => {
      const pastStart = new Date()
      pastStart.setDate(pastStart.getDate() - 5)
      mockOfferFindUnique.mockResolvedValue(mockExistingOffer(userId, { startDate: pastStart }))

      const input = {
        ...validUpdateInput(),
        startDate: pastStart.toISOString().split('T')[0],
      }

      const result = await updateOffer(input)

      expect(result.success).toBe(true)
    })

    it('allows today as startDate when offer has not started yet', async () => {
      const futureStart = new Date()
      futureStart.setDate(futureStart.getDate() + 5)
      mockOfferFindUnique.mockResolvedValue(mockExistingOffer(userId, { startDate: futureStart }))

      const today = new Date().toISOString().split('T')[0]
      const input = {
        ...validUpdateInput(),
        startDate: today,
      }

      const result = await updateOffer(input)

      expect(result.success).toBe(true)
    })
  })

  describe('photo management', () => {
    const userId = 'supplier-uuid-123'

    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: { id: userId } } })
      mockSupplierFindUnique.mockResolvedValue({ id: userId })
      mockOfferUpdate.mockResolvedValue({ id: '550e8400-e29b-41d4-a716-446655440000' })
      mockStorageRemove.mockResolvedValue({ error: null })
    })

    it('deletes old photo from storage when photo URL changes', async () => {
      const oldPhotoUrl = 'https://storage.supabase.co/storage/v1/object/public/offer-photos/supplier-123/old-photo.jpg'
      mockOfferFindUnique.mockResolvedValue(mockExistingOffer(userId, { photoUrl: oldPhotoUrl }))

      const input = {
        ...validUpdateInput(),
        photoUrl: 'https://storage.supabase.co/storage/v1/object/public/offer-photos/supplier-123/new-photo.jpg',
      }

      await updateOffer(input)

      expect(mockStorageRemove).toHaveBeenCalledWith(['supplier-123/old-photo.jpg'])
    })

    it('deletes old photo when photo is removed (set to empty)', async () => {
      const oldPhotoUrl = 'https://storage.supabase.co/storage/v1/object/public/offer-photos/supplier-123/old-photo.jpg'
      mockOfferFindUnique.mockResolvedValue(mockExistingOffer(userId, { photoUrl: oldPhotoUrl }))

      const input = {
        ...validUpdateInput(),
        photoUrl: '',
      }

      await updateOffer(input)

      expect(mockStorageRemove).toHaveBeenCalledWith(['supplier-123/old-photo.jpg'])
    })

    it('does not delete photo when photoUrl is unchanged', async () => {
      const samePhotoUrl = 'https://storage.supabase.co/storage/v1/object/public/offer-photos/supplier-123/photo.jpg'
      mockOfferFindUnique.mockResolvedValue(mockExistingOffer(userId, { photoUrl: samePhotoUrl }))

      const input = {
        ...validUpdateInput(),
        photoUrl: samePhotoUrl,
      }

      await updateOffer(input)

      expect(mockStorageRemove).not.toHaveBeenCalled()
    })

    it('does not delete photo when there was no previous photo', async () => {
      mockOfferFindUnique.mockResolvedValue(mockExistingOffer(userId, { photoUrl: null }))

      const input = {
        ...validUpdateInput(),
        photoUrl: 'https://storage.supabase.co/storage/v1/object/public/offer-photos/supplier-123/new-photo.jpg',
      }

      await updateOffer(input)

      expect(mockStorageRemove).not.toHaveBeenCalled()
    })
  })
})

// ============================================
// deleteOffer
// ============================================

const VALID_OFFER_ID = '550e8400-e29b-41d4-a716-446655440000'

function mockDeleteTargetOffer(userId: string, overrides: Record<string, unknown> = {}) {
  return {
    id: VALID_OFFER_ID,
    supplierId: userId,
    name: 'Nutella 1kg',
    photoUrl: null,
    deletedAt: null,
    ...overrides,
  }
}

describe('deleteOffer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validation', () => {
    it('returns VALIDATION_ERROR for invalid id', async () => {
      const result = await deleteOffer({ id: 'not-a-uuid' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
      }
    })

    it('returns VALIDATION_ERROR for empty id', async () => {
      const result = await deleteOffer({ id: '' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
      }
    })
  })

  describe('authentication', () => {
    it('returns UNAUTHORIZED when no user session', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const result = await deleteOffer({ id: VALID_OFFER_ID })

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

      const result = await deleteOffer({ id: VALID_OFFER_ID })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('FORBIDDEN')
        expect(result.error).toContain('fournisseur')
      }
    })

    it('returns FORBIDDEN when offer belongs to another supplier', async () => {
      const userId = 'supplier-uuid-123'
      mockGetUser.mockResolvedValue({
        data: { user: { id: userId } },
      })
      mockSupplierFindUnique.mockResolvedValue({ id: userId })
      mockOfferFindUnique.mockResolvedValue(
        mockDeleteTargetOffer('other-supplier-id')
      )

      const result = await deleteOffer({ id: VALID_OFFER_ID })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('FORBIDDEN')
        expect(result.error).toContain('interdit')
      }
    })
  })

  describe('offer not found', () => {
    it('returns NOT_FOUND when offer does not exist', async () => {
      const userId = 'supplier-uuid-123'
      mockGetUser.mockResolvedValue({
        data: { user: { id: userId } },
      })
      mockSupplierFindUnique.mockResolvedValue({ id: userId })
      mockOfferFindUnique.mockResolvedValue(null)

      const result = await deleteOffer({ id: VALID_OFFER_ID })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('NOT_FOUND')
        expect(result.error).toContain('introuvable')
      }
    })

    it('returns NOT_FOUND when offer is already soft-deleted', async () => {
      const userId = 'supplier-uuid-123'
      mockGetUser.mockResolvedValue({
        data: { user: { id: userId } },
      })
      mockSupplierFindUnique.mockResolvedValue({ id: userId })
      mockOfferFindUnique.mockResolvedValue(
        mockDeleteTargetOffer(userId, { deletedAt: new Date() })
      )

      const result = await deleteOffer({ id: VALID_OFFER_ID })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('NOT_FOUND')
      }
    })
  })

  describe('successful deletion', () => {
    const userId = 'supplier-uuid-123'

    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: userId } },
      })
      mockSupplierFindUnique.mockResolvedValue({ id: userId })
      mockOfferUpdate.mockResolvedValue({ id: VALID_OFFER_ID })
      mockStorageRemove.mockResolvedValue({ error: null })
    })

    it('soft-deletes offer and returns offerId', async () => {
      mockOfferFindUnique.mockResolvedValue(mockDeleteTargetOffer(userId))

      const result = await deleteOffer({ id: VALID_OFFER_ID })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.offerId).toBe(VALID_OFFER_ID)
      }
    })

    it('uses prisma.offer.update for soft delete (NOT prisma.offer.delete)', async () => {
      mockOfferFindUnique.mockResolvedValue(mockDeleteTargetOffer(userId))

      await deleteOffer({ id: VALID_OFFER_ID })

      expect(mockOfferUpdate).toHaveBeenCalledWith({
        where: { id: VALID_OFFER_ID },
        data: { deletedAt: expect.any(Date) },
      })
    })

    it('calls revalidatePath for /dashboard, /offers, and /offers/[id]', async () => {
      mockOfferFindUnique.mockResolvedValue(mockDeleteTargetOffer(userId))

      await deleteOffer({ id: VALID_OFFER_ID })

      expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(revalidatePath).toHaveBeenCalledWith('/offers')
      expect(revalidatePath).toHaveBeenCalledWith(`/offers/${VALID_OFFER_ID}`)
    })

    it('deletes photo from storage when offer has a photo', async () => {
      const photoUrl = 'https://storage.supabase.co/storage/v1/object/public/offer-photos/supplier-123/photo.jpg'
      mockOfferFindUnique.mockResolvedValue(
        mockDeleteTargetOffer(userId, { photoUrl })
      )

      await deleteOffer({ id: VALID_OFFER_ID })

      expect(mockStorageRemove).toHaveBeenCalledWith(['supplier-123/photo.jpg'])
      expect(mockOfferUpdate).toHaveBeenCalled()
    })

    it('does not call storage remove when offer has no photo', async () => {
      mockOfferFindUnique.mockResolvedValue(
        mockDeleteTargetOffer(userId, { photoUrl: null })
      )

      await deleteOffer({ id: VALID_OFFER_ID })

      expect(mockStorageRemove).not.toHaveBeenCalled()
      expect(mockOfferUpdate).toHaveBeenCalled()
    })

    it('still soft-deletes even if photo deletion fails', async () => {
      const photoUrl = 'https://storage.supabase.co/storage/v1/object/public/offer-photos/supplier-123/photo.jpg'
      mockOfferFindUnique.mockResolvedValue(
        mockDeleteTargetOffer(userId, { photoUrl })
      )
      mockStorageRemove.mockRejectedValue(new Error('Storage error'))

      const result = await deleteOffer({ id: VALID_OFFER_ID })

      expect(result.success).toBe(true)
      expect(mockOfferUpdate).toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('returns SERVER_ERROR on database failure', async () => {
      const userId = 'supplier-uuid-123'
      mockGetUser.mockResolvedValue({
        data: { user: { id: userId } },
      })
      mockSupplierFindUnique.mockResolvedValue({ id: userId })
      mockOfferFindUnique.mockResolvedValue(mockDeleteTargetOffer(userId))
      mockOfferUpdate.mockRejectedValue(new Error('DB connection failed'))

      const result = await deleteOffer({ id: VALID_OFFER_ID })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('SERVER_ERROR')
      }
    })
  })
})
