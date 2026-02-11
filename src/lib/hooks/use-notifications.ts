'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { subscribeToNotifications, unsubscribeFromNotifications, type NotificationPayload } from '@/lib/supabase/realtime'
import { toast } from 'sonner'

interface UseNotificationsOptions {
  onNewNotification?: (notification: NotificationPayload) => void
}

export function useNotifications(
  userId: string | null,
  initialCount: number,
  options?: UseNotificationsOptions
) {
  const [unreadCount, setUnreadCount] = useState(initialCount)
  const onNewNotificationRef = useRef(options?.onNewNotification)
  onNewNotificationRef.current = options?.onNewNotification

  // Sync state when server provides updated initialCount (e.g. after navigation)
  useEffect(() => {
    setUnreadCount(initialCount)
  }, [initialCount])

  useEffect(() => {
    if (!userId) return

    const channel = subscribeToNotifications(userId, (notification) => {
      setUnreadCount((prev) => prev + 1)
      toast(notification.title, {
        description: notification.body,
      })
      onNewNotificationRef.current?.(notification)
    })

    return () => {
      unsubscribeFromNotifications(channel)
    }
  }, [userId])

  const decrementCount = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  const resetCount = useCallback(() => {
    setUnreadCount(0)
  }, [])

  return { unreadCount, decrementCount, resetCount }
}
