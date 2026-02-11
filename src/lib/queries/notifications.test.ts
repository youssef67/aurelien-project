import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock react cache to pass through
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    cache: (fn: Function) => fn,
  }
})

// Mock Prisma
const mockNotificationCount = vi.fn()
const mockNotificationFindMany = vi.fn()

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    notification: {
      count: (...args: unknown[]) => mockNotificationCount(...args),
      findMany: (...args: unknown[]) => mockNotificationFindMany(...args),
    },
  },
}))

// Import after mocks
const { getUnreadNotificationCount, getNotifications } = await import('./notifications')

describe('getUnreadNotificationCount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns count of unread notifications for user', async () => {
    mockNotificationCount.mockResolvedValue(5)

    const result = await getUnreadNotificationCount('user-uuid-123', 'SUPPLIER')

    expect(result).toBe(5)
  })

  it('queries with correct userId, userType and read=false', async () => {
    mockNotificationCount.mockResolvedValue(0)

    await getUnreadNotificationCount('user-uuid-123', 'SUPPLIER')

    expect(mockNotificationCount).toHaveBeenCalledWith({
      where: {
        userId: 'user-uuid-123',
        userType: 'SUPPLIER',
        read: false,
      },
    })
  })

  it('returns 0 when no unread notifications', async () => {
    mockNotificationCount.mockResolvedValue(0)

    const result = await getUnreadNotificationCount('user-uuid-123', 'SUPPLIER')

    expect(result).toBe(0)
  })

  it('filters by STORE userType when specified', async () => {
    mockNotificationCount.mockResolvedValue(2)

    await getUnreadNotificationCount('user-uuid-123', 'STORE')

    expect(mockNotificationCount).toHaveBeenCalledWith({
      where: {
        userId: 'user-uuid-123',
        userType: 'STORE',
        read: false,
      },
    })
  })
})

function mockNotification(overrides = {}) {
  return {
    id: 'notif-uuid-1',
    userId: 'user-uuid-123',
    userType: 'SUPPLIER',
    type: 'NEW_REQUEST',
    title: 'Nouvelle demande',
    body: 'Mon Magasin - Promo',
    relatedId: 'req-uuid-1',
    read: false,
    createdAt: new Date('2026-02-10T10:00:00Z'),
    updatedAt: new Date('2026-02-10T10:00:00Z'),
    ...overrides,
  }
}

describe('getNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('queries with correct userId and userType', async () => {
    mockNotificationFindMany.mockResolvedValue([])

    await getNotifications('user-uuid-123', 'SUPPLIER')

    expect(mockNotificationFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-uuid-123', userType: 'SUPPLIER' },
      })
    )
  })

  it('orders by createdAt descending', async () => {
    mockNotificationFindMany.mockResolvedValue([])

    await getNotifications('user-uuid-123', 'SUPPLIER')

    expect(mockNotificationFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      })
    )
  })

  it('uses default offset 0 and limit 50', async () => {
    mockNotificationFindMany.mockResolvedValue([])

    await getNotifications('user-uuid-123', 'SUPPLIER')

    expect(mockNotificationFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 50,
      })
    )
  })

  it('accepts custom offset and limit', async () => {
    mockNotificationFindMany.mockResolvedValue([])

    await getNotifications('user-uuid-123', 'SUPPLIER', 10, 20)

    expect(mockNotificationFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 20,
      })
    )
  })

  it('returns serialized notifications', async () => {
    mockNotificationFindMany.mockResolvedValue([mockNotification()])

    const result = await getNotifications('user-uuid-123', 'SUPPLIER')

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('notif-uuid-1')
    expect(result[0].createdAt).toBe('2026-02-10T10:00:00.000Z')
  })

  it('returns empty array when no notifications', async () => {
    mockNotificationFindMany.mockResolvedValue([])

    const result = await getNotifications('user-uuid-123', 'SUPPLIER')

    expect(result).toEqual([])
  })

  it('filters by STORE userType', async () => {
    mockNotificationFindMany.mockResolvedValue([])

    await getNotifications('user-uuid-123', 'STORE')

    expect(mockNotificationFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-uuid-123', userType: 'STORE' },
      })
    )
  })
})
