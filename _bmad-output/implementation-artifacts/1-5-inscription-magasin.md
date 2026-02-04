# Story 1.5: Inscription Magasin

Status: ready-for-dev

## Story

En tant que **chef de rayon**,
Je veux **créer un compte magasin avec les informations de mon point de vente**,
Afin de **accéder aux offres promotionnelles des fournisseurs**.

## Acceptance Criteria

### AC1: Affichage du formulaire d'inscription
**Given** je suis sur la page d'inscription magasin `/register/store`
**When** je visualise le formulaire
**Then** les champs suivants sont affichés: nom du magasin, enseigne (dropdown), email, ville, téléphone, mot de passe, confirmation mot de passe
**And** le formulaire utilise le design system (shadcn/ui)
**And** les champs ont les labels appropriés en français
**And** l'enseigne est un dropdown avec les options: Leclerc, Intermarché, Super U, Système U

### AC2: Validation côté client avec Zod
**Given** je suis sur la page d'inscription magasin
**When** je remplis le formulaire avec des données invalides
**Then** le formulaire valide les champs avec Zod (email valide, téléphone format français optionnel, mot de passe min 8 caractères)
**And** les erreurs de validation s'affichent inline sous chaque champ en rouge
**And** le bouton "S'inscrire" reste désactivé tant que le formulaire est invalide

### AC3: Création du compte avec succès
**Given** le formulaire est valide
**When** je soumets l'inscription
**Then** un compte Supabase Auth est créé avec l'email et mot de passe
**And** un profil magasin est créé dans la table `stores` avec l'enseigne sélectionnée
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

- [ ] **Task 1: Étendre le schéma de validation Zod** (AC: 2)
  - [ ] 1.1 Ajouter dans `/src/lib/validations/auth.ts` les schémas pour Store
  - [ ] 1.2 Définir `registerStoreSchema` avec les règles:
    - `name`: string min(2), max(100) - Nom du magasin
    - `brand`: enum Brand (LECLERC, INTERMARCHE, SUPER_U, SYSTEME_U)
    - `email`: email valide
    - `city`: string min(2), max(100) - Ville du magasin
    - `phone`: regex format français optionnel (0X XX XX XX XX ou +33)
    - `password`: min 8 caractères
    - `confirmPassword`: doit correspondre à password
  - [ ] 1.3 Exporter le type `RegisterStoreInput` inféré du schéma
  - [ ] 1.4 Créer le schéma serveur `registerStoreServerSchema` (sans confirmPassword)
  - [ ] 1.5 Ajouter les tests unitaires pour le schéma Store

- [ ] **Task 2: Créer la Server Action d'inscription magasin** (AC: 3, 5, 6)
  - [ ] 2.1 Ajouter `registerStore` dans `/src/lib/actions/auth.ts`
  - [ ] 2.2 Implémenter `registerStore(input: RegisterStoreServerInput): Promise<ActionResult<{ userId: string }>>`
  - [ ] 2.3 Valider l'input avec Zod côté serveur (double validation)
  - [ ] 2.4 Créer l'utilisateur Supabase Auth avec `supabase.auth.signUp()` et `user_type: 'store'`
  - [ ] 2.5 Créer le profil dans la table `stores` avec le même UUID et l'enseigne
  - [ ] 2.6 Gérer les erreurs spécifiques:
    - Email déjà utilisé → `{ success: false, error: 'Cet email est déjà utilisé', code: 'VALIDATION_ERROR' }`
    - Erreur serveur → `{ success: false, error: '...', code: 'SERVER_ERROR' }`
  - [ ] 2.7 Implémenter le rollback si la création du profil échoue
  - [ ] 2.8 Ajouter les tests unitaires pour la Server Action

- [ ] **Task 3: Créer le composant formulaire d'inscription magasin** (AC: 1, 2)
  - [ ] 3.1 Créer `/src/components/forms/register-store-form.tsx`
  - [ ] 3.2 Utiliser React Hook Form avec zodResolver
  - [ ] 3.3 Ajouter les composants shadcn/ui: Input, Button, Label, FormField, Select
  - [ ] 3.4 Implémenter le dropdown Select pour l'enseigne avec les 4 options
  - [ ] 3.5 Implémenter l'affichage des erreurs inline
  - [ ] 3.6 Ajouter le state de loading pendant la soumission
  - [ ] 3.7 Implémenter le toggle visibilité mot de passe

- [ ] **Task 4: Mettre à jour la page d'inscription magasin** (AC: 1, 4)
  - [ ] 4.1 Mettre à jour `/src/app/(auth)/register/store/page.tsx`
  - [ ] 4.2 Intégrer `RegisterStoreForm`
  - [ ] 4.3 Ajouter le lien "Déjà un compte ? Connectez-vous"
  - [ ] 4.4 Ajouter le lien "Vous êtes un fournisseur ?"
  - [ ] 4.5 Ajouter les metadata pour le SEO

- [ ] **Task 5: Tests et validation** (AC: 1-6)
  - [ ] 5.1 Ajouter les tests unitaires pour le schéma Zod Store
  - [ ] 5.2 Ajouter les tests pour la Server Action registerStore
  - [ ] 5.3 Tester manuellement le flow complet d'inscription
  - [ ] 5.4 Vérifier que `npm run build` passe
  - [ ] 5.5 Vérifier que `npm run lint` passe

## Dev Notes

### Schéma de validation Zod - Ajouts à auth.ts

```typescript
// Ajouter dans src/lib/validations/auth.ts

// Import de l'enum Brand (ou définir localement pour la validation client)
export const BrandEnum = z.enum(['LECLERC', 'INTERMARCHE', 'SUPER_U', 'SYSTEME_U'])
export type BrandType = z.infer<typeof BrandEnum>

// Labels pour l'affichage dans le dropdown
export const BRAND_LABELS: Record<BrandType, string> = {
  LECLERC: 'Leclerc',
  INTERMARCHE: 'Intermarché',
  SUPER_U: 'Super U',
  SYSTEME_U: 'Système U',
}

// Constantes de validation
const MIN_NAME_LENGTH = 2
const MAX_NAME_LENGTH = 100
const MIN_CITY_LENGTH = 2
const MAX_CITY_LENGTH = 100

// Schéma de base pour les champs communs Store
const baseStoreSchema = z.object({
  name: z
    .string()
    .min(MIN_NAME_LENGTH, `Le nom du magasin doit contenir au moins ${MIN_NAME_LENGTH} caractères`)
    .max(MAX_NAME_LENGTH, `Le nom du magasin ne peut pas dépasser ${MAX_NAME_LENGTH} caractères`),
  brand: BrandEnum,
  email: z
    .string()
    .email('Veuillez entrer une adresse email valide'),
  city: z
    .string()
    .min(MIN_CITY_LENGTH, `La ville doit contenir au moins ${MIN_CITY_LENGTH} caractères`)
    .max(MAX_CITY_LENGTH, `La ville ne peut pas dépasser ${MAX_CITY_LENGTH} caractères`),
  phone: z
    .string()
    .regex(phoneRegex, 'Veuillez entrer un numéro de téléphone valide')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`),
})

// Schéma client avec confirmation mot de passe
export const registerStoreSchema = baseStoreSchema
  .extend({
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export type RegisterStoreInput = z.infer<typeof registerStoreSchema>

// Version serveur sans confirmPassword (pour la Server Action)
export const registerStoreServerSchema = baseStoreSchema

export type RegisterStoreServerInput = z.infer<typeof registerStoreServerSchema>
```

### Server Action d'inscription magasin

```typescript
// Ajouter dans src/lib/actions/auth.ts

import { registerStoreServerSchema, type RegisterStoreServerInput } from '@/lib/validations/auth'

export async function registerStore(
  input: RegisterStoreServerInput
): Promise<ActionResult<{ userId: string }>> {
  // 1. Validation serveur (double validation)
  const validated = registerStoreServerSchema.safeParse(input)
  if (!validated.success) {
    const issues = JSON.parse(validated.error.message)
    return {
      success: false,
      error: issues[0]?.message || 'Données invalides',
      code: 'VALIDATION_ERROR'
    }
  }

  const { name, brand, email, city, phone, password } = validated.data

  try {
    const supabase = await createClient()

    // 2. Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: 'store',
          store_name: name,
          brand: brand,
        }
      }
    })

    if (authError) {
      // Gérer l'erreur "email déjà utilisé"
      if (authError.message.includes('already registered') ||
          authError.message.includes('already exists') ||
          authError.message.includes('User already registered')) {
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

    // 3. Créer le profil dans la table stores (avec client admin pour bypasser RLS)
    const adminClient = createAdminClient()
    const now = new Date().toISOString()
    const { error: profileError } = await adminClient
      .from('stores')
      .insert({
        id: authData.user.id,
        email,
        name,
        brand,
        city,
        phone: phone || null,
        created_at: now,
        updated_at: now,
      })

    if (profileError) {
      // Rollback: supprimer l'utilisateur Auth si le profil échoue
      await adminClient.auth.admin.deleteUser(authData.user.id)
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
  } catch {
    return {
      success: false,
      error: 'Une erreur inattendue s\'est produite',
      code: 'SERVER_ERROR'
    }
  }
}
```

### Composant formulaire d'inscription magasin

```typescript
// src/components/forms/register-store-form.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

import {
  registerStoreSchema,
  type RegisterStoreInput,
  BRAND_LABELS,
  type BrandType
} from '@/lib/validations/auth'
import { registerStore } from '@/lib/actions/auth'

export function RegisterStoreForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<RegisterStoreInput>({
    resolver: zodResolver(registerStoreSchema),
    defaultValues: {
      name: '',
      brand: undefined,
      email: '',
      city: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: RegisterStoreInput) {
    setIsLoading(true)

    try {
      const result = await registerStore({
        name: data.name,
        brand: data.brand,
        email: data.email,
        city: data.city,
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du magasin</FormLabel>
              <FormControl>
                <Input
                  placeholder="Super U Bordeaux Centre"
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
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enseigne</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre enseigne" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(Object.keys(BRAND_LABELS) as BrandType[]).map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {BRAND_LABELS[brand]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  placeholder="contact@magasin.fr"
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
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ville</FormLabel>
              <FormControl>
                <Input
                  placeholder="Bordeaux"
                  autoComplete="address-level2"
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
                  placeholder="05 56 12 34 56"
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
          disabled={isLoading || !form.formState.isValid}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          S'inscrire
        </Button>
      </form>
    </Form>
  )
}
```

### Page d'inscription magasin

```typescript
// src/app/(auth)/register/store/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterStoreForm } from '@/components/forms/register-store-form'

export const metadata: Metadata = {
  title: 'Inscription Magasin - aurelien-project',
  description: 'Créez votre compte magasin pour accéder aux offres promotionnelles',
}

export default function RegisterStorePage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Inscription Magasin
        </h1>
        <p className="text-muted-foreground">
          Créez votre compte pour accéder aux offres
        </p>
      </div>

      <RegisterStoreForm />

      <div className="space-y-2 text-center text-sm">
        <p className="text-muted-foreground">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Connectez-vous
          </Link>
        </p>
        <p className="text-muted-foreground">
          Vous êtes un fournisseur ?{' '}
          <Link href="/register/supplier" className="text-primary hover:underline">
            Inscrivez-vous ici
          </Link>
        </p>
      </div>
    </div>
  )
}
```

### Project Structure Notes

**Fichiers à modifier:**
- `/src/lib/validations/auth.ts` - Ajouter les schémas registerStore
- `/src/lib/actions/auth.ts` - Ajouter la Server Action registerStore
- `/src/app/(auth)/register/store/page.tsx` - Remplacer le placeholder

**Fichiers à créer:**
- `/src/components/forms/register-store-form.tsx` - Composant formulaire magasin

**Composants shadcn/ui requis:**
- Form (déjà installé)
- Input (déjà installé)
- Button (déjà installé)
- Label (déjà installé)
- Select (à installer si pas présent)
- Sonner (déjà installé)

**Installation des composants manquants:**
```bash
npx shadcn@latest add select
```

### Architecture Compliance

**Références Architecture:**
- [Source: architecture.md#API & Communication Patterns - Server Actions]
- [Source: architecture.md#Implementation Patterns - ActionResult<T>]
- [Source: architecture.md#Implementation Patterns - Validation Zod client ET serveur]
- [Source: architecture.md#Data Architecture - Store model]
- [Source: project-context.md#API Response Pattern - MANDATORY]
- [Source: project-context.md#TypeScript Rules - NO ANY]

**Patterns OBLIGATOIRES:**
- `ActionResult<T>` pour la Server Action
- Double validation Zod (client + serveur)
- Messages d'erreur en français
- Touch targets minimum 44x44px (h-11 pour les boutons)
- Server Components par défaut, `'use client'` uniquement pour le formulaire
- Utiliser `createAdminClient()` pour bypasser RLS lors de l'insertion

### Previous Story Intelligence

**Learnings from Story 1.4:**
- Pattern établi: `registerSupplierSchema` + `registerSupplierServerSchema` (avec/sans confirmPassword)
- Pattern établi: `createAdminClient()` pour bypasser RLS lors de l'insertion du profil
- Pattern établi: Rollback Auth si création profil échoue
- Pattern établi: Toggle password visibility avec Eye/EyeOff icons
- Pattern établi: Redirection vers `/login?registered=true` après succès
- Toast Sonner déjà configuré dans providers.tsx
- ThemeProvider ajouté pour éviter erreur d'hydratation

**Files Created in Story 1.4 (réutiliser les patterns):**
- `/src/lib/validations/auth.ts` - Étendre avec Store schemas
- `/src/lib/actions/auth.ts` - Étendre avec registerStore
- `/src/types/api.ts` - ActionResult déjà défini
- `/src/lib/supabase/server.ts` - createClient() et createAdminClient() disponibles
- `/src/components/forms/register-supplier-form.tsx` - Pattern à suivre

**Key Pattern: Supabase Auth + Profile Creation**
L'inscription doit créer:
1. Un utilisateur dans Supabase Auth (`auth.users`) avec `user_type: 'store'`
2. Un profil dans la table `stores` avec le **même UUID**

Le RLS policy `auth.uid() = id` garantit que l'utilisateur ne peut créer/lire que son propre profil.

### Database Schema Reference

```prisma
// Extrait de prisma/schema.prisma

enum Brand {
  LECLERC
  INTERMARCHE
  SUPER_U
  SYSTEME_U

  @@map("brand")
}

model Store {
  id        String   @id @default(uuid()) @db.Uuid
  email     String   @unique
  name      String
  brand     Brand
  city      String
  phone     String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("stores")
}
```

### Testing Requirements

**Tests unitaires à ajouter dans auth.test.ts:**
```typescript
describe('registerStoreSchema', () => {
  it('accepts valid input', () => {
    const result = registerStoreSchema.safeParse({
      name: 'Super U Bordeaux',
      brand: 'SUPER_U',
      email: 'contact@superubordeaux.fr',
      city: 'Bordeaux',
      phone: '0556123456',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid brand', () => {
    const result = registerStoreSchema.safeParse({
      name: 'Mon Magasin',
      brand: 'INVALID_BRAND',
      email: 'test@example.com',
      city: 'Paris',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing city', () => {
    const result = registerStoreSchema.safeParse({
      name: 'Mon Magasin',
      brand: 'LECLERC',
      email: 'test@example.com',
      city: '',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid brand values', () => {
    const brands = ['LECLERC', 'INTERMARCHE', 'SUPER_U', 'SYSTEME_U']
    brands.forEach(brand => {
      const result = registerStoreSchema.safeParse({
        name: 'Mon Magasin',
        brand,
        email: 'test@example.com',
        city: 'Paris',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result.success).toBe(true)
    })
  })
})
```

**Tests manuels:**
- [ ] Inscription avec données valides → succès, redirection, toast
- [ ] Inscription avec email existant → erreur "email déjà utilisé"
- [ ] Inscription avec email invalide → erreur inline
- [ ] Inscription avec mot de passe court → erreur inline
- [ ] Inscription avec mots de passe différents → erreur inline
- [ ] Inscription sans sélectionner d'enseigne → erreur inline
- [ ] Inscription avec ville vide → erreur inline
- [ ] Vérifier l'email reçu dans Supabase Dashboard
- [ ] Vérifier le profil créé dans la table stores avec la bonne enseigne

### Security Considerations

- **Mot de passe**: Minimum 8 caractères (Supabase gère le hashing)
- **Double validation**: Zod côté client ET serveur
- **Rate limiting**: Géré par Supabase Auth (anti-bruteforce)
- **HTTPS**: Garanti par Vercel en production
- **RGPD**: Consentement implicite à l'inscription (CGU à ajouter post-MVP)
- **Admin client**: Utilisé uniquement pour l'insertion initiale du profil, pas exposé au client

### UX Considerations

- **Touch targets**: Boutons h-11 (44px) pour mobile
- **Loading state**: Spinner dans le bouton pendant la soumission
- **Toggle password**: Améliore l'UX sans compromettre la sécurité
- **Error messages**: Inline en français, clairs et actionnables
- **Toast**: Position top-center pour visibilité mobile
- **Select dropdown**: Native sur mobile pour meilleure UX
- **Disabled submit**: Bouton désactivé tant que le formulaire est invalide

### Differences with Story 1.4 (Supplier)

| Aspect | Supplier (1.4) | Store (1.5) |
|--------|----------------|-------------|
| Table | `suppliers` | `stores` |
| Name field | `companyName` | `name` |
| Unique field | - | `brand` (enum dropdown) |
| Unique field | - | `city` (required) |
| user_type | `'supplier'` | `'store'` |
| Post-login redirect | `/dashboard` | `/offers` |

## References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5: Inscription Magasin]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture - Store model]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/prd.md#FR2 - Création compte magasin]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Form Patterns]
- [Source: _bmad-output/project-context.md#API Response Pattern]
- [Source: _bmad-output/project-context.md#TypeScript Rules]
- [Source: _bmad-output/implementation-artifacts/1-4-inscription-fournisseur.md]
- [Source: prisma/schema.prisma#Store model and Brand enum]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
