# Story 2.2: Création d'Offre (Champs Obligatoires)

Status: done

## Story

En tant que **fournisseur**,
Je veux **créer une offre promotionnelle avec les informations essentielles**,
Afin de **la rendre visible aux magasins**.

## Acceptance Criteria

### AC1: Formulaire en étapes avec indicateur de progression
**Given** je suis sur la page `/offers/new`
**When** la page se charge
**Then** un formulaire en étapes s'affiche avec un StepIndicator
**And** l'étape 1 "Produit & Prix" est active

### AC2: Étape 1 — Produit & Prix (champs obligatoires)
**Given** je suis à l'étape 1
**When** je remplis les champs obligatoires
**Then** je peux saisir: nom du produit, prix promo (décimal), remise en % (entier)
**And** la validation Zod vérifie que le prix > 0 et la remise entre 1 et 99
**And** les erreurs s'affichent inline sous chaque champ

### AC3: Étape 2 — Dates de validité
**Given** l'étape 1 est valide
**When** je clique sur "Suivant"
**Then** l'étape 2 "Dates de validité" s'affiche
**And** je peux sélectionner date de début et date de fin
**And** la date de fin doit être >= date de début
**And** la date de début doit être >= aujourd'hui

### AC4: Publication de l'offre
**Given** les étapes 1 et 2 sont complètes
**When** je clique sur "Publier"
**Then** une Server Action `createOffer` est appelée
**And** elle retourne `ActionResult<{ offerId: string }>`
**And** l'offre est créée avec status ACTIVE

### AC5: Feedback de succès
**Given** la création réussit
**When** l'offre est enregistrée
**Then** un toast de succès s'affiche "Offre publiée !"
**And** je suis redirigé vers `/dashboard`
**And** la nouvelle offre apparaîtra dans la liste (story 2.4)

### AC6: Gestion d'erreur serveur
**Given** une erreur de validation serveur survient
**When** la création échoue
**Then** un toast d'erreur s'affiche avec le message
**And** je reste sur le formulaire avec mes données préservées

### AC7: Sauvegarde brouillon automatique
**Given** je quitte le formulaire avant de publier
**When** j'ai saisi des données
**Then** un brouillon est sauvegardé automatiquement (localStorage)
**And** au retour sur `/offers/new`, mes données sont restaurées

## Tasks / Subtasks

- [x] **Task 1: Créer les schémas de validation Zod** (AC: 2, 3)
  - [x] 1.1 Créer `/src/lib/validations/offers.ts`
  - [x] 1.2 Schéma étape 1: `name` (min 3, max 255), `promoPrice` (number > 0), `discountPercent` (int 1-99)
  - [x] 1.3 Schéma étape 2: `startDate` (>= aujourd'hui), `endDate` (>= startDate), `category` (enum OfferCategory)
  - [x] 1.4 Schéma complet: merge des deux étapes avec refinement cross-field (endDate >= startDate)
  - [x] 1.5 Export des types `CreateOfferStep1Input`, `CreateOfferStep2Input`, `CreateOfferInput`

- [x] **Task 2: Créer la Server Action `createOffer`** (AC: 4, 6)
  - [x] 2.1 Créer `/src/lib/actions/offers.ts` avec `'use server'`
  - [x] 2.2 Valider input avec Zod côté serveur (double validation)
  - [x] 2.3 Récupérer `user.id` via `createClient()` → `supabase.auth.getUser()`
  - [x] 2.4 Vérifier que l'utilisateur est un fournisseur via `prisma.supplier.findUnique`
  - [x] 2.5 Créer l'offre avec `prisma.offer.create` — `supplierId = user.id`, `status = ACTIVE`
  - [x] 2.6 Retourner `ActionResult<{ offerId: string }>` (succès ou erreur typée)

- [x] **Task 3: Créer le composant StepIndicator** (AC: 1)
  - [x] 3.1 Créer `/src/components/custom/step-indicator.tsx`
  - [x] 3.2 Props: `currentStep: number`, `totalSteps: number`, `labels: string[]`
  - [x] 3.3 3 états visuels: completed (cercle plein primary), current (cercle ring), upcoming (cercle outline)
  - [x] 3.4 Barre de progression entre les cercles
  - [x] 3.5 Accessibilité: `role="progressbar"`, `aria-valuenow`, `aria-valuemax`, `aria-label`

- [x] **Task 4: Créer le formulaire CreateOfferForm** (AC: 1-7)
  - [x] 4.1 Créer `/src/components/forms/create-offer-form.tsx` avec `'use client'`
  - [x] 4.2 Utiliser `useForm` avec `zodResolver` — même pattern que `RegisterSupplierForm`
  - [x] 4.3 Étape 1: FormField pour `name` (Input), `promoPrice` (Input type number), `discountPercent` (Input type number)
  - [x] 4.4 Étape 2: FormField pour `startDate` (Input type date), `endDate` (Input type date), `category` (Select avec les 6 options)
  - [x] 4.5 Navigation entre étapes: boutons "Suivant" / "Retour"
  - [x] 4.6 Validation par étape: ne permettre "Suivant" que si l'étape courante est valide
  - [x] 4.7 Bouton "Publier" sur la dernière étape — appelle `createOffer()`
  - [x] 4.8 État loading: `Loader2` spinner dans le bouton, bouton disabled
  - [x] 4.9 Gestion succès: `toast.success("Offre publiée !")` + `router.push('/dashboard')`
  - [x] 4.10 Gestion erreur: `toast.error(result.error)`
  - [x] 4.11 Brouillon localStorage: sauvegarder `form.getValues()` sur chaque changement, restaurer au mount

- [x] **Task 5: Mettre à jour la page `/offers/new`** (AC: 1)
  - [x] 5.1 Remplacer le placeholder dans `/src/app/(supplier)/offers/new/page.tsx`
  - [x] 5.2 Ajouter metadata SEO: `title: "Nouvelle offre - aurelien-project"`
  - [x] 5.3 Intégrer `PageHeader` avec `title="Nouvelle offre"` et `showBack={true}`
  - [x] 5.4 Rendre le `CreateOfferForm` dans le contenu

- [x] **Task 6: Tests** (AC: 1-7)
  - [x] 6.1 Créer `/src/lib/validations/offers.test.ts` — tests des schémas Zod
  - [x] 6.2 Créer `/src/lib/actions/offers.test.ts` — tests de la server action
  - [x] 6.3 Créer `/src/components/custom/step-indicator.test.tsx` — tests du composant
  - [x] 6.4 Créer `/src/components/forms/create-offer-form.test.tsx` — tests du formulaire
  - [x] 6.5 Tous les tests passent
  - [x] 6.6 `npm run build` passe
  - [x] 6.7 `npm run lint` passe

## Dev Notes

### Schéma Zod — Validation des offres

```typescript
// src/lib/validations/offers.ts
import { z } from 'zod'

const OFFER_NAME_MIN = 3
const OFFER_NAME_MAX = 255
const DISCOUNT_MIN = 1
const DISCOUNT_MAX = 99

// Catégories disponibles (mapper sur l'enum Prisma OfferCategory)
export const OFFER_CATEGORIES = [
  'EPICERIE',
  'FRAIS',
  'DPH',
  'SURGELES',
  'BOISSONS',
  'AUTRES',
] as const

export const OFFER_CATEGORY_LABELS: Record<string, string> = {
  EPICERIE: 'Épicerie',
  FRAIS: 'Frais',
  DPH: 'DPH',
  SURGELES: 'Surgelés',
  BOISSONS: 'Boissons',
  AUTRES: 'Autres',
}

// Étape 1: Produit & Prix
export const createOfferStep1Schema = z.object({
  name: z
    .string()
    .min(OFFER_NAME_MIN, `Le nom doit contenir au moins ${OFFER_NAME_MIN} caractères`)
    .max(OFFER_NAME_MAX, `Le nom ne peut pas dépasser ${OFFER_NAME_MAX} caractères`),
  promoPrice: z
    .number({ invalid_type_error: 'Le prix doit être un nombre' })
    .positive('Le prix doit être supérieur à 0')
    .multipleOf(0.01, 'Le prix doit avoir maximum 2 décimales'),
  discountPercent: z
    .number({ invalid_type_error: 'La remise doit être un nombre' })
    .int('La remise doit être un nombre entier')
    .min(DISCOUNT_MIN, `La remise doit être d'au moins ${DISCOUNT_MIN}%`)
    .max(DISCOUNT_MAX, `La remise ne peut pas dépasser ${DISCOUNT_MAX}%`),
})

// Étape 2: Dates & Catégorie
export const createOfferStep2Schema = z.object({
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
  category: z.enum(OFFER_CATEGORIES, {
    errorMap: () => ({ message: 'Veuillez sélectionner une catégorie' }),
  }),
})

// Schéma complet pour la Server Action (merge + refinement)
export const createOfferSchema = createOfferStep1Schema
  .merge(createOfferStep2Schema)
  .refine(
    (data) => {
      const start = new Date(data.startDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return start >= today
    },
    { message: 'La date de début doit être aujourd\'hui ou dans le futur', path: ['startDate'] }
  )
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    { message: 'La date de fin doit être après la date de début', path: ['endDate'] }
  )

export type CreateOfferStep1Input = z.infer<typeof createOfferStep1Schema>
export type CreateOfferStep2Input = z.infer<typeof createOfferStep2Schema>
export type CreateOfferInput = z.infer<typeof createOfferSchema>
```

### Server Action — createOffer

```typescript
// src/lib/actions/offers.ts
'use server'

import { createOfferSchema, type CreateOfferInput } from '@/lib/validations/offers'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import type { ActionResult } from '@/types/api'

export async function createOffer(
  input: CreateOfferInput
): Promise<ActionResult<{ offerId: string }>> {
  // 1. Server-side validation (OBLIGATOIRE même si validé côté client)
  const validated = createOfferSchema.safeParse(input)
  if (!validated.success) {
    const issues = JSON.parse(validated.error.message)
    return {
      success: false,
      error: issues[0]?.message || 'Données invalides',
      code: 'VALIDATION_ERROR',
    }
  }

  try {
    // 2. Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Non authentifié', code: 'UNAUTHORIZED' }
    }

    // 3. Vérifier rôle fournisseur
    const supplier = await prisma.supplier.findUnique({
      where: { id: user.id },
    })

    if (!supplier) {
      return { success: false, error: 'Accès fournisseur requis', code: 'FORBIDDEN' }
    }

    // 4. Créer l'offre — supplierId TOUJOURS depuis auth, JAMAIS depuis input
    const { name, promoPrice, discountPercent, startDate, endDate, category } = validated.data

    const offer = await prisma.offer.create({
      data: {
        supplierId: user.id,
        name,
        promoPrice,
        discountPercent,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        category,
        status: 'ACTIVE',
      },
    })

    return { success: true, data: { offerId: offer.id } }
  } catch (error) {
    console.error('createOffer error:', error)
    return { success: false, error: 'Erreur lors de la création de l\'offre', code: 'SERVER_ERROR' }
  }
}
```

### Composant StepIndicator

```typescript
// src/components/custom/step-indicator.tsx
'use client'

import { cn } from '@/lib/utils/cn'
import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  labels: string[]
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Étape ${currentStep} sur ${totalSteps} : ${labels[currentStep - 1]}`}
      className="flex items-center justify-center gap-2 py-4"
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1
        const isCompleted = step < currentStep
        const isCurrent = step === currentStep

        return (
          <div key={step} className="flex items-center">
            {/* Circle */}
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                isCompleted && 'bg-primary text-primary-foreground',
                isCurrent && 'border-2 border-primary text-primary',
                !isCompleted && !isCurrent && 'border-2 border-muted text-muted-foreground'
              )}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : step}
            </div>

            {/* Connector line */}
            {step < totalSteps && (
              <div
                className={cn(
                  'mx-2 h-0.5 w-8',
                  step < currentStep ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
```

### Formulaire CreateOfferForm — Structure

```typescript
// src/components/forms/create-offer-form.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react'

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
import { StepIndicator } from '@/components/custom/step-indicator'
import {
  createOfferSchema,
  createOfferStep1Schema,
  createOfferStep2Schema,
  OFFER_CATEGORIES,
  OFFER_CATEGORY_LABELS,
  type CreateOfferInput,
} from '@/lib/validations/offers'
import { createOffer } from '@/lib/actions/offers'

const DRAFT_KEY = 'create-offer-draft'
const STEP_LABELS = ['Produit & Prix', 'Dates & Catégorie']

export function CreateOfferForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<CreateOfferInput>({
    resolver: zodResolver(createOfferSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      promoPrice: undefined as unknown as number,
      discountPercent: undefined as unknown as number,
      startDate: '',
      endDate: '',
      category: undefined as unknown as typeof OFFER_CATEGORIES[number],
    },
  })

  // Restaurer brouillon localStorage au mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        form.reset(parsed)
      } catch { /* ignore invalid draft */ }
    }
  }, [form])

  // Sauvegarder brouillon à chaque changement
  useEffect(() => {
    const subscription = form.watch((values) => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(values))
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Validation par étape avant de passer à la suivante
  async function handleNext() {
    const values = form.getValues()
    const stepSchema = currentStep === 1 ? createOfferStep1Schema : createOfferStep2Schema
    const stepFields = currentStep === 1
      ? { name: values.name, promoPrice: values.promoPrice, discountPercent: values.discountPercent }
      : { startDate: values.startDate, endDate: values.endDate, category: values.category }

    const result = stepSchema.safeParse(stepFields)
    if (!result.success) {
      // Trigger validation errors on current step fields
      const fieldNames = Object.keys(stepFields) as (keyof CreateOfferInput)[]
      for (const field of fieldNames) {
        await form.trigger(field)
      }
      return
    }
    setCurrentStep((prev) => prev + 1)
  }

  async function onSubmit(data: CreateOfferInput) {
    setIsLoading(true)
    try {
      const result = await createOffer(data)
      if (result.success) {
        localStorage.removeItem(DRAFT_KEY)
        toast.success('Offre publiée !')
        router.push('/dashboard')
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <StepIndicator
          currentStep={currentStep}
          totalSteps={2}
          labels={STEP_LABELS}
        />

        {/* Étape 1: Produit & Prix */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du produit</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Nutella 1kg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="promoPrice" render={({ field }) => (
              <FormItem>
                <FormLabel>Prix promo (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="12.99"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="discountPercent" render={({ field }) => (
              <FormItem>
                <FormLabel>Remise (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="99"
                    placeholder="25"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        )}

        {/* Étape 2: Dates & Catégorie */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <FormField control={form.control} name="startDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Date de début</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="endDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Date de fin</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {OFFER_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {OFFER_CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11"
              onClick={() => setCurrentStep((prev) => prev - 1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          )}

          {currentStep < 2 ? (
            <Button
              type="button"
              className="flex-1 h-11"
              onClick={handleNext}
            >
              Suivant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="flex-1 h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publication...
                </>
              ) : (
                'Publier l\'offre'
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
```

### Page `/offers/new`

```typescript
// src/app/(supplier)/offers/new/page.tsx
import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { CreateOfferForm } from '@/components/forms/create-offer-form'

export const metadata: Metadata = {
  title: 'Nouvelle offre - aurelien-project',
  description: 'Créer une nouvelle offre promotionnelle',
}

export default function NewOfferPage() {
  return (
    <>
      <PageHeader title="Nouvelle offre" showBack />
      <div className="flex-1 overflow-auto p-4">
        <CreateOfferForm />
      </div>
    </>
  )
}
```

### Project Structure Notes

**Fichiers à créer:**
- `/src/lib/validations/offers.ts` — Schémas Zod pour la création d'offre
- `/src/lib/validations/offers.test.ts` — Tests validation
- `/src/lib/actions/offers.ts` — Server Action `createOffer`
- `/src/lib/actions/offers.test.ts` — Tests server action
- `/src/components/custom/step-indicator.tsx` — Composant indicateur d'étape
- `/src/components/custom/step-indicator.test.tsx` — Tests StepIndicator
- `/src/components/forms/create-offer-form.tsx` — Formulaire de création
- `/src/components/forms/create-offer-form.test.tsx` — Tests formulaire

**Fichiers à modifier:**
- `/src/app/(supplier)/offers/new/page.tsx` — Remplacer placeholder par le vrai formulaire

**Fichiers existants à réutiliser (NE PAS recréer):**
- `/src/lib/supabase/server.ts` → `createClient()`
- `/src/lib/prisma/client.ts` → `prisma`
- `/src/types/api.ts` → `ActionResult`, `ErrorCode`
- `/src/lib/utils/cn.ts` → `cn()`
- `/src/components/ui/form.tsx` → Form, FormField, FormItem, FormLabel, FormControl, FormMessage
- `/src/components/ui/input.tsx` → Input
- `/src/components/ui/select.tsx` → Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- `/src/components/ui/button.tsx` → Button
- `/src/components/layout/page-header.tsx` → PageHeader

### Architecture Compliance

**Patterns OBLIGATOIRES à suivre:**
- `ActionResult<T>` pour toutes les Server Actions [Source: architecture.md#Format Patterns]
- Validation Zod côté client ET serveur [Source: architecture.md#Process Patterns]
- `supplierId` TOUJOURS depuis `auth.uid()`, JAMAIS depuis le formulaire [Source: architecture.md#Authentication & Security]
- Fichiers en `kebab-case` [Source: architecture.md#Naming Patterns]
- Composants en `PascalCase` [Source: architecture.md#Naming Patterns]
- Server Actions en `camelCase` verb+noun [Source: architecture.md#Naming Patterns]
- Tests co-localisés `*.test.ts` [Source: architecture.md#Structure Patterns]
- `"use client"` seulement si nécessaire (formulaire = oui) [Source: project-context.md#Next.js Rules]
- `"use server"` pour les Server Actions [Source: architecture.md#API Patterns]

**Conventions de nommage Prisma:**
- Tables en `snake_case` → `offers`
- Champs Prisma en `camelCase` → `promoPrice`, `discountPercent`
- Mapper avec `@map()` → déjà fait dans schema.prisma (Story 2.1)

### Previous Story Intelligence

**Story 2.1 — Learnings critiques:**
- Migration Prisma via `db push` + `migrate resolve` (shadow DB incompatible avec `auth.uid()` Supabase)
- Schéma Offer déjà en place avec 17 champs, 2 index, relation bidirectionnelle Supplier
- 5 policies RLS appliquées sur `offers` (4 supplier + 1 store)
- Layout supplier avec auth protection fonctionne
- `PageHeader` accepte `showBack` prop pour le bouton retour
- Boutons `h-11` (44px) pour les touch targets mobile
- FAB existant dans le dashboard pointe déjà vers `/offers/new`
- SupplierBottomNavigation opérationnelle avec 3 items

**Issue H3 de la code review (Story 2.1) — NON corrigée:**
- RLS policies potentiellement contournées par Prisma (DATABASE_URL = service role)
- Le contrôle d'accès applicatif (vérification `supplier.id === user.id`) est la vraie barrière
- **IMPORTANT:** Dans la Server Action `createOffer`, TOUJOURS vérifier que le user est bien un fournisseur ET utiliser `user.id` comme `supplierId`

**Task 4.8 reportée (Story 2.1):**
- Tests RLS manuels reportés — dès que la création d'offres est fonctionnelle, tester l'isolation fournisseur/magasin sur Supabase réel

### Git Intelligence

**Commits récents:**
```
2e75f5d feat: Réinitialisation mot de passe avec forgot/reset pages (Story 1.8)
51b5c49 feat: Déconnexion utilisateur avec page profil unifiée (Story 1.7)
d5fe1a5 feat: Connexion utilisateur avec redirection selon rôle (Story 1.6)
```

**Pattern de commit à suivre:**
```
feat: Création offre champs obligatoires avec formulaire en étapes (Story 2.2)
```

### Library & Framework Requirements

**Dépendances déjà installées (NE PAS réinstaller):**
- `react-hook-form@^7.71.1` — Gestion d'état du formulaire
- `@hookform/resolvers@^5.2.2` — Intégration Zod
- `zod@^4.3.6` — Validation
- `sonner@^2.0.7` — Toast (`import { toast } from 'sonner'`)
- `lucide-react@^0.563.0` — Icônes
- `@prisma/client@^6.19.2` — ORM
- `next@16.1.6` — Framework

**Composants shadcn/ui disponibles:**
Form, Input, Select, Button, Label, Card, Badge, Sheet, Tabs, Dialog, Skeleton, Alert, Avatar, Textarea

### Testing Requirements

**Validation tests (`offers.test.ts`):**
- Schéma step 1: nom trop court, nom valide, prix négatif, prix valide, remise hors bornes
- Schéma step 2: date passée rejetée, dates valides, catégorie invalide
- Schéma complet: endDate < startDate rejeté, données valides acceptées

**Server action tests (`offers.test.ts`):**
- Retourne VALIDATION_ERROR pour données invalides
- Retourne UNAUTHORIZED si pas de session
- Retourne FORBIDDEN si l'utilisateur n'est pas un fournisseur
- Retourne success avec offerId pour des données valides
- Ne permet jamais de spécifier supplierId depuis l'input

**Composant tests:**
- StepIndicator: rendu, état courant, états completed/upcoming, accessibilité
- CreateOfferForm: rendu étape 1, navigation étape 1→2, navigation 2→1, validation inline, soumission, toast succès, toast erreur, état loading

**Pattern de test — référence `register-supplier-form.test.tsx`:**
- `@testing-library/react` + `vitest`
- Mock des server actions
- Mock du router (`useRouter`)
- `screen.getByLabelText()` / `screen.getByRole()`
- `userEvent.type()` / `userEvent.click()`
- `waitFor()` pour les assertions async

### UX Considerations

**Formulaire en étapes (UX Spec):**
- StepIndicator avec progression visuelle (`●───○`) [Source: ux-design-specification.md#StepIndicator]
- 2 étapes pour les champs obligatoires, étape 3 optionnelle sera ajoutée en Story 2.3
- Navigation Retour/Suivant avec validation par étape

**Touch targets:**
- Boutons `h-11` (44px minimum) [Source: ux-design-specification.md#Touch targets]
- Inputs avec padding suffisant

**Feedback patterns:**
- Toast vert pour succès, durée 3 secondes [Source: ux-design-specification.md#Success Feedback]
- Toast rouge pour erreur [Source: ux-design-specification.md#Error Feedback]
- Spinner dans le bouton pendant le loading [Source: ux-design-specification.md#Loading Feedback]
- Erreurs inline sous les champs [Source: ux-design-specification.md#Form Patterns]

**Auto-save brouillon:**
- Sauvegarder dans localStorage à chaque changement de valeur
- Restaurer au mount du composant
- Supprimer après publication réussie
- Clé: `create-offer-draft`

### Security Considerations

- **CRITIQUE:** `supplierId = user.id` dans la server action, JAMAIS depuis le formulaire
- **Double validation:** Zod côté client (UX) + côté serveur (sécurité)
- **Vérification de rôle:** Vérifier que le user authentifié est un fournisseur avant de créer
- **RLS:** Les policies existent déjà (Story 2.1) — INSERT vérifie `auth.uid()::text = supplier_id::text`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2: Création d'Offre (Champs Obligatoires)]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Form Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#StepIndicator]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md#FR6 - Création offre champs obligatoires]
- [Source: _bmad-output/project-context.md#API Response Pattern]
- [Source: _bmad-output/project-context.md#Testing Rules]
- [Source: _bmad-output/implementation-artifacts/2-1-schema-offres-et-page-liste-vide.md]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Zod 4 API migration: `invalid_type_error` → `error`, `errorMap` → `error` (string)
- Radix Select jsdom polyfill: ajouté `hasPointerCapture`, `scrollIntoView`, `ResizeObserver` dans `vitest.setup.ts`

### Completion Notes List

- Task 1: Schémas Zod créés avec validation step1 (produit/prix), step2 (dates/catégorie), et schéma complet avec refinements cross-field — 27 tests
- Task 2: Server Action `createOffer` avec double validation Zod, auth check, vérification rôle fournisseur, `supplierId` toujours depuis auth — 9 tests
- Task 3: Composant `StepIndicator` avec 3 états visuels, barre de progression, accessibilité complète (progressbar/aria) — 13 tests
- Task 4: Formulaire `CreateOfferForm` en 2 étapes avec RHF + Zod, navigation, validation par étape, brouillon localStorage, toast feedback — 14 tests
- Task 5: Page `/offers/new` mise à jour — placeholder remplacé par le vrai formulaire
- Task 6: Suite complète 270 tests GREEN, build OK, lint OK

### Change Log

- 2026-02-05: Implémentation complète Story 2.2 — formulaire création offre en 2 étapes avec Server Action, validation Zod, StepIndicator accessible, brouillon localStorage
- 2026-02-05: Code review (AI) — 8 issues trouvées (2H, 4M, 2L). 6 issues fixées: labels StepIndicator visibles, console.error restauré, Select controlled warning, AC4 type corrigé, tests step 2 validation ajoutés, revalidatePath ajouté. 274 tests GREEN, build OK.

### File List

- `src/lib/validations/offers.ts` — Schémas Zod pour création d'offre (step1, step2, complet)
- `src/lib/validations/offers.test.ts` — Tests validation (27 tests)
- `src/lib/actions/offers.ts` — Server Action createOffer avec auth/authorization
- `src/lib/actions/offers.test.ts` — Tests server action (9 tests)
- `src/components/custom/step-indicator.tsx` — Composant indicateur d'étape accessible
- `src/components/custom/step-indicator.test.tsx` — Tests StepIndicator (13 tests)
- `src/components/forms/create-offer-form.tsx` — Formulaire création offre en 2 étapes
- `src/components/forms/create-offer-form.test.tsx` — Tests formulaire (14 tests)
- `src/app/(supplier)/offers/new/page.tsx` — Page mise à jour avec formulaire
- `vitest.setup.ts` — Polyfills Radix UI pour jsdom
