# Story 5.3: Traitement d'une Demande

Status: done

## Story

As a fournisseur (supplier),
I want to mark a request as treated and call the requesting store directly,
so that I can track my processing progress and not forget any client.

## Acceptance Criteria

1. **AC1 - Boutons d'action sur page détail** : Sur la page détail d'une demande PENDING (`/requests/[id]`), deux boutons d'action sont visibles :
   - "Appeler" (lien `tel:`) qui ouvre l'application téléphone avec le numéro du magasin pré-rempli
   - "Marquer comme traitée" (bouton primary)

2. **AC2 - Comportement "Appeler"** : Clic sur "Appeler" → ouvre l'app téléphone (mobile) via `tel:`. Sur desktop, le numéro est copié dans le presse-papier avec toast de confirmation "Numéro copié".

3. **AC3 - Server Action updateRequestStatus** : Clic sur "Marquer comme traitée" → appelle une Server Action `updateRequestStatus` qui :
   - Vérifie l'authentification et que la demande appartient au fournisseur
   - Vérifie que le statut actuel est PENDING
   - Met à jour le statut à TREATED
   - Retourne `ActionResult<{ requestId: string }>`

4. **AC4 - Feedback succès** : Après marquage réussi → toast "Demande marquée comme traitée", le badge passe de "Nouveau" à "Traité", les boutons d'action sont remplacés par un indicateur "Traitée le [date]" (format absolu).

5. **AC5 - Demande déjà traitée** : Si je consulte le détail d'une demande TREATED → le statut "Traité" et la date de traitement (`updatedAt`) sont affichés. Pas de bouton "Marquer comme traitée". Les infos de contact restent visibles pour rappel éventuel. Le bouton "Appeler" reste disponible.

6. **AC6 - Erreur** : Si le marquage échoue → toast d'erreur, le statut reste inchangé, je peux réessayer.

7. **AC7 - Visibilité magasin** : Quand le fournisseur marque comme traitée, le magasin voit le statut passer à "Traité" dans son historique `/my-requests` (FR22).

## Tasks / Subtasks

- [x] Task 1: Créer la validation et la Server Action `updateRequestStatus` (AC: #3, #6)
  - [x] 1.1 Ajouter `updateRequestStatusSchema` dans `src/lib/validations/requests.ts` : `z.object({ requestId: z.string().uuid() })`
  - [x] 1.2 Créer `updateRequestStatus` dans `src/lib/actions/requests.ts` :
    - Auth check via `createClient()` + `getUser()`
    - Fetch request via Prisma avec `where: { id: requestId, supplierId: user.id }`
    - Si non trouvée → `{ success: false, error: 'Demande introuvable', code: 'NOT_FOUND' }`
    - Si status !== PENDING → `{ success: false, error: 'Cette demande a déjà été traitée', code: 'VALIDATION_ERROR' }`
    - Update `status: 'TREATED'`
    - `revalidatePath('/requests')` + `revalidatePath('/requests/[id]', 'page')` + `revalidatePath('/my-requests')`
    - Return `{ success: true, data: { requestId } }`
  - [x] 1.3 Tests dans `src/lib/actions/requests.test.ts` (ajouter aux tests existants)

- [x] Task 2: Créer le composant client `RequestDetailActions` (AC: #1, #2, #4, #5, #6)
  - [x] 2.1 Créer `src/components/custom/request-detail-actions.tsx` (client component `'use client'`)
  - [x] 2.2 Props : `requestId: string`, `status: 'PENDING' | 'TREATED'`, `phone: string`, `updatedAt: string`
  - [x] 2.3 Si status === PENDING :
    - Bouton "Appeler" (`variant="outline"`, icône `Phone`) → `handleCall()`
    - Bouton "Marquer comme traitée" (`variant="default"`, icône `CheckCircle`) → `handleTreat()`
    - `handleCall()` : détecte mobile via `'ontouchstart' in window`, si mobile → `window.location.href = 'tel:${phone}'`, sinon → `navigator.clipboard.writeText(phone)` + toast "Numéro copié"
    - `handleTreat()` : appelle `updateRequestStatus({ requestId })`, gère loading state avec `useTransition`, toast succès/erreur, `router.refresh()` après succès
  - [x] 2.4 Si status === TREATED :
    - Indicateur texte "Traitée le [date]" avec icône `CheckCircle2` (vert)
    - Date formatée via `formatAbsoluteDate(updatedAt)`
    - Bouton "Appeler" toujours disponible
  - [x] 2.5 Design : boutons dans un `div` sticky bottom ou section dédiée, `min-h-[44px]` pour touch targets
  - [x] 2.6 Tests dans `src/components/custom/request-detail-actions.test.tsx`

- [x] Task 3: Intégrer `RequestDetailActions` dans la page détail (AC: #1, #4, #5)
  - [x] 3.1 Modifier `src/app/(supplier)/requests/[id]/page.tsx` :
    - Ajouter `updatedAt` à la sérialisation (`serializeSupplierRequestDetail` retourne déjà `createdAt`, ajouter `updatedAt`)
    - Rendre `<RequestDetailActions>` en bas de la page avec les props nécessaires
  - [x] 3.2 Modifier `src/lib/utils/requests.ts` : ajouter `updatedAt: string` au type `SerializedSupplierRequestDetail` et à la fonction `serializeSupplierRequestDetail()`
  - [x] 3.3 Mettre à jour `src/lib/queries/requests.ts` : ajouter `updatedAt` au select de `getSupplierRequestDetail` (si pas déjà inclus par défaut)
  - [x] 3.4 Mettre à jour les tests de la page détail dans `src/app/(supplier)/requests/[id]/page.test.tsx`

- [x] Task 4: Validation finale (tous AC)
  - [x] 4.1 Tous les tests passent (`npm run test`)
  - [x] 4.2 TypeScript sans erreurs (`tsc --noEmit`)
  - [x] 4.3 Vérifier le flow complet : liste → détail PENDING → marquer traitée → badge mis à jour → refresh liste
  - [x] 4.4 Vérifier le flow "Appeler" : mobile (tel:) et desktop (clipboard)
  - [x] 4.5 Vérifier qu'une demande déjà TREATED affiche l'indicateur et pas les boutons d'action

## Dev Notes

### CRITICAL : Pattern Server Action à suivre exactement

Suivre le pattern EXACT de `createRequest()` dans `src/lib/actions/requests.ts` :

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import { updateRequestStatusSchema } from '@/lib/validations/requests'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/api'

export async function updateRequestStatus(
  input: { requestId: string }
): Promise<ActionResult<{ requestId: string }>> {
  const validated = updateRequestStatusSchema.safeParse(input)
  if (!validated.success) {
    return { success: false, error: 'Données invalides', code: 'VALIDATION_ERROR' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Non authentifié', code: 'UNAUTHORIZED' }
  }

  const request = await prisma.request.findFirst({
    where: { id: validated.data.requestId, supplierId: user.id },
  })

  if (!request) {
    return { success: false, error: 'Demande introuvable', code: 'NOT_FOUND' }
  }

  if (request.status === 'TREATED') {
    return { success: false, error: 'Cette demande a déjà été traitée', code: 'VALIDATION_ERROR' }
  }

  await prisma.request.update({
    where: { id: request.id },
    data: { status: 'TREATED' },
  })

  revalidatePath('/requests')
  revalidatePath(`/requests/${request.id}`)
  revalidatePath('/my-requests')

  return { success: true, data: { requestId: request.id } }
}
```

### Pattern "Appeler" — Détection mobile vs desktop

```typescript
function handleCall(phone: string) {
  // Detect touch device (mobile/tablet)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  if (isTouchDevice) {
    window.location.href = `tel:${phone}`
  } else {
    navigator.clipboard.writeText(phone).then(() => {
      toast.success('Numéro copié')
    }).catch(() => {
      // Fallback si clipboard API non disponible
      toast.error('Impossible de copier le numéro')
    })
  }
}
```

### Pattern Client Component avec Server Action

Suivre le pattern de `RequestSheet` (`src/components/custom/request-sheet.tsx`) pour l'appel de Server Action depuis un client component :

```typescript
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast' // OU toast de sonner
import { updateRequestStatus } from '@/lib/actions/requests'

// Dans le composant :
const [isPending, startTransition] = useTransition()
const router = useRouter()

function handleTreat() {
  startTransition(async () => {
    const result = await updateRequestStatus({ requestId })
    if (result.success) {
      toast.success('Demande marquée comme traitée')
      router.refresh()
    } else {
      toast.error(result.error)
    }
  })
}
```

**IMPORTANT** : Vérifier si le projet utilise `sonner` (toast) ou `shadcn/ui toast`. Vérifier les imports existants dans `request-sheet.tsx` pour le pattern exact.

### Sérialisation — Ajouter `updatedAt`

Le type `SerializedSupplierRequestDetail` dans `src/lib/utils/requests.ts` doit être étendu :

```typescript
export type SerializedSupplierRequestDetail = {
  id: string
  type: 'INFO' | 'ORDER'
  status: 'PENDING' | 'TREATED'
  message: string | null
  createdAt: string
  updatedAt: string  // ← AJOUTER
  store: { name: string; brand: string; city: string; email: string; phone: string }
  offer: { id: string; name: string; promoPrice: number }
}

export function serializeSupplierRequestDetail(
  request: SupplierRequestDetailWithRelations
): SerializedSupplierRequestDetail {
  return {
    // ...existant...
    updatedAt: request.updatedAt.toISOString(),  // ← AJOUTER
  }
}
```

### Configs et utilitaires à RÉUTILISER (NE PAS recréer)

| Config | Source | Usage |
|--------|--------|-------|
| `SUPPLIER_REQUEST_STATUS_CONFIG` | `src/lib/utils/requests.ts` | Labels "Nouveau"/"Traité" pour les badges |
| `formatAbsoluteDate()` | `src/lib/utils/format.ts` | Date formatée "10 fév. 2026" pour l'indicateur |
| `formatRelativeDate()` | `src/lib/utils/format.ts` | Pas besoin ici (déjà sur la card) |
| `cn()` | `src/lib/utils/cn.ts` | Merge de classes conditionnelles |
| `ActionResult<T>` | `src/types/api.ts` | Type retour Server Action |
| `Badge` | `src/components/ui/badge.tsx` | Variants existants |
| `Button` | `src/components/ui/button.tsx` | Variants existants |

### Swipe-to-treat — HORS SCOPE

L'acceptance criteria de l'epic mentionne un swipe-to-treat sur les cards de la liste. **Ceci est HORS SCOPE pour cette story** car :
- La complexité UX du swipe gesture est disproportionnée pour le MVP
- Le pattern n'existe pas ailleurs dans l'app
- Le flow principal est via la page détail

### Visual Design Compliance

- **Boutons action** : `min-h-[44px]` pour touch targets (UX-02)
- **Bouton "Appeler"** : `variant="outline"`, icône `Phone` (lucide-react)
- **Bouton "Marquer comme traitée"** : `variant="default"` (primary), icône `CheckCircle` (lucide-react)
- **Indicateur "Traitée"** : texte `text-success` avec icône `CheckCircle2`, date formatée
- **Headings** : `font-display` (Plus Jakarta Sans)
- **Page background** : `bg-muted`
- **Button asymmetric radius** : Primary CTA uses `rounded-[0_8px_8px_8px]`

### Schéma Prisma — Aucune migration nécessaire

Le modèle `Request` a déjà :
- `status RequestStatus @default(PENDING)` avec enum `PENDING | TREATED`
- `updatedAt DateTime @updatedAt` (mis à jour automatiquement par Prisma)
- RLS policy UPDATE pour le fournisseur (ajoutée en Story 5.1)

### Project Structure Notes

Fichiers à CRÉER :
```
src/components/custom/
  ├── request-detail-actions.tsx          # Boutons action (client component)
  └── request-detail-actions.test.tsx     # Tests composant
```

Fichiers à MODIFIER :
```
src/lib/actions/requests.ts              # Ajouter updateRequestStatus
src/lib/validations/requests.ts          # Ajouter updateRequestStatusSchema
src/lib/utils/requests.ts               # Ajouter updatedAt à SerializedSupplierRequestDetail
src/app/(supplier)/requests/[id]/page.tsx  # Intégrer RequestDetailActions
src/app/(supplier)/requests/[id]/page.test.tsx  # Tests page mis à jour
```

Fichiers à potentiellement modifier :
```
src/lib/actions/requests.test.ts         # Ajouter tests updateRequestStatus
src/lib/queries/requests.ts              # Vérifier que updatedAt est inclus dans le select
```

### Testing Requirements

- **`request-detail-actions.test.tsx`** (~12 tests) :
  - Rendering boutons PENDING (Appeler + Marquer comme traitée)
  - Rendering indicateur TREATED (texte + date)
  - Clic "Appeler" mobile → `tel:` link behavior
  - Clic "Appeler" desktop → clipboard copy
  - Clic "Marquer comme traitée" → appel Server Action
  - Loading state pendant le traitement (bouton disabled, spinner)
  - Toast succès après marquage
  - Toast erreur si échec
  - Router refresh après succès
  - Bouton "Appeler" toujours visible quand TREATED

- **`requests.test.ts`** (actions) (~6 tests) :
  - Succès : status PENDING → TREATED
  - Erreur : request non trouvée
  - Erreur : request pas au fournisseur
  - Erreur : request déjà TREATED
  - Erreur : non authentifié
  - Validation : requestId invalide

- **Page test updates** (~3 tests) :
  - Rendering RequestDetailActions avec props correctes
  - updatedAt passé en prop

- **Total estimé** : ~20 nouveaux tests
- **Mock patterns** : `vi.mock('@/lib/actions/requests')`, `vi.mock('next/navigation')`, `Object.assign(navigator, { clipboard: { writeText: vi.fn() } })`

### Previous Story Intelligence (Stories 5.1, 5.2)

**From 5.1 :**
- `SupplierRequestCard` déjà affiche TREATED avec `opacity-60`
- Page détail `/requests/[id]` est read-only, en 4 cards (magasin, demande, message, offre)
- `getSupplierRequestDetail` query inclut store (name, brand, city, email, phone) + offer
- RLS UPDATE policy ajoutée dans migration `20260210_add_supplier_update_rls`
- `serializeSupplierRequestDetail()` retourne `createdAt` mais PAS `updatedAt` → à ajouter
- 777 tests après review de 5.1

**From 5.2 :**
- Filtrage par type/statut fonctionne avec cross-counts
- Quand on marque une demande comme traitée, les compteurs se mettent à jour au refresh
- `useSyncExternalStore` pattern pour les filtres localStorage
- 812 tests après review de 5.2
- `chipLabel` centralisé dans configs

**Key insight :** Le `router.refresh()` dans `SupplierRequestList` recharge les données serveur. Après `updateRequestStatus`, le `revalidatePath('/requests')` assure que la liste est à jour. Le `revalidatePath('/my-requests')` assure que le magasin voit aussi la mise à jour.

### Scope Boundaries

**IN scope :**
- Server Action `updateRequestStatus` avec validation
- Composant `RequestDetailActions` (boutons Appeler + Marquer comme traitée)
- Indicateur "Traitée le [date]" pour les demandes déjà traitées
- Copie numéro clipboard sur desktop
- Lien tel: sur mobile
- Toast succès/erreur
- Ajout `updatedAt` à la sérialisation

**OUT of scope :**
- Swipe-to-treat sur les cards de la liste (trop complexe pour MVP)
- Annulation d'un traitement (pas dans les FR)
- Notification au magasin lors du traitement (Epic 6)
- Modification de la SupplierRequestCard ou SupplierRequestList (déjà gèrent TREATED)
- Email au magasin lors du traitement (pas dans les FR de cette story)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.3]
- [Source: _bmad-output/planning-artifacts/prd.md#FR25]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Patterns - ActionResult]
- [Source: src/lib/actions/requests.ts - Pattern createRequest existant]
- [Source: src/lib/validations/requests.ts - Pattern validation existant]
- [Source: src/app/(supplier)/requests/[id]/page.tsx - Page détail à modifier]
- [Source: src/lib/utils/requests.ts - Sérialisation à étendre]
- [Source: src/components/custom/request-sheet.tsx - Pattern client component + Server Action]
- [Source: _bmad-output/implementation-artifacts/5-1-liste-des-demandes-recues.md - Previous story]
- [Source: _bmad-output/implementation-artifacts/5-2-filtrage-des-demandes.md - Previous story]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- Clipboard test in JSDOM: `navigator.clipboard` is `undefined` by default, `navigator.maxTouchPoints` is `undefined`. Used `Object.defineProperty(window.navigator, 'clipboard', ...)` and `fireEvent.click` + `waitFor` for async clipboard call.

### Completion Notes List
- ✅ Task 1: `updateRequestStatusSchema` + `updateRequestStatus` Server Action avec 7 tests (validation, auth, not found, already treated, success, prisma args, server error)
- ✅ Task 2: `RequestDetailActions` client component avec 12 tests (PENDING buttons, TREATED indicator, clipboard desktop, server action call, toast success/error, router refresh, phone null)
- ✅ Task 3: Intégration dans page détail `/requests/[id]` + `updatedAt` à `SerializedSupplierRequestDetail` + 2 tests page (props, updatedAt)
- ✅ Task 4: 837 tests pass (0 failures), 2 pre-existing TS errors (unrelated offer-card/offer-list test files)
- Touch detection: Used `navigator.maxTouchPoints > 0` instead of `'ontouchstart' in window` for JSDOM testability (JSDOM always has `ontouchstart in window === true`)

### Change Log
- 2026-02-10: Story 5.3 implemented - updateRequestStatus Server Action, RequestDetailActions component, page integration, 21 new tests added
- 2026-02-10: Code review (AI) — 6 issues found (1 HIGH, 3 MEDIUM, 2 LOW), all fixed:
  - [HIGH] `text-green-600` → `text-success` (design system compliance)
  - [MEDIUM] Added try/catch in `handleTreat` for network error resilience
  - [MEDIUM] Added loading state test (disabled button during isPending)
  - [MEDIUM] Added clipboard error toast test
  - [MEDIUM] Added thrown server action error test (try/catch coverage)
  - [LOW] Confirmed `fireEvent.click` intentional for clipboard tests (userEvent interferes with touch detection)
  - [LOW] Confirmed null guard in `handleCall` is TypeScript type narrowing, not dead code
  - Total tests: 840 (58 files), +3 from review fixes

### File List
- `src/lib/validations/requests.ts` (modified) — Added `updateRequestStatusSchema`
- `src/lib/actions/requests.ts` (modified) — Added `updateRequestStatus` Server Action
- `src/lib/actions/requests.test.ts` (modified) — Added 7 tests for `updateRequestStatus`
- `src/components/custom/request-detail-actions.tsx` (new) — Client component for call/treat actions
- `src/components/custom/request-detail-actions.test.tsx` (new) — 12 tests for component
- `src/lib/utils/requests.ts` (modified) — Added `updatedAt` to `SerializedSupplierRequestDetail`
- `src/lib/utils/requests.test.ts` (modified) — Updated expected output to include `updatedAt`
- `src/app/(supplier)/requests/[id]/page.tsx` (modified) — Integrated `RequestDetailActions`
- `src/app/(supplier)/requests/[id]/page.test.tsx` (modified) — Added 2 tests for actions props
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified) — Status: in-progress → review
