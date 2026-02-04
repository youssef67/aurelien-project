import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Inscription Magasin - Aurelien Project',
}

export default function RegisterStorePage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Inscription Magasin</h1>
        <p className="text-muted-foreground">
          Créez votre compte magasin
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Formulaire d&apos;inscription magasin (à implémenter)
        </p>
      </div>

      <div className="text-center text-sm">
        <Link href="/register" className="text-primary hover:underline">
          ← Retour au choix
        </Link>
      </div>
    </div>
  )
}
