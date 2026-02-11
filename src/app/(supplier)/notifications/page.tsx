import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/page-header'
import { NotificationList } from '@/components/custom/notification-list'
import { getNotifications, getUnreadNotificationCount } from '@/lib/queries/notifications'

export const metadata: Metadata = {
  title: 'Notifications',
}

const PAGE_SIZE = 50

export default async function SupplierNotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(user.id, 'SUPPLIER', 0, PAGE_SIZE),
    getUnreadNotificationCount(user.id, 'SUPPLIER'),
  ])

  return (
    <>
      <PageHeader title="Notifications" />
      <NotificationList
        initialNotifications={notifications}
        userId={user.id}
        userType="SUPPLIER"
        initialUnreadCount={unreadCount}
        hasMore={notifications.length >= PAGE_SIZE}
      />
    </>
  )
}
