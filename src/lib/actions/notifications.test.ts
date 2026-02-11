import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createNotificationForRequest, createNotificationForTreatedRequest, markNotificationAsRead, markAllNotificationsAsRead, loadMoreNotifications } from './notifications'

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
const mockNotificationCreate = vi.fn()
const mockNotificationFindFirst = vi.fn()
const mockNotificationUpdate = vi.fn()
const mockNotificationUpdateMany = vi.fn()
const mockSupplierFindUnique = vi.fn()

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    notification: {
      create: (...args: unknown[]) => mockNotificationCreate(...args),
      findFirst: (...args: unknown[]) => mockNotificationFindFirst(...args),
      update: (...args: unknown[]) => mockNotificationUpdate(...args),
      updateMany: (...args: unknown[]) => mockNotificationUpdateMany(...args),
    },
    supplier: {
      findUnique: (...args: unknown[]) => mockSupplierFindUnique(...args),
    },
  },
}))

// Mock email sending
const mockSendEmailForRequest = vi.fn()
vi.mock('@/lib/email/send-request-email', () => ({
  sendEmailForRequest: (...args: unknown[]) => mockSendEmailForRequest(...args),
}))

// Mock queries
const mockGetNotifications = vi.fn()
vi.mock('@/lib/queries/notifications', () => ({
  getNotifications: (...args: unknown[]) => mockGetNotifications(...args),
}))

function validRequestNotificationInput() {
  return {
    supplierId: '550e8400-e29b-41d4-a716-446655440000',
    requestType: 'INFO' as const,
    storeName: 'Mon Magasin',
    storeBrand: 'Carrefour',
    storeCity: 'Paris',
    offerName: 'Promo Biscuits',
    requestId: '660e8400-e29b-41d4-a716-446655440000',
    message: 'Question sur les délais',
  }
}

describe('createNotificationForRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNotificationCreate.mockResolvedValue({ id: 'notif-uuid-123' })
    mockSupplierFindUnique.mockResolvedValue({ email: 'supplier@example.com' })
    mockSendEmailForRequest.mockResolvedValue(undefined)
  })

  it('creates a notification for the supplier', async () => {
    await createNotificationForRequest(validRequestNotificationInput())

    expect(mockNotificationCreate).toHaveBeenCalledTimes(1)
  })

  it('sets userId to supplierId', async () => {
    await createNotificationForRequest(validRequestNotificationInput())

    expect(mockNotificationCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: '550e8400-e29b-41d4-a716-446655440000',
      }),
    })
  })

  it('sets userType to SUPPLIER', async () => {
    await createNotificationForRequest(validRequestNotificationInput())

    expect(mockNotificationCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userType: 'SUPPLIER',
      }),
    })
  })

  it('sets type to NEW_REQUEST', async () => {
    await createNotificationForRequest(validRequestNotificationInput())

    expect(mockNotificationCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'NEW_REQUEST',
      }),
    })
  })

  it('sets title to "Nouvelle demande" for INFO request type', async () => {
    await createNotificationForRequest(validRequestNotificationInput())

    expect(mockNotificationCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'Nouvelle demande',
      }),
    })
  })

  it('sets title to "Intention de commande" for ORDER request type', async () => {
    await createNotificationForRequest({
      ...validRequestNotificationInput(),
      requestType: 'ORDER',
    })

    expect(mockNotificationCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'Intention de commande',
      }),
    })
  })

  it('sets body to "storeName - offerName"', async () => {
    await createNotificationForRequest(validRequestNotificationInput())

    expect(mockNotificationCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        body: 'Mon Magasin - Promo Biscuits',
      }),
    })
  })

  it('sets relatedId to requestId', async () => {
    await createNotificationForRequest(validRequestNotificationInput())

    expect(mockNotificationCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        relatedId: '660e8400-e29b-41d4-a716-446655440000',
      }),
    })
  })

  it('passes complete correct data to prisma', async () => {
    await createNotificationForRequest(validRequestNotificationInput())

    expect(mockNotificationCreate).toHaveBeenCalledWith({
      data: {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        userType: 'SUPPLIER',
        type: 'NEW_REQUEST',
        title: 'Nouvelle demande',
        body: 'Mon Magasin - Promo Biscuits',
        relatedId: '660e8400-e29b-41d4-a716-446655440000',
      },
    })
  })

  it('throws when prisma create fails', async () => {
    mockNotificationCreate.mockRejectedValue(new Error('DB error'))

    await expect(
      createNotificationForRequest(validRequestNotificationInput())
    ).rejects.toThrow('DB error')
  })

  it('throws validation error when supplierId is not a valid UUID', async () => {
    await expect(
      createNotificationForRequest({
        ...validRequestNotificationInput(),
        supplierId: 'not-a-uuid',
      })
    ).rejects.toThrow('Notification validation failed')
  })

  it('throws validation error when requestId is not a valid UUID', async () => {
    await expect(
      createNotificationForRequest({
        ...validRequestNotificationInput(),
        requestId: 'not-a-uuid',
      })
    ).rejects.toThrow('Notification validation failed')
  })

  describe('email integration', () => {
    it('calls sendEmailForRequest after creating notification', async () => {
      await createNotificationForRequest(validRequestNotificationInput())

      expect(mockSendEmailForRequest).toHaveBeenCalledTimes(1)
    })

    it('passes correct params to sendEmailForRequest', async () => {
      await createNotificationForRequest(validRequestNotificationInput())

      expect(mockSendEmailForRequest).toHaveBeenCalledWith({
        supplierEmail: 'supplier@example.com',
        requestType: 'INFO',
        storeName: 'Mon Magasin',
        storeBrand: 'Carrefour',
        storeCity: 'Paris',
        offerName: 'Promo Biscuits',
        requestId: '660e8400-e29b-41d4-a716-446655440000',
        message: 'Question sur les délais',
      })
    })

    it('does not throw when email sending fails', async () => {
      mockSendEmailForRequest.mockRejectedValue(new Error('Email failed'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(
        createNotificationForRequest(validRequestNotificationInput())
      ).resolves.toBeUndefined()

      consoleSpy.mockRestore()
    })

    it('still creates notification even when email fails', async () => {
      mockSendEmailForRequest.mockRejectedValue(new Error('Email failed'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await createNotificationForRequest(validRequestNotificationInput())

      expect(mockNotificationCreate).toHaveBeenCalledTimes(1)
      consoleSpy.mockRestore()
    })

    it('does not send email when supplier not found', async () => {
      mockSupplierFindUnique.mockResolvedValue(null)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await createNotificationForRequest(validRequestNotificationInput())

      expect(mockSendEmailForRequest).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})

describe('createNotificationForTreatedRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNotificationCreate.mockResolvedValue({ id: 'notif-uuid-456' })
  })

  it('creates a notification for the store', async () => {
    await createNotificationForTreatedRequest({
      storeId: '550e8400-e29b-41d4-a716-446655440000',
      supplierName: 'Fournisseur ABC',
      offerName: 'Promo Biscuits',
      requestId: '660e8400-e29b-41d4-a716-446655440000',
    })

    expect(mockNotificationCreate).toHaveBeenCalledTimes(1)
  })

  it('sets userId to storeId and userType to STORE', async () => {
    await createNotificationForTreatedRequest({
      storeId: '550e8400-e29b-41d4-a716-446655440000',
      supplierName: 'Fournisseur ABC',
      offerName: 'Promo Biscuits',
      requestId: '660e8400-e29b-41d4-a716-446655440000',
    })

    expect(mockNotificationCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        userType: 'STORE',
        type: 'REQUEST_TREATED',
      }),
    })
  })

  it('sets title to "Demande traitée" and body to supplierName - offerName', async () => {
    await createNotificationForTreatedRequest({
      storeId: '550e8400-e29b-41d4-a716-446655440000',
      supplierName: 'Fournisseur ABC',
      offerName: 'Promo Biscuits',
      requestId: '660e8400-e29b-41d4-a716-446655440000',
    })

    expect(mockNotificationCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'Demande traitée',
        body: 'Fournisseur ABC - Promo Biscuits',
      }),
    })
  })

  it('sets relatedId to requestId', async () => {
    await createNotificationForTreatedRequest({
      storeId: '550e8400-e29b-41d4-a716-446655440000',
      supplierName: 'Fournisseur ABC',
      offerName: 'Promo Biscuits',
      requestId: '660e8400-e29b-41d4-a716-446655440000',
    })

    expect(mockNotificationCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        relatedId: '660e8400-e29b-41d4-a716-446655440000',
      }),
    })
  })
})

const VALID_NOTIFICATION_ID = '770e8400-e29b-41d4-a716-446655440000'

describe('markNotificationAsRead', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns UNAUTHORIZED when no user session', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await markNotificationAsRead(VALID_NOTIFICATION_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('UNAUTHORIZED')
    }
  })

  it('returns NOT_FOUND when notification does not belong to user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockNotificationFindFirst.mockResolvedValue(null)

    const result = await markNotificationAsRead(VALID_NOTIFICATION_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('NOT_FOUND')
    }
  })

  it('queries notification with userId filter for ownership check', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockNotificationFindFirst.mockResolvedValue(null)

    await markNotificationAsRead(VALID_NOTIFICATION_ID)

    expect(mockNotificationFindFirst).toHaveBeenCalledWith({
      where: { id: VALID_NOTIFICATION_ID, userId: 'user-123' },
    })
  })

  it('updates notification read to true', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockNotificationFindFirst.mockResolvedValue({
      id: VALID_NOTIFICATION_ID,
      userId: 'user-123',
      read: false,
    })
    mockNotificationUpdate.mockResolvedValue({ id: VALID_NOTIFICATION_ID })

    await markNotificationAsRead(VALID_NOTIFICATION_ID)

    expect(mockNotificationUpdate).toHaveBeenCalledWith({
      where: { id: VALID_NOTIFICATION_ID },
      data: { read: true },
    })
  })

  it('returns success with notification id', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockNotificationFindFirst.mockResolvedValue({
      id: VALID_NOTIFICATION_ID,
      userId: 'user-123',
      read: false,
    })
    mockNotificationUpdate.mockResolvedValue({ id: VALID_NOTIFICATION_ID })

    const result = await markNotificationAsRead(VALID_NOTIFICATION_ID)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.id).toBe(VALID_NOTIFICATION_ID)
    }
  })

  it('returns success even if notification is already read (idempotent)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockNotificationFindFirst.mockResolvedValue({
      id: VALID_NOTIFICATION_ID,
      userId: 'user-123',
      read: true,
    })
    mockNotificationUpdate.mockResolvedValue({ id: VALID_NOTIFICATION_ID })

    const result = await markNotificationAsRead(VALID_NOTIFICATION_ID)

    expect(result.success).toBe(true)
  })

  it('returns VALIDATION_ERROR when notificationId is not a UUID', async () => {
    const result = await markNotificationAsRead('not-a-uuid')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('VALIDATION_ERROR')
    }
  })

  it('returns SERVER_ERROR on database failure', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockNotificationFindFirst.mockResolvedValue({
      id: VALID_NOTIFICATION_ID,
      userId: 'user-123',
      read: false,
    })
    mockNotificationUpdate.mockRejectedValue(new Error('DB error'))

    const result = await markNotificationAsRead(VALID_NOTIFICATION_ID)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('SERVER_ERROR')
    }
  })
})

describe('markAllNotificationsAsRead', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns UNAUTHORIZED when no user session', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await markAllNotificationsAsRead()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('UNAUTHORIZED')
    }
  })

  it('updates all unread notifications for the user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockNotificationUpdateMany.mockResolvedValue({ count: 3 })

    await markAllNotificationsAsRead()

    expect(mockNotificationUpdateMany).toHaveBeenCalledWith({
      where: { userId: 'user-123', read: false },
      data: { read: true },
    })
  })

  it('returns success with count of updated notifications', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockNotificationUpdateMany.mockResolvedValue({ count: 5 })

    const result = await markAllNotificationsAsRead()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.count).toBe(5)
    }
  })

  it('returns success with count 0 when no unread notifications', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockNotificationUpdateMany.mockResolvedValue({ count: 0 })

    const result = await markAllNotificationsAsRead()

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.count).toBe(0)
    }
  })

  it('returns SERVER_ERROR on database failure', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockNotificationUpdateMany.mockRejectedValue(new Error('DB error'))

    const result = await markAllNotificationsAsRead()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('SERVER_ERROR')
    }
  })
})

describe('loadMoreNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns UNAUTHORIZED when no user session', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await loadMoreNotifications('SUPPLIER', 0)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('UNAUTHORIZED')
    }
  })

  it('returns VALIDATION_ERROR when userType is invalid', async () => {
    const result = await loadMoreNotifications('INVALID' as 'SUPPLIER', 0)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('VALIDATION_ERROR')
    }
  })

  it('returns VALIDATION_ERROR when offset is negative', async () => {
    const result = await loadMoreNotifications('SUPPLIER', -1)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('VALIDATION_ERROR')
    }
  })

  it('calls getNotifications with correct parameters', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockGetNotifications.mockResolvedValue([])

    await loadMoreNotifications('SUPPLIER', 50)

    expect(mockGetNotifications).toHaveBeenCalledWith('user-123', 'SUPPLIER', 50, 50)
  })

  it('returns notifications and hasMore=false when fewer than PAGE_SIZE', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockGetNotifications.mockResolvedValue([{ id: 'n1' }, { id: 'n2' }])

    const result = await loadMoreNotifications('SUPPLIER', 0)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.notifications).toHaveLength(2)
      expect(result.data.hasMore).toBe(false)
    }
  })

  it('returns hasMore=true when exactly PAGE_SIZE notifications returned', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockGetNotifications.mockResolvedValue(Array.from({ length: 50 }, (_, i) => ({ id: `n${i}` })))

    const result = await loadMoreNotifications('STORE', 0)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.hasMore).toBe(true)
    }
  })

  it('returns SERVER_ERROR on database failure', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    mockGetNotifications.mockRejectedValue(new Error('DB error'))

    const result = await loadMoreNotifications('SUPPLIER', 0)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('SERVER_ERROR')
    }
  })
})
