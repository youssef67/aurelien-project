import { createClient } from './client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface NotificationPayload {
  id: string
  user_id: string
  user_type: 'SUPPLIER' | 'STORE'
  type: 'NEW_REQUEST' | 'REQUEST_TREATED'
  title: string
  body: string
  related_id: string | null
  read: boolean
  created_at: string
  updated_at: string
}

export function subscribeToNotifications(
  userId: string,
  onNewNotification: (notification: NotificationPayload) => void
): RealtimeChannel {
  const supabase = createClient()

  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onNewNotification(payload.new as NotificationPayload)
    )
    .subscribe()
}

export function unsubscribeFromNotifications(channel: RealtimeChannel): void {
  channel.unsubscribe()
}
