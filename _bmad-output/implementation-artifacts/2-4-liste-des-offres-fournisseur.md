# Story 2.4: Liste des Offres Fournisseur

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

En tant que **fournisseur**,
Je veux **voir la liste de mes offres avec leur statut (active, expirée, brouillon)**,
Afin de **gérer mon portefeuille promotionnel efficacement**.

## Acceptance Criteria

### AC1: Affichage liste offres sous forme de cards
**Given** je suis connecté en tant que fournisseur
**When** j'accède à `/dashboard` (via bottom nav "Offres")
**Then** la liste de MES offres uniquement s'affiche (FR32 — isolation par `supplierId`)
**And** les offres sont affichées sous forme de cards (OfferCard)
**And** les offres sont triées par date de création (plus récentes en premier)
**And** les offres soft-deleted (`deletedAt != null`) sont exclues

### AC2: Contenu de chaque OfferCard
**Given** des offres existent
**When** la liste se charge
**Then** chaque OfferCard affiche:
- Photo du produit (ou placeholder icône Package si pas de photo)
- Nom du produit
- Prix promo (format `XX,XX €`)
- Remise en % (format `-XX%`)
- Dates de validité (format: "15 fév - 28 fév")
**And** un badge de statut est visible selon les règles AC3

### AC3: Badges de statut avec auto-expiration visuelle
**Given** une offre a `status === 'ACTIVE'` et `endDate >= aujourd'hui`
**When** la liste se charge
**Then** le badge affiche "Active" en vert (variant success)

**Given** une offre a `endDate < aujourd'hui` (quel que soit le statut DB)
**When** la liste se charge
**Then** le badge affiche "Expirée" en gris (variant secondary)
**And** la card a une opacité réduite (`opacity-60`)

**Given** une offre a `status === 'DRAFT'`
**When** la liste se charge
**Then** le badge affiche "Brouillon" en orange (variant warning/outline)

### AC4: Skeleton loading pendant le chargement
**Given** la page `/dashboard` se charge
**When** les données ne sont pas encore disponibles
**Then** 3 skeleton cards s'affichent avec la forme des OfferCards
**And** les skeletons ont la même structure: image placeholder + lignes de texte

### AC5: Pull-to-refresh pour actualiser la liste
**Given** je suis sur la liste des offres
**When** j'effectue un pull-to-refresh (ou tap sur un bouton refresh)
**Then** la liste est rechargée depuis le serveur via `router.refresh()`
**And** un indicateur de chargement s'affiche pendant le refresh

### AC6: Navigation vers le détail d'une offre
**Given** je clique sur une OfferCard
**When** l'action est déclenchée
**Then** je suis redirigé vers `/offers/[id]`
**And** la transition est fluide

### AC7: Empty state quand aucune offre
**Given** je n'ai aucune offre
**When** j'accède à `/dashboard`
**Then** le composant `EmptyOffersState` existant s'affiche (DÉJÀ IMPLÉMENTÉ — ne pas recréer)
**And** le bouton CTA et le FAB restent visibles

### AC8: Performance de scroll
**Given** la liste contient plus de 10 offres
**When** je scroll
**Then** le scroll est fluide (60fps — NFR4)
**And** aucun jank visible

## Tasks / Subtasks

- [x] **Task 1: Créer le composant OfferCard** (AC: 1, 2, 3, 6)
  - [x] 1.1 Créer `/src/components/custom/offer-card.tsx` (Server Component — pas de `"use client"`)
  - [x] 1.2 Props interface: `{ offer: OfferWithStatus }` où `OfferWithStatus` est le type Prisma Offer avec le statut calculé
  - [x] 1.3 Structure: `<Link href={/offers/${offer.id}}>` wrapping un `<Card>` avec photo, infos, badge
  - [x] 1.4 Photo: `<img>` avec `src={offer.photoUrl}` ou placeholder icône `Package` (lucide-react) si pas de photo
  - [x] 1.5 Infos: nom produit (`text-lg font-semibold`), prix promo (`tabular-nums`), remise %, dates
  - [x] 1.6 Badge de statut via fonction `getOfferDisplayStatus(offer)` qui calcule le statut d'affichage
  - [x] 1.7 Opacité réduite (`opacity-60`) pour les offres expirées
  - [x] 1.8 Accessibilité: `<article>` avec `aria-labelledby`, focus visible sur la card
  - [x] 1.9 Touch target minimum 44px sur toute la card (via `<Link>`)

- [x] **Task 2: Créer la fonction utilitaire `getOfferDisplayStatus`** (AC: 3)
  - [x] 2.1 Créer dans `/src/lib/utils/offers.ts`
  - [x] 2.2 Logique: si `endDate < today` → `'expired'`, sinon mapper le statut DB (`ACTIVE` → `'active'`, `DRAFT` → `'draft'`)
  - [x] 2.3 Retourner un objet `{ label: string, variant: string }` pour le Badge
  - [x] 2.4 Labels en français: "Active", "Expirée", "Brouillon"

- [x] **Task 3: Créer les fonctions de formatage** (AC: 2)
  - [x] 3.1 Dans `/src/lib/utils/format.ts` (créer si n'existe pas), ajouter:
  - [x] 3.2 `formatPrice(price: number | Decimal): string` → `"12,99 €"` (format français)
  - [x] 3.3 `formatDateRange(start: Date, end: Date): string` → `"15 fév - 28 fév"` (format court français)
  - [x] 3.4 `formatDiscount(percent: number): string` → `"-25%"`
  - [x] 3.5 Utiliser `Intl.NumberFormat('fr-FR')` et `Intl.DateTimeFormat('fr-FR')` — PAS de dépendance externe (date-fns, etc.)

- [x] **Task 4: Créer le composant OfferCardSkeleton** (AC: 4)
  - [x] 4.1 Créer dans `/src/components/custom/offer-card-skeleton.tsx`
  - [x] 4.2 Utiliser le composant `Skeleton` de shadcn/ui (DÉJÀ installé)
  - [x] 4.3 Même dimensions que OfferCard: zone image + lignes de texte
  - [x] 4.4 Exporter aussi `OfferListSkeleton` qui affiche 3 skeletons

- [x] **Task 5: Créer le wrapper OfferList client pour pull-to-refresh** (AC: 5, 8)
  - [x] 5.1 Créer `/src/components/custom/offer-list.tsx` avec `"use client"`
  - [x] 5.2 Props: `{ offers: Offer[] }` (les données viennent du RSC parent)
  - [x] 5.3 Implémenter pull-to-refresh: bouton "Actualiser" en haut OU un composant pull-to-refresh simple
  - [x] 5.4 Utiliser `useRouter()` + `router.refresh()` pour revalider les données RSC
  - [x] 5.5 État `isRefreshing` pour spinner pendant le refresh
  - [x] 5.6 Rendre chaque offre via `<OfferCard offer={offer} />`

- [x] **Task 6: Mettre à jour le Dashboard page** (AC: 1, 4, 7)
  - [x] 6.1 Modifier `/src/app/(supplier)/dashboard/page.tsx`
  - [x] 6.2 Supprimer le placeholder `<div>Liste des offres à implémenter (Story 2.4)</div>`
  - [x] 6.3 Remplacer par `<OfferList offers={offers} />`
  - [x] 6.4 Créer `loading.tsx` dans `/src/app/(supplier)/dashboard/loading.tsx` avec `<OfferListSkeleton />`
  - [x] 6.5 Garder `EmptyOffersState` et `FloatingActionButton` inchangés
  - [x] 6.6 Garder le `PageHeader title="Mes offres"` existant

- [x] **Task 7: Tests** (AC: 1-8)
  - [x] 7.1 Créer `/src/components/custom/offer-card.test.tsx` — tests du composant OfferCard
  - [x] 7.2 Créer `/src/lib/utils/offers.test.ts` — tests `getOfferDisplayStatus`
  - [x] 7.3 Créer `/src/lib/utils/format.test.ts` — tests formatPrice, formatDateRange, formatDiscount
  - [x] 7.4 Créer `/src/components/custom/offer-card-skeleton.test.tsx` — tests skeleton rendering
  - [x] 7.5 Créer `/src/components/custom/offer-list.test.tsx` — tests OfferList avec refresh
  - [x] 7.6 Tous les tests passent (`npm run test`)
  - [x] 7.7 `npm run build` passe
  - [x] 7.8 `npm run lint` passe

## Dev Notes

### Architecture Compliance

**Patterns OBLIGATOIRES à suivre:**
- Server Components par défaut — `OfferCard` est un SC, `OfferList` est `"use client"` seulement pour le refresh interactif [Source: project-context.md#Next.js Rules]
- Fichiers en `kebab-case`, composants en `PascalCase` [Source: architecture.md#Naming Patterns]
- Tests co-localisés `*.test.ts` à côté du source [Source: architecture.md#Structure Patterns]
- `"use client"` UNIQUEMENT sur `OfferList` (interactivité refresh) et jamais sur `OfferCard` [Source: project-context.md#Anti-Patterns]
- Pas de React Query pour cette story — les données sont fetchées en RSC via Prisma, le refresh utilise `router.refresh()` [Cohérence avec le pattern actuel du dashboard]

### Composant OfferCard — Structure

```typescript
// src/components/custom/offer-card.tsx
// PAS de "use client" — Server Component

import Link from 'next/link'
import { Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { getOfferDisplayStatus } from '@/lib/utils/offers'
import { formatPrice, formatDateRange, formatDiscount } from '@/lib/utils/format'
import type { Offer } from '@prisma/client'

interface OfferCardProps {
  offer: Offer
}

export function OfferCard({ offer }: OfferCardProps) {
  const displayStatus = getOfferDisplayStatus(offer)
  const isExpired = displayStatus.key === 'expired'

  return (
    <Link href={`/offers/${offer.id}`}>
      <article
        aria-labelledby={`offer-${offer.id}-title`}
        className={cn(
          'transition-shadow hover:shadow-md',
          isExpired && 'opacity-60'
        )}
      >
        <Card>
          <CardContent className="flex gap-3 p-3">
            {/* Photo ou placeholder */}
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
              {offer.photoUrl ? (
                <img
                  src={offer.photoUrl}
                  alt={offer.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Informations */}
            <div className="flex flex-1 flex-col justify-between min-w-0">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3
                    id={`offer-${offer.id}-title`}
                    className="text-sm font-semibold leading-tight truncate"
                  >
                    {offer.name}
                  </h3>
                  <Badge variant={displayStatus.variant}>
                    {displayStatus.label}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-semibold tabular-nums">
                  {formatPrice(Number(offer.promoPrice))}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {formatDiscount(offer.discountPercent)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDateRange(offer.startDate, offer.endDate)}
              </p>
            </div>
          </CardContent>
        </Card>
      </article>
    </Link>
  )
}
```

**NOTE:** Le type exact de `variant` pour le Badge dépend des variants disponibles dans le composant `Badge` shadcn/ui installé. Vérifier les variants existantes dans `/src/components/ui/badge.tsx` avant d'implémenter. Les variants connues sont: `default`, `secondary`, `destructive`, `outline`. Si `success` ou `warning` n'existent pas, utiliser des classes Tailwind pour la couleur du badge ou ajouter ces variants dans `badge.tsx`.

### Fonction getOfferDisplayStatus

```typescript
// src/lib/utils/offers.ts
import type { Offer, OfferStatus } from '@prisma/client'

type DisplayStatus = {
  key: 'active' | 'expired' | 'draft'
  label: string
  variant: string // Badge variant
}

export function getOfferDisplayStatus(offer: Offer): DisplayStatus {
  // Auto-expiration visuelle: si endDate < aujourd'hui, toujours "Expirée"
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endDate = new Date(offer.endDate)
  endDate.setHours(0, 0, 0, 0)

  if (endDate < today) {
    return { key: 'expired', label: 'Expirée', variant: 'secondary' }
  }

  if (offer.status === 'DRAFT') {
    return { key: 'draft', label: 'Brouillon', variant: 'outline' }
  }

  return { key: 'active', label: 'Active', variant: 'default' }
}
```

**IMPORTANT:** La comparaison de dates doit normaliser à minuit (`setHours(0,0,0,0)`) car `endDate` est un `@db.Date` (pas datetime). Prisma retourne les dates `@db.Date` comme `Date` à minuit UTC.

### Fonctions de formatage

```typescript
// src/lib/utils/format.ts

const priceFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

const shortDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
})

export function formatPrice(price: number): string {
  return priceFormatter.format(price)
}

export function formatDateRange(start: Date, end: Date): string {
  return `${shortDateFormatter.format(new Date(start))} - ${shortDateFormatter.format(new Date(end))}`
}

export function formatDiscount(percent: number): string {
  return `-${percent}%`
}
```

**Pas de dépendance externe (date-fns, dayjs).** `Intl` est natif et supporte le français parfaitement.

### OfferList — Client Component pour refresh

```typescript
// src/components/custom/offer-list.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OfferCard } from '@/components/custom/offer-card'
import { cn } from '@/lib/utils/cn'
import type { Offer } from '@prisma/client'

interface OfferListProps {
  offers: Offer[]
}

export function OfferList({ offers }: OfferListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleRefresh() {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isPending}
          aria-label="Actualiser la liste"
        >
          <RefreshCw className={cn('mr-1 h-4 w-4', isPending && 'animate-spin')} />
          Actualiser
        </Button>
      </div>
      <div className="space-y-3">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  )
}
```

**ATTENTION:** `OfferCard` est un Server Component importé dans un Client Component. C'est possible SEULEMENT si `OfferCard` n'utilise pas de fonctionnalités server-only (await, headers, cookies). Comme `OfferCard` est un composant de rendu pur (pas de fetch), cela fonctionne. Si problème, convertir `OfferCard` en client component aussi.

**Alternative si OfferCard en SC pose problème:** Passer les offers comme props sérialisées et rendre OfferCard comme client component. Dans ce cas, les `Decimal` Prisma doivent être convertis en `number` avant sérialisation.

### Dashboard page — Modifications

```typescript
// src/app/(supplier)/dashboard/page.tsx — MODIFICATIONS
// Remplacer le placeholder par OfferList

// AVANT:
// {offers.length === 0 ? (
//   <EmptyOffersState />
// ) : (
//   <div>Liste des offres à implémenter (Story 2.4)</div>
// )}

// APRÈS:
// {offers.length === 0 ? (
//   <EmptyOffersState />
// ) : (
//   <OfferList offers={offers} />
// )}
```

**CRITIQUE: Sérialisation Prisma → Client Component**
Les objets Prisma contiennent des `Decimal` et `Date` qui ne sont pas directement sérialisables par Next.js RSC → Client boundary. Il faut:
1. Convertir les `Decimal` en `number` et `Date` en `string` (ISO) dans le page RSC
2. OU utiliser `JSON.parse(JSON.stringify(offers))` (hack simple mais fonctionnel)
3. OU créer un type `SerializedOffer` avec les transformations

**Approche recommandée:** Créer une fonction `serializeOffer(offer: Offer)` dans `src/lib/utils/offers.ts` qui transforme les types Prisma pour le passage RSC→Client:

```typescript
export type SerializedOffer = Omit<Offer, 'promoPrice' | 'margin' | 'startDate' | 'endDate' | 'createdAt' | 'updatedAt' | 'deletedAt'> & {
  promoPrice: number
  margin: number | null
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export function serializeOffer(offer: Offer): SerializedOffer {
  return {
    ...offer,
    promoPrice: Number(offer.promoPrice),
    margin: offer.margin ? Number(offer.margin) : null,
    startDate: offer.startDate.toISOString(),
    endDate: offer.endDate.toISOString(),
    createdAt: offer.createdAt.toISOString(),
    updatedAt: offer.updatedAt.toISOString(),
    deletedAt: offer.deletedAt?.toISOString() ?? null,
  }
}
```

Ensuite dans dashboard: `<OfferList offers={offers.map(serializeOffer)} />` et adapter les types dans OfferCard/OfferList/getOfferDisplayStatus pour accepter `SerializedOffer`.

### Loading.tsx — Skeleton

```typescript
// src/app/(supplier)/dashboard/loading.tsx
import { PageHeader } from '@/components/layout/page-header'
import { OfferListSkeleton } from '@/components/custom/offer-card-skeleton'

export default function DashboardLoading() {
  return (
    <>
      <PageHeader title="Mes offres" />
      <div className="flex-1 overflow-auto p-4">
        <OfferListSkeleton />
      </div>
    </>
  )
}
```

### Project Structure Notes

**Fichiers à créer:**
- `/src/components/custom/offer-card.tsx` — Composant OfferCard
- `/src/components/custom/offer-card.test.tsx` — Tests OfferCard
- `/src/components/custom/offer-card-skeleton.tsx` — Skeleton loading
- `/src/components/custom/offer-card-skeleton.test.tsx` — Tests skeleton
- `/src/components/custom/offer-list.tsx` — Liste avec refresh (client)
- `/src/components/custom/offer-list.test.tsx` — Tests OfferList
- `/src/lib/utils/offers.ts` — Utilitaires offres (statut, sérialisation)
- `/src/lib/utils/offers.test.ts` — Tests utilitaires
- `/src/lib/utils/format.ts` — Fonctions de formatage (si n'existe pas)
- `/src/lib/utils/format.test.ts` — Tests formatage
- `/src/app/(supplier)/dashboard/loading.tsx` — Loading skeleton page

**Fichiers à modifier:**
- `/src/app/(supplier)/dashboard/page.tsx` — Remplacer placeholder par `OfferList`

**Fichiers existants à réutiliser (NE PAS recréer):**
- `/src/components/ui/card.tsx` → Card, CardContent, CardHeader, etc.
- `/src/components/ui/badge.tsx` → Badge (vérifier variants disponibles)
- `/src/components/ui/skeleton.tsx` → Skeleton
- `/src/components/ui/button.tsx` → Button
- `/src/components/custom/empty-offers-state.tsx` → EmptyOffersState (INCHANGÉ)
- `/src/components/custom/floating-action-button.tsx` → FloatingActionButton (INCHANGÉ)
- `/src/components/layout/page-header.tsx` → PageHeader (INCHANGÉ)
- `/src/components/layout/mobile-layout.tsx` → MobileLayout (via layout parent)
- `/src/components/custom/supplier-bottom-navigation.tsx` → BottomNav (INCHANGÉ)
- `/src/lib/utils/cn.ts` → `cn()`
- `/src/lib/prisma/client.ts` → `prisma`
- `/src/lib/supabase/server.ts` → `createClient()` (server)

### Previous Story Intelligence

**Story 2.3 — Learnings critiques:**
- Le dashboard page fetch déjà les offres correctement avec Prisma: `prisma.offer.findMany({ where: { supplierId: user.id, deletedAt: null }, orderBy: { createdAt: 'desc' } })`
- L'auth est gérée dans le layout `(supplier)/layout.tsx` — pas besoin de re-vérifier dans la page
- Le FAB est positionné `bottom-20 right-4 z-50` (au-dessus du bottom nav z-40)
- Boutons `h-11` (44px) pour touch targets — garder cette convention
- `EmptyOffersState` existe déjà et fonctionne — NE PAS le modifier
- Les photos sont stockées dans Supabase Storage bucket `offer-photos` avec URLs publiques
- Zod 4 API utilisé — pas Zod 3
- `sonner` pour les toasts (`import { toast } from 'sonner'`)
- Tests avec `@testing-library/react` + `vitest`

**Story 2.2 — Code review issues (à ne pas reproduire):**
- RLS policies potentiellement contournées par Prisma (DATABASE_URL = service role) — le contrôle d'accès applicatif (`supplierId === user.id` dans le WHERE clause) EST la vraie barrière
- Pour les queries RSC, toujours filtrer par `supplierId: user.id` explicitement

**Issue connue:** Les types `Decimal` de Prisma ne sont pas sérialisables par défaut dans le boundary RSC → Client. Il FAUT les convertir en `number` avant de les passer en props.

### Git Intelligence

**Commits récents:**
```
f71942d feat: Enrichissement offre champs optionnels avec upload photo (Story 2.3)
4630284 feat: Création offre champs obligatoires avec formulaire en étapes (Story 2.2)
4a05a76 feat: Schema offres, RLS policies et page liste vide avec dashboard fournisseur (Story 2.1)
```

**Pattern de commit à suivre:**
```
feat: Liste des offres fournisseur avec OfferCard et statuts (Story 2.4)
```

**Fichiers créés/modifiés dans les stories précédentes (à ne pas casser):**
- `src/app/(supplier)/dashboard/page.tsx` — MODIFIER (remplacer placeholder uniquement)
- `src/app/(supplier)/offers/new/page.tsx` — NE PAS MODIFIER
- `src/components/forms/create-offer-form.tsx` — NE PAS MODIFIER
- `src/components/custom/empty-offers-state.tsx` — NE PAS MODIFIER
- `src/components/custom/floating-action-button.tsx` — NE PAS MODIFIER
- `src/lib/actions/offers.ts` — NE PAS MODIFIER
- `src/lib/validations/offers.ts` — NE PAS MODIFIER
- `prisma/schema.prisma` — NE PAS MODIFIER

### Library & Framework Requirements

**Dépendances déjà installées (NE PAS réinstaller):**
- `next@16.1.6` — Framework (App Router, RSC)
- `react@19.2.3` — UI library
- `@prisma/client@^6.19.2` — ORM (types Offer, OfferStatus, etc.)
- `lucide-react@^0.563.0` — Icônes (Package, RefreshCw disponibles)
- `tailwindcss` — Styling
- `sonner@^2.0.7` — Toast

**Composants shadcn/ui disponibles (DÉJÀ installés):**
Card, Badge, Button, Skeleton, Form, Input, Textarea, Select, Sheet, Tabs, Dialog, Alert, Avatar, Label

**AUCUNE nouvelle dépendance requise.** Tout est fait avec les outils existants + `Intl` natif du navigateur.

### Testing Requirements

**Tests utilitaires (`offers.test.ts`):**
- `getOfferDisplayStatus`: offre active → `{ key: 'active', label: 'Active' }`
- `getOfferDisplayStatus`: offre expirée (endDate passée) → `{ key: 'expired', label: 'Expirée' }`
- `getOfferDisplayStatus`: offre ACTIVE mais endDate passée → `{ key: 'expired' }` (auto-expiration)
- `getOfferDisplayStatus`: offre DRAFT → `{ key: 'draft', label: 'Brouillon' }`
- `serializeOffer`: convertit Decimal en number, Date en string ISO

**Tests formatage (`format.test.ts`):**
- `formatPrice(12.99)` → `"12,99 €"`
- `formatPrice(0)` → `"0,00 €"`
- `formatDateRange(15 fév, 28 fév)` → `"15 févr. - 28 févr."` (ou format exact de `Intl`)
- `formatDiscount(25)` → `"-25%"`

**Tests OfferCard (`offer-card.test.tsx`):**
- Affiche le nom du produit
- Affiche le prix formaté
- Affiche la remise formatée
- Affiche les dates formatées
- Affiche badge "Active" pour offre active
- Affiche badge "Expirée" + opacité pour offre expirée
- Affiche badge "Brouillon" pour offre draft
- Affiche placeholder Package quand pas de photo
- Affiche la photo quand photoUrl existe
- Le lien pointe vers `/offers/[id]`
- Article a `aria-labelledby` correct

**Tests OfferList (`offer-list.test.tsx`):**
- Rend la liste des offres
- Bouton "Actualiser" présent
- Click sur "Actualiser" appelle `router.refresh()`

**Tests OfferCardSkeleton (`offer-card-skeleton.test.tsx`):**
- `OfferCardSkeleton` rend des éléments Skeleton
- `OfferListSkeleton` rend 3 skeletons

**Pattern de test — identique stories précédentes:**
- `@testing-library/react` + `vitest`
- `screen.getByText()` / `screen.getByRole()` / `screen.getByLabelText()`
- Mock `next/navigation` pour `useRouter` et `Link`
- Mock `next/link` si nécessaire (ou utiliser le default de testing-library)

### UX Considerations

**OfferCard design (UX Spec):**
- Card-based layout: photo + infos clés scanables en un coup d'oeil [Source: ux-design-specification.md#OfferCard]
- Chiffres en `tabular-nums` pour alignement vertical [Source: ux-design-specification.md#Typography]
- Shadow-sm au repos, shadow-md au hover [Source: ux-design-specification.md#Shadows]
- Badge couleur selon statut — vert/gris/orange

**Loading (UX Spec):**
- 3 skeleton cards pendant le chargement [Source: ux-design-specification.md#Loading States]
- Skeleton avec même forme que les OfferCards

**Interactions (UX Spec):**
- Pull-to-refresh ou bouton actualiser [Source: ux-design-specification.md#Transferable UX Patterns]
- Touch target 44px minimum [Source: ux-design-specification.md#Touch targets]
- Cards avec `article` role + `aria-labelledby` [Source: ux-design-specification.md#OfferCard Accessibility]

**Mobile-first:**
- Cards full-width sur mobile (single column)
- Responsive: 2 colonnes sur tablette (`md`), 3 sur desktop (`lg`) — mais pour le MVP, une seule colonne suffit car le layout mobile est le use case primaire

### Security Considerations

- **Isolation FR32:** Les offres sont TOUJOURS filtrées par `supplierId: user.id` dans la query Prisma du dashboard RSC
- **Pas de données sensibles exposées:** La marge n'est PAS affichée dans la card fournisseur (elle le sera dans le détail, Story 2.5)
- **Photos publiques:** Les URLs de photos sont publiques (bucket `offer-photos` avec policy SELECT public) — pas de problème de sécurité
- **Pas de Server Action dans cette story** — lecture seule via RSC

### Prisma Schema — Rappel (AUCUNE modification nécessaire)

Le modèle `Offer` dans `prisma/schema.prisma` contient déjà tous les champs nécessaires. Aucune migration requise pour cette story.

Champs utilisés dans OfferCard:
```prisma
id              String        @id @default(uuid()) @db.Uuid
name            String
promoPrice      Decimal       @map("promo_price") @db.Decimal(10, 2)
discountPercent Int           @map("discount_percent")
startDate       DateTime      @map("start_date") @db.Date
endDate         DateTime      @map("end_date") @db.Date
photoUrl        String?       @map("photo_url")
status          OfferStatus   @default(DRAFT)
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.4: Liste des Offres Fournisseur]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#OfferCard]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Loading States]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy]
- [Source: _bmad-output/planning-artifacts/prd.md#FR10 - Liste des offres fournisseur]
- [Source: _bmad-output/planning-artifacts/prd.md#FR11 - Statut des offres]
- [Source: _bmad-output/planning-artifacts/prd.md#FR32 - Isolation données fournisseur]
- [Source: _bmad-output/project-context.md#Next.js Rules]
- [Source: _bmad-output/project-context.md#Anti-Patterns]
- [Source: _bmad-output/implementation-artifacts/2-3-enrichissement-offre-champs-optionnels.md]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Skeleton test: ajusté de 15 à 18 (6 skeletons par card x 3 = 18)
- Dashboard page test: mis à jour mock offer avec Date/Decimal complets pour `serializeOffer`

### Completion Notes List

- Task 2: `getOfferDisplayStatus` créé dans `offers.ts` — auto-expiration par comparaison `endDate < today`, labels FR, variants Badge avec className custom pour couleurs vert/orange
- Task 3: `formatPrice`, `formatDateRange`, `formatDiscount` créés dans `format.ts` — utilisation exclusive de `Intl` natif (fr-FR), zéro dépendance externe
- Task 1: `OfferCard` composant sans `"use client"` — Link wrapping Card avec photo/placeholder, Badge coloré, opacity-60 pour expirées, article + aria-labelledby
- Task 4: `OfferCardSkeleton` et `OfferListSkeleton` (3 cards) avec composant Skeleton shadcn/ui
- Task 5: `OfferList` client component — bouton Actualiser avec `useTransition` + `router.refresh()`, spinner animé
- Task 6: Dashboard page mis à jour — placeholder remplacé par `OfferList`, `serializeOffer` pour la boundary RSC→Client, `loading.tsx` créé
- Task 7: 5 fichiers de test créés (42 nouveaux tests), 366/366 total passent, build OK, lint 0 erreurs
- Décision technique: `SerializedOffer` type créé pour sérialisation Prisma Decimal→number et Date→string à la boundary RSC→Client
- Décision technique: Badge `variant` + `className` custom pour couleurs (vert active, gris expired, orange draft) car variants `success`/`warning` absentes de shadcn Badge

### Change Log

- 2026-02-06: Implémentation complète Story 2.4 — OfferCard, utilitaires formatage/statut, OfferList refresh, skeleton loading, dashboard intégration
- 2026-02-06: Code review — 4 fixes appliqués: (H1) mock Decimal corrigé + assertions prix dans page.test, (M1) `<img>` remplacé par `<Image>` next/image + remotePatterns Supabase configuré, (M2) test edge case endDate=today ajouté, (M3) taille police nom produit corrigée text-sm→text-lg

### File List

**Fichiers créés:**
- `src/lib/utils/offers.ts` — getOfferDisplayStatus, serializeOffer, SerializedOffer type
- `src/lib/utils/offers.test.ts` — 13 tests (statut display, sérialisation)
- `src/lib/utils/format.ts` — formatPrice, formatDateRange, formatDiscount
- `src/lib/utils/format.test.ts` — 11 tests (prix, dates, remise)
- `src/components/custom/offer-card.tsx` — Composant OfferCard
- `src/components/custom/offer-card.test.tsx` — 12 tests (rendu, badge, photo, lien, a11y)
- `src/components/custom/offer-card-skeleton.tsx` — OfferCardSkeleton + OfferListSkeleton
- `src/components/custom/offer-card-skeleton.test.tsx` — 2 tests (skeleton rendering)
- `src/components/custom/offer-list.tsx` — OfferList client avec refresh
- `src/components/custom/offer-list.test.tsx` — 3 tests (liste, bouton refresh, router.refresh)
- `src/app/(supplier)/dashboard/loading.tsx` — Skeleton loading page

**Fichiers modifiés:**
- `src/app/(supplier)/dashboard/page.tsx` — Remplacé placeholder par OfferList + serializeOffer
- `src/app/(supplier)/dashboard/page.test.tsx` — Mis à jour test mock pour offres avec types complets + fix mock Decimal + assertions prix/remise
- `src/components/custom/offer-card.tsx` — [Review fix] `<img>` → `<Image>` next/image, text-sm → text-lg
- `src/components/custom/offer-card.test.tsx` — [Review fix] Adapté assertion src pour next/image
- `src/lib/utils/offers.test.ts` — [Review fix] Ajouté test edge case endDate=today
- `next.config.ts` — [Review fix] Ajouté remotePatterns Supabase pour next/image
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — 2-4 status: review → done
