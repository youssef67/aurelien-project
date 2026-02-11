# Story 4.1: Schéma Demandes & Envoi Demande de Renseignements

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

En tant que **chef de rayon (magasin)**,
Je veux **envoyer une demande de renseignements sur une offre**,
Afin d'**obtenir plus d'informations avant de commander**.

## Acceptance Criteria

### AC1: Schéma Prisma — modèle Request
**Given** le schéma Prisma existe
**When** j'ajoute le modèle Request
**Then** la table `requests` est créée avec les champs :
- id (UUID), store_id (FK → stores), offer_id (FK → offers), supplier_id (FK dénormalisé → suppliers)
- type (enum RequestType: INFO, ORDER), message (optional text)
- status (enum RequestStatus: PENDING, TREATED), created_at, updated_at
**And** un index existe sur store_id
**And** un index existe sur supplier_id
**And** un index existe sur offer_id

### AC2: Policies RLS
**Given** la table requests existe
**When** je crée les policies RLS
**Then** un magasin ne peut voir que ses propres demandes (FR33)
**And** un magasin peut créer des demandes sur n'importe quelle offre active
**And** un magasin ne peut pas modifier/supprimer ses demandes une fois envoyées

### AC3: Ouverture du Sheet "Demande de renseignements"
**Given** je suis sur le détail d'une offre active (non expirée)
**When** je clique sur "Demande de renseignements"
**Then** un Sheet (bottom panel) s'ouvre
**And** le type INFO est pré-sélectionné (non visible pour l'utilisateur)
**And** un champ textarea permet d'ajouter un message optionnel (FR20)
**And** un placeholder suggère : "Précisez votre question (optionnel)"

### AC4: Envoi de la demande
**Given** le Sheet est ouvert
**When** je clique sur "Envoyer"
**Then** une Server Action `createRequest` est appelée
**And** elle crée une demande avec type=INFO et status=PENDING
**And** elle retourne `ActionResult<Request>`

### AC5: Succès de l'envoi
**Given** l'envoi réussit
**When** la demande est créée
**Then** le Sheet se ferme
**And** un toast de succès s'affiche "Demande envoyée à [Fournisseur]"
**And** sur la page détail, le bouton "Demande de renseignements" est remplacé par "Demande envoyée" (désactivé)

### AC6: Déjà envoyé une demande INFO
**Given** j'ai déjà envoyé une demande INFO sur cette offre
**When** je retourne sur le détail de l'offre
**Then** le bouton "Demande de renseignements" est remplacé par "Demande envoyée" (désactivé)
**And** je peux toujours envoyer une intention de commande (le bouton reste actif pour Epic 4.2)

### AC7: Erreur à l'envoi
**Given** une erreur survient
**When** l'envoi échoue
**Then** un toast d'erreur s'affiche
**And** le Sheet reste ouvert avec mon message préservé
**And** je peux réessayer

### AC8: Offre expirée — CTA désactivés
**Given** l'offre est expirée
**When** j'accède au détail
**Then** les deux boutons CTA sont désactivés (comportement existant, inchangé)
**And** le Sheet ne peut pas s'ouvrir

## Tasks / Subtasks

- [x] **Task 1: Ajouter le modèle Request dans Prisma** (AC: 1)
  - [x] 1.1 Ajouter les enums `RequestType` (INFO, ORDER) et `RequestStatus` (PENDING, TREATED) dans `prisma/schema.prisma`
  - [x] 1.2 Ajouter le modèle `Request` avec tous les champs, FK et indexes
  - [x] 1.3 Ajouter les relations bidirectionnelles : `Request.store → Store`, `Request.offer → Offer`, `Request.supplier → Supplier`
  - [x] 1.4 Ajouter `requests Request[]` dans les modèles Store, Offer et Supplier
  - [x] 1.5 Exécuter `npx prisma migrate dev --name add_requests_table`
  - [x] 1.6 Vérifier que `npx prisma generate` passe sans erreur

- [x] **Task 2: Créer les policies RLS** (AC: 2)
  - [x] 2.1 Créer une migration SQL pour les policies RLS sur la table `requests` :
    - `requests_store_select` : `auth.uid() = store_id` (magasin ne voit que ses demandes)
    - `requests_store_insert` : `auth.uid() = store_id` (magasin ne peut créer que pour lui-même)
    - `requests_supplier_select` : `auth.uid() = supplier_id` (fournisseur voit les demandes sur ses offres — prépare Epic 5)
  - [x] 2.2 Activer RLS sur la table `requests` : `ALTER TABLE requests ENABLE ROW LEVEL SECURITY;`
  - [x] 2.3 **Note** : Pas de policy UPDATE pour les magasins (un magasin ne peut pas modifier ses demandes)
  - [x] 2.4 **Note** : Policy UPDATE pour supplier_id sera ajoutée dans Story 5.3 (pas dans cette story)

- [x] **Task 3: Créer la validation Zod** (AC: 3, 4)
  - [x] 3.1 Créer `src/lib/validations/requests.ts`
  - [x] 3.2 Schéma `createRequestSchema` :
    ```typescript
    import { z } from 'zod'

    export const REQUEST_TYPES = ['INFO', 'ORDER'] as const
    export const REQUEST_STATUSES = ['PENDING', 'TREATED'] as const

    export const createRequestSchema = z.object({
      offerId: z.string().uuid('ID offre invalide'),
      type: z.enum(REQUEST_TYPES),
      message: z
        .string()
        .max(1000, 'Le message ne peut pas dépasser 1000 caractères')
        .optional()
        .or(z.literal('')),
    })

    export type CreateRequestInput = z.infer<typeof createRequestSchema>
    ```
  - [x] 3.3 **NE PAS inclure** `storeId` ni `supplierId` dans le schéma — ces valeurs viennent de l'auth et de l'offre côté serveur

- [x] **Task 4: Créer la Server Action `createRequest`** (AC: 4, 5, 7)
  - [x] 4.1 Créer `src/lib/actions/requests.ts` avec `'use server'`
  - [x] 4.2 Implémenter `createRequest(input: CreateRequestInput): Promise<ActionResult<{ requestId: string }>>`
  - [x] 4.3 Pattern exact (copier le pattern de `createOffer`) :
    1. Validation Zod serveur
    2. Auth check (`createClient` → `getUser`)
    3. Vérifier rôle magasin (`prisma.store.findUnique({ where: { id: user.id } })`)
    4. Vérifier que l'offre existe, est active et non supprimée
    5. Vérifier que le magasin n'a pas déjà envoyé une demande du même type sur cette offre
    6. Créer la demande avec `supplierId` provenant de l'offre (dénormalisé)
    7. `revalidatePath('/offers/[id]')` pour refresh
    8. Retourner `{ success: true, data: { requestId } }`
  - [x] 4.4 Erreur si offre expirée : `{ success: false, error: "Cette offre n'est plus disponible", code: 'VALIDATION_ERROR' }`
  - [x] 4.5 Erreur si déjà envoyée : `{ success: false, error: "Vous avez déjà envoyé une demande de ce type", code: 'VALIDATION_ERROR' }`

- [x] **Task 5: Créer la query pour les demandes existantes** (AC: 6)
  - [x] 5.1 Créer `src/lib/queries/requests.ts`
  - [x] 5.2 Implémenter `getExistingRequestTypes(storeId: string, offerId: string): Promise<string[]>` — retourne les types de demandes déjà envoyées par ce magasin sur cette offre
    ```typescript
    import { cache } from 'react'
    import { prisma } from '@/lib/prisma/client'

    export const getExistingRequestTypes = cache(
      async (storeId: string, offerId: string) => {
        const requests = await prisma.request.findMany({
          where: { storeId, offerId },
          select: { type: true },
        })
        return requests.map((r) => r.type)
      }
    )
    ```

- [x] **Task 6: Créer le composant RequestSheet** (AC: 3, 4, 5, 7)
  - [x] 6.1 Créer `src/components/custom/request-sheet.tsx` — `"use client"`
  - [x] 6.2 Props du composant :
    ```typescript
    interface RequestSheetProps {
      offerId: string
      supplierName: string
      type: 'INFO' | 'ORDER'
      trigger: React.ReactNode
      disabled?: boolean
    }
    ```
  - [x] 6.3 Utiliser les composants Sheet de shadcn/ui : `Sheet`, `SheetTrigger`, `SheetContent` (side="bottom"), `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter`
  - [x] 6.4 Contenu du Sheet :
    - Titre : "Demande de renseignements" (ou "Intention de commande" pour ORDER — prépare 4.2)
    - Description : "Envoyer une demande à [supplierName]"
    - Textarea avec placeholder "Précisez votre question (optionnel)"
    - Bouton "Envoyer" dans le SheetFooter
  - [x] 6.5 État local : `open` (contrôle Sheet), `message` (textarea), `isPending` (loading)
  - [x] 6.6 `useTransition` de React pour gérer l'état pending de la Server Action
  - [x] 6.7 Au submit :
    - Appeler `createRequest({ offerId, type, message })`
    - Success → fermer le Sheet, toast succès, `router.refresh()` pour recharger les données RSC
    - Erreur → toast erreur, Sheet reste ouvert
  - [x] 6.8 Toast border-radius : `0 0.75rem 0.75rem 0.75rem` (design system)
  - [x] 6.9 Bouton "Envoyer" avec `disabled={isPending}` et spinner pendant le loading

- [x] **Task 7: Mettre à jour la page détail offre** (AC: 3, 5, 6, 8)
  - [x] 7.1 Modifier `src/app/(store)/offers/[id]/page.tsx`
  - [x] 7.2 Charger l'utilisateur courant via `createClient` → `getUser` pour obtenir le `storeId`
  - [x] 7.3 Charger les types de demandes existantes : `getExistingRequestTypes(user.id, offer.id)`
  - [x] 7.4 Déterminer `hasInfoRequest = existingTypes.includes('INFO')`
  - [x] 7.5 Remplacer le bouton "Demande de renseignements" par :
    - Si `hasInfoRequest` : `<Button variant="outline" disabled>Demande envoyée</Button>`
    - Sinon : `<RequestSheet offerId={offer.id} supplierName={offer.supplier.companyName} type="INFO" trigger={<Button variant="outline">Demande de renseignements</Button>} disabled={isExpired} />`
  - [x] 7.6 Le bouton "Souhaite commander" reste non-fonctionnel pour l'instant (Story 4.2 le connectera)
  - [x] 7.7 **IMPORTANT** : La page reste un Server Component pour le rendu RSC. Seul le `RequestSheet` est un client component wrapper autour du trigger.

- [x] **Task 8: Tests** (AC: 1-8)
  - [x] 8.1 Créer `src/lib/actions/requests.test.ts` :
    - Test : validation échoue si offerId manquant
    - Test : erreur UNAUTHORIZED si pas d'utilisateur
    - Test : erreur FORBIDDEN si pas un magasin
    - Test : erreur si offre inexistante
    - Test : erreur si offre expirée
    - Test : erreur si demande déjà envoyée
    - Test : succès de création avec type INFO
    - Test : supplierId provient de l'offre (pas de l'input)
  - [x] 8.2 Créer `src/components/custom/request-sheet.test.tsx` :
    - Test : affiche le titre correct pour type INFO
    - Test : affiche le textarea avec placeholder
    - Test : bouton "Envoyer" présent
    - Test : bouton "Envoyer" disabled quand composant disabled
    - Test : appelle createRequest au submit
  - [x] 8.3 Mettre à jour `src/app/(store)/offers/[id]/page.test.tsx` :
    - Test : affiche "Demande envoyée" quand hasInfoRequest=true
    - Test : affiche le bouton "Demande de renseignements" quand hasInfoRequest=false
    - Test : le bouton est désactivé quand offre expirée

- [x] **Task 9: Validation finale** (AC: 1-8)
  - [x] 9.1 `npx prisma migrate dev` — migration appliquée
  - [x] 9.2 `npm run test` — tous les tests passent (0 régression)
  - [x] 9.3 `npm run build` — build OK
  - [x] 9.4 `npm run lint` — 0 erreur, 0 warning

## Dev Notes

### Architecture Compliance

**Patterns OBLIGATOIRES :**
- Server Action avec `ActionResult<T>` [Source: types/api.ts]
- Validation Zod client + serveur [Source: architecture.md#Implementation Patterns]
- `"use server"` dans le fichier actions [Source: project-context.md#Next.js Rules]
- Tests co-localisés `*.test.ts(x)` [Source: project-context.md#Testing Rules]
- Fichiers `kebab-case`, composants `PascalCase` [Source: project-context.md#Naming Conventions]
- Headings : `font-display` (Plus Jakarta Sans) [Source: visual-design-guide]
- Toast border-radius : `0 0.75rem 0.75rem 0.75rem` [Source: visual-design-guide]
- Cards border-radius asymétrique : `0 16px 16px 16px` [Source: visual-design-guide]

**NE PAS faire :**
- NE PAS inclure `storeId` ou `supplierId` dans l'input de la Server Action — toujours les dériver du `auth.uid()` et de l'offre côté serveur
- NE PAS créer de API Route — utiliser Server Actions exclusivement
- NE PAS implémenter le handler du bouton "Souhaite commander" — c'est Story 4.2
- NE PAS créer la page `/my-requests` (historique) — c'est Story 4.3
- NE PAS installer de nouvelle dépendance
- NE PAS modifier le `BottomNavigation` — sera mis à jour dans Story 4.3
- NE PAS toucher aux policies RLS des offres — elles sont déjà en place

### Modèle Prisma — Request

```prisma
enum RequestType {
  INFO
  ORDER

  @@map("request_type")
}

enum RequestStatus {
  PENDING
  TREATED

  @@map("request_status")
}

model Request {
  id         String        @id @default(uuid()) @db.Uuid
  storeId    String        @map("store_id") @db.Uuid
  offerId    String        @map("offer_id") @db.Uuid
  supplierId String        @map("supplier_id") @db.Uuid
  type       RequestType
  message    String?       @db.Text
  status     RequestStatus @default(PENDING)
  createdAt  DateTime      @default(now()) @map("created_at")
  updatedAt  DateTime      @updatedAt @map("updated_at")

  // Relations
  store    Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  offer    Offer    @relation(fields: [offerId], references: [id], onDelete: Cascade)
  supplier Supplier @relation(fields: [supplierId], references: [id], onDelete: Cascade)

  // Indexes
  @@index([storeId])
  @@index([offerId])
  @@index([supplierId])

  @@map("requests")
}
```

**Relations à ajouter dans les modèles existants :**
```prisma
// Dans model Store, ajouter :
requests Request[]

// Dans model Offer, ajouter :
requests Request[]

// Dans model Supplier, ajouter (déjà a offers Offer[], ajouter sous) :
requests Request[]
```

### RLS Policies — SQL Migration

```sql
-- Activer RLS
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Policy : un magasin ne voit que ses propres demandes
CREATE POLICY "requests_store_select" ON requests
  FOR SELECT USING (auth.uid() = store_id);

-- Policy : un magasin ne peut créer que des demandes pour lui-même
CREATE POLICY "requests_store_insert" ON requests
  FOR INSERT WITH CHECK (auth.uid() = store_id);

-- Policy : un fournisseur voit les demandes sur ses offres (prépare Epic 5)
CREATE POLICY "requests_supplier_select" ON requests
  FOR SELECT USING (auth.uid() = supplier_id);

-- Note : Policy UPDATE pour fournisseur sera ajoutée dans Story 5.3
```

### Server Action — Pattern de référence

Suivre exactement le pattern de `src/lib/actions/offers.ts:createOffer` :
1. Validation Zod → retour `VALIDATION_ERROR` si échec
2. `createClient()` → `getUser()` → retour `UNAUTHORIZED` si pas d'user
3. `prisma.store.findUnique({ where: { id: user.id } })` → retour `FORBIDDEN` si pas un magasin
4. `prisma.offer.findFirst({ where: { id: offerId, deletedAt: null, status: 'ACTIVE' } })` → retour `NOT_FOUND` ou `VALIDATION_ERROR` si expirée
5. Vérifier absence de doublon : `prisma.request.findFirst({ where: { storeId: user.id, offerId, type } })` → retour `VALIDATION_ERROR` si existe
6. Créer : `prisma.request.create({ data: { storeId: user.id, offerId, supplierId: offer.supplierId, type, message: message || null, status: 'PENDING' } })`
7. `revalidatePath(`/offers/${offerId}`)` pour refresh de la page détail
8. Retourner `{ success: true, data: { requestId: request.id } }`

### Vérification offre active — Logique

```typescript
// L'offre doit être active et non expirée
const today = new Date()
today.setUTCHours(0, 0, 0, 0)

const offer = await prisma.offer.findFirst({
  where: { id: offerId, deletedAt: null },
  select: { id: true, supplierId: true, status: true, endDate: true },
})

if (!offer) {
  return { success: false, error: 'Offre introuvable', code: 'NOT_FOUND' }
}

if (offer.status !== 'ACTIVE' || new Date(offer.endDate) < today) {
  return { success: false, error: "Cette offre n'est plus disponible", code: 'VALIDATION_ERROR' }
}
```

### RequestSheet — Composant client

```typescript
// Pattern : Sheet bottom panel (comme offer-filter-sheet.tsx)
// Imports nécessaires :
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast' // ou import { toast } from 'sonner' selon implémentation
import { createRequest } from '@/lib/actions/requests'
import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
```

Le composant gère :
- `open` state pour contrôler le Sheet
- `message` state pour le textarea
- `isPending` via `useTransition` pour le loading
- Au submit, appelle `createRequest` puis `router.refresh()` pour recharger les données RSC (la page détail re-vérifie les demandes existantes)

### Page détail — Modifications minimales

La page `src/app/(store)/offers/[id]/page.tsx` est un **Server Component**. Les modifications :

1. Importer `createClient` de `@/lib/supabase/server`
2. Obtenir `user` via `supabase.auth.getUser()` (le layout fait déjà le auth check, mais on a besoin du user.id)
3. Appeler `getExistingRequestTypes(user.id, offer.id)`
4. Passer les résultats aux composants CTA

**Structure CTA mise à jour :**
```tsx
{/* Sticky CTA buttons */}
<div className="sticky bottom-0 border-t bg-background p-4">
  <div className="flex gap-3">
    {hasInfoRequest ? (
      <Button variant="outline" className="flex-1 h-11" disabled>
        Demande envoyée
      </Button>
    ) : (
      <RequestSheet
        offerId={offer.id}
        supplierName={offer.supplier.companyName}
        type="INFO"
        trigger={
          <Button variant="outline" className="flex-1 h-11" disabled={isExpired}>
            Demande de renseignements
          </Button>
        }
        disabled={isExpired}
      />
    )}
    <Button className="flex-1 h-11 rounded-[0_0.5rem_0.5rem_0.5rem]" disabled={isExpired}>
      Souhaite commander
    </Button>
  </div>
</div>
```

**Note :** Le `RequestSheet` utilise `SheetTrigger asChild` pour wrapper le bouton trigger sans ajouter de DOM supplémentaire.

### Toast — Implémentation

Vérifier l'implémentation existante des toasts dans le projet. Le pattern utilise probablement `sonner` ou le hook `useToast` de shadcn :

```typescript
// Vérifier dans le projet : grep pour "toast" ou "sonner"
// Pattern attendu :
import { toast } from 'sonner'

// Succès
toast.success(`Demande envoyée à ${supplierName}`)

// Erreur
toast.error(result.error)
```

### Données disponibles dans la page détail (Prisma)

La query `getOfferForStoreDetail` retourne déjà :
```typescript
offer.id           // string (UUID)
offer.supplierId   // string (UUID) — nécessaire pour la demande
offer.supplier.companyName // string — pour le toast
// ... tous les autres champs
```

La nouvelle query `getExistingRequestTypes` retourne :
```typescript
existingTypes: string[] // ex: ['INFO'] ou ['INFO', 'ORDER'] ou []
```

### Conflit de routes — Note

Le `BottomNavigation` du magasin pointe vers `/requests`. Or le `SupplierBottomNavigation` pointe aussi vers `/requests`. Les route groups sont différents mais la résolution URL est identique. La page `(store)/my-requests/` existe comme répertoire vide. **Ne pas toucher au BottomNavigation dans cette story** — Story 4.3 créera la page `/my-requests` et mettra à jour le lien.

### Project Structure Notes

**Fichiers à créer :**
- `prisma/migrations/XXXXXX_add_requests_table/migration.sql` — via `prisma migrate dev`
- `src/lib/validations/requests.ts` — Schéma Zod
- `src/lib/actions/requests.ts` — Server Action
- `src/lib/queries/requests.ts` — Query pour demandes existantes
- `src/components/custom/request-sheet.tsx` — Composant Sheet client
- `src/components/custom/request-sheet.test.tsx` — Tests Sheet
- `src/lib/actions/requests.test.ts` — Tests Server Action

**Fichiers à modifier :**
- `prisma/schema.prisma` — Ajouter enums + modèle Request + relations
- `src/app/(store)/offers/[id]/page.tsx` — Intégrer RequestSheet + query existingTypes
- `src/app/(store)/offers/[id]/page.test.tsx` — Tests mis à jour pour les CTA

**NE PAS modifier :**
- `src/components/custom/bottom-navigation.tsx` — Story 4.3
- `src/components/custom/supplier-bottom-navigation.tsx`
- `src/lib/actions/offers.ts` — Pas de changement
- `src/lib/queries/offers.ts` — La query existante suffit
- `src/components/custom/store-offer-list.tsx`
- `src/components/custom/store-offer-card.tsx`

### Previous Story Intelligence

**Story 3.5 (Détail Complet Offre) — Patterns établis :**
- Page RSC avec `getOfferForStoreDetail` + `React.cache()`
- Bandeau expirée via `getOfferDisplayStatus` → `key === 'expired'`
- CTA sticky avec `sticky bottom-0 border-t bg-background p-4`
- Boutons `variant="outline"` et `variant="default"` avec `h-11`
- `disabled={isExpired}` sur les CTA
- Tests mockent `@/lib/queries/offers`, `next/navigation`, `next/image`
- 597 tests passent — NE PAS les casser
- **Refactoring route** : supplier pages déplacées de `(supplier)/offers/` vers `(supplier)/my-offers/`

**Story 3.3/3.4 (Filtrage) — Pattern Sheet existant :**
- `offer-filter-sheet.tsx` utilise `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter`
- Pattern `side="bottom"` pour le Sheet sur mobile
- Composant `"use client"` avec état local

### Git Intelligence

**Commits récents :**
- `981f40e` — Stories 2.5-3.2, design system Acquire et filtrage par catégorie
- Convention : `feat: Description en français (Story X.X)`
- Migration Prisma pas récente (dernière : ajout table offers)

**Commit suggéré pour cette story :**
```
feat: Schema demandes, RLS policies et envoi demande renseignements (Story 4.1)
```

### Testing Requirements

**Server Action `createRequest` — Tests unitaires :**
- Mocker `@/lib/supabase/server` (createClient → getUser)
- Mocker `@/lib/prisma/client` (prisma.store.findUnique, prisma.offer.findFirst, prisma.request.findFirst, prisma.request.create)
- Mocker `next/cache` (revalidatePath)
- Tester chaque cas d'erreur : validation, auth, rôle, offre inexistante, offre expirée, doublon
- Tester le cas de succès : vérifier les données passées à `prisma.request.create`

**RequestSheet — Tests composant :**
- Mocker `@/lib/actions/requests` (createRequest)
- Mocker `next/navigation` (useRouter → refresh)
- Tester le rendu du titre et de la description
- Tester le bouton disabled quand `disabled={true}`
- Tester le submit : vérifier que createRequest est appelé avec les bons paramètres

**Page détail — Tests mis à jour :**
- Mocker `@/lib/queries/requests` (getExistingRequestTypes)
- Mocker `@/lib/supabase/server` (createClient → getUser)
- Test : "Demande envoyée" affiché quand existingTypes inclut 'INFO'
- Test : "Demande de renseignements" affiché quand existingTypes est vide
- Les tests existants (bandeau expiré, CTA disabled) doivent continuer à passer

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.1: Schéma Demandes & Envoi Demande de Renseignements]
- [Source: _bmad-output/planning-artifacts/epics.md#FR18: Demande de renseignements]
- [Source: _bmad-output/planning-artifacts/epics.md#FR20: Message personnalisé]
- [Source: _bmad-output/planning-artifacts/epics.md#FR33: Isolation demandes magasin]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture — Request model]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security — RLS]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns — Server Actions]
- [Source: _bmad-output/project-context.md — Règles implémentation]
- [Source: src/lib/actions/offers.ts — Pattern Server Action (createOffer)]
- [Source: src/lib/validations/offers.ts — Pattern validation Zod]
- [Source: src/types/api.ts — ActionResult<T>, ErrorCode]
- [Source: src/app/(store)/offers/[id]/page.tsx — Page détail actuelle]
- [Source: src/components/custom/offer-filter-sheet.tsx — Pattern Sheet existant]
- [Source: _bmad-output/implementation-artifacts/3-5-detail-complet-offre.md — Story précédente]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Prisma `migrate dev` échoue (shadow DB) → résolu via `prisma db push`

### Completion Notes List

- Task 1: Enums `RequestType`/`RequestStatus` + modèle `Request` avec FK/indexes + relations bidirectionnelles dans Store/Offer/Supplier. Migration via `prisma db push`.
- Task 2: RLS policies créées : `requests_store_select`, `requests_store_insert`, `requests_supplier_select`. Appliquées via psql.
- Task 3: Schéma Zod `createRequestSchema` — offerId (UUID), type (INFO|ORDER), message (optional, max 1000). storeId/supplierId exclus volontairement.
- Task 4: Server Action `createRequest` suivant pattern `createOffer` — validation, auth, rôle magasin, offre active, doublon, création, revalidation.
- Task 5: Query `getExistingRequestTypes` avec `React.cache()` — retourne les types de demandes existantes.
- Task 6: Composant `RequestSheet` — Sheet bottom, textarea, `useTransition`, toast sonner, `router.refresh()`.
- Task 7: Page détail mise à jour — import `createClient`/`getExistingRequestTypes`/`RequestSheet`, logique `hasInfoRequest`, bouton "Demande envoyée" vs `RequestSheet`.
- Task 8: 47 tests créés (15 action + 11 composant + 21 page). Tous passent.
- Task 9: 627 tests passent (0 régression), build OK, lint 0 erreur.

### File List

**Fichiers créés :**
- `prisma/migrations/20260210_add_requests_table/migration.sql`
- `prisma/migrations/20260210_add_requests_rls/migration.sql`
- `src/lib/validations/requests.ts`
- `src/lib/actions/requests.ts`
- `src/lib/actions/requests.test.ts`
- `src/lib/queries/requests.ts`
- `src/components/custom/request-sheet.tsx`
- `src/components/custom/request-sheet.test.tsx`

**Fichiers modifiés :**
- `prisma/schema.prisma` — enums + modèle Request + relations + @@unique([storeId, offerId, type])
- `src/app/(store)/offers/[id]/page.tsx` — intégration RequestSheet + getExistingRequestTypes
- `src/app/(store)/offers/[id]/page.test.tsx` — mocks + 4 nouveaux tests Story 4.1
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — 4-1 → review
- `_bmad-output/implementation-artifacts/4-1-schema-demandes-et-envoi-demande-renseignements.md` — tasks [x] + record

### Senior Developer Review (AI)

**Reviewer:** Youssef — 2026-02-10
**Issues Found:** 2 HIGH, 3 MEDIUM, 3 LOW
**Issues Fixed:** 5 (2 HIGH + 3 MEDIUM)
**Action Items:** 3 LOW (non-bloquants, laissés en l'état)

**Fixes appliqués :**
1. **[HIGH] Race condition** — Ajout `@@unique([storeId, offerId, type])` dans le modèle Request + handling P2002 dans la Server Action + test unitaire
2. **[HIGH] Migration SQL** — Ajout `CREATE UNIQUE INDEX` dans la migration table
3. **[MEDIUM] Scope creep RLS** — Retrait de la policy `requests_supplier_update` (hors scope, Story 5.3)
4. **[MEDIUM] Type safety** — `getExistingRequestTypes` retourne maintenant `RequestType[]` au lieu de `string[]`
5. **[MEDIUM] RLS defense-in-depth** — Noté comme action item (requiert une décision architecturale)

**Issues LOW non corrigés (non-bloquants) :**
- Zod `.or(z.literal(''))` redondant (cosmétique)
- File List "modified" vs "created" pour fichiers Story 3.5 (documentation)
- Dev Notes Task 2.4 contradiction (corrigé par fix #3)
