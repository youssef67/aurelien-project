# Story 3.4: Filtrage par Enseigne Compatible

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

En tant que **chef de rayon (magasin)**,
Je veux **filtrer les offres compatibles avec mon enseigne**,
Afin de **voir uniquement les promotions que je peux commander**.

## Acceptance Criteria

### AC1: Pas de filtre enseigne par défaut
**Given** mon profil magasin a une enseigne définie (ex: Leclerc)
**When** j'accède à la liste des offres `/offers`
**Then** par défaut, toutes les offres sont affichées (pas de filtre enseigne automatique)

### AC2: Section filtre enseigne dans le Sheet
**Given** le Sheet de filtres avancés est ouvert
**When** je consulte les options de filtre
**Then** une section "Enseigne compatible" est visible après les sections date et fournisseur
**And** deux options radio sont disponibles : "Toutes les enseignes" (défaut) et "Mon enseigne uniquement ({brandLabel})"
**And** {brandLabel} est le nom lisible de mon enseigne (ex: "Leclerc", "Intermarché")

### AC3: Application du filtre enseigne
**Given** je sélectionne "Mon enseigne uniquement"
**When** je clique sur "Appliquer"
**Then** le Sheet se ferme
**And** le badge sur l'icône filtres s'incrémente de 1
**And** le filtrage est appliqué (note MVP : toutes les offres sont compatibles → pas de changement visible)

### AC4: Combinaison avec les filtres existants (AND)
**Given** j'ai des filtres actifs (catégorie, date, fournisseur, enseigne)
**When** les filtres sont appliqués
**Then** tous les filtres se combinent en AND
**And** le badge indique le nombre total de filtres avancés actifs (0 à 3 : date + fournisseur + enseigne)
**And** les `categoryCounts` reflètent les offres APRÈS filtrage avancé (date + fournisseur + enseigne) mais AVANT catégorie

### AC5: Réinitialisation inclut le filtre enseigne
**Given** le filtre enseigne est actif
**When** je clique sur "Réinitialiser" dans le Sheet
**Then** le filtre enseigne revient à "Toutes les enseignes"
**And** les autres filtres sont aussi réinitialisés
**And** le badge disparaît

### AC6: Persistance du filtre en localStorage
**Given** j'ai appliqué le filtre enseigne
**When** je quitte et reviens sur la page `/offers`
**Then** mon filtre enseigne est restauré depuis localStorage
**And** le badge indique le nombre correct de filtres actifs

### AC7: Réinitialisation totale depuis l'empty state
**Given** des filtres (dont enseigne) sont actifs et aucune offre ne correspond
**When** je clique sur "Réinitialiser les filtres" dans l'empty state
**Then** TOUS les filtres sont réinitialisés (catégorie + date + fournisseur + enseigne)

### AC8: Note MVP — Comportement actuel
**Note:** Pour le MVP, toutes les offres sont compatibles avec toutes les enseignes. Le filtre "Mon enseigne uniquement" ne masque aucune offre. L'infrastructure UI est en place pour l'évolution future où les fournisseurs pourront cibler des enseignes spécifiques sur leurs offres.

## Tasks / Subtasks

- [x] **Task 1: Passer la marque du magasin à StoreOfferList** (AC: 1, 2)
  - [x] 1.1 Modifier `src/app/(store)/offers/page.tsx` : récupérer l'utilisateur authentifié et son store profile (brand)
  - [x] 1.2 Passer `storeBrand={store.brand}` comme prop à `<StoreOfferList>`
  - [x] 1.3 Si pas de store (impossible vu le layout, mais safety) : ne pas passer la prop

- [x] **Task 2: Étendre OfferFilterSheet avec le filtre enseigne** (AC: 2, 5)
  - [x] 2.1 Modifier `src/components/custom/offer-filter-sheet.tsx`
  - [x] 2.2 Ajouter un type `BrandFilterValue = 'all' | 'my-brand'` (exporté)
  - [x] 2.3 Nouvelles props : `storeBrandLabel: string`, `brandFilter: BrandFilterValue`
  - [x] 2.4 Modifier `onApply` signature : `(date: DateFilterValue, suppliers: string[], brand: BrandFilterValue) => void`
  - [x] 2.5 Ajouter état interne `localBrandFilter` (même pattern que `localDateFilter`)
  - [x] 2.6 Ajouter section "Enseigne compatible" après "Fournisseur" : 2 radios — "Toutes les enseignes" / "Mon enseigne uniquement ({storeBrandLabel})"
  - [x] 2.7 `handleReset` remet `localBrandFilter` à `'all'`
  - [x] 2.8 `handleApply` passe `localBrandFilter` au callback `onApply`
  - [x] 2.9 Synchroniser `localBrandFilter` depuis `brandFilter` à l'ouverture du Sheet (même pattern que date/supplier)

- [x] **Task 3: Intégrer le filtre enseigne dans StoreOfferList** (AC: 1, 3, 4, 5, 6, 7)
  - [x] 3.1 Modifier `src/components/custom/store-offer-list.tsx`
  - [x] 3.2 Ajouter prop `storeBrand?: string` à l'interface `StoreOfferListProps`
  - [x] 3.3 Nouveau store `useSyncExternalStore` pour brand filter :
    - Clé : `store-offers-brand-filter`
    - Event : `brand-filter-change`
    - Validation : Set `new Set(['my-brand'])`
    - `getServerSnapshot` retourne `'all'`
  - [x] 3.4 Chaîne de filtrage : `offers → date → fournisseur → enseigne → categoryCounts → catégorie`
  - [x] 3.5 Le filtre enseigne (MVP) : si `brandFilter === 'my-brand'` → pas de filtrage réel (toutes les offres passent). Code prêt pour le futur : commentaire indiquant où ajouter le vrai filtre
  - [x] 3.6 `activeFilterCount` : `(date !== 'all' ? 1 : 0) + (supplier.length > 0 ? 1 : 0) + (brand !== 'all' ? 1 : 0)` → max 3
  - [x] 3.7 `handleApplyFilters` : signature étendue pour accepter `brand: BrandFilterValue`, sauvegarder en localStorage
  - [x] 3.8 `handleResetFilters` : supprimer aussi `BRAND_FILTER_KEY`
  - [x] 3.9 `handleResetAll` : supprimer aussi `BRAND_FILTER_KEY` et dispatch event
  - [x] 3.10 Importer `BRAND_LABELS` de `@/lib/validations/auth` pour convertir `storeBrand` en label lisible
  - [x] 3.11 Passer `storeBrandLabel` et `brandFilter` à `<OfferFilterSheet>`

- [x] **Task 4: Tests OfferFilterSheet** (AC: 2, 5)
  - [x] 4.1 Modifier `src/components/custom/offer-filter-sheet.test.tsx`
  - [x] 4.2 Tester que la section "Enseigne compatible" est affichée
  - [x] 4.3 Tester les 2 options radio : "Toutes les enseignes" (défaut) et "Mon enseigne uniquement (Leclerc)"
  - [x] 4.4 Tester que le click sur "Mon enseigne" change la sélection
  - [x] 4.5 Tester que "Appliquer" appelle `onApply` avec 3 arguments (date, suppliers, brand)
  - [x] 4.6 Tester que "Réinitialiser" remet brand à 'all'
  - [x] 4.7 Tester la pré-sélection quand `brandFilter === 'my-brand'`

- [x] **Task 5: Tests StoreOfferList** (AC: 3, 4, 6, 7)
  - [x] 5.1 Modifier `src/components/custom/store-offer-list.test.tsx`
  - [x] 5.2 Mettre à jour les tests existants : `StoreOfferList` reçoit maintenant `storeBrand="LECLERC"` dans les tests
  - [x] 5.3 Tester le badge compteur à 3 (date + fournisseur + enseigne)
  - [x] 5.4 Tester la persistance localStorage du filtre enseigne
  - [x] 5.5 Tester que `handleResetAll` réinitialise le filtre enseigne
  - [x] 5.6 Tester que le filtre enseigne MVP ne masque aucune offre (toutes passent)
  - [x] 5.7 Mettre à jour les tests existants de `handleApplyFilters` pour le nouveau 3e argument

- [x] **Task 6: Validation finale** (AC: 1-8)
  - [x] 6.1 `npm run test` — tous les tests passent
  - [x] 6.2 `npm run build` — build OK
  - [x] 6.3 `npm run lint` — 0 erreur, 0 warning
  - [x] 6.4 Tests existants non cassés (régressions vérifiées)

## Dev Notes

### Architecture Compliance

**Patterns OBLIGATOIRES à suivre:**
- `"use client"` sur `OfferFilterSheet` et `StoreOfferList` (déjà client) — filtrage 100% client-side [Source: project-context.md#Next.js Rules]
- Fichiers en `kebab-case`, composants en `PascalCase` [Source: project-context.md#Naming Conventions]
- Tests co-localisés `*.test.tsx` à côté du source [Source: project-context.md#Testing Rules]
- Utiliser le composant `Sheet` de shadcn/ui existant — NE PAS créer de custom modal
- NE PAS modifier la query `getActiveOffers()` — le filtrage est client-side
- NE PAS modifier `store-offer-card.tsx` — aucun changement sur les cards
- NE PAS modifier `category-filter-chips.tsx`
- NE PAS modifier `src/lib/utils/filters.ts` — aucun nouveau helper de date nécessaire

**Décision architecturale — Filtrage client-side (MVP no-op):**
Le filtre enseigne est purement UI pour le MVP. Toutes les offres sont compatibles avec toutes les enseignes. Quand le modèle `Offer` évoluera avec un champ `brandTargets Brand[]`, le filtre sera activé côté client avec un simple `Array.filter()`. Pas de Server Action, pas de query Prisma supplémentaire.

### Récupération du store brand dans la page RSC

Le layout `(store)/layout.tsx` vérifie déjà que l'utilisateur est authentifié et a un store profile. La page peut donc faire confiance à cette vérification. Pattern :

```typescript
// src/app/(store)/offers/page.tsx
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'

export default async function StoreOffersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const offers = await getActiveOffers()
  const serializedOffers = offers.map(serializeOfferWithSupplier)

  // Le layout garantit que user et store existent
  const store = user
    ? await prisma.store.findUnique({ where: { id: user.id }, select: { brand: true } })
    : null

  return (
    <>
      <PageHeader title="Offres disponibles" />
      <div className="flex-1 overflow-auto p-4 bg-muted">
        {serializedOffers.length === 0 ? (
          /* ... empty state inchangé ... */
        ) : (
          <StoreOfferList offers={serializedOffers} storeBrand={store?.brand} />
        )}
      </div>
    </>
  )
}
```

**IMPORTANT:** Utiliser `select: { brand: true }` pour ne récupérer que le champ nécessaire. Le layout fait déjà un `findUnique` complet — ici on fait un appel léger additionnel.

### Brand labels — Réutiliser BRAND_LABELS

```typescript
// Déjà défini dans src/lib/validations/auth.ts — NE PAS recréer
import { BRAND_LABELS, type BrandType } from '@/lib/validations/auth'

// Utilisation :
const storeBrandLabel = storeBrand ? BRAND_LABELS[storeBrand as BrandType] : undefined
// Ex: 'LECLERC' → 'Leclerc', 'INTERMARCHE' → 'Intermarché'
```

### Nouveau type BrandFilterValue

```typescript
// Dans offer-filter-sheet.tsx (exporté)
export type BrandFilterValue = 'all' | 'my-brand'
```

### Store useSyncExternalStore pour brand filter

Même pattern EXACT que date filter et supplier filter :

```typescript
// Brand filter store
const BRAND_FILTER_KEY = 'store-offers-brand-filter'
const BRAND_FILTER_EVENT = 'brand-filter-change'

const VALID_BRAND_FILTERS: ReadonlySet<string> = new Set(['my-brand'])

function subscribeBrandFilter(callback: () => void): () => void {
  window.addEventListener(BRAND_FILTER_EVENT, callback)
  return () => window.removeEventListener(BRAND_FILTER_EVENT, callback)
}

function getBrandFilterSnapshot(): BrandFilterValue {
  const value = localStorage.getItem(BRAND_FILTER_KEY)
  if (value !== null && VALID_BRAND_FILTERS.has(value)) return value as BrandFilterValue
  return 'all'
}

function getBrandFilterServerSnapshot(): BrandFilterValue {
  return 'all'
}
```

### Chaîne de filtrage étendue dans StoreOfferList

```typescript
// 1. Advanced filtering (date + supplier + brand) — appliqué sur toutes les offres
const advancedFilteredOffers = useMemo(() => {
  let result = offers

  // Filtre date (existant)
  if (dateFilter !== 'all') {
    const range = dateFilter === 'this-week' ? getWeekRange() : getMonthRange()
    result = result.filter((o) => dateRangesOverlap(o.startDate, o.endDate, range.start, range.end))
  }

  // Filtre fournisseur (existant)
  if (supplierFilter.length > 0) {
    const supplierSet = new Set(supplierFilter)
    result = result.filter((o) => supplierSet.has(o.supplierId))
  }

  // Filtre enseigne (MVP : no-op — toutes les offres sont compatibles)
  if (brandFilter === 'my-brand' && storeBrand) {
    // MVP: Toutes les offres sont compatibles avec toutes les enseignes.
    // Futur: Décommenter quand Offer aura un champ brandTargets:
    // result = result.filter((o) =>
    //   !o.brandTargets || o.brandTargets.length === 0 || o.brandTargets.includes(storeBrand)
    // )
  }

  return result
}, [offers, dateFilter, supplierFilter, brandFilter, storeBrand])

// 2. categoryCounts (inchangé — sur advancedFilteredOffers)
// 3. filteredOffers par catégorie (inchangé)
```

### Extension des handlers

```typescript
// handleApplyFilters — ajout du 3e argument
const handleApplyFilters = useCallback((date: DateFilterValue, suppliers: string[], brand: BrandFilterValue) => {
  // Date (existant)
  if (date === 'all') localStorage.removeItem(DATE_FILTER_KEY)
  else localStorage.setItem(DATE_FILTER_KEY, date)

  // Supplier (existant)
  if (suppliers.length === 0) localStorage.removeItem(SUPPLIER_FILTER_KEY)
  else localStorage.setItem(SUPPLIER_FILTER_KEY, JSON.stringify(suppliers))

  // Brand (nouveau)
  if (brand === 'all') localStorage.removeItem(BRAND_FILTER_KEY)
  else localStorage.setItem(BRAND_FILTER_KEY, brand)

  window.dispatchEvent(new Event(DATE_FILTER_EVENT))
  window.dispatchEvent(new Event(SUPPLIER_FILTER_EVENT))
  window.dispatchEvent(new Event(BRAND_FILTER_EVENT))
}, [])

// handleResetFilters — ajout brand reset
const handleResetFilters = useCallback(() => {
  localStorage.removeItem(DATE_FILTER_KEY)
  localStorage.removeItem(SUPPLIER_FILTER_KEY)
  localStorage.removeItem(BRAND_FILTER_KEY) // NOUVEAU
  window.dispatchEvent(new Event(DATE_FILTER_EVENT))
  window.dispatchEvent(new Event(SUPPLIER_FILTER_EVENT))
  window.dispatchEvent(new Event(BRAND_FILTER_EVENT)) // NOUVEAU
}, [])

// handleResetAll — ajout brand reset
const handleResetAll = useCallback(() => {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(DATE_FILTER_KEY)
  localStorage.removeItem(SUPPLIER_FILTER_KEY)
  localStorage.removeItem(BRAND_FILTER_KEY) // NOUVEAU
  window.dispatchEvent(new Event(CHANGE_EVENT))
  window.dispatchEvent(new Event(DATE_FILTER_EVENT))
  window.dispatchEvent(new Event(SUPPLIER_FILTER_EVENT))
  window.dispatchEvent(new Event(BRAND_FILTER_EVENT)) // NOUVEAU
}, [])
```

### Extension du OfferFilterSheet — Section enseigne

```tsx
// Nouvelle constante
const BRAND_OPTIONS: { value: BrandFilterValue; label: string }[] = [
  { value: 'all', label: 'Toutes les enseignes' },
  // Le label du 2e est dynamique → géré dans le JSX
]

// Nouvelle section après "Fournisseur" :
<div className="space-y-3">
  <h3 className="text-sm font-medium">Enseigne compatible</h3>
  <div role="radiogroup" aria-label="Filtre par enseigne" className="space-y-2">
    <button
      type="button"
      role="radio"
      aria-checked={localBrandFilter === 'all'}
      onClick={() => setLocalBrandFilter('all')}
      className={cn(
        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
        localBrandFilter === 'all'
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground'
      )}
    >
      Toutes les enseignes
    </button>
    {storeBrandLabel && (
      <button
        type="button"
        role="radio"
        aria-checked={localBrandFilter === 'my-brand'}
        onClick={() => setLocalBrandFilter('my-brand')}
        className={cn(
          'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
          localBrandFilter === 'my-brand'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground'
        )}
      >
        Mon enseigne uniquement ({storeBrandLabel})
      </button>
    )}
  </div>
</div>
```

**Note:** Si `storeBrandLabel` est `undefined` (pas de store brand passé), la section enseigne s'affiche avec seulement "Toutes les enseignes" et le bouton "Mon enseigne" est masqué. En pratique, le layout garantit que le store existe.

### Props OfferFilterSheet mises à jour

```typescript
interface OfferFilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  suppliers: Supplier[]
  dateFilter: DateFilterValue
  supplierFilter: string[]
  storeBrandLabel?: string           // NOUVEAU
  brandFilter: BrandFilterValue      // NOUVEAU
  onApply: (date: DateFilterValue, suppliers: string[], brand: BrandFilterValue) => void  // MODIFIÉ
  onReset: () => void
}
```

### Props StoreOfferList mises à jour

```typescript
interface StoreOfferListProps {
  offers: SerializedOfferWithSupplier[]
  storeBrand?: string  // NOUVEAU — Brand enum value (LECLERC, INTERMARCHE, etc.)
}
```

### activeFilterCount étendu

```typescript
const activeFilterCount =
  (dateFilter !== 'all' ? 1 : 0) +
  (supplierFilter.length > 0 ? 1 : 0) +
  (brandFilter !== 'all' ? 1 : 0) // NOUVEAU — max 3
```

### Project Structure Notes

**Fichiers à modifier:**
- `src/app/(store)/offers/page.tsx` — Récupérer store brand, passer en prop
- `src/components/custom/store-offer-list.tsx` — Prop storeBrand, store brand filter, chaîne de filtrage, handlers
- `src/components/custom/offer-filter-sheet.tsx` — Section enseigne, props étendues, types exportés
- `src/components/custom/offer-filter-sheet.test.tsx` — Tests section enseigne
- `src/components/custom/store-offer-list.test.tsx` — Tests filtre enseigne intégré

**Fichiers existants à réutiliser (NE PAS recréer):**
- `src/lib/validations/auth.ts` → `BRAND_LABELS`, `BrandType` — déjà définis
- `src/components/ui/sheet.tsx` → Sheet (déjà installé)
- `src/components/ui/button.tsx` → Button (déjà installé)
- `src/lib/utils/filters.ts` → helpers date (inchangés)
- `src/lib/utils/cn.ts` → `cn()`

**NE PAS modifier:**
- `src/lib/queries/offers.ts` — La query `getActiveOffers()` ne change PAS
- `src/lib/utils/filters.ts` — Pas de nouveau helper nécessaire
- `src/components/custom/category-filter-chips.tsx` — Inchangé
- `src/components/custom/store-offer-card.tsx` — Inchangé
- `prisma/schema.prisma` — PAS de migration. Le champ `brandTargets` sur Offer est une évolution future, hors scope MVP

**NE PAS installer de nouvelle dépendance.** Tout est déjà disponible.

### Previous Story Intelligence

**Story 3.3 (Filtrage par Date et Fournisseur) — Learnings critiques:**
- 562 tests passent (41 fichiers) — NE PAS les casser
- `useSyncExternalStore` pattern avec validation Set — **réutiliser exactement** pour brand filter
- `getServerSnapshot()` retourne la valeur par défaut (pas de localStorage côté serveur)
- `type="button"` sur TOUS les boutons interactifs (éviter submit implicite)
- `prevOpen` pattern pour synchroniser l'état interne du Sheet à l'ouverture — étendre pour `localBrandFilter`
- `cachedSupplierRaw`/`cachedSupplierParsed` pattern pour éviter les infinite loops avec arrays — PAS nécessaire pour brand (c'est un simple string, pas un array)
- ESLint `react-hooks/set-state-in-effect` : utiliser le pattern "adjust state during rendering" (pas useEffect)

**Story 3.2 — Pattern de filtrage catégorie:**
- `VALID_CATEGORIES` Set pour valider les valeurs localStorage — appliquer la même validation pour brandFilter

**Story 3.1 — Data flow:**
- `SerializedOfferWithSupplier` a `supplierId` et `supplier: { companyName }` — PAS de champ brand
- Les offres sont sérialisées dans la page RSC et passées au client

### Git Intelligence

**Commits récents pertinents:**
- `981f40e` — Stories 2.5-3.2, design system Acquire et filtrage par catégorie
- Pattern de filtrage client-side bien établi
- Conventions de commit : `feat: Description en français (Story X.X)`

### Library & Framework Requirements

**Dépendances déjà installées (NE PAS réinstaller):**
- `react@19` — useSyncExternalStore, useMemo, useState, useCallback
- `lucide-react` — SlidersHorizontal déjà utilisé
- `@radix-ui/react-dialog` — utilisé par Sheet
- `tailwindcss` — Styling

**Import nécessaire pour la page RSC:**
- `@/lib/supabase/server` → `createClient` (déjà utilisé dans layout)
- `@/lib/prisma/client` → `prisma` (déjà utilisé dans layout)
- `@/lib/validations/auth` → `BRAND_LABELS`, `BrandType` (déjà défini)

**AUCUNE nouvelle dépendance requise.**

### Testing Requirements

**Tests OfferFilterSheet mis à jour (`offer-filter-sheet.test.tsx`):**
- Affiche la section "Enseigne compatible" avec 2 options radio
- "Toutes les enseignes" sélectionné par défaut quand `brandFilter === 'all'`
- Click sur "Mon enseigne uniquement (Leclerc)" change la sélection
- Click "Appliquer" appelle `onApply` avec 3 arguments (date, suppliers, brand)
- Click "Réinitialiser" remet brand à 'all' et appelle `onReset`
- Pré-sélection correcte quand `brandFilter === 'my-brand'`
- Sans `storeBrandLabel`, seul "Toutes les enseignes" s'affiche

**Tests StoreOfferList mis à jour (`store-offer-list.test.tsx`):**
- Passer `storeBrand="LECLERC"` dans les tests existants (prop optionnelle, tests existants continuent de fonctionner sans)
- Badge compteur à 3 quand date + fournisseur + enseigne actifs
- Persistance localStorage du filtre enseigne
- `handleResetAll` réinitialise aussi le filtre enseigne
- Le filtre enseigne MVP ne masque aucune offre
- Tests existants de `handleApplyFilters` mis à jour pour le nouveau 3e argument

**Pattern de test:**
- Mock localStorage : `vi.spyOn(Storage.prototype, 'getItem')`, `vi.spyOn(Storage.prototype, 'setItem')`
- `@testing-library/react` + `vitest`
- Mock `next/navigation` (`useRouter`)
- Les tests existants doivent continuer de passer avec `storeBrand` optionnel

### Security Considerations

- Pas de nouvelles données sensibles exposées
- localStorage ne contient que `'all'` ou `'my-brand'` — pas d'information sensible
- La marque du magasin (LECLERC, etc.) n'est pas un secret
- Pas de Server Action dans cette story — lecture seule côté serveur (select brand)

### UX Considerations

- **Sheet bottom panel (UX-09):** Extension naturelle du Sheet existant
- **Radio buttons cohérents:** Même style que les radios date (bg-primary quand sélectionné)
- **Label dynamique:** "Mon enseigne uniquement (Leclerc)" — feedback clair sur l'enseigne de l'utilisateur
- **Badge compteur étendu:** max 3 au lieu de 2 — feedback visuel cohérent
- **MVP transparent:** L'utilisateur peut activer le filtre mais ne verra pas de changement (toutes les offres passent). C'est acceptable car l'UX est en place pour quand le backend évoluera
- **État temporaire dans le Sheet:** Même pattern — fermer = annuler, "Appliquer" = confirmer

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.4: Filtrage par Enseigne Compatible]
- [Source: _bmad-output/planning-artifacts/epics.md#FR16: Filtre par enseigne]
- [Source: src/lib/validations/auth.ts#BRAND_LABELS — mapping Brand enum → label]
- [Source: src/components/custom/store-offer-list.tsx — pattern useSyncExternalStore existant]
- [Source: src/components/custom/offer-filter-sheet.tsx — Sheet filtres existant]
- [Source: src/app/(store)/layout.tsx — pattern accès store profile]
- [Source: _bmad-output/implementation-artifacts/3-3-filtrage-par-date-et-fournisseur.md — patterns et learnings]
- [Source: _bmad-output/project-context.md — règles implémentation]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed page.test.tsx: added mocks for `@/lib/supabase/server` and `@/lib/prisma/client` after page.tsx started calling `createClient()` and `prisma.store.findUnique()`

### Completion Notes List

- Task 1: Modified RSC page to fetch store brand via Supabase auth + Prisma query, passed as `storeBrand` prop
- Task 2: Extended OfferFilterSheet with `BrandFilterValue` type, `storeBrandLabel`/`brandFilter` props, "Enseigne compatible" radio section, reset/apply handlers
- Task 3: Added brand filter store (useSyncExternalStore + localStorage), extended filtering chain (date → supplier → brand → categoryCounts → category), activeFilterCount max 3, all handlers updated
- Task 4: 7 new tests for OfferFilterSheet brand section (rendering, selection, apply, reset, pre-selection, no storeBrandLabel)
- Task 5: 5 new tests for StoreOfferList brand filter (badge "3", localStorage persistence, MVP no-op, reset all)
- Task 6: 576 tests pass, 0 lint errors, build OK
- Updated page.test.tsx mocks for new Supabase/Prisma dependencies

### Change Log

- 2026-02-08: Story 3.4 implementation complete — brand filter UI infrastructure for MVP (Date: 2026-02-08)
- 2026-02-08: Code review fixes — H1+H2: parallelized getUser()/getActiveOffers() in page.tsx with Promise.all; M2: added test for handleApplyFilters saving brand to localStorage; M3: added test for Sheet brand resync on re-open; M4: added test verifying storeBrand prisma query; M1: added sprint-status.yaml to File List

### File List

- `src/app/(store)/offers/page.tsx` — Added Supabase auth + Prisma store.brand fetch, pass storeBrand prop
- `src/app/(store)/offers/page.test.tsx` — Added mocks for @/lib/supabase/server and @/lib/prisma/client
- `src/components/custom/offer-filter-sheet.tsx` — Added BrandFilterValue type, storeBrandLabel/brandFilter props, "Enseigne compatible" section
- `src/components/custom/offer-filter-sheet.test.tsx` — Added 7 brand filter tests
- `src/components/custom/store-offer-list.tsx` — Added storeBrand prop, brand filter store, extended filtering chain and handlers
- `src/components/custom/store-offer-list.test.tsx` — Added 5 brand filter tests (badge "3", localStorage, MVP no-op, reset)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Updated story status
