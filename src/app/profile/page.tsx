import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { PageHeader } from '@/components/layout/page-header'
import { LogoutButton } from '@/components/custom/logout-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Mon profil - aurelien-project',
  description: 'Gérez votre profil et vos paramètres',
}

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userType = user.user_metadata?.user_type as 'supplier' | 'store' | undefined
  const email = user.email

  // Informations selon le type d'utilisateur
  const isSupplier = userType === 'supplier'
  const displayName = isSupplier
    ? user.user_metadata?.company_name || 'Fournisseur'
    : user.user_metadata?.store_name || 'Magasin'
  const brand = user.user_metadata?.brand
  const accountTypeLabel = isSupplier ? 'Fournisseur' : 'Magasin'

  return (
    <MobileLayout header={<PageHeader title="Mon profil" />}>
      <div className="container max-w-2xl py-6 space-y-6 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {displayName}
              {brand && <Badge variant="secondary">{brand}</Badge>}
            </CardTitle>
            <CardDescription>Informations de votre compte {accountTypeLabel.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type de compte</p>
              <p className="font-medium">{accountTypeLabel}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Déconnexion</CardTitle>
            <CardDescription>
              Déconnectez-vous de votre compte pour sécuriser votre accès
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LogoutButton className="h-11" />
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}
