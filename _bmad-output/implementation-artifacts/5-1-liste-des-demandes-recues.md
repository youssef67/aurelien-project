# Story 5.1: Liste des Demandes Reçues

Status: done

## Story

As a fournisseur (supplier),
I want to see requests received on my offers with store contact information,
so that I can process requests and contact interested stores.

## Acceptance Criteria

1. **AC1 - RLS fournisseur** : Les policies RLS existantes pour `requests` sont étendues/vérifiées pour les fournisseurs : un fournisseur peut voir (SELECT) les demandes sur SES offres uniquement, peut modifier (UPDATE) le statut des demandes sur ses offres, ne peut pas supprimer (DELETE) les demandes.

2. **AC2 - Page liste /requests** : Accessible via bottom navigation "Demandes" du fournisseur, affiche la liste des demandes reçues sur MES offres triées par date DESC. Seules les demandes sur les offres du fournisseur courant sont visibles (FR23).

3. **AC3 - SupplierRequestCard** : Chaque demande affiche : nom du magasin demandeur (FR24), enseigne du magasin (badge Leclerc/Intermarché/etc.) (FR24), ville du magasin (FR24), type de demande (badge "Renseignements" bleu primary ou "Commande" vert success), nom de l'offre concernée, date de réception en format relatif ("il y a 2h"), statut (badge "Nouveau" accent ou "Traité" secondary).

4. **AC4 - Mise en évidence des nouvelles demandes** : Les demandes PENDING ont un fond légèrement mis en évidence (`bg-secondary/50`). Les demandes TREATED ont une opacité réduite.

5. **AC5 - Navigation vers détail** : Clic sur une SupplierRequestCard redirige vers `/requests/[id]` qui affiche : infos complètes du magasin (nom, enseigne, ville, email, téléphone - FR24), détails de la demande (type, message si présent, statut, date), lien vers l'offre concernée.

6. **AC6 - Empty state fournisseur** : Si aucune demande, affiche "Les demandes de vos clients apparaîtront ici" + sous-message "Publiez des offres pour recevoir des demandes". Pas de CTA (le fournisseur publie des offres, pas des demandes).

7. **AC7 - Loading states** : Skeleton loading sur les deux pages (liste et détail). Skeletons utilisent `bg-secondary`.

8. **AC8 - Refresh** : Un bouton refresh (RefreshCw icon + `router.refresh()`) permet de recharger la liste et voir les nouvelles demandes.

## Tasks / Subtasks

- [x] Task 1: Vérifier/étendre les RLS pour les fournisseurs (AC: #1)
  - [x] 1.1 Vérifier que la policy SELECT existe pour `requests` WHERE `supplier_id = auth.uid()` (devrait exister depuis Story 4.1)
  - [x] 1.2 Ajouter la policy UPDATE pour `requests` WHERE `supplier_id = auth.uid()` (uniquement colonne `status` et `updated_at`)
  - [x] 1.3 Vérifier qu'aucune policy DELETE n'existe pour les fournisseurs sur `requests`
  - [x] 1.4 Créer une migration Prisma si de nouvelles policies sont nécessaires

- [x] Task 2: Créer les queries fournisseur (AC: #2)
  - [x] 2.1 Ajouter dans `src/lib/queries/requests.ts` :
    - `getSupplierRequests(supplierId: string)` : retourne les demandes avec `include: { store: { select: { name, brand, city } }, offer: { select: { id, name } } }`, triées par `createdAt: 'desc'`
    - `getSupplierRequestDetail(requestId: string, supplierId: string)` : retourne une demande avec store complet (name, brand, city, email, phone) + offer (id, name, promoPrice)
  - [x] 2.2 Utiliser `React.cache()` pour les deux queries
  - [x] 2.3 Exporter les types `SupplierRequestWithRelations` et `SupplierRequestDetailWithRelations`

- [x] Task 3: Créer la sérialisation fournisseur (AC: #3)
  - [x] 3.1 Ajouter dans `src/lib/utils/requests.ts` :
    - Type `SerializedSupplierRequest` avec : id, type, status, message, createdAt, store: { name, brand, city }, offer: { id, name }
    - Type `SerializedSupplierRequestDetail` avec : id, type, status, message, createdAt, store: { name, brand, city, email, phone }, offer: { id, name, promoPrice }
    - `serializeSupplierRequest()` et `serializeSupplierRequestDetail()`
  - [x] 3.2 Réutiliser `REQUEST_TYPE_CONFIG` et `REQUEST_STATUS_CONFIG` déjà existants (IMPORTANT : ne PAS les recréer)
  - [x] 3.3 Ajouter config pour les badges supplier-spécifiques :
    - Status PENDING côté fournisseur → label "Nouveau" (pas "En attente")
    - Status TREATED côté fournisseur → label "Traité" (identique)

- [x] Task 4: Créer le composant `SupplierRequestCard` (AC: #3, #4)
  - [x] 4.1 Créer `src/components/custom/supplier-request-card.tsx`
  - [x] 4.2 Structure visuelle :
    ```
    ┌─────────────────────────────────────┐
    │ Nom magasin           [Commande]    │
    │ Leclerc • Strasbourg                │
    │ → Nutella 1kg                       │
    │ il y a 2h              [Nouveau]    │
    └─────────────────────────────────────┘
    ```
  - [x] 4.3 Props : `request: SerializedSupplierRequest`
  - [x] 4.4 Wrappé dans un `Link` vers `/requests/${request.id}`
  - [x] 4.5 Design : asymmetric border-radius `rounded-[0_16px_16px_16px]`, pas de shadow au repos, shadow on hover `hover:shadow-[0_4px_12px_rgba(37,34,74,0.08)]`
  - [x] 4.6 PENDING : fond `bg-secondary/50` (mis en évidence), TREATED : `opacity-60`
  - [x] 4.7 Badges :
    - Type INFO → variant "default" (primary/bleu), label "Renseignements"
    - Type ORDER → className success (vert), label "Commande"
    - Status PENDING → variant "default", label "Nouveau"
    - Status TREATED → variant "secondary", label "Traité"
  - [x] 4.8 Tests dans `src/components/custom/supplier-request-card.test.tsx`

- [x] Task 5: Créer le composant `SupplierRequestList` (AC: #2, #8)
  - [x] 5.1 Créer `src/components/custom/supplier-request-list.tsx` (client component)
  - [x] 5.2 Pattern identique à `StoreRequestList` : bouton refresh avec `useTransition` + `router.refresh()`
  - [x] 5.3 Rendre les `SupplierRequestCard` dans un `space-y-3`
  - [x] 5.4 Tests dans `src/components/custom/supplier-request-list.test.tsx`

- [x] Task 6: Créer le composant empty state fournisseur (AC: #6)
  - [x] 6.1 Créer `src/components/custom/empty-supplier-requests-state.tsx`
  - [x] 6.2 Message : "Les demandes de vos clients apparaîtront ici"
  - [x] 6.3 Sous-message : "Publiez des offres pour recevoir des demandes"
  - [x] 6.4 Icône : `MessageSquare` (lucide-react) — même icône que le bottom nav
  - [x] 6.5 PAS de CTA button (contrairement au EmptyRequestsState côté magasin)
  - [x] 6.6 Pattern identique à `empty-requests-state.tsx` sauf pas de bouton
  - [x] 6.7 Tests dans `src/components/custom/empty-supplier-requests-state.test.tsx`

- [x] Task 7: Créer la page liste `/requests` (AC: #2, #6, #7, #8)
  - [x] 7.1 Créer `src/app/(supplier)/requests/page.tsx` (Server Component)
  - [x] 7.2 Pattern identique au dashboard : auth check via `createClient()` + `supabase.auth.getUser()`
  - [x] 7.3 Appeler `getSupplierRequests(user!.id)`
  - [x] 7.4 Sérialiser avec `serializeSupplierRequest()`
  - [x] 7.5 Si requests vide → `EmptySupplierRequestsState`
  - [x] 7.6 Sinon → `SupplierRequestList`
  - [x] 7.7 PageHeader : titre "Demandes reçues"
  - [x] 7.8 Metadata : `title: 'Demandes reçues'`
  - [x] 7.9 Créer `src/app/(supplier)/requests/loading.tsx` avec skeletons `bg-secondary`
  - [x] 7.10 Tests dans `src/app/(supplier)/requests/page.test.tsx`

- [x] Task 8: Créer la page détail `/requests/[id]` (AC: #5, #7)
  - [x] 8.1 Créer `src/app/(supplier)/requests/[id]/page.tsx` (Server Component)
  - [x] 8.2 Auth check puis `getSupplierRequestDetail(id, user!.id)`
  - [x] 8.3 Si non trouvé → `notFound()`
  - [x] 8.4 Afficher :
    - PageHeader "Détail de la demande" + back button (href="/requests")
    - **Card magasin** : nom, enseigne (badge), ville, email (mailto: link), téléphone (tel: link)
    - **Card demande** : badge type, badge statut, date d'envoi (relatif + absolu via `formatAbsoluteDate`)
    - **Card message** : message du magasin si envoyé, sinon "Aucun message"
    - **Card offre** : nom de l'offre (Link vers `/my-offers/[offerId]`), prix promo
  - [x] 8.5 Design : Cards avec asymmetric border-radius, `font-display` pour headings
  - [x] 8.6 Créer `src/app/(supplier)/requests/[id]/loading.tsx` avec skeletons
  - [x] 8.7 Metadata : `title: 'Détail de la demande'`
  - [x] 8.8 Tests dans `src/app/(supplier)/requests/[id]/page.test.tsx`

- [x] Task 9: Validation finale (tous AC)
  - [x] 9.1 Vérifier que tous les tests passent (`npm run test`)
  - [x] 9.2 Vérifier le TypeScript (`tsc --noEmit`)
  - [x] 9.3 Vérifier la navigation complète : bottom nav → liste → card → détail → retour
  - [x] 9.4 Vérifier l'empty state quand pas de demandes
  - [x] 9.5 Vérifier les skeletons sur les deux pages
  - [x] 9.6 Vérifier les liens tel: et mailto: sur la page détail

## Dev Notes

### CRITICAL : Route `/requests` est déjà configurée

Le `SupplierBottomNavigation` pointe déjà vers `/requests`. La route est dans le group `(supplier)`, donc pas de conflit avec la route store `/my-requests`. Aucun changement nécessaire dans la navigation.

### RLS : Policies probablement déjà en place

Story 4.1 mentionne : "Supplier RLS (SELECT on their offers' requests) est déjà prête pour Epic 5". Vérifier les migrations dans `prisma/migrations/20260210_add_requests_rls/` avant de créer de nouvelles policies. Il faudra potentiellement SEULEMENT ajouter la policy UPDATE pour le marquage en TREATED (Story 5.3).

### Patterns existants à RÉUTILISER (NE PAS recréer)

| Pattern | Source | Réutilisation |
|---------|--------|---------------|
| Server Component page + auth | `(store)/my-requests/page.tsx` | Même pattern, remplacer storeId par user.id |
| `React.cache()` queries | `src/lib/queries/requests.ts` | Étendre avec queries fournisseur |
| `REQUEST_TYPE_CONFIG` / `REQUEST_STATUS_CONFIG` | `src/lib/utils/requests.ts` | RÉUTILISER tel quel pour les badges type |
| `serializeStoreRequest()` | `src/lib/utils/requests.ts` | Créer `serializeSupplierRequest()` analogue |
| Empty state component | `src/components/custom/empty-requests-state.tsx` | Pattern identique sans CTA |
| PageHeader avec back button | `src/components/layout/page-header.tsx` | Réutiliser pour page détail |
| Card asymmetric radius | `src/components/custom/store-request-card.tsx` | Même `rounded-[0_16px_16px_16px]` |
| Loading skeletons | `src/app/(store)/my-requests/loading.tsx` | Pattern skeletons `bg-secondary` |
| Refresh button pattern | `src/components/custom/store-request-list.tsx` | RefreshCw icon + router.refresh() |
| `formatRelativeDate` / `formatAbsoluteDate` | `src/lib/utils/format.ts` | Réutiliser directement |
| Badge component | `src/components/ui/badge.tsx` | Variants existants |

### Badge config côté fournisseur

Le fournisseur voit les statuts différemment du magasin :

| Data | Badge variant | Label côté fournisseur | Label côté magasin |
|------|--------------|------------------------|---------------------|
| status=PENDING | default / accent | **"Nouveau"** | "En attente" |
| status=TREATED | secondary | "Traité" | "Traité" |

Ajouter dans `src/lib/utils/requests.ts` :

```typescript
export const SUPPLIER_REQUEST_STATUS_CONFIG = {
  PENDING: { label: 'Nouveau', variant: 'default' as const, className: 'bg-primary/10 text-primary border-transparent' },
  TREATED: { label: 'Traité', variant: 'secondary' as const, className: '' },
}
```

### Query implementation

```typescript
// AJOUTER dans src/lib/queries/requests.ts

export const getSupplierRequests = cache(async (supplierId: string) => {
  return prisma.request.findMany({
    where: { supplierId },
    include: {
      store: { select: { name: true, brand: true, city: true } },
      offer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
})

export type SupplierRequestWithRelations = Awaited<ReturnType<typeof getSupplierRequests>>[number]

export const getSupplierRequestDetail = cache(async (requestId: string, supplierId: string) => {
  return prisma.request.findFirst({
    where: { id: requestId, supplierId },
    include: {
      store: { select: { name: true, brand: true, city: true, email: true, phone: true } },
      offer: { select: { id: true, name: true, promoPrice: true } },
    },
  })
})

export type SupplierRequestDetailWithRelations = NonNullable<Awaited<ReturnType<typeof getSupplierRequestDetail>>>
```

### Serialization pattern

```typescript
// AJOUTER dans src/lib/utils/requests.ts

export type SerializedSupplierRequest = {
  id: string
  type: 'INFO' | 'ORDER'
  status: 'PENDING' | 'TREATED'
  message: string | null
  createdAt: string
  store: { name: string; brand: string; city: string }
  offer: { id: string; name: string }
}

export type SerializedSupplierRequestDetail = {
  id: string
  type: 'INFO' | 'ORDER'
  status: 'PENDING' | 'TREATED'
  message: string | null
  createdAt: string
  store: { name: string; brand: string; city: string; email: string; phone: string }
  offer: { id: string; name: string; promoPrice: number }
}

export function serializeSupplierRequest(
  request: SupplierRequestWithRelations
): SerializedSupplierRequest {
  return {
    id: request.id,
    type: request.type,
    status: request.status,
    message: request.message,
    createdAt: request.createdAt.toISOString(),
    store: {
      name: request.store.name,
      brand: request.store.brand,
      city: request.store.city,
    },
    offer: {
      id: request.offer.id,
      name: request.offer.name,
    },
  }
}

export function serializeSupplierRequestDetail(
  request: SupplierRequestDetailWithRelations
): SerializedSupplierRequestDetail {
  return {
    id: request.id,
    type: request.type,
    status: request.status,
    message: request.message,
    createdAt: request.createdAt.toISOString(),
    store: {
      name: request.store.name,
      brand: request.store.brand,
      city: request.store.city,
      email: request.store.email,
      phone: request.store.phone,
    },
    offer: {
      id: request.offer.id,
      name: request.offer.name,
      promoPrice: Number(request.offer.promoPrice),
    },
  }
}
```

### Page détail — Liens d'action

La page détail doit afficher les informations de contact du magasin avec des liens actionnables :

```tsx
// Email : lien mailto:
<a href={`mailto:${store.email}`} className="text-primary underline">
  {store.email}
</a>

// Téléphone : lien tel:
<a href={`tel:${store.phone}`} className="text-primary underline">
  {store.phone}
</a>
```

Note : Le bouton "Marquer comme traitée" sera implémenté dans la Story 5.3. Pour cette story, la page détail est en lecture seule.

### Visual Design Compliance

- **SupplierRequestCard** : `rounded-[0_16px_16px_16px]`, bg white, border `border-border`, padding `p-4`, hover shadow `hover:shadow-[0_4px_12px_rgba(37,34,74,0.08)]`
- **PENDING cards** : `bg-secondary/50` pour mise en évidence
- **TREATED cards** : `opacity-60`
- **Page background** : `bg-muted`
- **Headings** : `font-display` (Plus Jakarta Sans)
- **Skeletons** : `bg-secondary` (pas `bg-accent`)
- **Page titre** : "Demandes reçues" dans le header
- **Enseigne badge** : Utiliser Badge variant="outline" avec le nom de l'enseigne

### Offre supplier route

IMPORTANT : Les offres fournisseur ont été relocalisées dans le sprint. Vérifier le chemin correct des offres fournisseur :
- Si `/my-offers/[id]` existe, utiliser ce chemin pour le lien "Voir l'offre" depuis le détail demande
- Si `/dashboard` est la seule route offres, ne pas mettre de lien direct vers l'offre individuelle
- Vérifier la structure des routes `(supplier)` avant d'implémenter le lien

### Project Structure Notes

Fichiers à CRÉER :
```
src/app/(supplier)/requests/
  ├── page.tsx            # Liste des demandes reçues (Server Component)
  ├── page.test.tsx       # Tests page liste
  └── loading.tsx         # Skeleton liste
src/app/(supplier)/requests/[id]/
  ├── page.tsx            # Détail demande (Server Component)
  ├── page.test.tsx       # Tests page détail
  └── loading.tsx         # Skeleton détail
src/components/custom/
  ├── supplier-request-card.tsx        # Card demande côté fournisseur
  ├── supplier-request-card.test.tsx   # Tests card
  ├── supplier-request-list.tsx        # Liste client component (refresh)
  ├── supplier-request-list.test.tsx   # Tests liste
  ├── empty-supplier-requests-state.tsx      # Empty state fournisseur
  └── empty-supplier-requests-state.test.tsx # Tests empty state
```

Fichiers à MODIFIER :
```
src/lib/queries/requests.ts  # Ajouter getSupplierRequests + getSupplierRequestDetail
src/lib/utils/requests.ts    # Ajouter sérialisation fournisseur + SUPPLIER_REQUEST_STATUS_CONFIG
```

### Testing Requirements

- **Component tests** : `SupplierRequestCard` (badges, link, date, enseigne, all type/status combos, pending highlight, treated opacity)
- **Component tests** : `SupplierRequestList` (rendering, refresh button, loading state)
- **Component tests** : `EmptySupplierRequestsState` (message, pas de CTA)
- **Page tests** : Liste (data rendering, empty state, loading)
- **Page tests** : Détail (all fields, notFound, back nav, email link, phone link, loading)
- Total estimé : ~50-60 tests
- Mock patterns : Réutiliser le pattern de mock de `src/app/(store)/my-requests/page.test.tsx`

### Previous Story Intelligence (Stories 4.1, 4.2, 4.3)

**Learnings from 4.1 :**
- Le pattern `ActionResult<T>` est strictement suivi
- RLS policies pour les stores (SELECT own requests) en place
- Supplier RLS (SELECT on their offers' requests) déjà prête pour Epic 5
- Unique constraint `(storeId, offerId, type)` empêche les doublons

**Learnings from 4.3 :**
- Pattern `StoreRequestCard` / `StoreRequestList` validé et fonctionnel
- `formatRelativeDate` + `formatAbsoluteDate` déjà créés et testés
- `REQUEST_TYPE_CONFIG` / `REQUEST_STATUS_CONFIG` centralisés dans `requests.ts`
- Code review a ajouté 12 tests supplémentaires (74 total)
- Le `!` non-null assertion sur `user!.id` est accepté car garanti par le layout

**Key infrastructure from Epic 4 already available :**
- `Request` model Prisma avec enums `RequestType`, `RequestStatus`
- Index sur `supplierId` (performance queries fournisseur)
- `formatRelativeDate` et `formatAbsoluteDate` dans `format.ts`
- Badge configs dans `requests.ts`
- Pattern `StoreRequestCard` à miroir

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure - app/(supplier)/requests/]
- [Source: _bmad-output/planning-artifacts/prd.md#FR23, FR24]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#RequestCard component]
- [Source: _bmad-output/planning-artifacts/visual-design-guide.md#Section 8.8 Demandes Fournisseur]
- [Source: _bmad-output/implementation-artifacts/4-1-schema-demandes-et-envoi-demande-renseignements.md]
- [Source: _bmad-output/implementation-artifacts/4-3-historique-des-demandes-magasin.md]
- [Source: src/components/custom/store-request-card.tsx - Pattern miroir]
- [Source: src/components/custom/supplier-bottom-navigation.tsx - Route /requests déjà configurée]
- [Source: src/lib/queries/requests.ts - Existing query pattern]
- [Source: src/lib/utils/requests.ts - Existing serialization/config pattern]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

Aucun problème rencontré.

### Completion Notes List

- **Task 1**: RLS vérifié — SELECT supplier policy existante, UPDATE policy ajoutée via migration `20260210_add_supplier_update_rls`, DELETE policy absente (correct).
- **Task 2**: Queries `getSupplierRequests` et `getSupplierRequestDetail` ajoutées dans `requests.ts` avec `React.cache()`. Types exportés.
- **Task 3**: Sérialisation fournisseur ajoutée (`SerializedSupplierRequest`, `SerializedSupplierRequestDetail`, fonctions `serialize*`). `SUPPLIER_REQUEST_STATUS_CONFIG` ajouté avec labels "Nouveau"/"Traité". `REQUEST_TYPE_CONFIG` réutilisé tel quel.
- **Task 4**: `SupplierRequestCard` créé avec design system conforme (asymmetric radius, hover shadow, PENDING highlight `bg-secondary/50`, TREATED `opacity-60`). 17 tests passent.
- **Task 5**: `SupplierRequestList` créé comme client component avec bouton refresh `useTransition` + `router.refresh()`. 7 tests passent.
- **Task 6**: `EmptySupplierRequestsState` créé sans CTA, avec MessageSquare icon. 5 tests passent.
- **Task 7**: Page `/requests` (supplier) créée comme Server Component. Auth check, sérialisation, empty state/list conditionnel, PageHeader "Demandes reçues", loading skeleton. 9 tests passent.
- **Task 8**: Page `/requests/[id]` créée avec 4 cards (magasin, demande, message, offre). Liens mailto:/tel:, lien vers `/my-offers/[offerId]`, back button, "Non renseigné" si phone null. 18 tests passent.
- **Task 9**: 754 tests passent (0 échecs), 0 erreurs TypeScript sur les fichiers de cette story. 2 erreurs TS pré-existantes dans offer-card.test.tsx et offer-list.test.tsx (enum rename).
- **Total tests ajoutés**: 56 tests dans 5 fichiers de tests

### Change Log

- 2026-02-10: Story 5.1 implémentée — Liste des demandes reçues fournisseur avec page liste, page détail, composants et tests (56 tests)
- 2026-02-10: Code review — 4 MEDIUM et 3 LOW issues identifiés. 4 MEDIUM corrigés : cn() dans SupplierRequestCard, tests unitaires sérialisation ajoutés, back button explicite via backHref, documentation RLS. 777 tests passent (dont 20 nouveaux tests sérialisation + 3 tests PageHeader backHref).

### Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.6 — 2026-02-10
**Verdict:** Approved (après corrections)
**Issues trouvés:** 4 MEDIUM, 3 LOW
**Issues corrigés:** 4 MEDIUM

**Corrections appliquées :**
- **M1** : Documentation limitation RLS dans migration SQL (column restriction au niveau applicatif Story 5.3)
- **M2** : Remplacement template literals par `cn()` dans `supplier-request-card.tsx`
- **M3** : 20 tests unitaires ajoutés dans `src/lib/utils/requests.test.ts` (sérialisation + configs)
- **M4** : Ajout prop `backHref` à `PageHeader` + utilisation dans page détail avec `/requests` explicite + 3 tests

**Issues LOW non corrigés (acceptés) :**
- **L1** : `brand` typé `string` au lieu de l'enum Brand (cohérent avec le pattern existant)
- **L2** : Pas de `aria-label` sur SupplierRequestCard link (pattern miroir de StoreRequestCard)
- **L3** : File List "Modifiés" vs git untracked (cosmétique)

### File List

**Créés:**
- `prisma/migrations/20260210_add_supplier_update_rls/migration.sql`
- `src/components/custom/supplier-request-card.tsx`
- `src/components/custom/supplier-request-card.test.tsx`
- `src/components/custom/supplier-request-list.tsx`
- `src/components/custom/supplier-request-list.test.tsx`
- `src/components/custom/empty-supplier-requests-state.tsx`
- `src/components/custom/empty-supplier-requests-state.test.tsx`
- `src/app/(supplier)/requests/loading.tsx`
- `src/app/(supplier)/requests/page.test.tsx`
- `src/app/(supplier)/requests/[id]/page.tsx`
- `src/app/(supplier)/requests/[id]/page.test.tsx`
- `src/app/(supplier)/requests/[id]/loading.tsx`
- `src/lib/utils/requests.test.ts` (ajouté par review)

**Modifiés:**
- `src/app/(supplier)/requests/page.tsx` (remplacé placeholder par implémentation complète)
- `src/app/(supplier)/requests/[id]/page.tsx` (ajout backHref="/requests" par review)
- `src/lib/queries/requests.ts` (ajout queries fournisseur)
- `src/lib/utils/requests.ts` (ajout sérialisation fournisseur + SUPPLIER_REQUEST_STATUS_CONFIG)
- `src/components/custom/supplier-request-card.tsx` (cn() par review)
- `src/components/layout/page-header.tsx` (ajout prop backHref par review)
- `src/components/layout/page-header.test.tsx` (3 tests backHref par review)
- `prisma/migrations/20260210_add_supplier_update_rls/migration.sql` (commentaire limitation par review)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (status: review → done)
