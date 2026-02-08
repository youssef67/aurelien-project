# Story 3.1: Liste des Offres Disponibles

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

En tant que **chef de rayon (magasin)**,
Je veux **voir la liste de toutes les offres promotionnelles disponibles**,
Afin de **découvrir les opportunités de mes fournisseurs**.

## Acceptance Criteria

### AC1: Affichage de toutes les offres actives
**Given** je suis connecté en tant que magasin
**When** j'accède à `/offers` (page d'accueil magasin via bottom nav)
**Then** la liste de TOUTES les offres actives de TOUS les fournisseurs s'affiche
**And** seules les offres avec `status === 'ACTIVE'` ET `endDate >= aujourd'hui` ET `deletedAt === null` sont visibles
**And** les offres sont triées par date de création (plus récentes en premier)

### AC2: Contenu de chaque StoreOfferCard
**Given** des offres existent
**When** la liste se charge
**Then** chaque StoreOfferCard affiche:
- Photo du produit (ou placeholder icône `Package` si pas de photo)
- Nom du produit
- Prix promo (format `XX,XX €`)
- Remise en % (format `-XX%`)
- **Nom du fournisseur** (company_name de la relation supplier)
- **Catégorie** (label français de l'enum OfferCategory)
- Dates de validité (format: "15 fév - 28 fév")
**And** un badge "Nouveau" apparaît sur les offres créées dans les dernières 48h

### AC3: Badge "Nouveau" pour offres récentes
**Given** une offre a été créée il y a moins de 48h (`createdAt > now() - 48h`)
**When** la liste se charge
**Then** un badge "Nouveau" vert apparaît en haut à droite de la card
**And** le badge utilise le variant `default` avec className `bg-emerald-600`

**Given** une offre a été créée il y a plus de 48h
**When** la liste se charge
**Then** aucun badge "Nouveau" n'apparaît sur cette card

### AC4: Skeleton loading pendant le chargement
**Given** la page `/offers` se charge
**When** les données ne sont pas encore disponibles
**Then** 3 skeleton cards s'affichent avec la forme des StoreOfferCards
**And** les skeletons ont la même structure: image placeholder + lignes de texte

### AC5: Empty state quand aucune offre disponible
**Given** aucune offre active n'existe
**When** la liste se charge
**Then** un empty state s'affiche avec message "Aucune offre disponible pour le moment"
**And** une illustration (icône `PackageSearch`) accompagne le message

### AC6: Pull-to-refresh
**Given** je veux actualiser la liste
**When** je clique sur le bouton "Actualiser"
**Then** la liste est rechargée depuis le serveur via `router.refresh()`
**And** un indicateur de chargement s'affiche pendant le refresh

### AC7: Navigation vers le détail (lien préparé)
**Given** je clique sur une StoreOfferCard
**When** l'action est déclenchée
**Then** je suis redirigé vers `/offers/[id]`
**And** (Note: la page détail sera implémentée en Story 3.5 — le lien doit pointer vers le bon URL)

### AC8: Store layout avec MobileLayout et BottomNavigation
**Given** je suis connecté en tant que magasin
**When** j'accède à `/offers`
**Then** le layout inclut MobileLayout avec BottomNavigation (store)
**And** l'item "Offres" est actif dans la bottom nav
**And** l'auth est vérifiée : si pas connecté → redirect `/login`
**And** le rôle est vérifié : si pas magasin (pas de profil `store`) → redirect `/login`

### AC9: Performance
**Given** la liste contient de nombreuses offres
**When** je scroll
**Then** le scroll est fluide (60fps — NFR4)
**And** les images sont chargées en lazy loading
**And** la page se charge en < 2 secondes (NFR1)

## Tasks / Subtasks

- [x] **Task 1: Mettre à jour le Store layout avec auth/role check et MobileLayout** (AC: 8)
  - [x] 1.1 Modifier `/src/app/(store)/layout.tsx`
  - [x] 1.2 Ajouter auth check: `createClient()` → `supabase.auth.getUser()` → redirect `/login` si pas connecté
  - [x] 1.3 Ajouter role check: `prisma.store.findUnique({ where: { id: user.id } })` → redirect `/login` si pas magasin
  - [x] 1.4 Wrapper avec `<MobileLayout bottomNav={<BottomNavigation />}>`
  - [x] 1.5 Suivre le MÊME pattern que `(supplier)/layout.tsx`

- [x] **Task 2: Créer le module queries offers** (AC: 1)
  - [x] 2.1 Créer `/src/lib/queries/offers.ts`
  - [x] 2.2 Créer `getActiveOffers()` — requête Prisma pour toutes les offres actives non supprimées
  - [x] 2.3 Include `supplier` relation (pour `companyName`)
  - [x] 2.4 Filtres: `status: 'ACTIVE'`, `deletedAt: null`, `endDate >= today`
  - [x] 2.5 OrderBy: `createdAt: 'desc'`

- [x] **Task 3: Créer la fonction utilitaire `getCategoryLabel`** (AC: 2)
  - [x] 3.1 Dans `/src/lib/utils/offers.ts`, ajouter `getCategoryLabel(category: OfferCategory): string`
  - [x] 3.2 Mapper les enums vers les labels FR: EPICERIE→"Épicerie", FRAIS→"Frais", DPH→"DPH", SURGELES→"Surgelés", BOISSONS→"Boissons", AUTRES→"Autres"
  - [x] 3.3 Ajouter `isNewOffer(createdAt: Date | string): boolean` — retourne `true` si < 48h

- [x] **Task 4: Créer le composant StoreOfferCard** (AC: 2, 3, 7)
  - [x] 4.1 Créer `/src/components/custom/store-offer-card.tsx` (PAS `"use client"`)
  - [x] 4.2 Props: `{ offer: SerializedOfferWithSupplier }` — extend SerializedOffer avec `supplier: { companyName: string }`
  - [x] 4.3 Structure: `<Link href={/offers/${offer.id}}>` wrapping un `<Card>`
  - [x] 4.4 Photo: `<Image>` next/image avec `src={offer.photoUrl}` ou placeholder icône `Package`
  - [x] 4.5 Infos: nom produit, fournisseur + catégorie (`text-sm text-muted-foreground`), prix + remise, dates
  - [x] 4.6 Badge "Nouveau" conditionnel via `isNewOffer(offer.createdAt)`
  - [x] 4.7 Accessibilité: `<article>` avec `aria-labelledby`

- [x] **Task 5: Créer StoreOfferCardSkeleton** (AC: 4)
  - [x] 5.1 Créer `/src/components/custom/store-offer-card-skeleton.tsx`
  - [x] 5.2 Utiliser composant `Skeleton` shadcn/ui
  - [x] 5.3 Exporter `StoreOfferListSkeleton` (3 skeletons)

- [x] **Task 6: Créer StoreOfferList client component** (AC: 6)
  - [x] 6.1 Créer `/src/components/custom/store-offer-list.tsx` avec `"use client"`
  - [x] 6.2 Props: `{ offers: SerializedOfferWithSupplier[] }`
  - [x] 6.3 Bouton "Actualiser" avec `useTransition` + `router.refresh()`
  - [x] 6.4 Map des offres vers `<StoreOfferCard>`

- [x] **Task 7: Créer la page Store Offers** (AC: 1, 5, 7)
  - [x] 7.1 Créer `/src/app/(store)/offers/page.tsx` (Server Component)
  - [x] 7.2 Fetch via `getActiveOffers()`
  - [x] 7.3 Sérialiser les offres avec `serializeOfferWithSupplier()`
  - [x] 7.4 Empty state si aucune offre
  - [x] 7.5 `<PageHeader title="Offres disponibles" />`
  - [x] 7.6 Metadata: `export const metadata = { title: 'Offres disponibles' }`

- [x] **Task 8: Créer loading.tsx** (AC: 4)
  - [x] 8.1 Créer `/src/app/(store)/offers/loading.tsx`
  - [x] 8.2 Utiliser `<StoreOfferListSkeleton />`

- [x] **Task 9: Tests** (AC: 1-9)
  - [x] 9.1 `/src/lib/queries/offers.test.ts` — tests getActiveOffers
  - [x] 9.2 `/src/lib/utils/offers.test.ts` — ajouter tests getCategoryLabel, isNewOffer
  - [x] 9.3 `/src/components/custom/store-offer-card.test.tsx` — tests composant
  - [x] 9.4 `/src/components/custom/store-offer-list.test.tsx` — tests liste avec refresh
  - [x] 9.5 `/src/app/(store)/offers/page.test.tsx` — tests page RSC
  - [x] 9.6 Tous les tests passent (`npm run test`)
  - [x] 9.7 `npm run build` passe
  - [x] 9.8 `npm run lint` passe

## Dev Notes

### Architecture Compliance

**Patterns OBLIGATOIRES à suivre:**
- Server Components par défaut — page et StoreOfferCard sont RSC, StoreOfferList est `"use client"` seulement pour le refresh [Source: project-context.md#Next.js Rules]
- Fichiers en `kebab-case`, composants en `PascalCase` [Source: architecture.md#Naming Patterns]
- Tests co-localisés `*.test.ts(x)` à côté du source [Source: architecture.md#Structure Patterns]
- `"use client"` UNIQUEMENT sur `StoreOfferList` — NE PAS mettre sur `StoreOfferCard` [Source: project-context.md#Anti-Patterns]
- Données fetchées en RSC via Prisma, refresh via `router.refresh()` — PAS de React Query pour cette story [Cohérence avec le pattern OfferList fournisseur]
- `<Image>` de `next/image` pour les photos — PAS `<img>` [Lesson Story 2.4 code review]

### Store Layout — Auth + Role Check Pattern

```typescript
// src/app/(store)/layout.tsx — MODIFIER
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { BottomNavigation } from '@/components/custom/bottom-navigation'

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Vérifier que c'est un magasin (pas un fournisseur)
  const store = await prisma.store.findUnique({
    where: { id: user.id },
  })
  if (!store) redirect('/login')

  return (
    <MobileLayout bottomNav={<BottomNavigation />}>
      {children}
    </MobileLayout>
  )
}
```

**COPIER LE PATTERN EXACT du `(supplier)/layout.tsx`** — même structure, remplacer `Supplier` par `Store`, `SupplierBottomNavigation` par `BottomNavigation`.

### Query getActiveOffers — Data Fetching

```typescript
// src/lib/queries/offers.ts — CRÉER
import { prisma } from '@/lib/prisma/client'

export async function getActiveOffers() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return prisma.offer.findMany({
    where: {
      status: 'ACTIVE',
      deletedAt: null,
      endDate: { gte: today },
    },
    include: {
      supplier: {
        select: { companyName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export type OfferWithSupplier = Awaited<ReturnType<typeof getActiveOffers>>[number]
```

**CRITIQUES:**
- `endDate: { gte: today }` — aujourd'hui inclus (offre valide aujourd'hui)
- `include: { supplier: { select: { companyName: true } } }` — SEULEMENT le nom, pas toutes les infos
- Type `OfferWithSupplier` dérivé du retour Prisma — évite la duplication de types

### Sérialisation — Boundary RSC → Client

```typescript
// Dans src/lib/utils/offers.ts — AJOUTER
import type { OfferWithSupplier } from '@/lib/queries/offers'

export type SerializedOfferWithSupplier = {
  id: string
  name: string
  promoPrice: number
  discountPercent: number
  startDate: string
  endDate: string
  category: string
  subcategory: string | null
  photoUrl: string | null
  supplierId: string
  createdAt: string
  supplier: { companyName: string }
}

export function serializeOfferWithSupplier(
  offer: OfferWithSupplier
): SerializedOfferWithSupplier {
  return {
    id: offer.id,
    name: offer.name,
    promoPrice: Number(offer.promoPrice),
    discountPercent: offer.discountPercent,
    startDate: offer.startDate.toISOString(),
    endDate: offer.endDate.toISOString(),
    category: offer.category,
    subcategory: offer.subcategory,
    photoUrl: offer.photoUrl,
    supplierId: offer.supplierId,
    createdAt: offer.createdAt.toISOString(),
    supplier: { companyName: offer.supplier.companyName },
  }
}
```

**CRITIQUE — Sérialisation Prisma Decimal→number et Date→string:**
- Les `Decimal` Prisma ne sont PAS sérialisables par Next.js RSC → Client boundary
- Les `Date` Prisma ne sont PAS sérialisables non plus
- Il FAUT convertir AVANT de passer en props au client component
- Même pattern que `serializeOffer()` existant, mais avec la relation `supplier`

### Utilitaires — getCategoryLabel et isNewOffer

```typescript
// Dans src/lib/utils/offers.ts — AJOUTER

import type { OfferCategory } from '@prisma/client'

const CATEGORY_LABELS: Record<OfferCategory, string> = {
  EPICERIE: 'Épicerie',
  FRAIS: 'Frais',
  DPH: 'DPH',
  SURGELES: 'Surgelés',
  BOISSONS: 'Boissons',
  AUTRES: 'Autres',
}

export function getCategoryLabel(category: OfferCategory | string): string {
  return CATEGORY_LABELS[category as OfferCategory] ?? category
}

export function isNewOffer(createdAt: Date | string): boolean {
  const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
  const fortyEightHoursAgo = new Date()
  fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48)
  return created > fortyEightHoursAgo
}
```

### StoreOfferCard — Structure

```typescript
// src/components/custom/store-offer-card.tsx
// PAS de "use client" — Server Component

import Link from 'next/link'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDateRange, formatDiscount } from '@/lib/utils/format'
import { getCategoryLabel, isNewOffer } from '@/lib/utils/offers'
import type { SerializedOfferWithSupplier } from '@/lib/utils/offers'

interface StoreOfferCardProps {
  offer: SerializedOfferWithSupplier
}

export function StoreOfferCard({ offer }: StoreOfferCardProps) {
  const isNew = isNewOffer(offer.createdAt)

  return (
    <Link href={`/offers/${offer.id}`}>
      <article
        aria-labelledby={`offer-${offer.id}-title`}
        className="transition-shadow hover:shadow-md"
      >
        <Card>
          <CardContent className="flex gap-3 p-3">
            {/* Photo ou placeholder */}
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
              {offer.photoUrl ? (
                <Image
                  src={offer.photoUrl}
                  alt={offer.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              {isNew && (
                <Badge
                  className="absolute top-1 right-1 bg-emerald-600 text-white text-[10px] px-1.5 py-0"
                >
                  Nouveau
                </Badge>
              )}
            </div>

            {/* Informations */}
            <div className="flex flex-1 flex-col justify-between min-w-0">
              <div>
                <h3
                  id={`offer-${offer.id}-title`}
                  className="text-lg font-semibold leading-tight truncate"
                >
                  {offer.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {offer.supplier.companyName} • {getCategoryLabel(offer.category)}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-semibold tabular-nums">
                  {formatPrice(offer.promoPrice)}
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

**Différences vs OfferCard fournisseur:**
- Affiche `supplier.companyName` + catégorie (au lieu du badge de statut)
- Badge "Nouveau" conditionnel (au lieu de Active/Expiré/Brouillon)
- Pas d'opacité réduite (toutes les offres affichées sont actives)
- NE PAS réutiliser le composant `OfferCard` existant — les besoins sont trop différents

### StoreOfferList — Client Component

```typescript
// src/components/custom/store-offer-list.tsx
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StoreOfferCard } from '@/components/custom/store-offer-card'
import { cn } from '@/lib/utils/cn'
import type { SerializedOfferWithSupplier } from '@/lib/utils/offers'

interface StoreOfferListProps {
  offers: SerializedOfferWithSupplier[]
}

export function StoreOfferList({ offers }: StoreOfferListProps) {
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
          <StoreOfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  )
}
```

**MÊME pattern exact que `OfferList` fournisseur.** `useTransition` + `router.refresh()`.

### Page Store Offers

```typescript
// src/app/(store)/offers/page.tsx
import type { Metadata } from 'next'
import { PackageSearch } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { StoreOfferList } from '@/components/custom/store-offer-list'
import { getActiveOffers } from '@/lib/queries/offers'
import { serializeOfferWithSupplier } from '@/lib/utils/offers'

export const metadata: Metadata = {
  title: 'Offres disponibles',
}

export default async function StoreOffersPage() {
  const offers = await getActiveOffers()
  const serializedOffers = offers.map(serializeOfferWithSupplier)

  return (
    <>
      <PageHeader title="Offres disponibles" />
      <div className="flex-1 overflow-auto p-4">
        {serializedOffers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PackageSearch className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Aucune offre disponible
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Aucune offre disponible pour le moment. Revenez bientôt !
            </p>
          </div>
        ) : (
          <StoreOfferList offers={serializedOffers} />
        )}
      </div>
    </>
  )
}
```

**PAS d'auth check dans la page** — c'est le layout `(store)/layout.tsx` qui gère l'auth et le role check.

### Loading Skeleton

```typescript
// src/app/(store)/offers/loading.tsx
import { PageHeader } from '@/components/layout/page-header'
import { StoreOfferListSkeleton } from '@/components/custom/store-offer-card-skeleton'

export default function StoreOffersLoading() {
  return (
    <>
      <PageHeader title="Offres disponibles" />
      <div className="flex-1 overflow-auto p-4">
        <StoreOfferListSkeleton />
      </div>
    </>
  )
}
```

### Project Structure Notes

**Fichiers à créer:**
- `/src/lib/queries/offers.ts` — Module queries offres (getActiveOffers)
- `/src/lib/queries/offers.test.ts` — Tests queries
- `/src/components/custom/store-offer-card.tsx` — Card offre côté magasin
- `/src/components/custom/store-offer-card.test.tsx` — Tests card
- `/src/components/custom/store-offer-card-skeleton.tsx` — Skeleton loading
- `/src/components/custom/store-offer-list.tsx` — Liste avec refresh (client)
- `/src/components/custom/store-offer-list.test.tsx` — Tests liste
- `/src/app/(store)/offers/page.tsx` — Page liste offres magasin
- `/src/app/(store)/offers/page.test.tsx` — Tests page
- `/src/app/(store)/offers/loading.tsx` — Loading skeleton

**Fichiers à modifier:**
- `/src/app/(store)/layout.tsx` — Ajouter auth/role check + MobileLayout + BottomNavigation
- `/src/lib/utils/offers.ts` — Ajouter getCategoryLabel, isNewOffer, serializeOfferWithSupplier, SerializedOfferWithSupplier
- `/src/lib/utils/offers.test.ts` — Ajouter tests des nouvelles fonctions

**Fichiers existants à réutiliser (NE PAS recréer):**
- `/src/components/ui/card.tsx` → Card, CardContent
- `/src/components/ui/badge.tsx` → Badge (variants: default, secondary, destructive, outline, ghost, link)
- `/src/components/ui/skeleton.tsx` → Skeleton
- `/src/components/ui/button.tsx` → Button
- `/src/components/layout/page-header.tsx` → PageHeader
- `/src/components/layout/mobile-layout.tsx` → MobileLayout
- `/src/components/custom/bottom-navigation.tsx` → BottomNavigation (store, routes: /offers, /requests, /profile)
- `/src/lib/utils/cn.ts` → `cn()`
- `/src/lib/utils/format.ts` → formatPrice, formatDateRange, formatDiscount (DÉJÀ IMPLÉMENTÉS)
- `/src/lib/utils/offers.ts` → getOfferDisplayStatus, serializeOffer, SerializedOffer (EXISTANTS — les garder, ajouter les nouveaux)
- `/src/lib/prisma/client.ts` → `prisma`
- `/src/lib/supabase/server.ts` → `createClient()`
- `/src/types/api.ts` → `ActionResult`, `ErrorCode`
- `next.config.ts` → remotePatterns Supabase DÉJÀ configuré pour next/image

**NE PAS installer de nouvelle dépendance.** Tout est déjà disponible.

### Previous Story Intelligence

**Story 2.6 (dernière complétée) — Learnings critiques:**
- `params` est une `Promise` dans Next.js 15 → `const { id } = await params` (si needed)
- Prisma uses DATABASE_URL = service role → RLS contournée, le contrôle d'accès applicatif EST la vraie barrière
- Tests avec `vitest` + `@testing-library/react`
- Mock `next/navigation`, `next/cache`, Supabase et Prisma
- 451 tests verts au total — ne pas casser les tests existants

**Story 2.4 — Learnings critiques pour la liste:**
- `SerializedOffer` type existe pour sérialisation Prisma → Client boundary
- `formatPrice`, `formatDateRange`, `formatDiscount` sont dans `/src/lib/utils/format.ts`
- `getOfferDisplayStatus`, `serializeOffer` sont dans `/src/lib/utils/offers.ts`
- OfferCard utilise `<Image>` de next/image (PAS `<img>`) — corrigé en code review 2.4
- OfferList utilise `useTransition` + `router.refresh()` — pattern à reproduire
- Badge variants custom via `className` (pas de variant success/warning natif)
- `next.config.ts` a déjà `remotePatterns` pour Supabase Storage (`*.supabase.co`)

**Story 2.2 — Code review issues (à ne pas reproduire):**
- RLS contournée par Prisma — toujours ajouter les filtres applicatifs
- Zod 4 API utilisé dans le projet

### Routing — Note Architecturale IMPORTANTE

**Pas de conflit pour cette story:**
- `(store)/offers/page.tsx` → `/offers` ✓ (pas de `(supplier)/offers/page.tsx` — la liste fournisseur est à `/dashboard`)

**Conflit FUTUR à anticiper (Story 3.5):**
- `(supplier)/offers/[id]/page.tsx` existe déjà → `/offers/[id]`
- `(store)/offers/[id]/page.tsx` sera nécessaire → CONFLIT avec la route ci-dessus
- **Solution recommandée pour Story 3.5:** Créer un seul `offers/[id]/page.tsx` partagé qui rend différemment selon le rôle, OU restructurer les routes supplier
- Pour cette Story 3.1: le `<Link href={/offers/${offer.id}}>` pointe vers la route existante, la page détail store sera ajoutée dans Story 3.5

### Library & Framework Requirements

**Dépendances déjà installées (NE PAS réinstaller):**
- `next@16.1.6` — Framework (App Router, RSC, next/image)
- `react@19.2.3` — UI
- `@prisma/client@^6.19.2` — ORM (types Offer, OfferCategory, OfferStatus, Supplier)
- `lucide-react@^0.563.0` — Icônes (Package, PackageSearch, RefreshCw)
- `tailwindcss` — Styling
- `sonner@^2.0.7` — Toast (si besoin)

**Composants shadcn/ui disponibles:** Card, Badge, Button, Skeleton, Sheet, Tabs, Dialog, etc.

**AUCUNE nouvelle dépendance requise.**

### Testing Requirements

**Tests queries (`queries/offers.test.ts`):**
- `getActiveOffers` retourne les offres actives, non supprimées, avec endDate >= today
- `getActiveOffers` exclut les offres DRAFT
- `getActiveOffers` exclut les offres soft-deleted
- `getActiveOffers` exclut les offres expirées (endDate < today)
- `getActiveOffers` inclut la relation supplier.companyName
- `getActiveOffers` trie par createdAt desc

**Tests utilitaires (ajouter à `offers.test.ts`):**
- `getCategoryLabel('EPICERIE')` → `"Épicerie"`
- `getCategoryLabel('FRAIS')` → `"Frais"`
- `getCategoryLabel` pour chaque valeur de l'enum
- `isNewOffer(new Date())` → `true`
- `isNewOffer(date 3 jours avant)` → `false`
- `isNewOffer(date exactement 48h)` — edge case
- `serializeOfferWithSupplier` convertit correctement les types

**Tests StoreOfferCard (`store-offer-card.test.tsx`):**
- Affiche le nom du produit
- Affiche le prix formaté
- Affiche la remise
- Affiche le nom du fournisseur
- Affiche la catégorie (label FR)
- Affiche les dates
- Affiche badge "Nouveau" si offre récente
- N'affiche PAS badge "Nouveau" si offre ancienne
- Affiche placeholder Package quand pas de photo
- Affiche Image quand photoUrl existe
- Le lien pointe vers `/offers/[id]`

**Tests StoreOfferList (`store-offer-list.test.tsx`):**
- Rend la liste des offres
- Bouton "Actualiser" présent
- Click sur "Actualiser" appelle router.refresh()

**Tests page (`page.test.tsx`):**
- Affiche la liste quand des offres existent
- Affiche l'empty state quand aucune offre
- Appelle getActiveOffers

**Pattern de test identique aux stories précédentes:**
- `@testing-library/react` + `vitest`
- Mock `next/navigation` (`useRouter`, `Link`)
- Mock `next/image` (`Image`)
- Mock Prisma (`@/lib/prisma/client`)
- Mock Supabase (`@/lib/supabase/server`)

### Security Considerations

- **Pas de données sensibles dans la liste:** La marge n'est PAS affichée dans la card (elle sera visible uniquement dans le détail — Story 3.5, FR34)
- **Isolation:** Les offres sont publiques pour tous les magasins — pas de filtre par store_id
- **Auth:** Le layout `(store)` vérifie que l'utilisateur est un magasin
- **Photos publiques:** Les URLs Supabase Storage sont publiques (bucket `offer-photos`)
- **Pas de Server Action dans cette story** — lecture seule via RSC

### UX Considerations

- **Card-based layout:** 1 offre = 1 card (photo + infos) [Source: ux-design-specification.md#OfferCard]
- **Badge "Nouveau":** Vert (emerald-600), discret, en haut à droite de la photo [Source: ux-design-specification.md#Badge]
- **Fournisseur + Catégorie:** Info secondaire sous le nom produit [Source: epics.md#Story 3.1]
- **Loading:** 3 skeleton cards [Source: ux-design-specification.md#Loading States]
- **Empty state:** Illustration + message + pas de CTA actif [Source: ux-design-specification.md#Empty States]
- **Pull-to-refresh:** Bouton "Actualiser" [Source: ux-design-specification.md#Interaction Patterns]
- **Touch target:** Cards clickables en entier, minimum 44px hauteur [Source: ux-design-specification.md#Touch targets]
- **Chiffres tabular-nums:** Pour alignement vertical [Source: ux-design-specification.md#Typography]
- **Mobile-first:** Cards full-width en colonne simple

### Prisma Schema — Rappel (AUCUNE modification requise)

L'Offer et Supplier existent déjà avec la relation bidirectionnelle. La query `include: { supplier: true }` fonctionne nativement.

```prisma
model Offer {
  // ... tous les champs
  supplier Supplier @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  @@index([status, startDate, endDate])  // Index utilisé par la query
}

model Supplier {
  // ... tous les champs
  offers Offer[]
}
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1: Liste des Offres Disponibles]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#OfferCard]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Loading States]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy]
- [Source: _bmad-output/planning-artifacts/prd.md#FR12 - Consultation liste offres]
- [Source: _bmad-output/project-context.md#Next.js Rules]
- [Source: _bmad-output/project-context.md#Anti-Patterns]
- [Source: _bmad-output/implementation-artifacts/2-4-liste-des-offres-fournisseur.md]
- [Source: _bmad-output/implementation-artifacts/2-6-suppression-offre.md]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Route conflict: `(supplier)/offers/page.tsx` (redirect to `/dashboard`) conflicted with new `(store)/offers/page.tsx`. Resolved by removing the redirect — supplier nav points to `/dashboard`, not `/offers`.

### Completion Notes List

- Task 1: Store layout updated with auth check (Supabase getUser) + role check (Prisma store.findUnique) + MobileLayout + BottomNavigation. Follows exact supplier layout pattern.
- Task 2: Created `getActiveOffers()` query with filters: ACTIVE status, non-deleted, endDate >= today, includes supplier.companyName, ordered by createdAt desc.
- Task 3: Added `getCategoryLabel()` (6 category mappings FR), `isNewOffer()` (48h threshold), `serializeOfferWithSupplier()` (Decimal→number, Date→string).
- Task 4: StoreOfferCard RSC with photo/placeholder, supplier name + category, price + discount, date range, conditional "Nouveau" badge (emerald-600), Link to `/offers/[id]`, article with aria-labelledby.
- Task 5: StoreOfferCardSkeleton + StoreOfferListSkeleton (3 cards) using shadcn Skeleton.
- Task 6: StoreOfferList client component with `useTransition` + `router.refresh()` pattern.
- Task 7: StoreOffersPage RSC — fetches via getActiveOffers, serializes, renders list or empty state with PackageSearch icon.
- Task 8: loading.tsx with PageHeader + StoreOfferListSkeleton.
- Task 9: 495 tests pass (38 files), build OK, lint OK. New tests: 7 query tests, 18 utils tests, 11 StoreOfferCard tests, 3 StoreOfferList tests, 3 page tests.
- Route conflict resolved: Removed `(supplier)/offers/page.tsx` redirect — no impact since supplier nav uses `/dashboard`.

### File List

**Created:**
- `src/lib/queries/offers.ts` — getActiveOffers query + OfferWithSupplier type
- `src/lib/queries/offers.test.ts` — 7 tests for query filters, sorting, includes
- `src/components/custom/store-offer-card.tsx` — StoreOfferCard RSC
- `src/components/custom/store-offer-card.test.tsx` — 11 tests
- `src/components/custom/store-offer-card-skeleton.tsx` — Skeleton + ListSkeleton
- `src/components/custom/store-offer-list.tsx` — Client component with refresh
- `src/components/custom/store-offer-list.test.tsx` — 3 tests
- `src/app/(store)/offers/page.tsx` — Store offers page RSC
- `src/app/(store)/offers/page.test.tsx` — 3 tests
- `src/app/(store)/offers/loading.tsx` — Loading skeleton page

**Modified:**
- `src/app/(store)/layout.tsx` — Added auth/role check + MobileLayout + BottomNavigation
- `src/lib/utils/offers.ts` — Added getCategoryLabel, isNewOffer, SerializedOfferWithSupplier, serializeOfferWithSupplier
- `src/lib/utils/offers.test.ts` — Added 18 tests for new utils

**Deleted:**
- `src/app/(supplier)/offers/page.tsx` — Removed redirect (route conflict with store offers page)

## Senior Developer Review (AI)

**Reviewer:** Youssef — 2026-02-08
**Outcome:** Approved with fixes applied

### Issues Found & Fixed (6 HIGH + MEDIUM)

| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| H1 | HIGH | Missing 48h boundary edge case test for `isNewOffer` | Added test in `offers.test.ts` — verifies `false` at exactly 48h |
| H2 | HIGH | `getActiveOffers` date filter uses server-local timezone (`setHours`) | Changed to `setUTCHours(0,0,0,0)` in query + test |
| H3 | HIGH | Supplier at `/offers` redirected to `/login` despite being authenticated | Changed redirect from `/login` to `/` in store layout |
| M1 | MEDIUM | Test mock uses invalid `FRUITS_LEGUMES` category (not in Prisma enum) | Changed to `EPICERIE` in `createMockOffer` |
| M2 | MEDIUM | `as never` type assertion bypasses type checking in page test | Replaced with typed `createMockOfferWithSupplier()` helper |
| M3 | MEDIUM | StoreOfferList test doesn't verify transition loading state | Added test for initial button state (not disabled, no spinner) |

### Low Issues (not fixed — documented only)
- L1: Redundant `loading="lazy"` on next/image (default behavior)
- L2: No `error.tsx` boundary for store offers route
- L3: Story Dev Notes claim StoreOfferCard is RSC but it's rendered in client boundary

### Test Results Post-Fix
- 497 tests pass (38 files) — +2 tests added
- Build: OK
- Lint: OK

### Change Log
- 2026-02-08: Code review — 6 issues fixed (3 HIGH, 3 MEDIUM), 3 LOW documented
