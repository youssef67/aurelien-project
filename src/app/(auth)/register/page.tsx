import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Inscription - Aurelien Project',
}

export default function RegisterPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Inscription</h1>
        <p className="text-muted-foreground">
          Choisissez votre type de compte
        </p>
      </div>

      <div className="space-y-4">
        <Link
          href="/register/supplier"
          className="block w-full p-4 border rounded-lg hover:bg-accent transition-colors"
        >
          <h2 className="font-semibold">Fournisseur</h2>
          <p className="text-sm text-muted-foreground">
            Je propose des offres promotionnelles
          </p>
        </Link>

        <Link
          href="/register/store"
          className="block w-full p-4 border rounded-lg hover:bg-accent transition-colors"
        >
          <h2 className="font-semibold">Magasin</h2>
          <p className="text-sm text-muted-foreground">
            Je recherche des offres pour mon magasin
          </p>
        </Link>
      </div>

      <div className="text-center text-sm">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Se connecter
        </Link>
      </div>
    </div>
  )
}
