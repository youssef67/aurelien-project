import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { ForgotPasswordForm } from '@/components/forms/forgot-password-form'

export const metadata: Metadata = {
  title: 'Mot de passe oublié - Aurelien Project',
  description: 'Réinitialisez votre mot de passe pour accéder à votre compte',
}

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Mot de passe oublié
        </h1>
        <p className="text-muted-foreground">
          Entrez votre adresse email pour recevoir un lien de réinitialisation.
        </p>
      </div>

      <ForgotPasswordForm />

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 size-4" />
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
