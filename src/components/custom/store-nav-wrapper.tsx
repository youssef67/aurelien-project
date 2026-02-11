'use client'

import { BottomNavigation } from './bottom-navigation'
import { useNotifications } from '@/lib/hooks/use-notifications'

interface StoreNavWrapperProps {
  userId: string
  initialUnreadCount: number
}

export function StoreNavWrapper({ userId, initialUnreadCount }: StoreNavWrapperProps) {
  const { unreadCount } = useNotifications(userId, initialUnreadCount)

  return <BottomNavigation unreadRequestCount={unreadCount} />
}
