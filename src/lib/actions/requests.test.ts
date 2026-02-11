import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Prisma } from '@prisma/client'
import { createRequest, updateRequestStatus } from './requests'

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock notifications
const mockCreateNotificationForRequest = vi.fn()
const mockCreateNotificationForTreatedRequest = vi.fn()
vi.mock('./notifications', () => ({
  createNotificationForRequest: (...args: unknown[]) => mockCreateNotificationForRequest(...args),
  createNotificationForTreatedRequest: (...args: unknown[]) => mockCreateNotificationForTreatedRequest(...args),
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
const mockStoreFindUnique = vi.fn()
const mockSupplierFindUnique = vi.fn()
const mockOfferFindFirst = vi.fn()
const mockRequestFindFirst = vi.fn()
const mockRequestCreate = vi.fn()
const mockRequestUpdate = vi.fn()

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    store: {
      findUnique: (...args: unknown[]) => mockStoreFindUnique(...args),
    },
    supplier: {
      findUnique: (...args: unknown[]) => mockSupplierFindUnique(...args),
    },
    offer: {
      findFirst: (...args: unknown[]) => mockOfferFindFirst(...args),
    },
    request: {
      findFirst: (...args: unknown[]) => mockRequestFindFirst(...args),
      create: (...args: unknown[]) => mockRequestCreate(...args),
      update: (...args: unknown[]) => mockRequestUpdate(...args),
    },
  },
}))

const VALID_OFFER_ID = '550e8400-e29b-41d4-a716-446655440000'

function validInput() {
  return {
    offerId: VALID_OFFER_ID,
    type: 'INFO' as const,
    message: 'Question sur les délais de livraison',
  }
}

function mockActiveOffer(supplierId = 'supplier-uuid-123') {
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  return {
    id: VALID_OFFER_ID,
    supplierId,
    status: 'ACTIVE',
    endDate: nextWeek,
    name: 'Promo Biscuits',
  }
}

describe('createRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validation', () => {
    it('returns VALIDATION_ERROR when offerId is missing', async () => {
      const result = await createRequest({
        offerId: '',
        type: 'INFO',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
      }
    })

    it('returns VALIDATION_ERROR when offerId is not a UUID', async () => {
      const result = await createRequest({
        offerId: 'not-a-uuid',
        type: 'INFO',
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

      const result = await createRequest(validInput())

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('UNAUTHORIZED')
        expect(result.error).toContain('authentifié')
      }
    })
  })

  describe('authorization', () => {
    it('returns FORBIDDEN when user is not a store', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      })
      mockStoreFindUnique.mockResolvedValue(null)

      const result = await createRequest(validInput())

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('FORBIDDEN')
        expect(result.error).toContain('magasin')
      }
    })
  })

  describe('offer validation', () => {
    const storeId = 'store-uuid-123'

    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: storeId } },
      })
      mockStoreFindUnique.mockResolvedValue({ id: storeId, name: 'Mon Magasin' })
    })

    it('returns NOT_FOUND when offer does not exist', async () => {
      mockOfferFindFirst.mockResolvedValue(null)

      const result = await createRequest(validInput())

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('NOT_FOUND')
        expect(result.error).toContain('introuvable')
      }
    })

    it('returns VALIDATION_ERROR when offer is expired', async () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 7)
      mockOfferFindFirst.mockResolvedValue({
        id: VALID_OFFER_ID,
        supplierId: 'supplier-uuid-123',
        status: 'ACTIVE',
        endDate: pastDate,
      })

      const result = await createRequest(validInput())

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
        expect(result.error).toContain('plus disponible')
      }
    })

    it('returns VALIDATION_ERROR when offer status is not ACTIVE', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)
      mockOfferFindFirst.mockResolvedValue({
        id: VALID_OFFER_ID,
        supplierId: 'supplier-uuid-123',
        status: 'EXPIRED',
        endDate: futureDate,
      })

      const result = await createRequest(validInput())

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
        expect(result.error).toContain('plus disponible')
      }
    })
  })

  describe('duplicate detection', () => {
    const storeId = 'store-uuid-123'

    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: storeId } },
      })
      mockStoreFindUnique.mockResolvedValue({ id: storeId, name: 'Mon Magasin' })
      mockOfferFindFirst.mockResolvedValue(mockActiveOffer())
    })

    it('returns VALIDATION_ERROR when request already sent', async () => {
      mockRequestFindFirst.mockResolvedValue({ id: 'existing-request' })

      const result = await createRequest(validInput())

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
        expect(result.error).toContain('déjà envoyé')
      }
    })
  })

  describe('successful creation', () => {
    const storeId = 'store-uuid-123'
    const supplierId = 'supplier-uuid-123'

    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: storeId } },
      })
      mockStoreFindUnique.mockResolvedValue({ id: storeId, name: 'Mon Magasin', brand: 'Carrefour', city: 'Paris' })
      mockOfferFindFirst.mockResolvedValue(mockActiveOffer(supplierId))
      mockRequestFindFirst.mockResolvedValue(null)
      mockRequestCreate.mockResolvedValue({ id: 'request-uuid-456' })
      mockCreateNotificationForRequest.mockResolvedValue(undefined)
    })

    it('creates request and returns requestId', async () => {
      const result = await createRequest(validInput())

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.requestId).toBe('request-uuid-456')
      }
    })

    it('uses supplierId from offer, not from input', async () => {
      await createRequest(validInput())

      expect(mockRequestCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          supplierId,
          storeId,
        }),
      })
    })

    it('passes correct data to prisma.request.create', async () => {
      const input = validInput()
      await createRequest(input)

      expect(mockRequestCreate).toHaveBeenCalledWith({
        data: {
          storeId,
          offerId: VALID_OFFER_ID,
          supplierId,
          type: 'INFO',
          message: 'Question sur les délais de livraison',
          status: 'PENDING',
        },
      })
    })

    it('sets message to null when empty', async () => {
      await createRequest({ offerId: VALID_OFFER_ID, type: 'INFO', message: '' })

      expect(mockRequestCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          message: null,
        }),
      })
    })

    it('sets message to null when undefined', async () => {
      await createRequest({ offerId: VALID_OFFER_ID, type: 'INFO' })

      expect(mockRequestCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          message: null,
        }),
      })
    })

    it('calls createNotificationForRequest after successful creation', async () => {
      await createRequest(validInput())

      expect(mockCreateNotificationForRequest).toHaveBeenCalledTimes(1)
    })

    it('passes correct data to createNotificationForRequest', async () => {
      await createRequest(validInput())

      expect(mockCreateNotificationForRequest).toHaveBeenCalledWith({
        supplierId,
        requestType: 'INFO',
        storeName: 'Mon Magasin',
        storeBrand: 'Carrefour',
        storeCity: 'Paris',
        offerName: 'Promo Biscuits',
        requestId: 'request-uuid-456',
        message: 'Question sur les délais de livraison',
      })
    })

    it('does not fail if notification creation fails', async () => {
      mockCreateNotificationForRequest.mockRejectedValue(new Error('Notification failed'))

      const result = await createRequest(validInput())

      expect(result.success).toBe(true)
    })
  })

  describe('error handling', () => {
    it('returns SERVER_ERROR on database failure', async () => {
      const storeId = 'store-uuid-123'
      mockGetUser.mockResolvedValue({
        data: { user: { id: storeId } },
      })
      mockStoreFindUnique.mockResolvedValue({ id: storeId })
      mockOfferFindFirst.mockResolvedValue(mockActiveOffer())
      mockRequestFindFirst.mockResolvedValue(null)
      mockRequestCreate.mockRejectedValue(new Error('DB connection failed'))

      const result = await createRequest(validInput())

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('SERVER_ERROR')
      }
    })

    it('returns VALIDATION_ERROR on unique constraint violation (P2002 race condition)', async () => {
      const storeId = 'store-uuid-123'
      mockGetUser.mockResolvedValue({
        data: { user: { id: storeId } },
      })
      mockStoreFindUnique.mockResolvedValue({ id: storeId })
      mockOfferFindFirst.mockResolvedValue(mockActiveOffer())
      mockRequestFindFirst.mockResolvedValue(null)
      mockRequestCreate.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '6.0.0',
        })
      )

      const result = await createRequest(validInput())

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
        expect(result.error).toContain('déjà envoyé')
      }
    })
  })
})

const VALID_REQUEST_ID = '660e8400-e29b-41d4-a716-446655440000'

describe('updateRequestStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validation', () => {
    it('returns VALIDATION_ERROR when requestId is not a UUID', async () => {
      const result = await updateRequestStatus({ requestId: 'not-a-uuid' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
        expect(result.error).toContain('invalides')
      }
    })
  })

  describe('authentication', () => {
    it('returns UNAUTHORIZED when no user session', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const result = await updateRequestStatus({ requestId: VALID_REQUEST_ID })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('UNAUTHORIZED')
        expect(result.error).toContain('authentifié')
      }
    })
  })

  describe('authorization', () => {
    it('returns NOT_FOUND when request does not belong to supplier', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'supplier-123' } },
      })
      mockRequestFindFirst.mockResolvedValue(null)

      const result = await updateRequestStatus({ requestId: VALID_REQUEST_ID })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('NOT_FOUND')
        expect(result.error).toContain('introuvable')
      }
    })
  })

  describe('status validation', () => {
    it('returns VALIDATION_ERROR when request is already TREATED', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'supplier-123' } },
      })
      mockRequestFindFirst.mockResolvedValue({
        id: VALID_REQUEST_ID,
        supplierId: 'supplier-123',
        status: 'TREATED',
      })

      const result = await updateRequestStatus({ requestId: VALID_REQUEST_ID })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
        expect(result.error).toContain('déjà été traitée')
      }
    })
  })

  describe('successful update', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'supplier-123' } },
      })
      mockRequestFindFirst.mockResolvedValue({
        id: VALID_REQUEST_ID,
        supplierId: 'supplier-123',
        storeId: 'store-456',
        status: 'PENDING',
        offer: { name: 'Promo Biscuits' },
      })
      mockRequestUpdate.mockResolvedValue({
        id: VALID_REQUEST_ID,
        status: 'TREATED',
      })
      mockSupplierFindUnique.mockResolvedValue({ companyName: 'Fournisseur ABC' })
      mockCreateNotificationForTreatedRequest.mockResolvedValue(undefined)
    })

    it('updates request to TREATED and returns requestId', async () => {
      const result = await updateRequestStatus({ requestId: VALID_REQUEST_ID })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.requestId).toBe(VALID_REQUEST_ID)
      }
    })

    it('calls prisma.request.update with correct data', async () => {
      await updateRequestStatus({ requestId: VALID_REQUEST_ID })

      expect(mockRequestUpdate).toHaveBeenCalledWith({
        where: { id: VALID_REQUEST_ID },
        data: { status: 'TREATED' },
      })
    })

    it('creates notification for store when request is treated', async () => {
      await updateRequestStatus({ requestId: VALID_REQUEST_ID })

      expect(mockCreateNotificationForTreatedRequest).toHaveBeenCalledWith({
        storeId: 'store-456',
        supplierName: 'Fournisseur ABC',
        offerName: 'Promo Biscuits',
        requestId: VALID_REQUEST_ID,
      })
    })

    it('does not fail if notification creation fails', async () => {
      mockCreateNotificationForTreatedRequest.mockRejectedValue(new Error('Notification failed'))

      const result = await updateRequestStatus({ requestId: VALID_REQUEST_ID })

      expect(result.success).toBe(true)
    })
  })

  describe('error handling', () => {
    it('returns SERVER_ERROR on database failure', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'supplier-123' } },
      })
      mockRequestFindFirst.mockResolvedValue({
        id: VALID_REQUEST_ID,
        supplierId: 'supplier-123',
        storeId: 'store-456',
        status: 'PENDING',
        offer: { name: 'Promo' },
      })
      mockRequestUpdate.mockRejectedValue(new Error('DB connection failed'))

      const result = await updateRequestStatus({ requestId: VALID_REQUEST_ID })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('SERVER_ERROR')
      }
    })
  })
})
