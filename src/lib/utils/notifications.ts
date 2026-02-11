import type { Notification } from '@prisma/client'

export interface SerializedNotification {
  id: string
  userId: string
  userType: 'SUPPLIER' | 'STORE'
  type: 'NEW_REQUEST' | 'REQUEST_TREATED'
  title: string
  body: string
  relatedId: string | null
  read: boolean
  createdAt: string
  updatedAt: string
}

export const NOTIFICATION_TYPE_CONFIG = {
  NEW_REQUEST: {
    label: 'Nouvelle demande',
    icon: 'message-square',
  },
  REQUEST_TREATED: {
    label: 'Demande traitée',
    icon: 'check-circle',
  },
} as const

export function serializeNotification(notification: Notification): SerializedNotification {
  return {
    id: notification.id,
    userId: notification.userId,
    userType: notification.userType,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    relatedId: notification.relatedId,
    read: notification.read,
    createdAt: notification.createdAt.toISOString(),
    updatedAt: notification.updatedAt.toISOString(),
  }
}
