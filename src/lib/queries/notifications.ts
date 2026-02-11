import { cache } from 'react'
import { prisma } from '@/lib/prisma/client'
import { serializeNotification, type SerializedNotification } from '@/lib/utils/notifications'

export const getUnreadNotificationCount = cache(
  async (userId: string, userType: 'SUPPLIER' | 'STORE'): Promise<number> => {
    return prisma.notification.count({
      where: {
        userId,
        userType,
        read: false,
      },
    })
  }
)

export const getNotifications = cache(
  async (
    userId: string,
    userType: 'SUPPLIER' | 'STORE',
    offset = 0,
    limit = 50
  ): Promise<SerializedNotification[]> => {
    const notifications = await prisma.notification.findMany({
      where: { userId, userType },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    })

    return notifications.map(serializeNotification)
  }
)
