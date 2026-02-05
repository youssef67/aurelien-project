import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { SupplierBottomNavigation } from '@/components/custom/supplier-bottom-navigation'

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

  return (
    <MobileLayout bottomNav={<SupplierBottomNavigation />}>
      {children}
    </MobileLayout>
  )
}
