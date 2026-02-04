import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Réinitialiser le mot de passe - Aurelien Project',
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
        <p className="text-muted-foreground">
          Définissez votre nouveau mot de passe
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Formulaire de nouveau mot de passe (à implémenter)
        </p>
      </div>

      <div className="text-center text-sm">
        <Link href="/login" className="text-primary hover:underline">
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
