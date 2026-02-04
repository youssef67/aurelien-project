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

import { registerSupplierSchema, type RegisterSupplierInput } from '@/lib/validations/auth'
import { registerSupplier } from '@/lib/actions/auth'

export function RegisterSupplierForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<RegisterSupplierInput>({
    resolver: zodResolver(registerSupplierSchema),
    mode: 'onChange',
    defaultValues: {
      companyName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: RegisterSupplierInput) {
    setIsLoading(true)

    try {
      const result = await registerSupplier({
        companyName: data.companyName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      })

      if (result.success) {
        toast.success('Compte créé ! Vérifiez votre email.')
        router.push('/login?registered=true')
      } else {
        toast.error(result.error)
        // Vider les champs mot de passe en cas d'erreur
        form.setValue('password', '')
        form.setValue('confirmPassword', '')
      }
    } catch {
      toast.error('Une erreur inattendue s\'est produite')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de l&apos;entreprise</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ma Société SAS"
                  autoComplete="organization"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="contact@entreprise.fr"
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
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone (optionnel)</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="06 12 34 56 78"
                  autoComplete="tel"
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
                    autoComplete="new-password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? 'Masquer' : 'Afficher'} le mot de passe
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmer le mot de passe</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? 'Masquer' : 'Afficher'} le mot de passe
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full h-11"
          disabled={isLoading || !form.formState.isValid}
        >
          {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
          S&apos;inscrire
        </Button>
      </form>
    </Form>
  )
}
