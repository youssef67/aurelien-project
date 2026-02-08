import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

import { LoginForm } from '@/components/forms/login-form'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const metadata: Metadata = {
  title: 'Connexion - Aurelien Project',
  description: 'Connectez-vous à votre compte pour accéder à votre espace personnel',
}

interface LoginPageProps {
  searchParams: Promise<{ registered?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const justRegistered = params.registered === 'true'

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Connexion
        </h1>
        <p className="text-muted-foreground">
          Entrez vos identifiants pour accéder à votre espace
        </p>
      </div>

      {justRegistered && (
        <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
          <AlertDescription>
            Compte créé avec succès ! Vérifiez votre email pour confirmer votre inscription.
          </AlertDescription>
        </Alert>
      )}

      <LoginForm />

      <div className="space-y-2 text-center text-sm">
        <p>
          <Link
            href="/forgot-password"
            className="text-muted-foreground hover:text-primary hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </p>
        <p className="text-muted-foreground">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  )
}
