import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Connexion - Aurelien Project',
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Connexion</h1>
        <p className="text-muted-foreground">
          Connectez-vous à votre compte
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Formulaire de connexion (à implémenter)
        </p>

        <div className="text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-primary hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <div className="text-center text-sm">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-primary hover:underline">
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </div>
  )
}
