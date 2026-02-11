# Story 3.5: Détail Complet d'une Offre

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

En tant que **chef de rayon (magasin)**,
Je veux **voir le détail complet d'une offre incluant la marge proposée**,
Afin de **prendre une décision d'achat éclairée**.

## Acceptance Criteria

### AC1: Navigation vers le détail
**Given** je suis sur la liste des offres
**When** je clique sur une OfferCard
**Then** je suis redirigé vers `/offers/[id]`
**And** la page de détail se charge

### AC2: Affichage complet des informations
**Given** je suis sur la page de détail
**When** la page se charge
**Then** toutes les informations de l'offre sont affichées :
- Photo en grand (ou placeholder)
- Nom du produit
- Nom du fournisseur
- Prix promo et remise %
- **Marge proposée** (visible car je suis un magasin — FR34)
- Dates de validité
- Catégorie et sous-catégorie
- Volume estimé
- Conditions commerciales
- Animation prévue

### AC3: Visibilité de la marge (FR34)
**Given** l'offre a une marge renseignée
**When** je consulte le détail en tant que magasin
**Then** la marge est affichée clairement (ex: "Marge proposée : 22%")
**And** cette information n'est JAMAIS visible par les autres fournisseurs (FR34)

### AC4: Boutons CTA en bas de l'écran
**Given** je suis sur le détail
**When** je veux agir sur cette offre
**Then** deux boutons CTA sont visibles en bas de l'écran (sticky) :
- "Demande de renseignements" (outline)
- "Souhaite commander" (primary)
**And** les boutons font minimum 44px de hauteur (touch target)
**And** Note : les boutons sont visuellement présents mais non fonctionnels dans cette story (Epic 4 implémente les Server Actions)

### AC5: Placeholder photo
**Given** l'offre n'a pas de photo
**When** le détail s'affiche
**Then** un placeholder avec icône Package est affiché sur fond `bg-muted`

### AC6: Retour à la liste avec filtres préservés
**Given** je veux revenir à la liste
**When** je clique sur le bouton retour (header)
**Then** je reviens à la liste avec mes filtres préservés
**And** ma position de scroll est restaurée (comportement natif `router.back()`)

### AC7: Offre expirée
**Given** l'offre a expiré (endDate < aujourd'hui ou status EXPIRED)
**When** j'accède au détail
**Then** un bandeau "Cette offre a expiré" s'affiche en haut du contenu
**And** les boutons CTA sont désactivés (disabled)

### AC8: Offre introuvable
**Given** l'ID de l'offre n'existe pas ou l'offre est supprimée (deletedAt non null)
**When** j'accède à `/offers/[id]`
**Then** la page not-found de Next.js s'affiche via `notFound()`

## Tasks / Subtasks

- [x] **Task 1: Créer la query `getOfferForStoreDetail`** (AC: 1, 2, 7, 8)
  - [x] 1.1 Ajouter dans `src/lib/queries/offers.ts` :
    ```typescript
    export async function getOfferForStoreDetail(id: string) {
      return prisma.offer.findFirst({
        where: { id, deletedAt: null },
        include: { supplier: { select: { companyName: true } } },
      })
    }
    ```
  - [x] 1.2 NE PAS filtrer par `status` ni `endDate` — on affiche les offres expirées avec un bandeau
  - [x] 1.3 NE PAS vérifier le `supplierId` — tout magasin peut voir toute offre non supprimée
  - [x] 1.4 Exporter le type résultat si nécessaire pour les tests

- [x] **Task 2: Créer la page détail** (AC: 1, 2, 3, 5, 6, 7, 8)
  - [x] 2.1 Créer `src/app/(store)/offers/[id]/page.tsx` — Server Component (PAS de `"use client"`)
  - [x] 2.2 `generateMetadata` dynamique avec le nom du produit comme title
  - [x] 2.3 Recevoir `params.id`, appeler `getOfferForStoreDetail(id)`
  - [x] 2.4 Si `null` → appeler `notFound()` de `next/navigation`
  - [x] 2.5 Déterminer si expirée via `getOfferDisplayStatus(offer)` → `key === 'expired'`
  - [x] 2.6 S'inspirer de la structure de `src/app/(supplier)/offers/[id]/page.tsx` pour le layout

- [x] **Task 3: Layout du contenu** (AC: 2, 3, 5)
  - [x] 3.1 `PageHeader` avec `title={offer.name}` et `showBack` (utilise `router.back()` nativement)
  - [x] 3.2 Zone scrollable `<div className="flex-1 overflow-auto">` avec padding-bottom suffisant pour les CTA + bottom nav
  - [x] 3.3 **Bandeau offre expirée** (conditionnel) : `bg-destructive/10 text-destructive` avec icône `AlertTriangle` et texte "Cette offre a expiré"
  - [x] 3.4 **Photo plein-largeur** : `aspect-video rounded-[0_1rem_1rem_1rem] bg-muted` — Image Next.js avec `fill` et `object-cover` si photoUrl, sinon placeholder `Package`
  - [x] 3.5 **Section titre** : `h1` avec `font-display text-xl font-bold` pour le nom produit + `text-sm text-muted-foreground` pour le nom fournisseur
  - [x] 3.6 **Card Prix** : `<Card>` avec prix via `formatPrice(Number(offer.promoPrice))`, remise via `formatDiscount(offer.discountPercent)`, et marge si renseignée `Number(offer.margin)%`
  - [x] 3.7 **Card Dates** : grid 2 cols (Début / Fin) avec `Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })` — même pattern que la page supplier
  - [x] 3.8 **Card Détails optionnels** : afficher conditionnellement catégorie (`getCategoryLabel` ou `OFFER_CATEGORY_LABELS`), sous-catégorie, volume, conditions (`whitespace-pre-wrap`), animation (`whitespace-pre-wrap`)
  - [x] 3.9 Cards avec border-radius asymétrique (via shadcn Card — vérifier si déjà stylé, sinon ajouter className)

- [x] **Task 4: Boutons CTA** (AC: 4, 7)
  - [x] 4.1 Footer sticky en bas de la zone scrollable, avec `bg-background border-t p-4`
  - [x] 4.2 Vérifier la hauteur du `BottomNavigation` (fixed bottom-0, ~56px + safe-area) et positionner les CTA au-dessus
  - [x] 4.3 Bouton "Demande de renseignements" — `variant="outline"`, `className="flex-1 h-11"`
  - [x] 4.4 Bouton "Souhaite commander" — `variant="default"` (primary), `className="flex-1 h-11 rounded-[0_0.5rem_0.5rem_0.5rem]"` (asymmetric)
  - [x] 4.5 Les deux boutons `disabled={isExpired}` quand l'offre est expirée
  - [x] 4.6 **NE PAS implémenter de handler onClick** — les Server Actions pour créer des demandes sont dans Epic 4 (Stories 4.1/4.2)

- [x] **Task 5: Tests** (AC: 1-8)
  - [x] 5.1 Créer `src/app/(store)/offers/[id]/page.test.tsx`
  - [x] 5.2 Mocker `@/lib/queries/offers` (`getOfferForStoreDetail`), `next/navigation` (`notFound`), `next/image`
  - [x] 5.3 Test : affiche le nom du produit (heading)
  - [x] 5.4 Test : affiche le nom du fournisseur
  - [x] 5.5 Test : affiche le prix formaté et la remise
  - [x] 5.6 Test : affiche la marge quand renseignée (ex: "22%")
  - [x] 5.7 Test : n'affiche PAS la section marge quand `margin === null`
  - [x] 5.8 Test : affiche le placeholder Package quand `photoUrl === null`
  - [x] 5.9 Test : affiche le bandeau "expiré" quand `getOfferDisplayStatus` retourne `key: 'expired'`
  - [x] 5.10 Test : boutons CTA disabled quand offre expirée
  - [x] 5.11 Test : boutons CTA enabled quand offre active
  - [x] 5.12 Test : affiche catégorie, volume, conditions, animation quand renseignés
  - [x] 5.13 Test : n'affiche pas les détails optionnels quand tous sont null
  - [x] 5.14 Test : appelle `notFound()` quand la query retourne null

- [x] **Task 6: Validation finale** (AC: 1-8)
  - [x] 6.1 `npm run test` — tous les tests passent (591/591)
  - [x] 6.2 `npm run build` — build OK
  - [x] 6.3 `npm run lint` — 0 erreur, 0 warning
  - [x] 6.4 Tests existants non cassés (régressions vérifiées)

## Dev Notes

### Architecture Compliance

**Patterns OBLIGATOIRES:**
- Page **Server Component** — PAS de `"use client"` [Source: project-context.md#Next.js Rules]
- Query Prisma directe dans la page (même pattern que `src/app/(supplier)/offers/[id]/page.tsx`) — PAS de serialization nécessaire côté RSC
- `Decimal` Prisma → `Number()` pour l'affichage (promoPrice, margin)
- Fichiers `kebab-case`, composants `PascalCase` [Source: project-context.md#Naming Conventions]
- Tests co-localisés `*.test.tsx` [Source: project-context.md#Testing Rules]
- Headings : `font-display` (Plus Jakarta Sans) [Source: visual-design-guide.md]
- Cards : utiliser `<Card>` + `<CardContent>` de shadcn/ui [Source: supplier detail page pattern]
- `notFound()` de `next/navigation` pour les 404 [Source: Next.js App Router]

**NE PAS faire :**
- NE PAS utiliser `serializeOfferWithSupplier()` — cette fonction N'INCLUT PAS `margin`, `volume`, `conditions`, `animation`, `status`. La page RSC accède directement aux données Prisma.
- NE PAS créer de composant client — la page est 100% Server Component
- NE PAS ajouter de handler onClick sur les CTA — Epic 4 le fera
- NE PAS modifier la `StoreOfferCard` — le link `/offers/{id}` fonctionne déjà
- NE PAS modifier le `BottomNavigation` — la nav reste telle quelle
- NE PAS installer de nouvelle dépendance

### Référence exacte : page supplier detail

Le fichier `src/app/(supplier)/offers/[id]/page.tsx` est le **template de référence**. Copier la structure et adapter :

| Supplier Detail | Store Detail (à créer) |
|---|---|
| `where: { id, supplierId: user.id, deletedAt: null }` | `where: { id, deletedAt: null }` (pas de check owner) |
| `redirect('/dashboard')` si non trouvé | `notFound()` si non trouvé |
| Badge statut (Active/Expirée/Brouillon) | Badge statut + bandeau "expirée" si expired |
| Bouton "Modifier" + "Supprimer" | Boutons CTA "Renseignements" + "Commander" |
| Pas de marge dans la Card prix | **Afficher la marge** (FR34 — magasins autorisés) |
| `redirect('/login')` si pas d'user | Layout `(store)` gère l'auth → pas nécessaire |

### Layout page — Attention BottomNavigation

Le `BottomNavigation` est `fixed bottom-0 z-50` avec `border-t` et `pb-[env(safe-area-inset-bottom)]`. La hauteur visuelle est ~56px (h-14) + safe-area.

**Stratégie CTA footer :**
- Option A (recommandée) : Placer les boutons CTA à la **fin du contenu scrollable** (pas fixed/sticky), avec du `mb-4`. Simple, pas de conflit de z-index.
- Option B : `sticky bottom-0` dans le `flex-1 overflow-auto` container — les boutons collent au bas du viewport dans la zone de scroll.
- Option C : `fixed` avec `bottom-[calc(3.5rem+env(safe-area-inset-bottom))]` — au-dessus de la nav fixe.

Vérifier le `(store)/layout.tsx` pour choisir. Si le layout a `pb-14` ou `pb-16` sur le main, les boutons en fin de contenu seront visibles au-dessus de la nav.

### Données Prisma disponibles (Offer model)

```typescript
// Champs accessibles via la query (tous ceux du modèle Offer)
offer.id           // string (UUID)
offer.name         // string
offer.promoPrice   // Decimal → Number(offer.promoPrice)
offer.discountPercent // number
offer.startDate    // Date
offer.endDate      // Date
offer.category     // OfferCategory enum
offer.subcategory  // string | null
offer.photoUrl     // string | null
offer.margin       // Decimal | null → offer.margin ? Number(offer.margin) : null
offer.volume       // string | null
offer.conditions   // string | null
offer.animation    // string | null
offer.status       // OfferStatus enum (DRAFT, ACTIVE, EXPIRED)
offer.supplierId   // string
offer.createdAt    // Date
offer.supplier.companyName // string (via include)
```

### Détection offre expirée

```typescript
import { getOfferDisplayStatus } from '@/lib/utils/offers'

const displayStatus = getOfferDisplayStatus(offer)
const isExpired = displayStatus.key === 'expired'
// getOfferDisplayStatus compare endDate avec today + vérifie status
```

### Utilitaires existants à réutiliser

```typescript
import { formatPrice, formatDiscount } from '@/lib/utils/format'
import { getOfferDisplayStatus, getCategoryLabel } from '@/lib/utils/offers'
import { OFFER_CATEGORY_LABELS } from '@/lib/validations/offers'
// Deux options pour le label catégorie : getCategoryLabel() ou OFFER_CATEGORY_LABELS[category]

// Date formatting — même pattern que supplier detail :
const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
```

### Sécurité — FR34 Marge

La marge est affichée car la page est dans le route group `(store)`. Le layout vérifie que l'utilisateur est un magasin authentifié. Pas de vérification supplémentaire nécessaire. La restriction FR34 (autres fournisseurs ne voient pas la marge) est assurée par le routing : les fournisseurs sont dans `(supplier)` et n'ont pas accès aux pages `(store)`.

### Project Structure Notes

**Fichiers à créer :**
- `src/app/(store)/offers/[id]/page.tsx` — Page détail offre magasin (Server Component)
- `src/app/(store)/offers/[id]/page.test.tsx` — Tests

**Fichiers à modifier :**
- `src/lib/queries/offers.ts` — Ajouter `getOfferForStoreDetail(id: string)`

**Fichiers existants à réutiliser (NE PAS recréer) :**
- `src/app/(supplier)/offers/[id]/page.tsx` → **RÉFÉRENCE** structure et patterns
- `src/lib/utils/offers.ts` → `getOfferDisplayStatus()`, `getCategoryLabel()`
- `src/lib/utils/format.ts` → `formatPrice()`, `formatDiscount()`
- `src/lib/validations/offers.ts` → `OFFER_CATEGORY_LABELS`
- `src/components/layout/page-header.tsx` → `PageHeader` (props: `title`, `showBack`)
- `src/components/ui/card.tsx` → `Card`, `CardContent`
- `src/components/ui/badge.tsx` → `Badge`
- `src/components/ui/button.tsx` → `Button`

**NE PAS modifier :**
- `src/components/custom/store-offer-card.tsx` — Link `/offers/{id}` existe déjà
- `src/components/custom/store-offer-list.tsx`
- `src/components/custom/bottom-navigation.tsx`
- `src/lib/actions/offers.ts` — Pas de Server Action dans cette story
- `prisma/schema.prisma` — Pas de migration

### Previous Story Intelligence

**Story 3.4 (Filtrage par Enseigne) — Patterns établis :**
- 576 tests passent — NE PAS les casser
- `StoreOfferCard` link vers `/offers/{id}` → la navigation est déjà implémentée
- Page RSC pattern : `createClient()` + Prisma query dans la page (voir `page.tsx` des offres)
- Layout `(store)` gère l'auth → pas de check auth dans la page

**Supplier detail page — Patterns à reprendre :**
- Photo `aspect-video rounded-[0_1rem_1rem_1rem] bg-muted` avec Image `fill` + `object-cover`
- Card avec `<CardContent className="p-4 space-y-3">`
- Date formatter inline `Intl.DateTimeFormat('fr-FR', { day, month: 'long', year: 'numeric' })`
- Champs optionnels affichés conditionnellement avec `{field && (...)}`
- Texte long : `whitespace-pre-wrap` (conditions, animation)
- Decimal → `Number()` pour promoPrice et margin

### Git Intelligence

**Commits récents :**
- `981f40e` — Stories 2.5-3.2, design system Acquire et filtrage par catégorie
- Convention : `feat: Description en français (Story X.X)`
- Pas de migration Prisma récente dans Epic 3

### Testing Requirements

**Pattern de test (suivre le pattern de `src/app/(store)/offers/page.test.tsx`) :**
- Mocker `@/lib/queries/offers` — `getOfferForStoreDetail` retourne une offre mock
- Mocker `next/navigation` — `notFound` est un mock vi.fn()
- Mocker `next/image` — composant div simple
- Offres mock : une complète (tous champs remplis) et une minimale (champs optionnels null)
- Offre expirée : `endDate` dans le passé ou `status: 'EXPIRED'`
- Tester le rendu conditionnel : marge, détails optionnels, bandeau expirée, CTA disabled

**Attention :** `getOfferDisplayStatus` utilise `new Date()` pour comparer. Utiliser `vi.useFakeTimers()` + `vi.setSystemTime()` si nécessaire pour contrôler l'état expired.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.5: Détail Complet d'une Offre]
- [Source: _bmad-output/planning-artifacts/epics.md#FR17: Détail complet offre]
- [Source: _bmad-output/planning-artifacts/epics.md#FR34: Visibilité marges (magasins only)]
- [Source: _bmad-output/planning-artifacts/visual-design-guide.md — Design system]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/project-context.md — Règles implémentation]
- [Source: src/app/(supplier)/offers/[id]/page.tsx — Pattern page détail existant]
- [Source: src/lib/utils/offers.ts — getOfferDisplayStatus, getCategoryLabel, types]
- [Source: src/lib/utils/format.ts — formatPrice, formatDiscount]
- [Source: src/components/layout/page-header.tsx — PageHeader (showBack)]
- [Source: _bmad-output/implementation-artifacts/3-4-filtrage-par-enseigne-compatible.md — Story précédente]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Conflit de route Next.js : `(store)/offers/[id]` et `(supplier)/offers/[id]` résolvaient au même path `/offers/[id]`. Résolu en déplaçant les pages supplier sous `/my-offers/` (route group `(supplier)/my-offers/`).

### Completion Notes List

- ✅ Task 1 : Query `getOfferForStoreDetail` ajoutée dans `src/lib/queries/offers.ts` — `findFirst` avec `where: { id, deletedAt: null }`, inclut `supplier.companyName`. Type `OfferDetail` exporté.
- ✅ Task 2 : Page Server Component créée à `src/app/(store)/offers/[id]/page.tsx` — `generateMetadata` dynamique, `notFound()` si null, détection expirée via `getOfferDisplayStatus`.
- ✅ Task 3 : Layout complet — PageHeader avec showBack, bandeau expirée conditionnel, photo plein-largeur avec placeholder Package, section titre avec font-display, Card Prix avec marge conditionnelle, Card Dates en grid 2 cols, Card Détails optionnels conditionnels.
- ✅ Task 4 : Boutons CTA — "Demande de renseignements" (outline) + "Souhaite commander" (primary, asymmetric border-radius), h-11, disabled quand expirée, pas de onClick (Epic 4).
- ✅ Task 5 : 12 tests créés couvrant tous les ACs — nom produit, fournisseur, prix/remise, marge visible/absente, placeholder photo, bandeau expiré, CTA disabled/enabled, détails optionnels présents/absents, notFound.
- ✅ Task 6 : 591 tests passent, build OK, lint 0 erreurs/warnings.
- ⚠️ Refactoring route supplier : Pages supplier déplacées de `(supplier)/offers/` vers `(supplier)/my-offers/` pour résoudre conflit de route Next.js App Router. Liens mis à jour dans offer-card, edit-offer-form, empty-offers-state, dashboard, et tests correspondants.

### File List

**Fichiers créés :**
- `src/app/(store)/offers/[id]/page.tsx`
- `src/app/(store)/offers/[id]/page.test.tsx`

**Fichiers modifiés :**
- `src/lib/queries/offers.ts` — ajout `getOfferForStoreDetail`, `OfferDetail`
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — status `in-progress` → `review`

**Fichiers déplacés (résolution conflit route) :**
- `src/app/(supplier)/offers/[id]/page.tsx` → `src/app/(supplier)/my-offers/[id]/page.tsx`
- `src/app/(supplier)/offers/[id]/page.test.tsx` → `src/app/(supplier)/my-offers/[id]/page.test.tsx`
- `src/app/(supplier)/offers/[id]/loading.tsx` → `src/app/(supplier)/my-offers/[id]/loading.tsx`
- `src/app/(supplier)/offers/[id]/edit/page.tsx` → `src/app/(supplier)/my-offers/[id]/edit/page.tsx`
- `src/app/(supplier)/offers/[id]/edit/page.test.tsx` → `src/app/(supplier)/my-offers/[id]/edit/page.test.tsx`
- `src/app/(supplier)/offers/[id]/edit/loading.tsx` → `src/app/(supplier)/my-offers/[id]/edit/loading.tsx`
- `src/app/(supplier)/offers/new/page.tsx` → `src/app/(supplier)/my-offers/new/page.tsx`

**Fichiers modifiés (liens /offers/ → /my-offers/) :**
- `src/components/custom/offer-card.tsx`
- `src/components/custom/offer-card.test.tsx`
- `src/components/forms/edit-offer-form.tsx`
- `src/components/forms/edit-offer-form.test.tsx`
- `src/components/custom/empty-offers-state.tsx`
- `src/components/custom/empty-offers-state.test.tsx`
- `src/app/(supplier)/dashboard/page.tsx`
- `src/app/(supplier)/dashboard/page.test.tsx`
- `src/app/(supplier)/my-offers/[id]/page.tsx` (lien edit)
- `src/app/(supplier)/my-offers/[id]/page.test.tsx` (lien edit)

### Code Review Fixes (2026-02-08)

- **[H1] Catégorie toujours visible** — Catégorie déplacée de la card Détails optionnels vers la card Prix (pattern supplier). Corrige AC2 : catégorie affichée même si tous les champs optionnels sont null.
- **[H2] getOfferDisplayStatus vérifie `status: 'EXPIRED'`** — Ajout condition `|| offer.status === 'EXPIRED'` dans `src/lib/utils/offers.ts`. Corrige AC7 : offre marquée EXPIRED avec endDate futur détectée correctement.
- **[M1] CTA sticky** — Boutons CTA restructurés avec `sticky bottom-0 border-t bg-background p-4`. Corrige AC4.
- **[M2] React.cache()** — `getOfferForStoreDetail` wrappée avec `cache()` de React pour dédupliquer les appels entre `generateMetadata` et la page.
- **[M3] loading.tsx créé** — `src/app/(store)/offers/[id]/loading.tsx` ajouté avec skeleton. Conforme project-context.md.
- **[M4] Tests generateMetadata** — 2 tests ajoutés (titre dynamique + fallback introuvable).
- **[L1/L2] Tests supplémentaires** — Tests catégorie dans price card, photo avec URL, catégorie visible sans champs optionnels.
- 6 nouveaux tests → 597/597 passent. Build OK. Lint 0 erreur.

### File List (mise à jour post-review)

**Fichiers ajoutés par le review :**
- `src/app/(store)/offers/[id]/loading.tsx`

**Fichiers modifiés par le review :**
- `src/lib/utils/offers.ts` — `getOfferDisplayStatus` vérifie `status === 'EXPIRED'`
- `src/lib/utils/offers.test.ts` — +1 test EXPIRED status
- `src/lib/queries/offers.ts` — `React.cache()` wrap
- `src/app/(store)/offers/[id]/page.tsx` — catégorie dans price card, CTA sticky
- `src/app/(store)/offers/[id]/page.test.tsx` — +5 tests (metadata, catégorie, photo URL)

## Change Log

- 2026-02-08: Story 3.5 implémentée — page détail offre magasin avec query, layout complet, CTA, et 12 tests. Refactoring route supplier `/offers/` → `/my-offers/` pour résoudre conflit Next.js App Router.
- 2026-02-08: Code review — 9 issues trouvés (2H/4M/3L), tous corrigés. Catégorie toujours visible, CTA sticky, React.cache(), loading.tsx, EXPIRED status check, +6 tests.
