'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { NotificationItem } from './notification-item'
import { markNotificationAsRead, markAllNotificationsAsRead, loadMoreNotifications } from '@/lib/actions/notifications'
import { useNotifications } from '@/lib/hooks/use-notifications'
import type { SerializedNotification } from '@/lib/utils/notifications'
import type { NotificationPayload } from '@/lib/supabase/realtime'

interface NotificationListProps {
  initialNotifications: SerializedNotification[]
  userId: string
  userType: 'SUPPLIER' | 'STORE'
  initialUnreadCount: number
  hasMore: boolean
}

export function NotificationList({
  initialNotifications,
  userId,
  userType,
  initialUnreadCount,
  hasMore: initialHasMore,
}: NotificationListProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loadingMore, setLoadingMore] = useState(false)

  const handleNewNotification = useCallback((payload: NotificationPayload) => {
    const serialized: SerializedNotification = {
      id: payload.id,
      userId: payload.user_id,
      userType: payload.user_type,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      relatedId: payload.related_id,
      read: payload.read,
      createdAt: payload.created_at,
      updatedAt: payload.updated_at,
    }
    setNotifications((prev) => [serialized, ...prev])
  }, [])

  const { unreadCount, decrementCount, resetCount } = useNotifications(userId, initialUnreadCount, {
    onNewNotification: handleNewNotification,
  })

  const handleNotificationClick = async (notification: SerializedNotification) => {
    if (!notification.read) {
      const result = await markNotificationAsRead(notification.id)
      if (result.success) {
        decrementCount()
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        )
      }
    }

    if (userType === 'SUPPLIER' && notification.relatedId) {
      router.push(`/requests/${notification.relatedId}`)
    } else if (userType === 'STORE') {
      router.push('/my-requests')
    }
  }

  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsRead()
    if (result.success) {
      resetCount()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }
  }

  const handleLoadMore = async () => {
    setLoadingMore(true)
    try {
      const result = await loadMoreNotifications(userType, notifications.length)
      if (result.success) {
        setNotifications((prev) => [...prev, ...result.data.notifications])
        setHasMore(result.data.hasMore)
      } else {
        toast.error('Erreur lors du chargement des notifications')
      }
    } catch {
      toast.error('Erreur lors du chargement des notifications')
    } finally {
      setLoadingMore(false)
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-muted p-6 mb-6">
          <Bell className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="font-display text-lg font-semibold mb-2">Aucune notification</h2>
        <p className="text-muted-foreground max-w-sm">
          {userType === 'SUPPLIER'
            ? 'Vous serez notifié lorsqu\u2019un magasin enverra une demande.'
            : 'Vous serez notifié lorsqu\u2019un fournisseur traitera votre demande.'}
        </p>
      </div>
    )
  }

  return (
    <div>
      {unreadCount > 0 && (
        <div className="flex justify-end px-4 py-2">
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
            Tout marquer comme lu
          </Button>
        </div>
      )}

      <div className="divide-y divide-border">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={() => handleNotificationClick(notification)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center py-4">
          <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore ? 'Chargement...' : 'Charger plus'}
          </Button>
        </div>
      )}
    </div>
  )
}
