import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterSupplierForm } from '@/components/forms/register-supplier-form'

export const metadata: Metadata = {
  title: 'Inscription Fournisseur - Aurelien Project',
  description: 'Créez votre compte fournisseur pour publier vos offres promotionnelles',
}

export default function RegisterSupplierPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Inscription Fournisseur
        </h1>
        <p className="text-muted-foreground">
          Créez votre compte pour publier vos offres
        </p>
      </div>

      <RegisterSupplierForm />

      <div className="space-y-2 text-center text-sm">
        <p className="text-muted-foreground">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Connectez-vous
          </Link>
        </p>
        <p className="text-muted-foreground">
          Vous êtes un magasin ?{' '}
          <Link href="/register/store" className="text-primary hover:underline">
            Inscrivez-vous ici
          </Link>
        </p>
      </div>
    </div>
  )
}
