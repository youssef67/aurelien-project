# Story 3.2: Filtrage par Catégorie

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

En tant que **chef de rayon (magasin)**,
Je veux **filtrer les offres par catégorie**,
Afin de **voir uniquement les promotions pertinentes pour mon rayon**.

## Acceptance Criteria

### AC1: Affichage de la barre de FilterChips
**Given** je suis sur la liste des offres `/offers`
**When** la page se charge
**Then** une barre de FilterChips horizontale s'affiche en haut de la liste (au-dessus des cards)
**And** les chips disponibles sont: "Tout", "Épicerie", "Frais", "DPH", "Surgelés", "Boissons", "Autres"
**And** "Tout" est sélectionné par défaut
**And** les chips sont ordonnés dans cet ordre exact

### AC2: Filtrage instantané par catégorie
**Given** les FilterChips sont affichés
**When** je tape sur une catégorie (ex: "Épicerie")
**Then** le chip devient actif (style primary — fond `bg-primary text-primary-foreground`)
**And** le chip "Tout" revient au style inactif
**And** la liste se filtre instantanément (client-side, < 500ms — NFR2)
**And** seules les offres de catégorie "EPICERIE" s'affichent

### AC3: Réinitialisation du filtre
**Given** un filtre catégorie est actif
**When** je tape sur "Tout"
**Then** le filtre est réinitialisé
**And** toutes les offres s'affichent à nouveau
**And** le chip "Tout" redevient actif

### AC4: Persistance du filtre en localStorage
**Given** j'ai sélectionné un filtre catégorie (ex: "Frais")
**When** je quitte et reviens sur la page `/offers`
**Then** mon filtre est mémorisé (persistance `localStorage` clé `store-offers-category-filter`)
**And** la liste affiche directement les offres filtrées
**And** le chip correspondant est actif

### AC5: Empty state filtré
**Given** un filtre catégorie est actif et aucune offre ne correspond
**When** la liste est filtrée
**Then** un empty state s'affiche "Aucune offre dans cette catégorie"
**And** un bouton "Voir toutes les offres" permet de réinitialiser le filtre (= tape "Tout")

### AC6: Chips scrollables horizontalement
**Given** les chips dépassent la largeur de l'écran (mobile < 375px)
**When** les chips s'affichent
**Then** la barre est scrollable horizontalement (`overflow-x-auto`)
**And** pas de scrollbar visible (`scrollbar-hide`)
**And** les chips ne wrappent PAS sur plusieurs lignes (`flex-nowrap`)

### AC7: Compteur d'offres par catégorie (optionnel UX)
**Given** des offres existent
**When** les chips s'affichent
**Then** chaque chip affiche le nombre d'offres dans la catégorie entre parenthèses
**And** exemple: "Épicerie (5)", "Frais (3)", "Tout (12)"
**And** les catégories avec 0 offres restent affichées mais avec "(0)"

## Tasks / Subtasks

- [x] **Task 1: Créer le composant CategoryFilterChips** (AC: 1, 2, 3, 6, 7)
  - [x] 1.1 Créer `/src/components/custom/category-filter-chips.tsx` (`"use client"`)
  - [x] 1.2 Props: `{ selectedCategory: string | null, onCategoryChange: (category: string | null) => void, categoryCounts: Record<string, number>, totalCount: number }`
  - [x] 1.3 Chips: "Tout" + toutes les catégories de l'enum `OfferCategory` via `CATEGORY_LABELS`
  - [x] 1.4 Style actif: `bg-primary text-primary-foreground` — inactif: `bg-secondary text-secondary-foreground`
  - [x] 1.5 Container: `flex gap-2 overflow-x-auto scrollbar-hide flex-nowrap pb-1`
  - [x] 1.6 Chaque chip est un `<button>` avec `min-h-[36px] px-3 rounded-full text-sm font-medium whitespace-nowrap`
  - [x] 1.7 "Tout" envoie `null`, les catégories envoient la clé enum (ex: `"EPICERIE"`)

- [x] **Task 2: Ajouter la logique de filtrage dans StoreOfferList** (AC: 2, 3, 4, 5)
  - [x] 2.1 Modifier `/src/components/custom/store-offer-list.tsx`
  - [x] 2.2 Utiliser `useSyncExternalStore` pour la catégorie sélectionnée (remplace useState+useEffect pour éviter lint error)
  - [x] 2.3 Lecture depuis `localStorage` via `getSnapshot()` (hydration-safe avec `getServerSnapshot()`)
  - [x] 2.4 Persister en `localStorage` à chaque changement via `handleCategoryChange`
  - [x] 2.5 Filtrer les offres client-side: `offers.filter(o => !category || o.category === category)`
  - [x] 2.6 Calculer `categoryCounts` depuis les offres non filtrées
  - [x] 2.7 Rendre `<CategoryFilterChips>` au-dessus de la liste
  - [x] 2.8 Afficher empty state filtré si 0 offres après filtrage

- [x] **Task 3: Tests CategoryFilterChips** (AC: 1, 2, 3, 6, 7)
  - [x] 3.1 Créer `/src/components/custom/category-filter-chips.test.tsx`
  - [x] 3.2 Affiche tous les chips (7 = "Tout" + 6 catégories)
  - [x] 3.3 "Tout" est actif par défaut quand `selectedCategory === null`
  - [x] 3.4 Click sur "Épicerie" appelle `onCategoryChange("EPICERIE")`
  - [x] 3.5 Click sur "Tout" appelle `onCategoryChange(null)`
  - [x] 3.6 Chip actif a le style `bg-primary`
  - [x] 3.7 Affiche les compteurs entre parenthèses
  - [x] 3.8 Affiche "(0)" pour les catégories vides

- [x] **Task 4: Mettre à jour les tests StoreOfferList** (AC: 2, 4, 5)
  - [x] 4.1 Modifier `/src/components/custom/store-offer-list.test.tsx`
  - [x] 4.2 Tester que CategoryFilterChips est rendu
  - [x] 4.3 Tester le filtrage client-side (click catégorie → offres filtrées)
  - [x] 4.4 Tester la persistance localStorage
  - [x] 4.5 Tester l'empty state filtré
  - [x] 4.6 Tester la réinitialisation via "Tout"

- [x] **Task 5: Validation finale** (AC: 1-7)
  - [x] 5.1 `npm run test` — 517 tests passent (39 fichiers)
  - [x] 5.2 `npm run build` — build OK
  - [x] 5.3 `npm run lint` — lint OK (0 erreur, 0 warning)
  - [x] 5.4 Tests existants non cassés (497 → 517 avec 20 nouveaux tests)

## Dev Notes

### Architecture Compliance

**Patterns OBLIGATOIRES à suivre:**
- `"use client"` sur `CategoryFilterChips` ET `StoreOfferList` (déjà client) — le filtrage est 100% client-side [Source: project-context.md#Next.js Rules]
- Fichiers en `kebab-case`, composants en `PascalCase` [Source: architecture.md#Naming Patterns]
- Tests co-localisés `*.test.tsx` à côté du source [Source: architecture.md#Structure Patterns]
- Réutiliser `getCategoryLabel()` de `@/lib/utils/offers` — NE PAS recréer le mapping [Source: story 3.1 learnings]
- NE PAS changer la query `getActiveOffers()` — le filtrage est client-side sur les données déjà chargées

**Décision architecturale — Filtrage client-side:**
Toutes les offres actives sont déjà chargées par la page RSC. Le filtrage par catégorie est une opération triviale sur un array (< 1ms pour 100 offres). Pas besoin de Server Action, de query Prisma supplémentaire, ou de paramètre URL. Client-side `Array.filter()` est la solution la plus simple et la plus performante.

### Approche de filtrage — Pattern (implémentation réelle: useSyncExternalStore)

```typescript
// Dans StoreOfferList — logique de filtrage via useSyncExternalStore
const STORAGE_KEY = 'store-offers-category-filter'
const CHANGE_EVENT = 'category-filter-change'

const VALID_CATEGORIES: ReadonlySet<string> = new Set([
  'EPICERIE', 'FRAIS', 'DPH', 'SURGELES', 'BOISSONS', 'AUTRES',
])

function subscribe(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback)
  return () => window.removeEventListener(CHANGE_EVENT, callback)
}

function getSnapshot(): string | null {
  const value = localStorage.getItem(STORAGE_KEY)
  if (value !== null && !VALID_CATEGORIES.has(value)) return null
  return value
}

function getServerSnapshot(): null {
  return null
}

// Usage dans le composant
const selectedCategory = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

const handleCategoryChange = useCallback((category: string | null) => {
  if (category) {
    localStorage.setItem(STORAGE_KEY, category)
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}, [])
```

**Choix `useSyncExternalStore` vs `useState`+`useEffect`:** Évite le lint error `react-hooks/set-state-in-effect` et suit les recommandations React 19 pour les stores externes (localStorage). Hydration-safe via `getServerSnapshot()` qui retourne `null`. Validation des valeurs localStorage contre les catégories valides.

### CategoryFilterChips — Structure

```typescript
// src/components/custom/category-filter-chips.tsx
'use client'

import { cn } from '@/lib/utils/cn'
import { getCategoryLabel } from '@/lib/utils/offers'
import type { OfferCategory } from '@prisma/client'

const CATEGORIES: OfferCategory[] = [
  'EPICERIE', 'FRAIS', 'DPH', 'SURGELES', 'BOISSONS', 'AUTRES'
]

interface CategoryFilterChipsProps {
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  categoryCounts: Record<string, number>
  totalCount: number
}

export function CategoryFilterChips({
  selectedCategory,
  onCategoryChange,
  categoryCounts,
  totalCount,
}: CategoryFilterChipsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-hide flex-nowrap pb-1"
      role="radiogroup"
      aria-label="Filtrer par catégorie"
    >
      {/* Chip "Tout" */}
      <button
        role="radio"
        aria-checked={selectedCategory === null}
        onClick={() => onCategoryChange(null)}
        className={cn(
          'min-h-[36px] px-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
          selectedCategory === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground'
        )}
      >
        Tout ({totalCount})
      </button>

      {/* Chips catégories */}
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          role="radio"
          aria-checked={selectedCategory === cat}
          onClick={() => onCategoryChange(cat)}
          className={cn(
            'min-h-[36px] px-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            selectedCategory === cat
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          )}
        >
          {getCategoryLabel(cat)} ({categoryCounts[cat] || 0})
        </button>
      ))}
    </div>
  )
}
```

**Points critiques:**
- `role="radiogroup"` + `role="radio"` + `aria-checked` pour l'accessibilité (un seul filtre actif à la fois)
- `scrollbar-hide` class Tailwind v4 — vérifier que la classe existe ou utiliser `[&::-webkit-scrollbar]:hidden`
- `rounded-full` pour les chips (pills) — PAS `rounded-[0_8px_8px_8px]` (l'asymétrique est pour les CTA buttons, pas les chips)
- Touch target minimum: `min-h-[36px]` + `px-3` donne au moins 36x~60px — suffisant pour mobile

### StoreOfferList — Implémentation réelle

Voir le code source complet dans `src/components/custom/store-offer-list.tsx`.

**Changements clés vs version story 3.1:**
- Ajout `useSyncExternalStore` pour la lecture/écriture localStorage (hydration-safe, React 19)
- Ajout `useCallback` pour `handleCategoryChange` (dispatch custom event)
- Ajout `VALID_CATEGORIES` Set pour valider les valeurs localStorage
- Ajout `useMemo` pour `categoryCounts`
- `filteredOffers` au lieu de `offers` dans le map
- Ajout `<CategoryFilterChips>` au-dessus du bouton Actualiser
- Ajout empty state filtré avec "Voir toutes les offres"
- Import `PackageSearch` de lucide-react pour l'empty state

### Hydration Mismatch — CRITIQUE

**PROBLEME:** Si on initialise `selectedCategory` depuis `localStorage` dans `useState`, le server render aura `null` mais le client aura la valeur sauvegardée → hydration mismatch.

**SOLUTION:** Toujours initialiser à `null` dans `useState`, puis synchroniser depuis `localStorage` dans un `useEffect`. Le premier render montre toutes les offres, puis le filtre s'applique. Ce flash est négligeable (< 16ms) et préférable à une erreur d'hydratation.

### Project Structure Notes

**Fichiers à créer:**
- `/src/components/custom/category-filter-chips.tsx` — Composant filter chips
- `/src/components/custom/category-filter-chips.test.tsx` — Tests composant

**Fichiers à modifier:**
- `/src/components/custom/store-offer-list.tsx` — Ajouter logique filtrage + CategoryFilterChips
- `/src/components/custom/store-offer-list.test.tsx` — Ajouter tests filtrage

**Fichiers existants à réutiliser (NE PAS recréer):**
- `/src/lib/utils/offers.ts` → `getCategoryLabel()`, `CATEGORY_LABELS` (DÉJÀ IMPLÉMENTÉ)
- `/src/lib/utils/cn.ts` → `cn()`
- `/src/components/ui/button.tsx` → Button
- `/src/components/custom/store-offer-card.tsx` → StoreOfferCard (AUCUNE modification)

**NE PAS installer de nouvelle dépendance.** Tout est déjà disponible.

**NE PAS modifier:**
- `page.tsx` — La page RSC ne change PAS, elle passe toujours toutes les offres
- `getActiveOffers()` — La query ne change PAS
- `store-offer-card.tsx` — La card ne change PAS
- `store-offer-card-skeleton.tsx` — Le skeleton ne change PAS
- `loading.tsx` — Le loading ne change PAS

### Previous Story Intelligence

**Story 3.1 (dernière complétée) — Learnings critiques:**
- 497 tests passent — NE PAS les casser
- `StoreOfferList` est déjà `"use client"` — on y ajoute directement la logique
- `getCategoryLabel()` existe et mappe les 6 catégories enum → labels FR
- `SerializedOfferWithSupplier` a le champ `category: string` — compatible avec le filtrage
- `useTransition` + `router.refresh()` pattern pour le bouton Actualiser — préserver ce pattern
- Hydration: toujours initialiser useState côté serveur-compatible, sync via useEffect

**Story 3.1 code review — Issues à ne pas reproduire:**
- H2: Timezone issue → utiliser `setUTCHours` si besoin (pas pertinent ici, filtrage est string comparison)
- M2: `as never` type assertion → éviter, utiliser des helpers typés dans les tests

### Tailwind v4 — scrollbar-hide

**VÉRIFIER** si `scrollbar-hide` existe comme classe native dans Tailwind v4. Si non, alternatives:
- CSS inline: `[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`
- Ou ajouter `@utility scrollbar-hide` dans `globals.css` si pas déjà fait

### Library & Framework Requirements

**Dépendances déjà installées (NE PAS réinstaller):**
- `react@19.2.3` — useState, useEffect, useMemo
- `lucide-react@^0.563.0` — PackageSearch
- `tailwindcss` — Styling

**AUCUNE nouvelle dépendance requise.**

### Testing Requirements

**Tests CategoryFilterChips (`category-filter-chips.test.tsx`):**
- Affiche 7 chips (1 "Tout" + 6 catégories)
- "Tout" a le style actif par défaut (`selectedCategory === null`)
- Click "Épicerie" appelle `onCategoryChange("EPICERIE")`
- Click "Tout" appelle `onCategoryChange(null)`
- Chip actif a `bg-primary` dans les classes
- Chip inactif a `bg-secondary` dans les classes
- Affiche les compteurs: "Tout (12)", "Épicerie (5)"
- Affiche "(0)" pour catégories vides
- Chips sont des buttons avec `role="radio"` et `aria-checked`

**Tests StoreOfferList mis à jour (`store-offer-list.test.tsx`):**
- Rend CategoryFilterChips
- Mock `localStorage.getItem` et `localStorage.setItem`
- Click sur "Épicerie" → seules les offres EPICERIE sont rendues
- Click sur "Tout" → toutes les offres sont rendues
- Persistance: `localStorage.setItem` appelé avec la catégorie
- Initialisation: `localStorage.getItem` appelé au mount
- Empty state filtré: si aucune offre dans la catégorie → message + bouton reset
- Click "Voir toutes les offres" dans l'empty state → reset le filtre
- Les compteurs reflètent les offres totales (pas filtrées)

**Pattern de test:**
- Mock localStorage: `vi.spyOn(Storage.prototype, 'getItem')`, `vi.spyOn(Storage.prototype, 'setItem')`
- Offres mock avec catégories variées: 2x EPICERIE, 1x FRAIS, 1x BOISSONS
- `@testing-library/react` + `vitest`
- Mock `next/navigation` (`useRouter`)

### Security Considerations

- Pas de nouvelles données exposées — même query, même filtrage client-side
- localStorage ne contient qu'un string de catégorie (pas de données sensibles)
- Pas de Server Action dans cette story — lecture seule

### UX Considerations

- **Filter chips (UX-05):** Chips horizontaux scrollables, pattern Uber Eats [Source: ux-design-specification.md#Interaction Patterns]
- **Mémorisation filtre:** Retour sur la page → filtre préservé → contrôle utilisateur [Source: ux-design-specification.md#Experience Principles#3-Control]
- **Touch target:** `min-h-[36px]` minimum, `px-3` padding — confortable pour mobile
- **Feedback instantané:** Filtrage client-side = 0ms latence perçue
- **Catégories vides affichées:** L'utilisateur voit l'étendue des catégories même sans offres
- **"Tout" toujours visible en premier:** Point d'ancrage pour réinitialiser

### Prisma Enum — Rappel (AUCUNE modification requise)

```prisma
enum OfferCategory {
  EPICERIE
  FRAIS
  DPH
  SURGELES
  BOISSONS
  AUTRES

  @@map("offer_category")
}
```

Les 6 valeurs sont les mêmes que dans `CATEGORY_LABELS` de `offers.ts`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2: Filtrage par Catégorie]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Transferable UX Patterns — Filtres chips]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/project-context.md#Next.js Rules]
- [Source: _bmad-output/implementation-artifacts/3-1-liste-des-offres-disponibles.md]
- [Source: src/lib/utils/offers.ts — getCategoryLabel, CATEGORY_LABELS]
- [Source: src/components/custom/store-offer-list.tsx — pattern existant]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Lint error `react-hooks/set-state-in-effect` résolu en remplaçant `useState`+`useEffect` par `useSyncExternalStore` pour la lecture/écriture localStorage (approche React 19 recommandée)
- `scrollbar-hide` n'existait pas dans Tailwind v4 → ajouté comme `@utility` dans `globals.css`

### Completion Notes List

- Task 1: Créé `CategoryFilterChips` — composant "use client" avec 7 chips (Tout + 6 catégories), role="radiogroup" pour a11y, compteurs par catégorie, styles actif/inactif, container scrollable flex-nowrap
- Task 2: Modifié `StoreOfferList` — ajout `useSyncExternalStore` pour localStorage (hydration-safe), filtrage client-side, `CategoryFilterChips` intégré au-dessus de la liste, empty state filtré avec bouton reset
- Task 3: 11 tests pour CategoryFilterChips — affichage chips, styles actif/inactif, callbacks, compteurs, a11y (role radio, aria-checked), catégories vides
- Task 4: 13 tests pour StoreOfferList — rendu liste, refresh, filtrage par catégorie, persistance localStorage, restauration filtre au mount, empty state filtré, réinitialisation, compteurs non affectés par filtre
- Task 5: 517 tests passent (39 fichiers), build OK, lint OK (0 erreur)
- Décision technique: `useSyncExternalStore` au lieu de `useState`+`useEffect` pour éviter lint error `react-hooks/set-state-in-effect` et suivre les recommandations React 19 pour les stores externes (localStorage)
- Code review fixes: [M1] test ordre chips AC1, [M2] VALID_CATEGORIES Set + validation getSnapshot, [M3] Dev Notes mis à jour avec code réel, [L1] type="button" sur filter chips

### Change Log

- 2026-02-08: Implémentation story 3.2 — Filtrage par catégorie avec CategoryFilterChips, persistance localStorage, empty state filtré (20 nouveaux tests)
- 2026-02-08: Code review — 3 MEDIUM + 1 LOW corrigés: test d'ordre des chips (M1), validation localStorage (M2), mise à jour Dev Notes (M3), ajout type="button" (L1). +2 tests (519 total)

### File List

**Fichiers créés:**
- `src/components/custom/category-filter-chips.tsx` — Composant FilterChips avec 7 chips, a11y, compteurs
- `src/components/custom/category-filter-chips.test.tsx` — 11 tests unitaires

**Fichiers modifiés:**
- `src/components/custom/store-offer-list.tsx` — Ajout filtrage, useSyncExternalStore, CategoryFilterChips, empty state
- `src/components/custom/store-offer-list.test.tsx` — 13 tests (mise à jour complète avec tests filtrage)
- `src/app/globals.css` — Ajout `@utility scrollbar-hide`
