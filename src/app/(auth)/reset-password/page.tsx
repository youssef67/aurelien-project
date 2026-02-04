import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { ResetPasswordForm } from '@/components/forms/reset-password-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Nouveau mot de passe - Aurelien Project',
  description: 'Définissez votre nouveau mot de passe',
}

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si pas d'utilisateur/session, le token est invalide ou expiré
  // Supabase échange le code automatiquement quand l'utilisateur arrive sur cette page
  const isValidSession = !!user

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {isValidSession ? 'Nouveau mot de passe' : 'Lien invalide'}
        </h1>
        {isValidSession && (
          <p className="text-muted-foreground">
            Choisissez un mot de passe sécurisé d&apos;au moins 8 caractères.
          </p>
        )}
      </div>

      {isValidSession ? (
        <ResetPasswordForm />
      ) : (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>
              Ce lien de réinitialisation est expiré ou invalide.
              Veuillez demander un nouveau lien.
            </AlertDescription>
          </Alert>
          <Button asChild className="w-full h-11">
            <Link href="/forgot-password">
              Demander un nouveau lien
            </Link>
          </Button>
        </div>
      )}

      <div className="text-center">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
