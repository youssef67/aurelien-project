'use client'

import { SupplierBottomNavigation } from './supplier-bottom-navigation'
import { useNotifications } from '@/lib/hooks/use-notifications'

interface SupplierNavWrapperProps {
  userId: string
  initialUnreadCount: number
}

export function SupplierNavWrapper({ userId, initialUnreadCount }: SupplierNavWrapperProps) {
  const { unreadCount } = useNotifications(userId, initialUnreadCount)

  return <SupplierBottomNavigation unreadRequestCount={unreadCount} />
}
