import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mot de passe oublié - Aurelien Project',
}

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
        <p className="text-muted-foreground">
          Entrez votre email pour réinitialiser votre mot de passe
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Formulaire de réinitialisation (à implémenter)
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
