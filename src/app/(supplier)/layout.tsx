import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { SupplierNavWrapper } from '@/components/custom/supplier-nav-wrapper'
import { getUnreadNotificationCount } from '@/lib/queries/notifications'

export default async function SupplierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const supplier = await prisma.supplier.findUnique({
    where: { id: user.id },
  })

  if (!supplier) {
    redirect('/profile')
  }

  const unreadCount = await getUnreadNotificationCount(user.id, 'SUPPLIER')

  return (
    <MobileLayout bottomNav={<SupplierNavWrapper userId={user.id} initialUnreadCount={unreadCount} />}>
      {children}
    </MobileLayout>
  )
}
