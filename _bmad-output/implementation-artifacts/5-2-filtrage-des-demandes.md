# Story 5.2: Filtrage des Demandes

Status: done

## Story

As a fournisseur (supplier),
I want to filter my received requests by type and by status,
so that I can prioritize my processing and focus on the most important requests first.

## Acceptance Criteria

1. **AC1 - FilterChips visibles** : Une barre de FilterChips s'affiche en haut de la liste des demandes avec deux groupes de filtres :
   - Type : "Tous", "Renseignements", "Commandes"
   - Statut : "Tous", "Nouveaux", "Traités"

2. **AC2 - Filtre par type** : Quand je tape sur "Commandes", seules les demandes de type ORDER s'affichent (FR26). Le chip devient actif (style primary). Le filtrage est instantané (< 500ms).

3. **AC3 - Filtre par statut** : Quand je tape sur "Nouveaux", seules les demandes avec status PENDING s'affichent (FR27). Le chip devient actif.

4. **AC4 - Filtres combinés** : Si je sélectionne "Commandes" + "Nouveaux", seules les demandes type=ORDER ET status=PENDING s'affichent (logique AND). Les deux chips sont actifs.

5. **AC5 - Réinitialisation** : Quand je tape sur "Tous" dans un groupe, le filtre de ce groupe est réinitialisé. L'autre groupe reste filtré si applicable.

6. **AC6 - Persistance localStorage** : Les filtres sont mémorisés entre les visites de la page. Au retour, la liste affiche directement les demandes filtrées.

7. **AC7 - Empty state contextuel** : Si un filtre est actif et aucune demande ne correspond, un empty state contextuel s'affiche :
   - "Aucune demande de renseignements" si type filter actif
   - "Aucune nouvelle demande" si status filter actif
   - "Aucune demande correspondant aux filtres" si les deux sont actifs
   - Un bouton "Réinitialiser les filtres" permet de tout effacer.

8. **AC8 - Compteurs** : Chaque chip affiche le nombre de demandes correspondantes entre parenthèses (ex : "Commandes (3)").

## Tasks / Subtasks

- [x] Task 1: Ajouter les filter stores localStorage dans `SupplierRequestList` (AC: #1, #6)
  - [x] 1.1 Créer les constantes `SUPPLIER_REQUESTS_TYPE_FILTER_KEY` et `SUPPLIER_REQUESTS_STATUS_FILTER_KEY`
  - [x] 1.2 Implémenter les fonctions `subscribe*`, `get*Snapshot`, `get*ServerSnapshot` pour chaque filtre
  - [x] 1.3 Utiliser `useSyncExternalStore` pour synchroniser les états avec localStorage

- [x] Task 2: Créer le composant `RequestTypeFilterChips` (AC: #1, #2, #8)
  - [x] 2.1 Créer `src/components/custom/request-type-filter-chips.tsx`
  - [x] 2.2 Props: `selectedType: string | null`, `onTypeChange: (type: string | null) => void`, `typeCounts: Record<string, number>`, `totalCount: number`
  - [x] 2.3 Chips: "Tous ({total})", "Renseignements ({INFO count})", "Commandes ({ORDER count})"
  - [x] 2.4 Design: Identique à `CategoryFilterChips` — `rounded-full`, `bg-primary` actif, `bg-secondary` inactif, `min-h-[36px]`, `role="radiogroup"`
  - [x] 2.5 Tests dans `src/components/custom/request-type-filter-chips.test.tsx`

- [x] Task 3: Créer le composant `RequestStatusFilterChips` (AC: #1, #3, #8)
  - [x] 3.1 Créer `src/components/custom/request-status-filter-chips.tsx`
  - [x] 3.2 Props: `selectedStatus: string | null`, `onStatusChange: (status: string | null) => void`, `statusCounts: Record<string, number>`, `totalCount: number`
  - [x] 3.3 Chips: "Tous ({total})", "Nouveaux ({PENDING count})", "Traités ({TREATED count})"
  - [x] 3.4 Design identique à `RequestTypeFilterChips`
  - [x] 3.5 Tests dans `src/components/custom/request-status-filter-chips.test.tsx`

- [x] Task 4: Implémenter le filtrage client dans `SupplierRequestList` (AC: #2, #3, #4, #5, #8)
  - [x] 4.1 Ajouter les `useSyncExternalStore` hooks pour type et status
  - [x] 4.2 Ajouter les `useCallback` handlers `handleTypeChange` et `handleStatusChange`
  - [x] 4.3 Calculer les compteurs avec `useMemo` :
    - `typeCounts` : compter INFO et ORDER sur la liste brute (pas filtrée par type, mais filtrée par status si actif)
    - `statusCounts` : compter PENDING et TREATED sur la liste brute (pas filtrée par status, mais filtrée par type si actif)
  - [x] 4.4 Calculer `filteredRequests` avec `useMemo` : appliquer les deux filtres en AND
  - [x] 4.5 Ajouter `handleResetFilters` pour réinitialiser les deux filtres

- [x] Task 5: Intégrer les chips et l'empty state dans le UI (AC: #1, #7)
  - [x] 5.1 Layout : deux lignes de chips au-dessus du bouton refresh
    ```
    [Type chips: Tous | Renseignements | Commandes]
    [Status chips: Tous | Nouveaux | Traités]   [Actualiser]
    ```
  - [x] 5.2 Empty state filtré : icône `MessageSquare`, message contextuel selon les filtres actifs, bouton "Réinitialiser les filtres"
  - [x] 5.3 Continuer à afficher les cards non-filtrées via `filteredRequests`

- [x] Task 6: Mettre à jour les tests de `SupplierRequestList` (AC: tous)
  - [x] 6.1 Tests de rendering des chips type et status
  - [x] 6.2 Tests de filtrage par type (clic sur chip → liste filtrée)
  - [x] 6.3 Tests de filtrage par statut (clic sur chip → liste filtrée)
  - [x] 6.4 Tests de filtres combinés (type + status)
  - [x] 6.5 Tests de réinitialisation ("Tous" remet un groupe)
  - [x] 6.6 Tests de l'empty state contextuel (messages différents selon filtres)
  - [x] 6.7 Tests des compteurs sur les chips
  - [x] 6.8 Mock localStorage pour les tests de persistance

- [x] Task 7: Validation finale (tous AC)
  - [x] 7.1 Tous les tests passent (`npm run test`)
  - [x] 7.2 TypeScript sans erreurs (`tsc --noEmit`)
  - [x] 7.3 Vérifier le filtrage combiné type + statut
  - [x] 7.4 Vérifier la persistance localStorage
  - [x] 7.5 Vérifier les empty states contextuels

## Dev Notes

### CRITICAL : Pattern à suivre — `StoreOfferList` + `CategoryFilterChips`

Le pattern de filtrage est DÉJÀ établi dans `src/components/custom/store-offer-list.tsx`. Voici le pattern exact :

**localStorage + useSyncExternalStore :**
```typescript
const STORAGE_KEY = 'supplier-requests-type-filter'
const CHANGE_EVENT = 'supplier-requests-type-filter-change'

const VALID_TYPES: ReadonlySet<string> = new Set(['INFO', 'ORDER'])

function subscribe(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback)
  return () => window.removeEventListener(CHANGE_EVENT, callback)
}

function getSnapshot(): string | null {
  const value = localStorage.getItem(STORAGE_KEY)
  if (value !== null && !VALID_TYPES.has(value)) return null
  return value
}

function getServerSnapshot(): null {
  return null
}
```

Même pattern pour le status filter avec `VALID_STATUSES = new Set(['PENDING', 'TREATED'])`.

### Composants FilterChips — Miroir de `CategoryFilterChips`

Créer `RequestTypeFilterChips` et `RequestStatusFilterChips` en miroir exact de `src/components/custom/category-filter-chips.tsx` :

```typescript
// Exemple: request-type-filter-chips.tsx
'use client'

import { cn } from '@/lib/utils/cn'
import { REQUEST_TYPE_CONFIG } from '@/lib/utils/requests'

const REQUEST_TYPES = ['INFO', 'ORDER'] as const

interface RequestTypeFilterChipsProps {
  selectedType: string | null
  onTypeChange: (type: string | null) => void
  typeCounts: Record<string, number>
  totalCount: number
}

export function RequestTypeFilterChips({
  selectedType,
  onTypeChange,
  typeCounts,
  totalCount,
}: RequestTypeFilterChipsProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto scrollbar-hide flex-nowrap pb-1"
      role="radiogroup"
      aria-label="Filtrer par type"
    >
      <button
        type="button"
        role="radio"
        aria-checked={selectedType === null}
        onClick={() => onTypeChange(null)}
        className={cn(
          'min-h-[36px] px-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
          selectedType === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground'
        )}
      >
        Tous ({totalCount})
      </button>
      {REQUEST_TYPES.map((type) => (
        <button
          type="button"
          key={type}
          role="radio"
          aria-checked={selectedType === type}
          onClick={() => onTypeChange(type)}
          className={cn(
            'min-h-[36px] px-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            selectedType === type
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          )}
        >
          {REQUEST_TYPE_CONFIG[type].label} ({typeCounts[type] || 0})
        </button>
      ))}
    </div>
  )
}
```

Pattern identique pour `RequestStatusFilterChips` avec `SUPPLIER_REQUEST_STATUS_CONFIG`.

### Calcul des compteurs — Pattern "cross-counts"

Les compteurs doivent refléter les résultats de l'autre filtre, pas la liste complète. Cela permet au fournisseur de voir combien de résultats chaque option donnerait :

```typescript
// Filtrage par type (appliqué sur requests filtrées par status)
const typeFilteredRequests = useMemo(() => {
  if (!selectedStatus) return requests
  return requests.filter((r) => r.status === selectedStatus)
}, [requests, selectedStatus])

// Compteurs type (basés sur requests filtrées par status)
const typeCounts = useMemo(() => {
  const counts: Record<string, number> = {}
  for (const r of typeFilteredRequests) {
    counts[r.type] = (counts[r.type] || 0) + 1
  }
  return counts
}, [typeFilteredRequests])

// Filtrage par status (appliqué sur requests filtrées par type)
const statusFilteredRequests = useMemo(() => {
  if (!selectedType) return requests
  return requests.filter((r) => r.type === selectedType)
}, [requests, selectedType])

// Compteurs status (basés sur requests filtrées par type)
const statusCounts = useMemo(() => {
  const counts: Record<string, number> = {}
  for (const r of statusFilteredRequests) {
    counts[r.status] = (counts[r.status] || 0) + 1
  }
  return counts
}, [statusFilteredRequests])

// Résultat final : les deux filtres en AND
const filteredRequests = useMemo(() => {
  let result = requests
  if (selectedType) result = result.filter((r) => r.type === selectedType)
  if (selectedStatus) result = result.filter((r) => r.status === selectedStatus)
  return result
}, [requests, selectedType, selectedStatus])
```

### Empty state contextuel

```typescript
function getFilteredEmptyMessage(selectedType: string | null, selectedStatus: string | null): string {
  if (selectedType && selectedStatus) return 'Aucune demande correspondant aux filtres'
  if (selectedType === 'INFO') return 'Aucune demande de renseignements'
  if (selectedType === 'ORDER') return 'Aucune intention de commande'
  if (selectedStatus === 'PENDING') return 'Aucune nouvelle demande'
  if (selectedStatus === 'TREATED') return 'Aucune demande traitée'
  return 'Aucune demande correspondant aux filtres'
}
```

### Configs à RÉUTILISER (NE PAS recréer)

| Config | Source | Usage |
|--------|--------|-------|
| `REQUEST_TYPE_CONFIG` | `src/lib/utils/requests.ts` | Labels "Renseignements"/"Commande" pour les chips |
| `SUPPLIER_REQUEST_STATUS_CONFIG` | `src/lib/utils/requests.ts` | Labels "Nouveau"/"Traité" pour les chips |
| `cn()` | `src/lib/utils/cn.ts` | Merge de classes conditionnelles |
| `formatRelativeDate()` | `src/lib/utils/format.ts` | Déjà utilisé dans SupplierRequestCard |

### localStorage keys

| Key | Values | Default |
|-----|--------|---------|
| `supplier-requests-type-filter` | `null` (Tous), `'INFO'`, `'ORDER'` | `null` |
| `supplier-requests-status-filter` | `null` (Tous), `'PENDING'`, `'TREATED'` | `null` |

### Layout UI final attendu

```
┌──────────────────────────────────────────────┐
│ PageHeader "Demandes reçues"                 │
├──────────────────────────────────────────────┤
│ [Tous (8)] [Renseignements (3)] [Commandes (5)]│  ← Type chips
│ [Tous (8)] [Nouveaux (5)] [Traités (3)] [🔄] │  ← Status chips + refresh
├──────────────────────────────────────────────┤
│ ┌─ SupplierRequestCard ────────────────────┐ │
│ │ Magasin A               [Commande]       │ │
│ │ Leclerc • Strasbourg                     │ │
│ │ → Nutella 1kg                            │ │
│ │ il y a 2h                  [Nouveau]     │ │
│ └──────────────────────────────────────────┘ │
│ ┌─ SupplierRequestCard ────────────────────┐ │
│ │ ...                                      │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### Visual Design Compliance

- **Chips** : `rounded-full`, `min-h-[36px]`, `px-3`, `text-sm font-medium`
- **Active chip** : `bg-primary text-primary-foreground`
- **Inactive chip** : `bg-secondary text-secondary-foreground`
- **Scrollable** : `overflow-x-auto scrollbar-hide flex-nowrap`
- **Accessibility** : `role="radiogroup"`, `role="radio"`, `aria-checked`, `aria-label`
- **Empty state filtered** : Icône `MessageSquare` (lucide-react), message contextuel, bouton "Réinitialiser les filtres" `variant="link"`
- **Page background** : `bg-muted`
- **Headings** : `font-display` (Plus Jakarta Sans)

### Project Structure Notes

Fichiers à CRÉER :
```
src/components/custom/
  ├── request-type-filter-chips.tsx          # Chips filtrage type
  ├── request-type-filter-chips.test.tsx     # Tests chips type
  ├── request-status-filter-chips.tsx        # Chips filtrage statut
  └── request-status-filter-chips.test.tsx   # Tests chips statut
```

Fichiers à MODIFIER :
```
src/components/custom/supplier-request-list.tsx       # Ajouter filtrage + chips
src/components/custom/supplier-request-list.test.tsx  # Ajouter tests filtrage
```

### Testing Requirements

- **`request-type-filter-chips.test.tsx`** (~8 tests) : rendering tous les chips, clic sur chip active, clic sur "Tous" réinitialise, compteurs affichés, aria-checked state, aria-label du radiogroup
- **`request-status-filter-chips.test.tsx`** (~8 tests) : idem pour les status chips
- **`supplier-request-list.test.tsx`** (~15 tests à ajouter) : rendering des chips, filtrage par type, filtrage par status, filtres combinés, réinitialisation, empty state contextuel (messages différents), compteurs dynamiques, mock localStorage
- **Total estimé** : ~30 nouveaux tests
- **Mock patterns** : `vi.mock('next/navigation')`, `vi.mock('@/lib/utils/format')`, `Object.defineProperty(window, 'localStorage', ...)` pour les tests de persistance

### Previous Story Intelligence (Story 5.1)

**Learnings from 5.1 :**
- `SupplierRequestList` est déjà un client component avec `useTransition` + `router.refresh()`
- Pattern `SupplierRequestCard` + `SerializedSupplierRequest` en place
- `SUPPLIER_REQUEST_STATUS_CONFIG` créé avec labels "Nouveau"/"Traité"
- `REQUEST_TYPE_CONFIG` réutilisé avec labels "Renseignements"/"Commande"
- 777 tests passaient à la fin de 5.1 (après review)
- `cn()` utilisé partout pour les classes conditionnelles
- Tests mock pattern : `vi.mock('next/navigation')`, `vi.mock('next/link')`

**Key infrastructure from Epic 3 (Store Offers Filtering) :**
- `CategoryFilterChips` component — pattern exact pour les chips
- `StoreOfferList` — pattern complet de filtrage client-side avec localStorage + useSyncExternalStore
- `useMemo` pour les compteurs et le filtrage
- `useCallback` pour les handlers localStorage
- Empty state contextuel avec messages différents selon les filtres

### Scope Boundaries

**IN scope :** Filtrage client-side par type et statut, FilterChips, localStorage persistence, empty states contextuels.

**OUT of scope :**
- Filtrage côté serveur (les demandes sont déjà chargées côté client)
- Filtre par Sheet/bottom panel (pas nécessaire, 2 groupes de chips suffisent)
- Filtre par date de création (pas demandé dans FR26/FR27)
- Filtre par enseigne ou ville du magasin (pas demandé)
- Modification de la page serveur `requests/page.tsx` (aucun changement nécessaire)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.2]
- [Source: _bmad-output/planning-artifacts/prd.md#FR26, FR27]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: src/components/custom/store-offer-list.tsx - Gold standard filtering pattern]
- [Source: src/components/custom/category-filter-chips.tsx - Chips UI pattern]
- [Source: src/components/custom/supplier-request-list.tsx - Current component to modify]
- [Source: src/lib/utils/requests.ts - REQUEST_TYPE_CONFIG, SUPPLIER_REQUEST_STATUS_CONFIG]
- [Source: _bmad-output/implementation-artifacts/5-1-liste-des-demandes-recues.md - Previous story]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: Added localStorage filter stores (TYPE_FILTER_KEY, STATUS_FILTER_KEY) with useSyncExternalStore pattern mirroring StoreOfferList. Functions: subscribeTypeFilter, getTypeFilterSnapshot, subscribeStatusFilter, getStatusFilterSnapshot.
- Task 2: Created RequestTypeFilterChips component with 8 passing tests. Mirrors CategoryFilterChips pattern with rounded-full chips, radiogroup aria, cross-count display.
- Task 3: Created RequestStatusFilterChips component with 8 passing tests. Uses plural labels "Nouveaux"/"Traités" per AC1.
- Task 4: Implemented cross-count pattern in SupplierRequestList — typeCounts filtered by status, statusCounts filtered by type, filteredRequests with AND logic. Added handleTypeChange, handleStatusChange, handleResetFilters handlers.
- Task 5: Integrated chips + empty state UI. Layout: type chips row, status chips + refresh button row. Empty state with MessageSquare icon and contextual messages per AC7.
- Task 6: Wrote 26 comprehensive tests in supplier-request-list.test.tsx covering: chip rendering, type filtering, status filtering, combined AND filtering, reset behavior, contextual empty states, cross-counts, localStorage persistence and restoration, invalid value handling.
- Task 7: Full test suite passes (812/812). TypeScript clean (only pre-existing FRUITS_LEGUMES errors remain). All ACs verified.

### Change Log

- 2026-02-10: Story 5.2 implementation complete — filtrage par type et statut des demandes fournisseur avec 40 nouveaux tests (8+8+24)
- 2026-02-10: Code review fixes — Labels chips corrigés ("Commandes" pluriel), pattern chipLabel centralisé dans configs, 4 tests manquants ajoutés (ORDER/TREATED empty states, reverse cross-counts, combined reset). Total: 46 tests (8+8+30).

### File List

- `src/components/custom/request-type-filter-chips.tsx` (NEW)
- `src/components/custom/request-type-filter-chips.test.tsx` (NEW)
- `src/components/custom/request-status-filter-chips.tsx` (NEW)
- `src/components/custom/request-status-filter-chips.test.tsx` (NEW)
- `src/components/custom/supplier-request-list.tsx` (MODIFIED)
- `src/components/custom/supplier-request-list.test.tsx` (MODIFIED)
- `src/lib/utils/requests.ts` (MODIFIED — ajout chipLabel)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (MODIFIED)
