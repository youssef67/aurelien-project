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

export default async function StoreNotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(user.id, 'STORE', 0, PAGE_SIZE),
    getUnreadNotificationCount(user.id, 'STORE'),
  ])

  return (
    <>
      <PageHeader title="Notifications" />
      <NotificationList
        initialNotifications={notifications}
        userId={user.id}
        userType="STORE"
        initialUnreadCount={unreadCount}
        hasMore={notifications.length >= PAGE_SIZE}
      />
    </>
  )
}
