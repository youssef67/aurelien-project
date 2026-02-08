# Story 2.5: Modification d'Offre

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

En tant que **fournisseur**,
Je veux **modifier une offre existante**,
Afin de **corriger ou mettre à jour ses informations**.

## Acceptance Criteria

### AC1: Page de détail offre avec bouton Modifier
**Given** je suis sur le détail d'une de mes offres `/offers/[id]`
**When** la page se charge
**Then** toutes les informations de l'offre sont affichées (nom, prix, remise, dates, catégorie, photo, détails optionnels)
**And** un bouton "Modifier" est visible dans le header
**And** si l'offre ne m'appartient pas, je suis redirigé vers `/dashboard`

### AC2: Formulaire d'édition pré-rempli
**Given** je clique sur "Modifier"
**When** la page d'édition se charge `/offers/[id]/edit`
**Then** le formulaire est pré-rempli avec toutes les données existantes
**And** la même structure en 3 étapes que la création est utilisée (Produit & Prix → Dates & Catégorie → Détails)
**And** je peux naviguer entre les étapes
**And** la photo existante est affichée dans le PhotoUpload

### AC3: Server Action updateOffer avec vérification propriétaire
**Given** je modifie des champs et je sauvegarde
**When** la Server Action `updateOffer` est appelée
**Then** elle vérifie que l'offre m'appartient (`supplierId === user.id`)
**And** elle valide les données avec Zod (updateOfferSchema)
**And** elle retourne `ActionResult<Offer>`

### AC4: Succès de la modification
**Given** la modification réussit
**When** l'offre est mise à jour
**Then** un toast de succès s'affiche "Offre modifiée"
**And** je suis redirigé vers `/offers/[id]` (détail de l'offre)
**And** les nouvelles données sont affichées

### AC5: Refus si offre ne m'appartient pas
**Given** je tente de modifier une offre qui ne m'appartient pas
**When** la requête est envoyée
**Then** une erreur FORBIDDEN est retournée
**And** je suis redirigé vers `/dashboard`

### AC6: Remplacement de photo
**Given** je modifie la photo sur la page d'édition
**When** j'uploade une nouvelle image
**Then** l'ancienne image est supprimée de Supabase Storage (via `deleteOfferPhoto`)
**And** la nouvelle image est uploadée et enregistrée
**And** si je supprime la photo sans en uploader une nouvelle, `photoUrl` est mis à `null`

### AC7: Contrainte de dates en édition
**Given** l'offre a une date de début déjà passée (offre en cours)
**When** j'édite l'offre
**Then** la date de début N'EST PAS modifiable (champ disabled)
**And** la date de fin doit rester >= date de début
**And** la date de fin peut être étendue dans le futur

**Given** l'offre a une date de début future
**When** j'édite l'offre
**Then** la date de début reste modifiable mais doit être >= aujourd'hui
**And** la date de fin doit être >= date de début

## Tasks / Subtasks

- [x] **Task 1: Créer la page de détail offre `/offers/[id]/page.tsx`** (AC: 1)
  - [x] 1.1 Créer `/src/app/(supplier)/offers/[id]/page.tsx` (Server Component)
  - [x] 1.2 Fetch l'offre par `id` via Prisma avec vérification `supplierId === user.id` ET `deletedAt === null`
  - [x] 1.3 Si offre introuvable ou pas la mienne → `redirect('/dashboard')`
  - [x] 1.4 Afficher toutes les infos: photo (ou placeholder), nom, prix promo, remise, dates, catégorie, sous-catégorie, marge, volume, conditions, animation
  - [x] 1.5 Badge de statut via `getOfferDisplayStatus()` existant
  - [x] 1.6 Bouton "Modifier" dans le header → lien vers `/offers/[id]/edit`
  - [x] 1.7 Bouton "Retour" → lien vers `/dashboard`
  - [x] 1.8 Créer `loading.tsx` dans le même dossier

- [x] **Task 2: Créer le schéma de validation `updateOfferSchema`** (AC: 3, 7)
  - [x] 2.1 Dans `/src/lib/validations/offers.ts`, ajouter `updateOfferSchema`
  - [x] 2.2 Réutiliser `createOfferStep1Schema`, `createOfferStep2Schema`, `createOfferStep3Schema`
  - [x] 2.3 Ajouter un champ `id: z.string().uuid()` pour identifier l'offre
  - [x] 2.4 Refinement dates: endDate >= startDate (GARDER), startDate >= today UNIQUEMENT si startDate est modifiée et que l'offre n'a pas encore commencé
  - [x] 2.5 Exporter `UpdateOfferInput` type

- [x] **Task 3: Créer la Server Action `updateOffer`** (AC: 3, 4, 5, 6)
  - [x] 3.1 Dans `/src/lib/actions/offers.ts`, ajouter `updateOffer`
  - [x] 3.2 Signature: `updateOffer(input: UpdateOfferInput): Promise<ActionResult<{ offerId: string }>>`
  - [x] 3.3 Validation Zod côté serveur avec `updateOfferSchema`
  - [x] 3.4 Auth check (Supabase `getUser()`)
  - [x] 3.5 Vérification fournisseur (lookup `prisma.supplier.findUnique`)
  - [x] 3.6 Fetch offre existante et vérifier `offer.supplierId === user.id` ET `offer.deletedAt === null`
  - [x] 3.7 Si ancienne photo différente de nouvelle (et ancienne existe): `deleteOfferPhoto(oldPhotoUrl)` — appeler côté serveur via Supabase admin client OU gérer côté client avant appel
  - [x] 3.8 `prisma.offer.update()` avec les données validées
  - [x] 3.9 `revalidatePath('/dashboard')`, `revalidatePath('/offers')`, `revalidatePath(\`/offers/${id}\`)`
  - [x] 3.10 Retourner `{ success: true, data: { offerId: offer.id } }`

- [x] **Task 4: Créer le composant `EditOfferForm`** (AC: 2, 6, 7)
  - [x] 4.1 Créer `/src/components/forms/edit-offer-form.tsx` (`"use client"`)
  - [x] 4.2 Props: `{ offer: SerializedOffer, supplierId: string }`
  - [x] 4.3 Même structure 3 étapes que `CreateOfferForm` (réutiliser StepIndicator, mêmes champs)
  - [x] 4.4 `useForm` avec `defaultValues` pré-remplis depuis `offer` prop
  - [x] 4.5 PAS de brouillon localStorage (pas nécessaire pour l'édition)
  - [x] 4.6 Date de début: `disabled` si `startDate < today` (offre déjà commencée)
  - [x] 4.7 Resolver: `zodResolver(updateOfferSchema)` avec l'id injecté
  - [x] 4.8 Boutons: "Retour" / "Suivant" / "Enregistrer les modifications" (au lieu de "Publier")
  - [x] 4.9 onSubmit: appeler `updateOffer(data)`, toast succès, `router.push(\`/offers/${offer.id}\`)`

- [x] **Task 5: Créer la page d'édition `/offers/[id]/edit/page.tsx`** (AC: 2, 5)
  - [x] 5.1 Créer `/src/app/(supplier)/offers/[id]/edit/page.tsx` (Server Component)
  - [x] 5.2 Fetch l'offre par id, vérifier propriété (`supplierId === user.id`), sinon `redirect('/dashboard')`
  - [x] 5.3 Sérialiser l'offre avec `serializeOffer()` existant
  - [x] 5.4 Passer à `<EditOfferForm offer={serializedOffer} supplierId={user.id} />`
  - [x] 5.5 PageHeader avec titre "Modifier l'offre"

- [x] **Task 6: Tests** (AC: 1-7)
  - [x] 6.1 `/src/lib/validations/offers.test.ts` — ajouter tests pour `updateOfferSchema`
  - [x] 6.2 `/src/lib/actions/offers.test.ts` — ajouter tests pour `updateOffer`
  - [x] 6.3 `/src/app/(supplier)/offers/[id]/page.test.tsx` — tests page détail
  - [x] 6.4 `/src/components/forms/edit-offer-form.test.tsx` — tests formulaire édition
  - [x] 6.5 `/src/app/(supplier)/offers/[id]/edit/page.test.tsx` — tests page édition
  - [x] 6.6 Tous les tests passent (`npm run test`)
  - [x] 6.7 `npm run build` passe
  - [x] 6.8 `npm run lint` passe

## Dev Notes

### Architecture Compliance

**Patterns OBLIGATOIRES à suivre:**
- Server Components par défaut — pages détail et edit sont des SC, formulaire est `"use client"` [Source: project-context.md#Next.js Rules]
- Fichiers en `kebab-case`, composants en `PascalCase` [Source: architecture.md#Naming Patterns]
- Tests co-localisés `*.test.ts(x)` à côté du source [Source: architecture.md#Structure Patterns]
- `ActionResult<T>` obligatoire pour `updateOffer` [Source: architecture.md#Format Patterns]
- Validation Zod côté client ET serveur [Source: architecture.md#Process Patterns]
- `supplierId` TOUJOURS depuis `user.id`, JAMAIS depuis l'input [Source: lib/actions/offers.ts pattern]

### Page Détail Offre — Structure

```typescript
// src/app/(supplier)/offers/[id]/page.tsx
// PAS de "use client" — Server Component

import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Package, Pencil, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getOfferDisplayStatus } from '@/lib/utils/offers'
import { formatPrice, formatDateRange, formatDiscount } from '@/lib/utils/format'
import { OFFER_CATEGORY_LABELS } from '@/lib/validations/offers'

interface OfferDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OfferDetailPage({ params }: OfferDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const offer = await prisma.offer.findUnique({
    where: { id, supplierId: user.id, deletedAt: null },
  })
  if (!offer) redirect('/dashboard')

  const displayStatus = getOfferDisplayStatus(offer)

  return (
    <>
      <PageHeader title={offer.name}>
        <Link href={`/offers/${offer.id}/edit`}>
          <Button variant="ghost" size="sm">
            <Pencil className="mr-1 h-4 w-4" /> Modifier
          </Button>
        </Link>
      </PageHeader>
      {/* ... affichage complet des infos */}
    </>
  )
}
```

**ATTENTION Next.js 15:** Le prop `params` est une `Promise` dans Next.js 15 App Router. Il FAUT `await params` avant d'utiliser `id`. C'est un changement par rapport à Next.js 14.

**ATTENTION PageHeader:** Vérifier si `PageHeader` accepte des `children` pour le bouton "Modifier". Si non, ajouter le bouton ailleurs (ex: dans le contenu de la page). Vérifier le composant dans `/src/components/layout/page-header.tsx`.

### updateOfferSchema — Logique de dates

```typescript
// Dans /src/lib/validations/offers.ts — AJOUTER

export const updateOfferSchema = createOfferStep1Schema
  .merge(createOfferStep2Schema)
  .merge(createOfferStep3Schema)
  .extend({
    id: z.string().uuid('ID offre invalide'),
  })
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    { message: 'La date de fin doit être après la date de début', path: ['endDate'] }
  )
  // PAS de refinement startDate >= today car une offre en cours a une startDate passée

export type UpdateOfferInput = z.infer<typeof updateOfferSchema>
```

**IMPORTANT:** Le refinement `startDate >= today` du `createOfferSchema` est ABSENT du `updateOfferSchema`. Raison: une offre en cours a une `startDate` dans le passé. La contrainte "startDate future" est gérée côté UI (champ disabled si déjà commencée) et vérifiée côté server action si modifiée.

### Server Action updateOffer

```typescript
// Dans /src/lib/actions/offers.ts — AJOUTER

export async function updateOffer(
  input: UpdateOfferInput
): Promise<ActionResult<{ offerId: string }>> {
  // 1. Validation Zod
  const validated = updateOfferSchema.safeParse(input)
  if (!validated.success) { ... VALIDATION_ERROR }

  // 2. Auth check (Supabase getUser)
  // 3. Vérifier rôle fournisseur (prisma.supplier.findUnique)
  // 4. Fetch offre existante
  const existingOffer = await prisma.offer.findUnique({
    where: { id: validated.data.id },
  })
  if (!existingOffer || existingOffer.deletedAt) { ... NOT_FOUND }
  if (existingOffer.supplierId !== user.id) { ... FORBIDDEN }

  // 5. Gestion photo: si ancienne photo ≠ nouvelle ET ancienne existe → delete
  // NOTE: deleteOfferPhoto utilise le client Supabase BROWSER (createClient from client.ts)
  // Mais cette action tourne côté serveur. Il faut soit:
  //   a) Appeler supabase server admin pour supprimer
  //   b) Ou créer une version server de deleteOfferPhoto
  // Solution recommandée: créer deleteOfferPhotoServer dans storage-server.ts
  // ou utiliser le supabase server client existant (createClient from server.ts)

  // 6. prisma.offer.update({ where: { id }, data: { ... } })
  // 7. revalidatePath('/dashboard'), '/offers', `/offers/${id}`
}
```

**CRITIQUE — Suppression photo côté serveur:**
`deleteOfferPhoto` dans `storage.ts` utilise `createClient` de `@/lib/supabase/client` (BROWSER client). Une Server Action ne peut PAS utiliser ce client. Il y a deux approches:

**Approche A (recommandée):** Créer `deleteOfferPhotoServer` dans `/src/lib/supabase/storage-server.ts` qui utilise `createClient` de `@/lib/supabase/server`:
```typescript
import { createClient } from '@/lib/supabase/server'

export async function deleteOfferPhotoServer(photoUrl: string): Promise<void> {
  const supabase = await createClient()
  const url = new URL(photoUrl)
  const pathParts = url.pathname.split(`/storage/v1/object/public/${BUCKET_NAME}/`)
  const filePath = pathParts[1]
  if (!filePath) return
  await supabase.storage.from(BUCKET_NAME).remove([filePath])
}
```

**Approche B:** Gérer la suppression de l'ancienne photo côté client (dans `EditOfferForm`) AVANT d'appeler `updateOffer`. Le composant `PhotoUpload` gère déjà `deleteOfferPhoto` côté client. Cette approche est PLUS SIMPLE et cohérente avec le flow existant de `PhotoUpload`.

**Recommandation: Approche B.** Le `PhotoUpload` supprime l'ancienne photo quand l'utilisateur clique le X. La Server Action n'a PAS besoin de supprimer la photo — elle met juste à jour `photoUrl`. La photo est déjà gérée côté client par le composant `PhotoUpload` existant.

### EditOfferForm — Structure

```typescript
// src/components/forms/edit-offer-form.tsx
'use client'

// MÊMES imports que CreateOfferForm + updateOffer + updateOfferSchema
import { SerializedOffer } from '@/lib/utils/offers'
import { updateOffer } from '@/lib/actions/offers'
import { updateOfferSchema, type UpdateOfferInput } from '@/lib/validations/offers'

const STEP_LABELS = ['Produit & Prix', 'Dates & Catégorie', 'Détails (optionnel)']

interface EditOfferFormProps {
  offer: SerializedOffer
  supplierId: string
}

export function EditOfferForm({ offer, supplierId }: EditOfferFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Déterminer si la date de début est passée (offre en cours)
  const isStartDatePast = new Date(offer.startDate) < new Date(new Date().toISOString().split('T')[0])

  const form = useForm<UpdateOfferInput>({
    resolver: zodResolver(updateOfferSchema),
    mode: 'onChange',
    defaultValues: {
      id: offer.id,
      name: offer.name,
      promoPrice: offer.promoPrice,      // déjà number (SerializedOffer)
      discountPercent: offer.discountPercent,
      startDate: offer.startDate.split('T')[0],  // ISO → YYYY-MM-DD
      endDate: offer.endDate.split('T')[0],
      category: offer.category,
      subcategory: offer.subcategory ?? '',
      margin: offer.margin ?? undefined,
      volume: offer.volume ?? '',
      conditions: offer.conditions ?? '',
      animation: offer.animation ?? '',
      photoUrl: offer.photoUrl ?? '',
    },
  })

  // PAS de localStorage draft pour l'édition

  async function onSubmit(data: UpdateOfferInput) {
    setIsLoading(true)
    try {
      const result = await updateOffer(data)
      if (result.success) {
        toast.success('Offre modifiée')
        router.push(`/offers/${offer.id}`)
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  // Même structure de rendu que CreateOfferForm
  // SAUF: startDate input a disabled={isStartDatePast}
  // SAUF: bouton final dit "Enregistrer les modifications" au lieu de "Publier"
}
```

**Points clés de différence avec CreateOfferForm:**
1. `defaultValues` pré-remplis depuis `offer` prop
2. Pas de brouillon localStorage
3. Appelle `updateOffer` au lieu de `createOffer`
4. Redirige vers `/offers/[id]` au lieu de `/dashboard`
5. Bouton "Enregistrer les modifications" au lieu de "Publier l'offre"
6. `startDate` input `disabled` si l'offre a déjà commencé
7. Le champ `id` est injecté automatiquement (hidden, depuis `offer.id`)

**ATTENTION sérialisation dates:** `SerializedOffer` a les dates en ISO string (`"2026-02-15T00:00:00.000Z"`). L'input HTML `type="date"` attend `"YYYY-MM-DD"`. Il faut `.split('T')[0]` pour convertir.

### Page Édition — Structure

```typescript
// src/app/(supplier)/offers/[id]/edit/page.tsx
// Server Component — fetch + pass à EditOfferForm

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import { PageHeader } from '@/components/layout/page-header'
import { EditOfferForm } from '@/components/forms/edit-offer-form'
import { serializeOffer } from '@/lib/utils/offers'

interface EditOfferPageProps {
  params: Promise<{ id: string }>
}

export default async function EditOfferPage({ params }: EditOfferPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const offer = await prisma.offer.findUnique({
    where: { id, supplierId: user.id, deletedAt: null },
  })
  if (!offer) redirect('/dashboard')

  return (
    <>
      <PageHeader title="Modifier l'offre" />
      <div className="flex-1 overflow-auto p-4">
        <EditOfferForm offer={serializeOffer(offer)} supplierId={user.id} />
      </div>
    </>
  )
}
```

**Pattern identique à `/offers/new/page.tsx`:** Même structure RSC → Client Component, même vérification auth, même sérialisation.

### Project Structure Notes

**Fichiers à créer:**
- `/src/app/(supplier)/offers/[id]/page.tsx` — Page détail offre
- `/src/app/(supplier)/offers/[id]/page.test.tsx` — Tests détail
- `/src/app/(supplier)/offers/[id]/loading.tsx` — Loading skeleton détail
- `/src/app/(supplier)/offers/[id]/edit/page.tsx` — Page édition offre
- `/src/app/(supplier)/offers/[id]/edit/page.test.tsx` — Tests page édition
- `/src/components/forms/edit-offer-form.tsx` — Formulaire édition
- `/src/components/forms/edit-offer-form.test.tsx` — Tests formulaire

**Fichiers à modifier:**
- `/src/lib/validations/offers.ts` — Ajouter `updateOfferSchema` + `UpdateOfferInput`
- `/src/lib/validations/offers.test.ts` — Ajouter tests updateOfferSchema
- `/src/lib/actions/offers.ts` — Ajouter `updateOffer` action
- `/src/lib/actions/offers.test.ts` — Ajouter tests updateOffer

**Fichiers existants à réutiliser (NE PAS recréer):**
- `/src/components/ui/card.tsx`, `badge.tsx`, `button.tsx`, `input.tsx`, `textarea.tsx`, `select.tsx`, `form.tsx`, `skeleton.tsx` → shadcn/ui
- `/src/components/custom/step-indicator.tsx` → StepIndicator (3 étapes)
- `/src/components/custom/photo-upload.tsx` → PhotoUpload (upload/delete)
- `/src/components/custom/offer-card.tsx` → OfferCard (inchangé)
- `/src/components/custom/offer-list.tsx` → OfferList (inchangé)
- `/src/components/custom/empty-offers-state.tsx` → inchangé
- `/src/components/custom/floating-action-button.tsx` → inchangé
- `/src/components/layout/page-header.tsx` → PageHeader
- `/src/components/layout/mobile-layout.tsx` → via layout parent
- `/src/lib/utils/offers.ts` → `getOfferDisplayStatus`, `serializeOffer`, `SerializedOffer`
- `/src/lib/utils/format.ts` → `formatPrice`, `formatDateRange`, `formatDiscount`
- `/src/lib/utils/cn.ts` → `cn()`
- `/src/lib/prisma/client.ts` → `prisma`
- `/src/lib/supabase/server.ts` → `createClient()` (server)
- `/src/lib/supabase/storage.ts` → `uploadOfferPhoto`, `deleteOfferPhoto` (client)
- `/src/lib/validations/offers.ts` → step schemas, OFFER_CATEGORIES, OFFER_CATEGORY_LABELS
- `/src/types/api.ts` → `ActionResult`, `ErrorCode`

### Previous Story Intelligence

**Story 2.4 — Learnings critiques:**
- `SerializedOffer` type utilisé pour la boundary RSC → Client (Decimal→number, Date→string ISO)
- `serializeOffer()` dans `offers.ts` gère la conversion
- `getOfferDisplayStatus()` calcule le statut d'affichage (active/expired/draft)
- `formatPrice()`, `formatDateRange()`, `formatDiscount()` utilisent `Intl` natif
- Badge variants: `default` (active/vert via className), `secondary` (expired/gris), `outline` (draft/orange via className) — les couleurs sont en `className` custom, pas en variant shadcn
- Tests avec `@testing-library/react` + `vitest`
- Mock `next/navigation` pour `useRouter`, `redirect`
- `next/image` utilisé dans OfferCard (pas `<img>`) — `remotePatterns` Supabase configuré dans `next.config.ts`

**Story 2.3 — Learnings critiques:**
- `PhotoUpload` composant gère upload ET delete de la photo
- Photos stockées dans bucket `offer-photos` sous `{supplierId}/{uuid}.{ext}`
- `deleteOfferPhoto` utilise le client browser Supabase — NE PAS appeler depuis une Server Action
- Le form utilise `form.setValue('photoUrl', url)` pour synchroniser avec RHF

**Story 2.2 — Code review issues (à ne pas reproduire):**
- Prisma utilise DATABASE_URL = service role → RLS contournée, le contrôle d'accès applicatif (`supplierId === user.id`) EST la vraie barrière de sécurité
- Toujours filtrer par `supplierId: user.id` dans les queries

**Issues connues:**
- `Decimal` Prisma non sérialisable → utiliser `serializeOffer()` ou `Number(offer.promoPrice)`
- `Date` Prisma `@db.Date` retourne un Date à minuit UTC → `.split('T')[0]` pour input HTML date
- Zod 4 API (pas Zod 3) — vérifier les messages d'erreur
- `sonner` pour les toasts (`import { toast } from 'sonner'`)
- `params` est une `Promise` dans Next.js 15 → `const { id } = await params`

### Git Intelligence

**Commits récents (Story 2.4):**
```
ab098ed feat: Liste des offres fournisseur avec OfferCard et statuts (Story 2.4)
```

**Fichiers créés en Story 2.4 (ne pas casser):**
- `src/lib/utils/offers.ts` — getOfferDisplayStatus, serializeOffer
- `src/lib/utils/format.ts` — formatPrice, formatDateRange, formatDiscount
- `src/components/custom/offer-card.tsx` — OfferCard
- `src/components/custom/offer-card-skeleton.tsx` — OfferCardSkeleton
- `src/components/custom/offer-list.tsx` — OfferList
- `src/app/(supplier)/dashboard/loading.tsx` — Loading skeleton page

**Fichiers critiques existants (NE PAS casser):**
- `src/app/(supplier)/dashboard/page.tsx` — NE PAS MODIFIER
- `src/components/forms/create-offer-form.tsx` — NE PAS MODIFIER
- `src/lib/actions/offers.ts` — AJOUTER updateOffer (ne pas modifier createOffer)
- `src/lib/validations/offers.ts` — AJOUTER updateOfferSchema (ne pas modifier createOfferSchema)
- `prisma/schema.prisma` — NE PAS MODIFIER (aucune migration requise)

### Library & Framework Requirements

**Dépendances déjà installées (NE PAS réinstaller):**
- `next@16.1.6` — Framework (App Router, RSC, params: Promise)
- `react@19.2.3` — UI library
- `@prisma/client@^6.19.2` — ORM
- `react-hook-form` + `@hookform/resolvers` — Forms + Zod resolver
- `zod` — Validation
- `lucide-react@^0.563.0` — Icônes (Pencil, ArrowLeft, ArrowRight, Loader2, Package, Camera, X)
- `sonner@^2.0.7` — Toast
- `tailwindcss` — Styling

**Composants shadcn/ui disponibles (DÉJÀ installés):**
Card, Badge, Button, Input, Textarea, Select, Form, Skeleton, Sheet, Dialog, Label

**AUCUNE nouvelle dépendance requise.**

### Testing Requirements

**Tests updateOfferSchema (`offers.test.ts` — ajouter):**
- Accepte données valides avec `id` UUID
- Rejette `id` invalide (pas UUID)
- Accepte `startDate` dans le passé (offre en cours)
- Valide `endDate >= startDate`
- Rejette `endDate < startDate`
- Mêmes validations que createOffer pour les autres champs

**Tests updateOffer action (`offers.test.ts` — ajouter):**
- Succès: modifie l'offre et retourne offerId
- Échec validation: retourne VALIDATION_ERROR
- Échec auth: retourne UNAUTHORIZED si pas connecté
- Échec rôle: retourne FORBIDDEN si pas fournisseur
- Échec propriété: retourne FORBIDDEN si offre ne m'appartient pas
- Échec offre inexistante: retourne NOT_FOUND
- Échec offre supprimée: retourne NOT_FOUND si `deletedAt` non null
- Vérifie que `revalidatePath` est appelé pour `/dashboard`, `/offers`, `/offers/[id]`

**Tests page détail (`offers/[id]/page.test.tsx`):**
- Affiche les informations de l'offre
- Affiche le bouton "Modifier"
- Redirige si offre non trouvée
- Redirige si pas le propriétaire

**Tests EditOfferForm (`edit-offer-form.test.tsx`):**
- Formulaire pré-rempli avec les données de l'offre
- Navigation entre les 3 étapes
- Champ startDate disabled si offre déjà commencée
- Champ startDate enabled si offre pas encore commencée
- Soumission appelle updateOffer
- Toast succès et redirection après modification
- Toast erreur si échec

**Tests page édition (`offers/[id]/edit/page.test.tsx`):**
- Rend le formulaire avec les données
- Redirige si offre non trouvée
- Redirige si pas le propriétaire

**Pattern de test identique aux stories précédentes:**
- `@testing-library/react` + `vitest`
- Mock `next/navigation` (`useRouter`, `redirect`)
- Mock `next/cache` (`revalidatePath`)
- Mock Supabase et Prisma

### Security Considerations

- **Isolation FR32:** L'offre est TOUJOURS vérifiée `supplierId === user.id` dans la Server Action ET dans les pages RSC
- **Double vérification:** Côté RSC (fetch) + côté Server Action (update) — belt and suspenders
- **Pas de supplierId dans l'input:** La Server Action ne prend JAMAIS le supplierId depuis l'input client
- **Soft delete respect:** Vérifier `deletedAt === null` avant d'autoriser la modification
- **Photo:** La suppression de l'ancienne photo est gérée côté client par le composant `PhotoUpload` existant
- **Validation serveur:** TOUJOURS revalider avec Zod côté serveur même si validé côté client

### UX Considerations

**Page détail:**
- Layout carte avec infos bien structurées
- Badge de statut (Active/Expirée/Brouillon) identique à OfferCard
- Photo en grand (aspect-video) ou placeholder Package
- Bouton "Modifier" accessible et visible (h-11 = 44px touch target)

**Formulaire édition:**
- Même UX que la création (familiarité utilisateur)
- 3 étapes identiques avec StepIndicator
- Pre-filled avec les données existantes — l'utilisateur voit immédiatement quoi modifier
- Date de début grisée si offre en cours (UX claire: on ne peut pas changer le passé)
- Bouton "Enregistrer les modifications" au lieu de "Publier" — libellé clair
- Toast "Offre modifiée" (pas "Offre publiée") pour différencier

### Prisma Schema — Rappel (AUCUNE modification nécessaire)

Le modèle `Offer` contient déjà tous les champs. `updatedAt` se met à jour automatiquement via `@updatedAt`. Aucune migration requise.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.5: Modification d'Offre]
- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure]
- [Source: _bmad-output/planning-artifacts/prd.md#FR8 - Modification offre]
- [Source: _bmad-output/planning-artifacts/prd.md#FR32 - Isolation données fournisseur]
- [Source: _bmad-output/project-context.md#Next.js Rules]
- [Source: _bmad-output/project-context.md#Anti-Patterns]
- [Source: _bmad-output/project-context.md#API Response Pattern]
- [Source: _bmad-output/implementation-artifacts/2-4-liste-des-offres-fournisseur.md]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

- Tests corrigés : UUID mock invalide `offer-uuid-1` → UUID valide `550e8400-...` pour passer la validation `updateOfferSchema`
- Test `getByText('Épicerie')` → `getByText(/Épicerie/)` car texte partiel dans "Catégorie : Épicerie"

### Completion Notes List

- ✅ Task 1: Page détail offre créée avec toutes les infos, badge statut, bouton Modifier via `PageHeader.actions`, bouton Retour, loading.tsx
- ✅ Task 2: `updateOfferSchema` ajouté — merge des 3 step schemas + `id: z.string().uuid()`, refinement `endDate >= startDate` SANS refinement `startDate >= today` (offre en cours a startDate passée)
- ✅ Task 3: `updateOffer` Server Action — validation Zod, auth check, vérification fournisseur, vérification propriété offre + deletedAt, prisma.offer.update, revalidatePath x3. Validation AC7 startDate >= today côté serveur pour offres non commencées. Suppression ancienne photo côté serveur quand photoUrl change.
- ✅ Task 4: `EditOfferForm` — même structure 3 étapes que CreateOfferForm, defaultValues pré-remplis, pas de localStorage draft, startDate disabled si offre déjà commencée + min attribute, bouton "Enregistrer les modifications". PhotoUpload en mode déféré (suppression photo gérée côté serveur au submit).
- ✅ Task 5: Page édition — Server Component, fetch + vérification propriété, sérialisation, passage à EditOfferForm, loading.tsx ajouté
- ✅ Task 6: 424 tests passent (dont ~49 nouveaux), build OK, lint OK

### Change Log

- 2026-02-06: Implémentation complète Story 2.5 — Page détail offre, schéma updateOffer, Server Action updateOffer, formulaire édition, page édition, tests complets
- 2026-02-06: Code review fixes — AC7 validation startDate serveur, suppression photo serveur (H3), min attribute startDate (M1), loading.tsx edit page (M2), tests ajoutés (9 nouveaux)

### File List

**Fichiers créés:**
- `src/app/(supplier)/offers/[id]/page.tsx` — Page détail offre (Server Component)
- `src/app/(supplier)/offers/[id]/loading.tsx` — Loading skeleton détail
- `src/app/(supplier)/offers/[id]/page.test.tsx` — Tests page détail (8 tests)
- `src/app/(supplier)/offers/[id]/edit/page.tsx` — Page édition offre (Server Component)
- `src/app/(supplier)/offers/[id]/edit/page.test.tsx` — Tests page édition (4 tests)
- `src/app/(supplier)/offers/[id]/edit/loading.tsx` — Loading skeleton édition
- `src/components/forms/edit-offer-form.tsx` — Formulaire édition offre (Client Component)
- `src/components/forms/edit-offer-form.test.tsx` — Tests formulaire édition (14 tests)

**Fichiers modifiés:**
- `src/lib/validations/offers.ts` — Ajout `updateOfferSchema` + `UpdateOfferInput`
- `src/lib/validations/offers.test.ts` — Ajout tests updateOfferSchema (14 tests)
- `src/lib/actions/offers.ts` — Ajout `updateOffer` Server Action + validation AC7 startDate + suppression photo serveur
- `src/lib/actions/offers.test.ts` — Ajout tests updateOffer (21 tests)
- `src/components/custom/photo-upload.tsx` — Ajout prop `onDelete` optionnelle pour gestion déférée
