import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterStoreForm } from '@/components/forms/register-store-form'

export const metadata: Metadata = {
  title: 'Inscription Magasin - Aurelien Project',
  description: 'Créez votre compte magasin pour accéder aux offres promotionnelles des fournisseurs',
}

export default function RegisterStorePage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Inscription Magasin
        </h1>
        <p className="text-muted-foreground">
          Créez votre compte pour accéder aux offres
        </p>
      </div>

      <RegisterStoreForm />

      <div className="space-y-2 text-center text-sm">
        <p className="text-muted-foreground">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Connectez-vous
          </Link>
        </p>
        <p className="text-muted-foreground">
          Vous êtes un fournisseur ?{' '}
          <Link href="/register/supplier" className="text-primary hover:underline">
            Inscrivez-vous ici
          </Link>
        </p>
      </div>
    </div>
  )
}
