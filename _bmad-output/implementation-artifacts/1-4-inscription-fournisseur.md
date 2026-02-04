# Story 1.4: Inscription Fournisseur

Status: done

## Story

En tant que **fournisseur**,
Je veux **créer un compte avec mes informations professionnelles**,
Afin de **accéder à la plateforme et publier mes offres**.

## Acceptance Criteria

### AC1: Affichage du formulaire d'inscription
**Given** je suis sur la page d'inscription fournisseur `/register/supplier`
**When** je visualise le formulaire
**Then** les champs suivants sont affichés: nom de l'entreprise, email, téléphone, mot de passe, confirmation mot de passe
**And** le formulaire utilise le design system (shadcn/ui)
**And** les champs ont les labels appropriés en français

### AC2: Validation côté client avec Zod
**Given** je suis sur la page d'inscription fournisseur
**When** je remplis le formulaire avec des données invalides
**Then** le formulaire valide les champs avec Zod (email valide, téléphone format français, mot de passe min 8 caractères)
**And** les erreurs de validation s'affichent inline sous chaque champ en rouge
**And** le bouton "S'inscrire" reste désactivé tant que le formulaire est invalide

### AC3: Création du compte avec succès
**Given** le formulaire est valide
**When** je soumets l'inscription
**Then** un compte Supabase Auth est créé avec l'email et mot de passe
**And** un profil fournisseur est créé dans la table `suppliers` avec l'ID de l'utilisateur Auth
**And** un email de confirmation est envoyé automatiquement par Supabase

### AC4: Feedback de succès
**Given** l'inscription réussit
**When** le compte est créé
**Then** un toast de succès s'affiche "Compte créé ! Vérifiez votre email."
**And** je suis redirigé vers la page de login `/login`

### AC5: Gestion de l'email déjà utilisé
**Given** l'email existe déjà dans Supabase Auth
**When** je tente de m'inscrire
**Then** un message d'erreur s'affiche "Cet email est déjà utilisé"
**And** le formulaire reste affiché avec les données saisies (sauf mot de passe)

### AC6: Gestion des erreurs serveur
**Given** une erreur serveur survient
**When** la création échoue (réseau, Supabase down, etc.)
**Then** un toast d'erreur s'affiche avec un message explicite
**And** je peux réessayer sans perdre mes données (sauf mot de passe)

## Tasks / Subtasks

- [x] **Task 1: Créer le schéma de validation Zod** (AC: 2)
  - [x] 1.1 Créer `/src/lib/validations/auth.ts`
  - [x] 1.2 Définir `registerSupplierSchema` avec les règles:
    - `companyName`: string min(2), max(100)
    - `email`: email valide
    - `phone`: regex format français optionnel (0X XX XX XX XX ou +33)
    - `password`: min 8 caractères
    - `confirmPassword`: doit correspondre à password
  - [x] 1.3 Exporter le type `RegisterSupplierInput` inféré du schéma
  - [x] 1.4 Créer les messages d'erreur en français

- [x] **Task 2: Créer la Server Action d'inscription** (AC: 3, 5, 6)
  - [x] 2.1 Créer `/src/lib/actions/auth.ts` (si n'existe pas)
  - [x] 2.2 Implémenter `registerSupplier(input: RegisterSupplierInput): Promise<ActionResult<{ userId: string }>>`
  - [x] 2.3 Valider l'input avec Zod côté serveur (double validation)
  - [x] 2.4 Créer l'utilisateur Supabase Auth avec `supabase.auth.signUp()`
  - [x] 2.5 Créer le profil dans la table `suppliers` avec le même UUID
  - [x] 2.6 Gérer les erreurs spécifiques:
    - Email déjà utilisé → `{ success: false, error: 'Cet email est déjà utilisé', code: 'VALIDATION_ERROR' }`
    - Erreur serveur → `{ success: false, error: '...', code: 'SERVER_ERROR' }`
  - [x] 2.7 Retourner `{ success: true, data: { userId } }` en cas de succès

- [x] **Task 3: Créer le composant formulaire d'inscription** (AC: 1, 2)
  - [x] 3.1 Créer `/src/components/forms/register-supplier-form.tsx`
  - [x] 3.2 Utiliser React Hook Form avec zodResolver
  - [x] 3.3 Ajouter les composants shadcn/ui: Input, Button, Label, FormField
  - [x] 3.4 Implémenter l'affichage des erreurs inline
  - [x] 3.5 Ajouter le state de loading pendant la soumission
  - [x] 3.6 Implémenter le toggle visibilité mot de passe (optionnel)

- [x] **Task 4: Mettre à jour la page d'inscription fournisseur** (AC: 1, 4)
  - [x] 4.1 Mettre à jour `/src/app/(auth)/register/supplier/page.tsx`
  - [x] 4.2 Intégrer `RegisterSupplierForm`
  - [x] 4.3 Ajouter le lien "Déjà un compte ? Connectez-vous"
  - [x] 4.4 Ajouter le lien "Vous êtes un magasin ?"

- [x] **Task 5: Configurer les toasts** (AC: 4, 6)
  - [x] 5.1 Installer/configurer shadcn/ui Toast si pas déjà fait
  - [x] 5.2 Ajouter `<Toaster />` dans le layout racine ou providers
  - [x] 5.3 Utiliser `toast.success()` pour le succès
  - [x] 5.4 Utiliser `toast.error()` pour les erreurs

- [x] **Task 6: Gérer la redirection post-inscription** (AC: 4)
  - [x] 6.1 Implémenter `router.push('/login')` après succès
  - [x] 6.2 Optionnel: passer un paramètre `?registered=true` pour afficher un message sur la page login

- [x] **Task 7: Tests et validation** (AC: 1-6)
  - [x] 7.1 Créer les tests unitaires pour le schéma Zod
  - [x] 7.2 Créer les tests pour la Server Action (mock Supabase)
  - [x] 7.3 Tester manuellement le flow complet d'inscription
  - [x] 7.4 Vérifier que `npm run build` passe
  - [x] 7.5 Vérifier que `npm run lint` passe

## Dev Notes

### Schéma de validation Zod

```typescript
// src/lib/validations/auth.ts
import { z } from 'zod'

// Regex pour téléphone français (optionnel)
const phoneRegex = /^(?:(?:\+33|0)[1-9])(?:[0-9]{8})$/

export const registerSupplierSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Le nom de l\'entreprise doit contenir au moins 2 caractères')
    .max(100, 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères'),
  email: z
    .string()
    .email('Veuillez entrer une adresse email valide'),
  phone: z
    .string()
    .regex(phoneRegex, 'Veuillez entrer un numéro de téléphone valide')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z
    .string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

export type RegisterSupplierInput = z.infer<typeof registerSupplierSchema>

// Version serveur sans confirmPassword
export const registerSupplierServerSchema = registerSupplierSchema.omit({ confirmPassword: true })
export type RegisterSupplierServerInput = z.infer<typeof registerSupplierServerSchema>
```

### Server Action d'inscription

```typescript
// src/lib/actions/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { registerSupplierServerSchema, type RegisterSupplierServerInput } from '@/lib/validations/auth'
import type { ActionResult } from '@/types/api'

export async function registerSupplier(
  input: RegisterSupplierServerInput
): Promise<ActionResult<{ userId: string }>> {
  // 1. Validation serveur (double validation)
  const validated = registerSupplierServerSchema.safeParse(input)
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0]?.message || 'Données invalides',
      code: 'VALIDATION_ERROR'
    }
  }

  const { companyName, email, phone, password } = validated.data

  try {
    const supabase = await createClient()

    // 2. Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: 'supplier',
          company_name: companyName,
        }
      }
    })

    if (authError) {
      // Gérer l'erreur "email déjà utilisé"
      if (authError.message.includes('already registered') ||
          authError.message.includes('already exists')) {
        return {
          success: false,
          error: 'Cet email est déjà utilisé',
          code: 'VALIDATION_ERROR'
        }
      }
      return {
        success: false,
        error: authError.message,
        code: 'SERVER_ERROR'
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Erreur lors de la création du compte',
        code: 'SERVER_ERROR'
      }
    }

    // 3. Créer le profil dans la table suppliers
    const { error: profileError } = await supabase
      .from('suppliers')
      .insert({
        id: authData.user.id,
        email,
        company_name: companyName,
        phone: phone || null,
      })

    if (profileError) {
      // Rollback: supprimer l'utilisateur Auth si le profil échoue
      // Note: En production, utiliser une transaction ou un webhook
      console.error('Profile creation failed:', profileError)
      return {
        success: false,
        error: 'Erreur lors de la création du profil',
        code: 'SERVER_ERROR'
      }
    }

    return {
      success: true,
      data: { userId: authData.user.id }
    }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      error: 'Une erreur inattendue s\'est produite',
      code: 'SERVER_ERROR'
    }
  }
}
```

### Composant formulaire d'inscription

```typescript
// src/components/forms/register-supplier-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    } catch (error) {
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
              <FormLabel>Nom de l'entreprise</FormLabel>
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
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
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
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
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
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          S'inscrire
        </Button>
      </form>
    </Form>
  )
}
```

### Page d'inscription fournisseur

```typescript
// src/app/(auth)/register/supplier/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterSupplierForm } from '@/components/forms/register-supplier-form'

export const metadata: Metadata = {
  title: 'Inscription Fournisseur - aurelien-project',
  description: 'Créez votre compte fournisseur pour publier vos offres promotionnelles',
}

export default function RegisterSupplierPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Inscription Fournisseur
        </h1>
        <p className="text-muted-foreground">
          Créez votre compte pour publier vos offres
        </p>
      </div>

      <RegisterSupplierForm />

      <div className="space-y-2 text-center text-sm">
        <p className="text-muted-foreground">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Connectez-vous
          </Link>
        </p>
        <p className="text-muted-foreground">
          Vous êtes un magasin ?{' '}
          <Link href="/register/store" className="text-primary hover:underline">
            Inscrivez-vous ici
          </Link>
        </p>
      </div>
    </div>
  )
}
```

### Configuration Toast (Sonner)

```typescript
// Installation si nécessaire:
// npx shadcn@latest add sonner

// Dans src/app/layout.tsx ou providers.tsx, ajouter:
import { Toaster } from '@/components/ui/sonner'

// Dans le JSX:
<Toaster position="top-center" richColors />
```

### Project Structure Notes

**Fichiers à créer:**
- `/src/lib/validations/auth.ts` - Schémas Zod pour l'authentification
- `/src/lib/actions/auth.ts` - Server Actions d'authentification (si pas existant, étendre le fichier créé en 1.3)
- `/src/components/forms/register-supplier-form.tsx` - Composant formulaire
- `/src/lib/validations/auth.test.ts` - Tests unitaires

**Fichiers à modifier:**
- `/src/app/(auth)/register/supplier/page.tsx` - Remplacer le placeholder
- `/src/app/layout.tsx` ou `/src/app/providers.tsx` - Ajouter `<Toaster />`

**Composants shadcn/ui requis:**
- Form (React Hook Form integration)
- Input
- Button
- Label
- Sonner (Toast)

**Installation des composants manquants:**
```bash
npx shadcn@latest add form input button sonner
```

### Architecture Compliance

**Références Architecture:**
- [Source: architecture.md#API & Communication Patterns - Server Actions]
- [Source: architecture.md#Implementation Patterns - ActionResult<T>]
- [Source: architecture.md#Implementation Patterns - Validation Zod client ET serveur]
- [Source: project-context.md#API Response Pattern - MANDATORY]
- [Source: project-context.md#TypeScript Rules - NO ANY]

**Patterns OBLIGATOIRES:**
- `ActionResult<T>` pour la Server Action
- Double validation Zod (client + serveur)
- Messages d'erreur en français
- Touch targets minimum 44x44px (h-11 pour les boutons)
- Server Components par défaut, `'use client'` uniquement pour le formulaire

### Testing Requirements

**Tests unitaires à créer:**
```typescript
// src/lib/validations/auth.test.ts
import { describe, it, expect } from 'vitest'
import { registerSupplierSchema } from './auth'

describe('registerSupplierSchema', () => {
  it('accepts valid input', () => {
    const result = registerSupplierSchema.safeParse({
      companyName: 'Ma Société',
      email: 'test@example.com',
      phone: '0612345678',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = registerSupplierSchema.safeParse({
      companyName: 'Ma Société',
      email: 'invalid-email',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects mismatched passwords', () => {
    const result = registerSupplierSchema.safeParse({
      companyName: 'Ma Société',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'different',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = registerSupplierSchema.safeParse({
      companyName: 'Ma Société',
      email: 'test@example.com',
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
  })
})
```

**Tests manuels:**
- [ ] Inscription avec données valides → succès, redirection, toast
- [ ] Inscription avec email existant → erreur "email déjà utilisé"
- [ ] Inscription avec email invalide → erreur inline
- [ ] Inscription avec mot de passe court → erreur inline
- [ ] Inscription avec mots de passe différents → erreur inline
- [ ] Vérifier l'email reçu dans Supabase Dashboard

### Dependencies

**Déjà installées:**
- `zod` (via Story 1.1)
- `react-hook-form` (via Story 1.1)
- `@hookform/resolvers` (peut nécessiter installation)
- `@supabase/supabase-js`, `@supabase/ssr`

**À installer si manquantes:**
```bash
npm install @hookform/resolvers
npx shadcn@latest add form sonner
```

### Previous Story Intelligence

**Learnings from Story 1.3:**
- `ActionResult<T>` déjà défini dans `/src/types/api.ts`
- Supabase clients disponibles: `createClient()` depuis `/src/lib/supabase/server.ts`
- RLS policies actives sur la table `suppliers` - INSERT autorisé si `auth.uid() = id`
- Middleware redirige les utilisateurs connectés de `/register/*` vers `/offers`
- Route group `(auth)` existe avec layout sans bottom nav

**Files Created in Story 1.3:**
- `/src/types/api.ts` - Type ActionResult (réutiliser)
- `/src/lib/supabase/server.ts` - createClient() (réutiliser)
- `/src/middleware.ts` - Déjà configuré pour les routes auth
- `/src/app/(auth)/register/supplier/page.tsx` - Placeholder à remplacer

**Key Pattern: Supabase Auth + Profile Creation**

L'inscription doit créer:
1. Un utilisateur dans Supabase Auth (`auth.users`)
2. Un profil dans la table `suppliers` avec le **même UUID**

Le RLS policy `auth.uid() = id` garantit que l'utilisateur ne peut créer/lire que son propre profil.

### Security Considerations

- **Mot de passe**: Minimum 8 caractères (Supabase gère le hashing)
- **Double validation**: Zod côté client ET serveur
- **Rate limiting**: Géré par Supabase Auth (anti-bruteforce)
- **HTTPS**: Garanti par Vercel en production
- **RGPD**: Consentement implicite à l'inscription (CGU à ajouter post-MVP)

### UX Considerations

- **Touch targets**: Boutons h-11 (44px) pour mobile
- **Loading state**: Spinner dans le bouton pendant la soumission
- **Toggle password**: Améliore l'UX sans compromettre la sécurité
- **Error messages**: Inline en français, clairs et actionnables
- **Toast**: Position top-center pour visibilité mobile

## References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4: Inscription Fournisseur]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/prd.md#FR1 - Création compte fournisseur]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Form Patterns]
- [Source: _bmad-output/project-context.md#API Response Pattern]
- [Source: _bmad-output/project-context.md#TypeScript Rules]
- [Source: _bmad-output/implementation-artifacts/1-3-schema-base-de-donnees-et-configuration-auth.md]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

N/A

### Completion Notes List

- ✅ Task 1: Schéma Zod créé avec validation française (12 tests)
- ✅ Task 2: Server Action registerSupplier avec double validation (9 tests)
- ✅ Task 3: Composant RegisterSupplierForm avec RHF + toggle password
- ✅ Task 4: Page /register/supplier mise à jour avec liens navigation
- ✅ Task 5: Toast Sonner déjà configuré, utilisé dans le formulaire
- ✅ Task 6: Redirection vers /login?registered=true après succès
- ✅ Task 7: 66 tests passent, lint OK, build OK

### Change Log

- 2026-02-04: Implémentation complète de l'inscription fournisseur (AC 1-6)
- 2026-02-04: Fix hydratation React (ajout ThemeProvider)
- 2026-02-04: Fix RLS bypass avec createAdminClient (service_role key)
- 2026-02-04: Fix insertion suppliers (ajout created_at/updated_at)
- 2026-02-04: Code Review - 7 issues corrigées (refactor Zod, suppression console.error, bouton disabled, return type)

### File List

**Créés:**
- `src/lib/validations/auth.ts` - Schémas Zod registerSupplierSchema et registerSupplierServerSchema
- `src/lib/validations/auth.test.ts` - Tests unitaires du schéma (12 tests)
- `src/lib/actions/auth.ts` - Server Action registerSupplier
- `src/lib/actions/auth.test.ts` - Tests unitaires de la Server Action (9 tests)
- `src/components/forms/register-supplier-form.tsx` - Composant formulaire d'inscription
- `src/components/ui/form.tsx` - Composant shadcn/ui Form (via npx shadcn add)
- `src/components/ui/label.tsx` - Composant shadcn/ui Label (via npx shadcn add)

**Modifiés:**
- `src/app/(auth)/register/supplier/page.tsx` - Intégration du formulaire d'inscription
- `src/app/providers.tsx` - Ajout ThemeProvider pour éviter erreur hydratation
- `src/lib/supabase/server.ts` - Ajout createAdminClient pour bypasser RLS
