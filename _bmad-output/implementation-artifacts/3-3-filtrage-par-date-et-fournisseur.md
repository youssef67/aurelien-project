# Story 3.3: Filtrage par Date et Fournisseur

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

En tant que **chef de rayon (magasin)**,
Je veux **filtrer les offres par date de validité et par fournisseur**,
Afin d'**affiner ma recherche selon mes besoins temporels et mes fournisseurs préférés**.

## Acceptance Criteria

### AC1: Bouton d'ouverture des filtres avancés
**Given** je suis sur la liste des offres `/offers`
**When** la page se charge
**Then** une icône de filtres avancés (SlidersHorizontal) s'affiche à droite de la barre CategoryFilterChips
**And** l'icône est un bouton avec `aria-label="Filtres avancés"`
**And** si des filtres avancés sont actifs, un badge numérique (compteur) s'affiche sur l'icône

### AC2: Ouverture du Sheet filtres avancés
**Given** je suis sur la liste des offres
**When** je clique sur l'icône de filtres avancés
**Then** un Sheet (bottom panel) s'ouvre depuis le bas (`side="bottom"`)
**And** le Sheet contient un titre "Filtrer les offres"
**And** le Sheet contient deux sections : "Date de validité" et "Fournisseur"
**And** un bouton "Appliquer" (primary) et un bouton "Réinitialiser" (ghost) sont visibles en bas

### AC3: Filtre par date — Presets
**Given** le Sheet de filtres est ouvert
**When** je consulte la section "Date de validité"
**Then** trois options sont disponibles sous forme de boutons radio :
- "Toutes les dates" (défaut)
- "Cette semaine" (lundi → dimanche de la semaine en cours)
- "Ce mois" (1er → dernier jour du mois en cours)

### AC4: Filtre par date — Application
**Given** je sélectionne "Cette semaine"
**When** je clique sur "Appliquer"
**Then** seules les offres dont la plage [startDate, endDate] chevauche la semaine en cours s'affichent
**And** le Sheet se ferme
**And** le badge sur l'icône filtres indique "1" (1 filtre actif)
**And** le filtrage est client-side (< 500ms — NFR2)

### AC5: Filtre par fournisseur — Liste
**Given** le Sheet de filtres est ouvert
**When** je consulte la section "Fournisseur"
**Then** une liste de checkboxes affiche les fournisseurs ayant des offres actives
**And** chaque checkbox affiche le `companyName` du fournisseur
**And** les fournisseurs sont triés par ordre alphabétique
**And** par défaut, aucun n'est sélectionné (= tous visibles)

### AC6: Filtre par fournisseur — Multi-sélection
**Given** la liste des fournisseurs est affichée
**When** je coche un ou plusieurs fournisseurs
**Then** les fournisseurs cochés sont visuellement marqués (checkbox checked)
**And** je peux cocher/décocher librement avant d'appliquer

### AC7: Combinaison des filtres (AND)
**Given** j'ai sélectionné un filtre date "Cette semaine" ET un fournisseur "Nestlé"
**When** je clique sur "Appliquer"
**Then** la liste est filtrée avec les deux critères combinés (AND)
**And** seules les offres de Nestlé chevauchant cette semaine s'affichent
**And** le badge indique "2" (2 filtres actifs)
**And** le Sheet se ferme

### AC8: Combinaison avec filtre catégorie existant
**Given** un filtre catégorie est actif via CategoryFilterChips (ex: "Épicerie")
**And** j'ai des filtres avancés actifs (date + fournisseur)
**When** les filtres sont appliqués
**Then** les trois filtres se combinent en AND (catégorie AND date AND fournisseur)
**And** les compteurs des CategoryFilterChips reflètent les offres APRÈS filtrage avancé

### AC9: Réinitialisation des filtres avancés
**Given** des filtres avancés sont actifs
**When** je clique sur "Réinitialiser" dans le Sheet
**Then** le filtre date revient à "Toutes les dates"
**And** tous les fournisseurs sont décochés
**And** le badge disparaît de l'icône
**And** le Sheet reste ouvert pour permettre de nouvelles sélections

### AC10: Persistance des filtres en localStorage
**Given** j'ai appliqué des filtres avancés
**When** je quitte et reviens sur la page `/offers`
**Then** mes filtres avancés sont restaurés depuis localStorage
**And** la liste s'affiche directement filtrée
**And** le badge indique le nombre de filtres actifs

### AC11: Empty state avec filtres avancés
**Given** des filtres avancés sont actifs et aucune offre ne correspond
**When** la liste est filtrée
**Then** un empty state s'affiche "Aucune offre ne correspond à vos filtres"
**And** un bouton "Réinitialiser les filtres" réinitialise TOUS les filtres (catégorie + avancés)

## Tasks / Subtasks

- [x] **Task 1: Créer le composant OfferFilterSheet** (AC: 2, 3, 5, 6, 9)
  - [x] 1.1 Créer `/src/components/custom/offer-filter-sheet.tsx` (`"use client"`)
  - [x] 1.2 Utiliser `Sheet` + `SheetContent side="bottom"` + `SheetHeader` + `SheetTitle` + `SheetFooter`
  - [x] 1.3 Section "Date de validité" : 3 boutons radio (Toutes, Cette semaine, Ce mois) — utiliser des `<button>` stylisés avec `role="radiogroup"` / `role="radio"` + `aria-checked`
  - [x] 1.4 Section "Fournisseur" : liste de checkboxes avec `companyName`, triés alphabétiquement
  - [x] 1.5 Props: `{ open, onOpenChange, suppliers: { id: string, companyName: string }[], dateFilter: DateFilterValue, supplierFilter: string[], onApply: (date: DateFilterValue, suppliers: string[]) => void, onReset: () => void }`
  - [x] 1.6 Type `DateFilterValue = 'all' | 'this-week' | 'this-month'`
  - [x] 1.7 État interne temporaire pour les sélections avant "Appliquer" (ne pas modifier l'état parent tant qu'on n'applique pas)
  - [x] 1.8 Bouton "Appliquer" appelle `onApply` puis ferme le Sheet — Bouton "Réinitialiser" appelle `onReset`

- [x] **Task 2: Créer les utilitaires de filtrage par date** (AC: 4)
  - [x] 2.1 Créer les helpers dans `/src/lib/utils/filters.ts`
  - [x] 2.2 `getWeekRange(): { start: Date, end: Date }` — lundi → dimanche de la semaine en cours (UTC)
  - [x] 2.3 `getMonthRange(): { start: Date, end: Date }` — 1er → dernier jour du mois en cours (UTC)
  - [x] 2.4 `dateRangesOverlap(offerStart: string, offerEnd: string, filterStart: Date, filterEnd: Date): boolean` — vérifie que [offerStart, offerEnd] chevauche [filterStart, filterEnd]
  - [x] 2.5 **IMPORTANT UTC:** Toujours utiliser `setUTCHours(0,0,0,0)` pour les dates de comparaison (lesson story 3.1 — H2 timezone issue)

- [x] **Task 3: Intégrer les filtres avancés dans StoreOfferList** (AC: 1, 4, 7, 8, 10, 11)
  - [x] 3.1 Modifier `/src/components/custom/store-offer-list.tsx`
  - [x] 3.2 Ajouter deux nouvelles clés localStorage : `store-offers-date-filter` (string: 'all' | 'this-week' | 'this-month') et `store-offers-supplier-filter` (JSON string[])
  - [x] 3.3 Ajouter `useSyncExternalStore` pour chaque nouveau filtre (même pattern que catégorie existante)
  - [x] 3.4 Extraire la liste unique des fournisseurs depuis `offers` : `useMemo(() => [...new Map(offers.map(o => [o.supplierId, { id: o.supplierId, companyName: o.supplier.companyName }])).values()].sort((a,b) => a.companyName.localeCompare(b.companyName)), [offers])`
  - [x] 3.5 Chaîne de filtrage : `offers → filtrer par catégorie → filtrer par date → filtrer par fournisseur`
  - [x] 3.6 Calculer `activeFilterCount` : nombre de filtres avancés actifs (0, 1 ou 2)
  - [x] 3.7 Rendre le bouton icône SlidersHorizontal avec badge à côté des CategoryFilterChips
  - [x] 3.8 Rendre `<OfferFilterSheet>` contrôlé par un state `open`/`onOpenChange`
  - [x] 3.9 **IMPORTANT:** Les `categoryCounts` doivent refléter les offres APRÈS filtrage avancé (date + fournisseur) mais AVANT filtrage catégorie — pour que l'utilisateur voie combien d'offres par catégorie dans son scope filtré
  - [x] 3.10 L'empty state filtré doit distinguer : si seulement catégorie active → "Aucune offre dans cette catégorie" (existant) ; si filtres avancés actifs → "Aucune offre ne correspond à vos filtres" + bouton "Réinitialiser les filtres" qui reset TOUT

- [x] **Task 4: Tests OfferFilterSheet** (AC: 2, 3, 5, 6, 9)
  - [x] 4.1 Créer `/src/components/custom/offer-filter-sheet.test.tsx`
  - [x] 4.2 Affiche le Sheet avec titre "Filtrer les offres"
  - [x] 4.3 Affiche 3 options de date (Toutes, Cette semaine, Ce mois)
  - [x] 4.4 "Toutes les dates" sélectionné par défaut quand `dateFilter === 'all'`
  - [x] 4.5 Affiche les fournisseurs triés alphabétiquement
  - [x] 4.6 Click sur un fournisseur le coche
  - [x] 4.7 Click "Appliquer" appelle `onApply` avec les bonnes valeurs
  - [x] 4.8 Click "Réinitialiser" appelle `onReset`
  - [x] 4.9 L'état interne ne modifie pas le parent avant "Appliquer"
  - [x] 4.10 Affiche les checkboxes cochées pour les fournisseurs déjà filtrés

- [x] **Task 5: Tests utilitaires de filtrage** (AC: 4)
  - [x] 5.1 Créer `/src/lib/utils/filters.test.ts`
  - [x] 5.2 `getWeekRange` retourne lundi → dimanche en cours (UTC)
  - [x] 5.3 `getMonthRange` retourne 1er → dernier jour du mois en cours (UTC)
  - [x] 5.4 `dateRangesOverlap` — chevauchement total, partiel, aucun, même jour, dates limites
  - [x] 5.5 Tester les edge cases : offre qui commence avant et finit pendant, offre entièrement incluse, offre qui déborde après

- [x] **Task 6: Mettre à jour les tests StoreOfferList** (AC: 1, 7, 8, 10, 11)
  - [x] 6.1 Modifier `/src/components/custom/store-offer-list.test.tsx`
  - [x] 6.2 Tester que le bouton filtres avancés est rendu
  - [x] 6.3 Tester le badge compteur (0 → pas de badge, 1 → "1", 2 → "2")
  - [x] 6.4 Tester le filtrage par date (mock dates)
  - [x] 6.5 Tester le filtrage par fournisseur
  - [x] 6.6 Tester la combinaison catégorie + date + fournisseur
  - [x] 6.7 Tester la persistance localStorage des filtres avancés
  - [x] 6.8 Tester l'empty state avec filtres avancés + bouton "Réinitialiser les filtres"
  - [x] 6.9 Tester que `categoryCounts` reflète les offres après filtrage avancé

- [x] **Task 7: Validation finale** (AC: 1-11)
  - [x] 7.1 `npm run test` — tous les tests passent
  - [x] 7.2 `npm run build` — build OK
  - [x] 7.3 `npm run lint` — lint OK (0 erreur, 0 warning)
  - [x] 7.4 Tests existants non cassés

## Dev Notes

### Architecture Compliance

**Patterns OBLIGATOIRES à suivre:**
- `"use client"` sur `OfferFilterSheet` et `StoreOfferList` (déjà client) — filtrage 100% client-side [Source: project-context.md#Next.js Rules]
- Fichiers en `kebab-case`, composants en `PascalCase` [Source: architecture.md#Naming Patterns]
- Tests co-localisés `*.test.tsx` à côté du source [Source: architecture.md#Structure Patterns]
- Utiliser le composant `Sheet` de shadcn/ui (`src/components/ui/sheet.tsx`) — NE PAS créer de custom modal/overlay
- NE PAS modifier la query `getActiveOffers()` — le filtrage est client-side
- NE PAS modifier `store-offer-card.tsx` — aucun changement sur les cards
- NE PAS modifier `category-filter-chips.tsx` — le composant reste inchangé, on change seulement les données qu'on lui passe

**Décision architecturale — Filtrage client-side (confirmée):**
Même approche que story 3.2. Toutes les offres actives sont chargées par la page RSC. Le filtrage par date/fournisseur est une opération triviale sur un array. Pas de Server Action, pas de query Prisma supplémentaire. Client-side `Array.filter()` combiné.

### Pattern useSyncExternalStore — Extension

Reprendre **exactement** le même pattern que pour le filtre catégorie (story 3.2), avec de nouvelles clés:

```typescript
// Nouvelles clés localStorage
const DATE_FILTER_KEY = 'store-offers-date-filter'
const DATE_FILTER_EVENT = 'date-filter-change'

const SUPPLIER_FILTER_KEY = 'store-offers-supplier-filter'
const SUPPLIER_FILTER_EVENT = 'supplier-filter-change'

// Types
type DateFilterValue = 'all' | 'this-week' | 'this-month'

// Date filter store
function subscribeDateFilter(callback: () => void): () => void {
  window.addEventListener(DATE_FILTER_EVENT, callback)
  return () => window.removeEventListener(DATE_FILTER_EVENT, callback)
}
function getDateFilterSnapshot(): DateFilterValue {
  const value = localStorage.getItem(DATE_FILTER_KEY)
  if (value === 'this-week' || value === 'this-month') return value
  return 'all'
}
function getDateFilterServerSnapshot(): DateFilterValue {
  return 'all'
}

// Supplier filter store
function subscribeSupplierFilter(callback: () => void): () => void {
  window.addEventListener(SUPPLIER_FILTER_EVENT, callback)
  return () => window.removeEventListener(SUPPLIER_FILTER_EVENT, callback)
}
function getSupplierFilterSnapshot(): string[] {
  const value = localStorage.getItem(SUPPLIER_FILTER_KEY)
  if (!value) return []
  try { return JSON.parse(value) } catch { return [] }
}
function getSupplierFilterServerSnapshot(): string[] {
  return []
}
```

### Logique de chevauchement de dates — CRITIQUE

Le filtre date ne filtre PAS par `startDate >= filterStart`. Il vérifie le **chevauchement** :

```typescript
// Une offre [offerStart, offerEnd] chevauche [filterStart, filterEnd] si :
// offerStart <= filterEnd AND offerEnd >= filterStart
function dateRangesOverlap(
  offerStart: string,
  offerEnd: string,
  filterStart: Date,
  filterEnd: Date
): boolean {
  const oStart = new Date(offerStart)
  const oEnd = new Date(offerEnd)
  return oStart <= filterEnd && oEnd >= filterStart
}
```

Cela signifie qu'une offre valide du 10 au 25 février sera visible si le filtre "Cette semaine" couvre le 17-23 février (chevauchement partiel = visible).

### Calcul des plages de dates — UTC

```typescript
function getWeekRange(): { start: Date; end: Date } {
  const now = new Date()
  const day = now.getUTCDay() // 0 = dimanche
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() - ((day + 6) % 7))
  monday.setUTCHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  sunday.setUTCHours(23, 59, 59, 999)
  return { start: monday, end: sunday }
}

function getMonthRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999))
  return { start, end }
}
```

**TOUJOURS UTC** — les dates Prisma sont en UTC, les dates sérialisées sont ISO strings. Utiliser `getUTC*` partout pour éviter les décalages de timezone (lesson story 3.1 — H2 timezone issue).

### Chaîne de filtrage dans StoreOfferList

```typescript
// 1. Filtrage avancé (date + fournisseur) — s'applique sur toutes les offres
const advancedFilteredOffers = useMemo(() => {
  let result = offers

  // Filtre date
  if (dateFilter !== 'all') {
    const range = dateFilter === 'this-week' ? getWeekRange() : getMonthRange()
    result = result.filter(o => dateRangesOverlap(o.startDate, o.endDate, range.start, range.end))
  }

  // Filtre fournisseur
  if (supplierFilter.length > 0) {
    const supplierSet = new Set(supplierFilter)
    result = result.filter(o => supplierSet.has(o.supplierId))
  }

  return result
}, [offers, dateFilter, supplierFilter])

// 2. Compteurs catégorie calculés sur les offres APRÈS filtrage avancé (mais AVANT catégorie)
const categoryCounts = useMemo(() => {
  const counts: Record<string, number> = {}
  for (const offer of advancedFilteredOffers) {
    if (offer.category) {
      counts[offer.category] = (counts[offer.category] || 0) + 1
    }
  }
  return counts
}, [advancedFilteredOffers])

// 3. Filtrage catégorie — s'applique sur les offres déjà filtrées par date/fournisseur
const filteredOffers = useMemo(() => {
  if (!selectedCategory) return advancedFilteredOffers
  return advancedFilteredOffers.filter(o => o.category === selectedCategory)
}, [advancedFilteredOffers, selectedCategory])
```

**CRITIQUE: L'ordre est important !** Les `categoryCounts` doivent refléter les offres APRÈS date/fournisseur mais AVANT catégorie. Ainsi, quand l'utilisateur a filtré sur "Cette semaine" + "Nestlé", les chips montrent combien d'offres Nestlé cette semaine il y a par catégorie.

### Layout du bouton filtres avancés

Le bouton icône doit être rendu **dans la même ligne** que les CategoryFilterChips, à droite :

```tsx
<div className="flex items-center gap-2">
  <div className="flex-1 min-w-0">
    <CategoryFilterChips
      selectedCategory={selectedCategory}
      onCategoryChange={handleCategoryChange}
      categoryCounts={categoryCounts}
      totalCount={advancedFilteredOffers.length}
    />
  </div>
  <button
    type="button"
    onClick={() => setSheetOpen(true)}
    className="relative flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-secondary-foreground"
    aria-label="Filtres avancés"
  >
    <SlidersHorizontal className="h-5 w-5" />
    {activeFilterCount > 0 && (
      <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
        {activeFilterCount}
      </span>
    )}
  </button>
</div>
```

### Structure OfferFilterSheet

```tsx
<Sheet open={open} onOpenChange={onOpenChange}>
  <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Filtrer les offres</SheetTitle>
    </SheetHeader>

    <div className="space-y-6 py-4">
      {/* Section Date */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Date de validité</h3>
        <div role="radiogroup" aria-label="Filtre par date" className="space-y-2">
          {/* 3 radio buttons: Toutes les dates, Cette semaine, Ce mois */}
        </div>
      </div>

      {/* Section Fournisseur */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Fournisseur</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {/* Checkboxes triées alphabétiquement */}
        </div>
      </div>
    </div>

    <SheetFooter className="flex-row gap-2">
      <Button variant="ghost" onClick={handleReset} className="flex-1">
        Réinitialiser
      </Button>
      <Button onClick={handleApply} className="flex-1">
        Appliquer
      </Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

**Points UX importants:**
- `max-h-[80vh]` pour ne pas couvrir tout l'écran
- `overflow-y-auto` sur la liste des fournisseurs si elle est longue (`max-h-48`)
- Boutons en `SheetFooter` côte à côte (Réinitialiser ghost + Appliquer primary)
- **État temporaire interne:** Quand le Sheet s'ouvre, copier les valeurs actuelles dans un state local. Modifier localement. Appliquer seulement au click "Appliquer". Cela permet d'annuler en fermant le Sheet sans appliquer.

### Checkbox Fournisseur — Implémentation

Utiliser le composant `Checkbox` de shadcn/ui s'il est installé. Sinon, des checkboxes HTML natifs stylisés :

```tsx
<label className="flex items-center gap-3 py-2 cursor-pointer">
  <input
    type="checkbox"
    checked={localSuppliers.includes(supplier.id)}
    onChange={() => toggleSupplier(supplier.id)}
    className="h-4 w-4 rounded border-input"
  />
  <span className="text-sm">{supplier.companyName}</span>
</label>
```

**Vérifier** si le composant `Checkbox` shadcn est installé dans `src/components/ui/checkbox.tsx`. Si oui, l'utiliser. Sinon, utiliser un input checkbox natif — NE PAS installer shadcn Checkbox pour cette seule story (sauf si déjà disponible).

### Radio Date — Implémentation

Des boutons stylisés en radio group (même approche que CategoryFilterChips) :

```tsx
const DATE_OPTIONS: { value: DateFilterValue; label: string }[] = [
  { value: 'all', label: 'Toutes les dates' },
  { value: 'this-week', label: 'Cette semaine' },
  { value: 'this-month', label: 'Ce mois' },
]

{DATE_OPTIONS.map(option => (
  <button
    key={option.value}
    type="button"
    role="radio"
    aria-checked={localDateFilter === option.value}
    onClick={() => setLocalDateFilter(option.value)}
    className={cn(
      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
      localDateFilter === option.value
        ? 'bg-primary text-primary-foreground'
        : 'bg-secondary text-secondary-foreground'
    )}
  >
    {option.label}
  </button>
))}
```

### Project Structure Notes

**Fichiers à créer:**
- `/src/components/custom/offer-filter-sheet.tsx` — Composant Sheet filtres avancés
- `/src/components/custom/offer-filter-sheet.test.tsx` — Tests composant
- `/src/lib/utils/filters.ts` — Utilitaires de filtrage (date ranges, overlap)
- `/src/lib/utils/filters.test.ts` — Tests utilitaires

**Fichiers à modifier:**
- `/src/components/custom/store-offer-list.tsx` — Intégrer filtres avancés, bouton icône, chaîne de filtrage
- `/src/components/custom/store-offer-list.test.tsx` — Ajouter tests filtres avancés

**Fichiers existants à réutiliser (NE PAS recréer):**
- `/src/components/ui/sheet.tsx` → Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter
- `/src/components/ui/button.tsx` → Button (variants primary, ghost)
- `/src/components/custom/category-filter-chips.tsx` → CategoryFilterChips (AUCUNE modification)
- `/src/components/custom/store-offer-card.tsx` → StoreOfferCard (AUCUNE modification)
- `/src/lib/utils/cn.ts` → `cn()`

**NE PAS modifier:**
- `src/app/(store)/offers/page.tsx` — La page RSC ne change PAS
- `src/lib/queries/offers.ts` — La query `getActiveOffers()` ne change PAS
- `category-filter-chips.tsx` — Le composant ne change PAS (seules les props changent)
- `store-offer-card.tsx` — Les cards ne changent PAS

**NE PAS installer de nouvelle dépendance.** Tout est déjà disponible (Sheet, Button, lucide-react pour SlidersHorizontal).

### Previous Story Intelligence

**Story 3.2 (Filtrage par catégorie) — Learnings critiques:**
- 519 tests passent (39 fichiers) — NE PAS les casser
- `useSyncExternalStore` pattern pour localStorage — **réutiliser exactement ce pattern** (pas useState+useEffect)
- `VALID_CATEGORIES` Set pour valider les valeurs localStorage — appliquer la même validation pour dateFilter
- `scrollbar-hide` utility déjà ajoutée dans `globals.css`
- `StoreOfferList` est `"use client"` avec `useTransition` + `router.refresh()` pour le bouton Actualiser — préserver ce pattern
- Hydration: `getServerSnapshot()` retourne la valeur par défaut (pas de localStorage côté serveur)
- Code review story 3.2 : `type="button"` sur tous les boutons interactifs (éviter submit implicite)

**Story 3.1 — Learnings additionnels:**
- `SerializedOfferWithSupplier` a les champs `startDate: string`, `endDate: string`, `supplierId: string`, `supplier: { companyName: string }` — tous nécessaires pour cette story
- H2 timezone issue : toujours utiliser `setUTCHours` pour les comparaisons de dates
- `isNewOffer()` et `getOfferDisplayStatus()` dans `src/lib/utils/offers.ts` — NE PAS les toucher

### Git Intelligence

**Commits récents pertinents:**
- `981f40e` — Stories 2.5-3.2, design system Acquire et filtrage par catégorie
  - Pattern de filtrage client-side établi
  - CategoryFilterChips créé avec useSyncExternalStore
  - Tests de filtrage avec mock localStorage

**Conventions de commit établies:** `feat: Description en français (Story X.X)`

### Library & Framework Requirements

**Dépendances déjà installées (NE PAS réinstaller):**
- `react@19` — useSyncExternalStore, useMemo, useState, useCallback
- `lucide-react` — SlidersHorizontal (icône filtres)
- `@radix-ui/react-dialog` — utilisé par Sheet (via shadcn)
- `tailwindcss` — Styling

**Composants shadcn disponibles:**
- `Sheet` (`src/components/ui/sheet.tsx`) — DÉJÀ INSTALLÉ
- `Button` (`src/components/ui/button.tsx`) — DÉJÀ INSTALLÉ

**AUCUNE nouvelle dépendance requise.**

### Testing Requirements

**Tests OfferFilterSheet (`offer-filter-sheet.test.tsx`):**
- Affiche le Sheet avec titre "Filtrer les offres"
- Affiche 3 options de date avec "Toutes les dates" sélectionné par défaut
- Click sur "Cette semaine" change la sélection radio visuelle
- Affiche les fournisseurs triés alphabétiquement
- Click sur un fournisseur coche/décoche la checkbox
- Click "Appliquer" appelle `onApply` avec les bonnes valeurs (date + suppliers)
- Click "Réinitialiser" appelle `onReset`
- L'état interne ne modifie pas le parent avant "Appliquer" (fermer sans appliquer = pas de changement)
- Pré-sélection correcte des filtres déjà actifs (props `dateFilter`, `supplierFilter`)

**Tests utilitaires (`filters.test.ts`):**
- `getWeekRange()` retourne lundi 00:00:00 → dimanche 23:59:59 UTC
- `getMonthRange()` retourne 1er 00:00:00 → dernier jour 23:59:59 UTC
- `dateRangesOverlap` — 5+ cas : chevauchement total, partiel début, partiel fin, aucun, même jour
- Edge case : offre d'un seul jour, filtre d'un seul jour

**Tests StoreOfferList mis à jour (`store-offer-list.test.tsx`):**
- Bouton filtres avancés rendu (icône SlidersHorizontal)
- Badge compteur affiché quand filtres actifs
- Pas de badge quand aucun filtre avancé
- Filtrage par date : mock localStorage + dispatch event → offres filtrées
- Filtrage par fournisseur : mock localStorage + dispatch event → offres filtrées
- Combinaison triple : catégorie + date + fournisseur
- `categoryCounts` recalculés après filtrage avancé
- Empty state avec filtres avancés : message + bouton reset
- Persistance localStorage des filtres avancés
- Réinitialisation complète (catégorie + avancés)

**Pattern de test:**
- Mock localStorage: `vi.spyOn(Storage.prototype, 'getItem')`, `vi.spyOn(Storage.prototype, 'setItem')`
- Mock Date pour les tests de date range : `vi.useFakeTimers()` / `vi.setSystemTime()`
- Offres mock avec dates et fournisseurs variés
- `@testing-library/react` + `vitest`
- Mock `next/navigation` (`useRouter`)

### Security Considerations

- Pas de nouvelles données exposées — même query, même filtrage client-side
- localStorage ne contient que des strings (date preset, supplier IDs) — pas de données sensibles
- Pas de Server Action dans cette story — lecture seule
- Les supplier IDs dans localStorage sont des UUIDs publics (pas de fuite d'information)

### UX Considerations

- **Sheet bottom panel (UX-09):** Pattern mobile natif pour les filtres avancés [Source: ux-design-specification.md#Modal & Overlay Patterns]
- **Combinaison filtres (FR14, FR15):** AND logique entre catégorie, date, fournisseur
- **Badge compteur:** Feedback visuel immédiat du nombre de filtres actifs — l'utilisateur sait qu'il y a des filtres appliqués
- **Mémorisation filtres:** Persistance localStorage — contrôle utilisateur préservé [Source: ux-design-specification.md#Experience Principles#3-Control]
- **État temporaire dans le Sheet:** L'utilisateur peut explorer les options sans appliquer — fermer = annuler
- **Réinitialisation à deux niveaux:** "Réinitialiser" dans le Sheet = filtres avancés seulement ; bouton empty state = TOUT réinitialiser
- **Feedback instantané (NFR2):** Filtrage client-side < 500ms
- **Touch targets:** Bouton icône filtres min 40x40px, checkboxes et radios avec labels cliquables larges

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.3: Filtrage par Date et Fournisseur]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Modal & Overlay Patterns — Sheet bottom]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Transferable UX Patterns — Filtres chips]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/project-context.md#Next.js Rules]
- [Source: _bmad-output/implementation-artifacts/3-2-filtrage-par-categorie.md — pattern useSyncExternalStore]
- [Source: src/components/ui/sheet.tsx — Sheet component]
- [Source: src/components/custom/store-offer-list.tsx — pattern existant filtrage]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed `useSyncExternalStore` infinite loop: `getSupplierFilterSnapshot` returning new array reference on each call. Solution: cached raw string + parsed result comparison.
- Fixed ESLint `react-hooks/set-state-in-effect` error: replaced `useEffect` with "adjust state during rendering" pattern (`prevOpen` tracking) per React docs recommendation.

### Completion Notes List

- OfferFilterSheet: Sheet bottom panel avec radios date (all/this-week/this-month) et checkboxes fournisseur multi-sélection. État interne temporaire, appliqué seulement au click "Appliquer".
- Utilitaires filtrage: `getWeekRange()`, `getMonthRange()`, `dateRangesOverlap()` — tout en UTC.
- StoreOfferList: 3 stores `useSyncExternalStore` (catégorie + date + fournisseur). Chaîne de filtrage: advanced filters → categoryCounts → catégorie. Bouton icône SlidersHorizontal avec badge compteur. Empty state différencié.
- 57 nouveaux tests (12 OfferFilterSheet + 16 utilitaires + 29 StoreOfferList). Total suite: 562 tests, 41 fichiers, 0 régressions.

### Change Log

- 2026-02-08: Story 3.3 implémentée — Filtrage par date et fournisseur avec Sheet bottom, persistance localStorage, combinaison AND triple (catégorie + date + fournisseur)

### File List

**Créés:**
- `src/components/custom/offer-filter-sheet.tsx` — Composant Sheet filtres avancés
- `src/components/custom/offer-filter-sheet.test.tsx` — Tests composant (12 tests)
- `src/lib/utils/filters.ts` — Utilitaires de filtrage date (getWeekRange, getMonthRange, dateRangesOverlap)
- `src/lib/utils/filters.test.ts` — Tests utilitaires (16 tests)

**Modifiés:**
- `src/components/custom/store-offer-list.tsx` — Intégration filtres avancés, bouton icône, chaîne de filtrage, empty state
- `src/components/custom/store-offer-list.test.tsx` — Tests étendus (29 tests, +15 nouveaux)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Status 3-3: backlog → review
