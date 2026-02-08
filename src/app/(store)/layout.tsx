import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { BottomNavigation } from '@/components/custom/bottom-navigation'

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const store = await prisma.store.findUnique({
    where: { id: user.id },
  })

  if (!store) {
    redirect('/')
  }

  return (
    <MobileLayout bottomNav={<BottomNavigation />}>
      {children}
    </MobileLayout>
  )
}
