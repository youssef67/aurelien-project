# Story 4.3: Historique des Demandes Magasin

Status: done

## Story

As a chef de rayon (store manager),
I want to view the history of my sent requests,
so that I can track my interactions with suppliers.

## Acceptance Criteria

1. **AC1 - Page liste /my-requests** : Accessible via bottom navigation "Demandes", affiche la liste des demandes du magasin courant triées par date DESC (plus récentes en premier). Seules MES demandes sont visibles (FR33 via RLS).

2. **AC2 - RequestCard magasin** : Chaque demande affiche : nom de l'offre, nom du fournisseur, badge type ("Renseignements" bleu primary ou "Commande" vert success), badge statut ("En attente" jaune warning ou "Traité" gris), date d'envoi en format relatif ("il y a 2h", "hier").

3. **AC3 - Navigation vers détail** : Clic sur une RequestCard redirige vers `/my-requests/[id]` qui affiche : infos de l'offre (nom, prix, fournisseur), mon message (si envoyé), statut actuel, date d'envoi.

4. **AC4 - Empty state** : Si aucune demande, affiche "Vous n'avez pas encore envoyé de demande" + CTA "Découvrir les offres" vers `/offers`.

5. **AC5 - Loading states** : Skeleton loading pendant le chargement des deux pages (liste et détail). Skeletons utilisent `bg-secondary`.

6. **AC6 - Bottom navigation update** : Le lien "Demandes" du `BottomNavigation` store pointe vers `/my-requests` (pas `/requests` pour éviter conflit avec le supplier route group).

7. **AC7 - Refresh** : Un bouton refresh (ou router.refresh()) permet de recharger la liste et voir les mises à jour de statut.

## Tasks / Subtasks

- [x] Task 1: Corriger le lien BottomNavigation (AC: #6)
  - [x] 1.1 Modifier `src/components/custom/bottom-navigation.tsx` : changer `href: '/requests'` → `href: '/my-requests'`
  - [x] 1.2 Mettre à jour les tests `bottom-navigation.test.tsx` si existants

- [x] Task 2: Créer l'utilitaire `formatRelativeDate` (AC: #2)
  - [x] 2.1 Ajouter `formatRelativeDate(date: Date | string): string` dans `src/lib/utils/format.ts`
  - [x] 2.2 Logique : < 1min → "à l'instant", < 60min → "il y a Xmin", < 24h → "il y a Xh", hier → "hier", < 7j → "il y a Xj", sinon → date formatée (ex: "3 fév.")
  - [x] 2.3 Tests unitaires dans `src/lib/utils/format.test.ts`

- [x] Task 3: Créer la query `getStoreRequests` (AC: #1)
  - [x] 3.1 Ajouter dans `src/lib/queries/requests.ts` :
    - `getStoreRequests(storeId: string)` : retourne les demandes avec `include: { offer: { select: { name: true, promoPrice: true } }, supplier: { select: { companyName: true } } }`, triées par `createdAt: 'desc'`
    - `getStoreRequestDetail(requestId: string, storeId: string)` : retourne une demande avec offer complet + supplier
  - [x] 3.2 Utiliser `React.cache()` pour les deux queries
  - [x] 3.3 Le `storeId` dans le WHERE assure l'isolation côté applicatif (en plus du RLS)

- [x] Task 4: Créer le composant `StoreRequestCard` (AC: #2)
  - [x] 4.1 Créer `src/components/custom/store-request-card.tsx`
  - [x] 4.2 Structure visuelle (conforme au visual-design-guide section 8.7) :
    ```
    ┌─────────────────────────────────────┐
    │ Nom offre           [Renseignements]│
    │ Fournisseur                         │
    │ il y a 2h           [En attente]    │
    └─────────────────────────────────────┘
    ```
  - [x] 4.3 Props : `request: SerializedStoreRequest` (type à définir)
  - [x] 4.4 Wrappé dans un `Link` vers `/my-requests/${request.id}`
  - [x] 4.5 Design : asymmetric border-radius `rounded-[0_16px_16px_16px]`, pas de shadow au repos, shadow on hover
  - [x] 4.6 Badges :
    - Type INFO → variant "default" (primary/bleu), label "Renseignements"
    - Type ORDER → variant "success" (vert), label "Commande"
    - Status PENDING → variant "warning" (jaune), label "En attente"
    - Status TREATED → variant "secondary" (gris), label "Traité"
  - [x] 4.7 Tests dans `src/components/custom/store-request-card.test.tsx`

- [x] Task 5: Créer la page liste `/my-requests` (AC: #1, #4, #5, #7)
  - [x] 5.1 Créer `src/app/(store)/my-requests/page.tsx` (Server Component)
  - [x] 5.2 Récupérer le user + store profile (pattern existant dans `(store)/layout.tsx`)
  - [x] 5.3 Appeler `getStoreRequests(store.id)`
  - [x] 5.4 Sérialiser les dates pour passage au client
  - [x] 5.5 Si requests vide → empty state (voir Task 6)
  - [x] 5.6 Sinon → lister les `StoreRequestCard`
  - [x] 5.7 Ajouter un bouton refresh (RefreshCw icon) qui appelle `router.refresh()`
  - [x] 5.8 Metadata : `title: 'Mes demandes'`
  - [x] 5.9 Créer `src/app/(store)/my-requests/loading.tsx` avec skeletons `bg-secondary`
  - [x] 5.10 Tests dans `src/app/(store)/my-requests/page.test.tsx`

- [x] Task 6: Créer le composant empty state demandes (AC: #4)
  - [x] 6.1 Créer `src/components/custom/empty-requests-state.tsx`
  - [x] 6.2 Message : "Vous n'avez pas encore envoyé de demande"
  - [x] 6.3 Sous-message : "Consultez les offres disponibles pour envoyer vos premières demandes"
  - [x] 6.4 CTA : Button "Découvrir les offres" → Link vers `/offers`
  - [x] 6.5 Icône : `MessageSquare` (lucide-react) comme dans la bottom nav
  - [x] 6.6 Pattern identique à `empty-offers-state.tsx`
  - [x] 6.7 Tests dans `src/components/custom/empty-requests-state.test.tsx`

- [x] Task 7: Créer la page détail `/my-requests/[id]` (AC: #3, #5)
  - [x] 7.1 Créer `src/app/(store)/my-requests/[id]/page.tsx` (Server Component)
  - [x] 7.2 Récupérer le user + store profile
  - [x] 7.3 Appeler `getStoreRequestDetail(id, store.id)`
  - [x] 7.4 Si non trouvé → `notFound()`
  - [x] 7.5 Afficher :
    - PageHeader avec titre "Détail de la demande" + back button
    - Card offre : nom produit, prix promo, fournisseur
    - Card demande : badge type, badge statut, date d'envoi (relatif + date absolue)
    - Card message : mon message (si envoyé), sinon "Aucun message"
  - [x] 7.6 Design : Cards avec asymmetric border-radius, `font-display` pour headings
  - [x] 7.7 Créer `src/app/(store)/my-requests/[id]/loading.tsx` avec skeletons
  - [x] 7.8 Tests dans `src/app/(store)/my-requests/[id]/page.test.tsx`

- [x] Task 8: Validation finale (tous AC)
  - [x] 8.1 Vérifier que tous les tests passent (`npm run test`)
  - [x] 8.2 Vérifier le TypeScript (`npm run type-check` ou `tsc --noEmit`)
  - [x] 8.3 Vérifier la navigation complète : bottom nav → liste → card → détail → retour
  - [x] 8.4 Vérifier l'empty state quand pas de demandes
  - [x] 8.5 Vérifier les skeletons sur les deux pages

## Dev Notes

### CRITICAL : Conflit de Route

Le `BottomNavigation` store (`bottom-navigation.tsx`) pointe actuellement vers `/requests`. Or, le supplier bottom nav (`supplier-bottom-navigation.tsx`) pointe aussi vers `/requests`. Puisque les route groups `(store)` et `(supplier)` ne changent PAS l'URL, il y aurait un conflit si les deux route groups avaient un dossier `requests/`.

**Solution (conforme à l'architecture)** : La route store est `/my-requests` (cf. `architecture.md` : `app/(store)/my-requests/`). Il faut donc modifier le `BottomNavigation` en premier.

### Patterns existants à réutiliser

| Pattern | Source | Réutilisation |
|---------|--------|---------------|
| Server Component page + auth check | `(store)/offers/page.tsx` | Même pattern pour page liste |
| `React.cache()` queries | `src/lib/queries/requests.ts` | Étendre avec nouvelles queries |
| `serializeOffer()` | `src/lib/utils/offers.ts` | Créer `serializeStoreRequest()` analogue |
| Empty state component | `src/components/custom/empty-offers-state.tsx` | Pattern identique pour demandes |
| PageHeader avec back button | `src/components/layout/page-header.tsx` | Réutiliser pour page détail |
| Badge component | `src/components/ui/badge.tsx` | Variants pour type/statut demande |
| Card asymmetric radius | `src/components/custom/offer-card.tsx` | Même `rounded-[0_16px_16px_16px]` |
| Loading skeletons | `src/app/(store)/offers/[id]/loading.tsx` | Pattern skeletons `bg-secondary` |
| Refresh button pattern | `src/components/custom/store-offer-list.tsx` | RefreshCw icon + router.refresh() |

### Query implementation

```typescript
// src/lib/queries/requests.ts - AJOUTER aux queries existantes
import { cache } from 'react'
import { prisma } from '@/lib/prisma/client'

export const getStoreRequests = cache(async (storeId: string) => {
  return prisma.request.findMany({
    where: { storeId },
    include: {
      offer: { select: { id: true, name: true, promoPrice: true } },
      supplier: { select: { companyName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
})

export const getStoreRequestDetail = cache(async (requestId: string, storeId: string) => {
  return prisma.request.findFirst({
    where: { id: requestId, storeId },
    include: {
      offer: { select: { id: true, name: true, promoPrice: true, regularPrice: true, discount: true, startDate: true, endDate: true, category: true, photoUrl: true } },
      supplier: { select: { companyName: true } },
    },
  })
})
```

### Serialization pattern

```typescript
// Créer dans src/lib/utils/requests.ts
import type { Request, Offer, Supplier } from '@prisma/client'

type StoreRequestWithRelations = Request & {
  offer: Pick<Offer, 'id' | 'name' | 'promoPrice'>
  supplier: Pick<Supplier, 'companyName'>
}

export type SerializedStoreRequest = {
  id: string
  type: 'INFO' | 'ORDER'
  status: 'PENDING' | 'TREATED'
  message: string | null
  createdAt: string // ISO string
  offer: { id: string; name: string; promoPrice: number }
  supplier: { companyName: string }
}

export function serializeStoreRequest(request: StoreRequestWithRelations): SerializedStoreRequest {
  return {
    id: request.id,
    type: request.type,
    status: request.status,
    message: request.message,
    createdAt: request.createdAt.toISOString(),
    offer: {
      id: request.offer.id,
      name: request.offer.name,
      promoPrice: Number(request.offer.promoPrice),
    },
    supplier: { companyName: request.supplier.companyName },
  }
}
```

### Date formatting utility

```typescript
// Ajouter dans src/lib/utils/format.ts
export function formatRelativeDate(date: Date | string): string {
  const now = new Date()
  const d = typeof date === 'string' ? new Date(date) : date
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin}min`
  if (diffH < 24) return `il y a ${diffH}h`
  if (diffD === 1) return 'hier'
  if (diffD < 7) return `il y a ${diffD}j`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
```

### Badge variants mapping

| Data | Badge variant | Label | Color |
|------|--------------|-------|-------|
| type=INFO | default (primary) | "Renseignements" | Cobalt #3E50F7 |
| type=ORDER | success | "Commande" | #059669 |
| status=PENDING | warning | "En attente" | #D97706 |
| status=TREATED | secondary | "Traité" | #94A3B8 |

### Visual Design Compliance

- **RequestCard** : `rounded-[0_16px_16px_16px]`, bg white, border `border-border`, padding `p-4`, hover shadow `hover:shadow-[0_4px_12px_rgba(37,34,74,0.08)]`
- **Page background** : `bg-muted` (conformément au wireframe section 8.7)
- **Headings** : `font-display` (Plus Jakarta Sans)
- **Skeletons** : `bg-secondary` (pas `bg-accent`)
- **Page titre** : "Mes demandes" dans le header

### Project Structure Notes

Fichiers à CREER :
```
src/app/(store)/my-requests/
  ├── page.tsx            # Liste des demandes (Server Component)
  ├── page.test.tsx       # Tests page liste
  └── loading.tsx         # Skeleton liste
src/app/(store)/my-requests/[id]/
  ├── page.tsx            # Détail demande (Server Component)
  ├── page.test.tsx       # Tests page détail
  └── loading.tsx         # Skeleton détail
src/components/custom/
  ├── store-request-card.tsx        # Card demande côté magasin
  ├── store-request-card.test.tsx   # Tests card
  ├── empty-requests-state.tsx      # Empty state demandes
  └── empty-requests-state.test.tsx # Tests empty state
src/lib/utils/
  └── requests.ts         # Serialization (serializeStoreRequest)
```

Fichiers à MODIFIER :
```
src/components/custom/bottom-navigation.tsx  # /requests → /my-requests
src/lib/queries/requests.ts                  # Ajouter getStoreRequests + getStoreRequestDetail
src/lib/utils/format.ts                      # Ajouter formatRelativeDate
src/lib/utils/format.test.ts                 # Tests formatRelativeDate
```

### Testing Requirements

- **Unit tests** : `formatRelativeDate` dans `format.test.ts`
- **Component tests** : `StoreRequestCard` (badges, link, date format, all type/status combos)
- **Component tests** : `EmptyRequestsState` (message, CTA link)
- **Page tests** : Liste (data rendering, empty state, refresh, loading)
- **Page tests** : Détail (all fields, notFound, back nav, loading)
- Total attendu : ~40-50 tests (estimation basée sur Story 4.1 : 47 tests)
- Mock patterns : Réutiliser le pattern de mock de `src/app/(store)/offers/page.test.tsx`

### Previous Story Intelligence (Stories 4.1 & 4.2)

**Learnings from 4.1 :**
- Le pattern `ActionResult<T>` est strictement suivi
- RLS policies déjà en place pour les stores (SELECT own requests)
- Supplier RLS (SELECT on their offers' requests) est déjà prête pour Epic 5
- `revalidatePath` est utilisé après mutations
- Le unique constraint `(storeId, offerId, type)` empêche les doublons

**Learnings from 4.2 :**
- Quand l'infrastructure existe, l'implémentation est minimale (4 fichiers modifiés)
- 0 issues en code review = pattern validé
- 633 tests passent actuellement dans le projet

**Key infrastructure from 4.1 already available :**
- `Request` model Prisma avec enums `RequestType`, `RequestStatus`
- RLS policies (store can only see own requests)
- `createRequest` server action
- `getExistingRequestTypes` query
- `RequestSheet` component
- Validation schema `createRequestSchema`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure - app/(store)/my-requests/]
- [Source: _bmad-output/planning-artifacts/visual-design-guide.md#Section 8.7 Historique Demandes Magasin]
- [Source: _bmad-output/planning-artifacts/visual-design-guide.md#Section 7.3 Badges - RequestCard variants]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#RequestCard component]
- [Source: _bmad-output/planning-artifacts/prd.md#FR21, FR22, FR33]
- [Source: src/components/custom/bottom-navigation.tsx - Route conflict /requests → /my-requests]
- [Source: src/lib/queries/requests.ts - Existing query pattern]
- [Source: src/components/custom/empty-offers-state.tsx - Empty state pattern]
- [Source: _bmad-output/implementation-artifacts/4-1-schema-demandes-et-envoi-demande-renseignements.md]
- [Source: _bmad-output/implementation-artifacts/4-2-envoi-intention-de-commande.md]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Aucun problème bloquant rencontré
- 2 erreurs TS pré-existantes (enum FRUITS_LEGUMES dans offer-card.test.tsx et offer-list.test.tsx) — non liées à cette story

### Completion Notes List

- Task 1: Corrigé BottomNavigation `/requests` → `/my-requests`, tests mis à jour (6/6 pass)
- Task 2: Créé `formatRelativeDate` avec 10 tests unitaires couvrant tous les cas (< 1min, min, h, hier, jours, 7j+)
- Task 3: Ajouté `getStoreRequests` + `getStoreRequestDetail` avec `React.cache()`, types exportés `StoreRequestWithRelations` / `StoreRequestDetailWithRelations`
- Task 4: Créé `StoreRequestCard` avec badges type/statut, asymmetric border-radius, hover shadow, 15 tests
- Task 5: Créé page liste `/my-requests` (Server Component) + `StoreRequestList` (client, refresh) + loading skeleton, 9 tests
- Task 6: Créé `EmptyRequestsState` avec MessageSquare icon, CTA vers `/offers`, 5 tests
- Task 7: Créé page détail `/my-requests/[id]` avec 3 cards (offre, demande, message), back button, notFound(), loading skeleton, 12 tests
- Task 8: Validation finale — 686/686 tests passent, 0 régressions, 2 erreurs TS pré-existantes uniquement
- Total nouveaux tests : 51 (10 format + 15 card + 9 page liste + 5 empty state + 12 page détail)
- Créé aussi `serializeStoreRequest` / `serializeStoreRequestDetail` dans `src/lib/utils/requests.ts`

### File List

**Nouveaux fichiers :**
- `src/app/(store)/my-requests/page.tsx`
- `src/app/(store)/my-requests/page.test.tsx`
- `src/app/(store)/my-requests/loading.tsx`
- `src/app/(store)/my-requests/[id]/page.tsx`
- `src/app/(store)/my-requests/[id]/page.test.tsx`
- `src/app/(store)/my-requests/[id]/loading.tsx`
- `src/components/custom/store-request-card.tsx`
- `src/components/custom/store-request-card.test.tsx`
- `src/components/custom/store-request-list.tsx`
- `src/components/custom/store-request-list.test.tsx`
- `src/components/custom/empty-requests-state.tsx`
- `src/components/custom/empty-requests-state.test.tsx`
- `src/lib/utils/requests.ts`

**Fichiers modifiés :**
- `src/components/custom/bottom-navigation.tsx` — href `/requests` → `/my-requests`
- `src/components/custom/bottom-navigation.test.tsx` — test mis à jour pour `/my-requests`
- `src/lib/utils/format.ts` — ajout `formatRelativeDate`
- `src/lib/utils/format.test.ts` — ajout 10 tests `formatRelativeDate`
- `src/lib/queries/requests.ts` — ajout `getStoreRequests`, `getStoreRequestDetail`, types exportés
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — status in-progress → review → done

## Senior Developer Review (AI)

**Reviewer:** Youssef — 2026-02-10
**Outcome:** Approved after fixes

### Issues Found & Fixed (9 total)

**HIGH (1 fixed):**
- H1: Créé `store-request-list.test.tsx` (7 tests) pour le client component avec logique refresh

**MEDIUM (4 fixed):**
- M1: Ajout date absolue sur page détail via `formatAbsoluteDate()` (Task 7.5 exigeait relatif + absolue)
- M2: Ajout `export const metadata` sur page détail `/my-requests/[id]`
- M3: Extraction `REQUEST_TYPE_CONFIG` / `REQUEST_STATUS_CONFIG` dans `requests.ts` (élimine duplication)
- M4: `formatRelativeDate` utilise maintenant les jours calendaires (pas le diff d'heures brut) pour "hier"

**LOW (4 — 3 fixed, 1 accepted):**
- L1: `formatRelativeDate` réutilise `shortDateFormatter` (fix perf)
- L2: Supprimé mock inutile `prisma.store` dans `page.test.tsx`
- L3: Ajout test prix sur page détail
- L4: `user!.id` non-null assertion accepté (garanti par layout)

**Tests ajoutés par la review:** 12 (7 StoreRequestList + 3 format + 2 detail page)
**Total tests story:** 74 (était 62 avant review)
