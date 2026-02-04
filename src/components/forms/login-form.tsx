'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'

import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { login, resendConfirmationEmail } from '@/lib/actions/auth'

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginInput) {
    setIsLoading(true)
    setNeedsEmailConfirmation(false)

    try {
      const result = await login(data)

      if (result.success) {
        toast.success('Connexion réussie')
        router.push(result.data.redirectUrl)
        router.refresh()
      } else {
        // Vérifier si c'est une erreur d'email non confirmé
        if (result.error.includes('confirmer votre email')) {
          setNeedsEmailConfirmation(true)
        }
        toast.error(result.error)
        // Vider le mot de passe après une erreur
        form.setValue('password', '')
      }
    } catch {
      toast.error('Une erreur inattendue s\'est produite')
      form.setValue('password', '')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendEmail() {
    const email = form.getValues('email')
    if (!email) {
      toast.error('Veuillez entrer votre email')
      return
    }

    setResendLoading(true)
    try {
      const result = await resendConfirmationEmail(email)
      if (result.success) {
        toast.success('Email de confirmation envoyé !')
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Une erreur inattendue s\'est produite')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="votre@email.fr"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-pressed={showPassword}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {needsEmailConfirmation && (
          <div className="rounded-md bg-muted p-4 text-sm">
            <p className="text-muted-foreground">
              Votre email n&apos;est pas encore confirmé.{' '}
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="text-primary hover:underline disabled:opacity-50"
              >
                {resendLoading ? 'Envoi en cours...' : 'Renvoyer l\'email de confirmation'}
              </button>
            </p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-11"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Se connecter
        </Button>
      </form>
    </Form>
  )
}
