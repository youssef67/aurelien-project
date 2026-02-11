# Story 4.2: Envoi Intention de Commande

Status: done

## Story

En tant que **chef de rayon (magasin)**,
Je veux **exprimer mon intention de passer commande sur une offre**,
Afin que **le fournisseur me contacte pour finaliser**.

## Acceptance Criteria

### AC1: Ouverture du Sheet "Souhaite commander"
**Given** je suis sur le détail d'une offre active (non expirée)
**When** je clique sur "Souhaite commander"
**Then** un Sheet (bottom panel) s'ouvre
**And** le type ORDER est pré-sélectionné (non visible pour l'utilisateur)
**And** un champ textarea permet d'ajouter un message optionnel (FR20)
**And** un placeholder suggère : "Précisez quantité ou conditions (optionnel)"

### AC2: Envoi de la demande ORDER
**Given** le Sheet est ouvert
**When** je clique sur "Envoyer"
**Then** la Server Action `createRequest` existante est appelée avec type=ORDER
**And** elle crée une demande avec type=ORDER et status=PENDING
**And** elle retourne `ActionResult<{ requestId: string }>`

### AC3: Succès de l'envoi
**Given** l'envoi réussit
**When** la demande est créée
**Then** le Sheet se ferme
**And** un toast de succès s'affiche "Intention de commande envoyée !"
**And** sur la page détail, le bouton "Souhaite commander" est remplacé par "Commande envoyée" (désactivé)

### AC4: Déjà envoyé une intention ORDER
**Given** j'ai déjà envoyé une intention ORDER sur cette offre
**When** je retourne sur le détail de l'offre
**Then** le bouton "Souhaite commander" est remplacé par "Commande envoyée" (désactivé)
**And** le bouton "Demande de renseignements" reste disponible si non utilisé

### AC5: Envoi rapide sans message
**Given** je veux commander rapidement
**When** je suis familier avec le fournisseur
**Then** je peux envoyer sans message (le champ est optionnel)
**And** l'envoi prend moins de 3 secondes (2 taps : bouton + confirmer)

### AC6: Offre expirée — CTA désactivés
**Given** l'offre est expirée
**When** j'accède au détail
**Then** les deux boutons CTA sont désactivés (comportement existant de Story 4.1)
**And** le Sheet ne peut pas s'ouvrir

### AC7: Erreur à l'envoi
**Given** une erreur survient
**When** l'envoi échoue
**Then** un toast d'erreur s'affiche
**And** le Sheet reste ouvert avec mon message préservé
**And** je peux réessayer

## Tasks / Subtasks

- [x] **Task 1: Mettre à jour le RequestSheet — placeholder dynamique** (AC: 1)
  - [x] 1.1 Ajouter un dictionnaire `PLACEHOLDERS` par type dans `request-sheet.tsx`
  - [x] 1.2 INFO → "Précisez votre question (optionnel)"
  - [x] 1.3 ORDER → "Précisez quantité ou conditions (optionnel)"
  - [x] 1.4 Utiliser `PLACEHOLDERS[type]` dans le `<Textarea placeholder=...>`

- [x] **Task 2: Mettre à jour le RequestSheet — toast dynamique** (AC: 3)
  - [x] 2.1 Ajouter un dictionnaire `SUCCESS_MESSAGES` par type
  - [x] 2.2 INFO → `` `Demande envoyée à ${supplierName}` ``
  - [x] 2.3 ORDER → `"Intention de commande envoyée !"`
  - [x] 2.4 Utiliser `SUCCESS_MESSAGES[type]` (ou une fonction) dans le toast de succès

- [x] **Task 3: Mettre à jour la page détail offre — bouton ORDER** (AC: 1, 3, 4, 6)
  - [x] 3.1 Modifier `src/app/(store)/offers/[id]/page.tsx`
  - [x] 3.2 Ajouter `hasOrderRequest = existingTypes.includes('ORDER')` (analogue à `hasInfoRequest`)
  - [x] 3.3 Remplacer le `<Button>Souhaite commander</Button>` statique par :
    - Si `hasOrderRequest` : `<Button disabled>Commande envoyée</Button>`
    - Sinon : `<RequestSheet offerId=... supplierName=... type="ORDER" trigger={<Button>Souhaite commander</Button>} disabled={isExpired} />`
  - [x] 3.4 Conserver le `rounded-[0_0.5rem_0.5rem_0.5rem]` sur le bouton trigger ORDER
  - [x] 3.5 Conserver `disabled={isExpired}` sur le trigger et le RequestSheet

- [x] **Task 4: Tests — RequestSheet** (AC: 1, 2, 3)
  - [x] 4.1 Ajouter un test : placeholder "Précisez quantité ou conditions (optionnel)" pour type ORDER
  - [x] 4.2 Ajouter un test : submit avec type ORDER appelle `createRequest` avec `type: 'ORDER'`
  - [x] 4.3 Ajouter un test : toast succès ORDER affiche "Intention de commande envoyée !"

- [x] **Task 5: Tests — Page détail offre** (AC: 3, 4, 6)
  - [x] 5.1 Mettre à jour le mock `RequestSheet` pour capturer le `type` prop (ajouter `data-type={type}`)
  - [x] 5.2 Ajouter un test : affiche "Commande envoyée" quand `existingTypes` inclut `'ORDER'`
  - [x] 5.3 Ajouter un test : affiche le RequestSheet ORDER quand `existingTypes` ne contient pas `'ORDER'`
  - [x] 5.4 Ajouter un test : les deux boutons sont "Demande envoyée" et "Commande envoyée" quand `existingTypes = ['INFO', 'ORDER']`
  - [x] 5.5 Vérifier que les tests existants Story 4.1 passent toujours (0 régression)

- [x] **Task 6: Validation finale** (AC: 1-7)
  - [x] 6.1 `npm run test` — tous les tests passent (0 régression)
  - [x] 6.2 `npm run build` — build OK
  - [x] 6.3 `npm run lint` — 0 erreur, 0 warning

## Dev Notes

### Architecture Compliance

**La quasi-totalité de l'infrastructure existe déjà (Story 4.1) :**
- `RequestSheet` supporte déjà `type: 'ORDER'` (titre "Intention de commande" fonctionne)
- `createRequest` Server Action gère déjà `type: 'ORDER'`
- `getExistingRequestTypes` retourne déjà les types INFO et ORDER
- Le schéma Prisma a déjà les enums `RequestType.ORDER` et `RequestStatus.PENDING`
- Les RLS policies sont en place
- La contrainte unique `@@unique([storeId, offerId, type])` empêche les doublons

**Patterns OBLIGATOIRES (rappel) :**
- Server Action avec `ActionResult<T>` [Source: types/api.ts]
- `"use client"` uniquement sur les composants client [Source: project-context.md]
- Toast border-radius : `0 0.75rem 0.75rem 0.75rem` [Source: visual-design-guide]
- Bouton CTA primary avec asymmetric border-radius `0 8px 8px 8px` [Source: visual-design-guide]
- Headings : `font-display` (Plus Jakarta Sans) [Source: visual-design-guide]

**NE PAS faire :**
- NE PAS modifier `createRequest` Server Action — elle gère déjà ORDER
- NE PAS modifier le schéma Prisma — il est complet
- NE PAS modifier les RLS policies — elles sont en place
- NE PAS modifier `getExistingRequestTypes` — elle retourne déjà tous les types
- NE PAS créer la page `/my-requests` (historique) — c'est Story 4.3
- NE PAS modifier le `BottomNavigation` — sera mis à jour dans Story 4.3
- NE PAS installer de nouvelle dépendance

### Changements requis — Diff minimal

**Fichier 1 : `src/components/custom/request-sheet.tsx`**

Ajouter un dictionnaire de placeholders par type :

```typescript
const PLACEHOLDERS: Record<RequestSheetProps['type'], string> = {
  INFO: 'Précisez votre question (optionnel)',
  ORDER: 'Précisez quantité ou conditions (optionnel)',
}
```

Modifier le toast de succès :

```typescript
// Avant (Story 4.1) :
toast.success(`Demande envoyée à ${supplierName}`)

// Après :
const successMessage = type === 'ORDER'
  ? 'Intention de commande envoyée !'
  : `Demande envoyée à ${supplierName}`
toast.success(successMessage)
```

Modifier le `<Textarea>` placeholder :

```typescript
// Avant :
<Textarea placeholder="Précisez votre question (optionnel)" .../>

// Après :
<Textarea placeholder={PLACEHOLDERS[type]} .../>
```

**Fichier 2 : `src/app/(store)/offers/[id]/page.tsx`**

Ajouter `hasOrderRequest` (1 ligne) :

```typescript
const hasOrderRequest = existingTypes.includes('ORDER')
```

Remplacer le bouton "Souhaite commander" statique :

```tsx
{/* Avant (Story 4.1) : */}
<Button className="flex-1 h-11 rounded-[0_0.5rem_0.5rem_0.5rem]" disabled={isExpired}>
  Souhaite commander
</Button>

{/* Après : */}
{hasOrderRequest ? (
  <Button className="flex-1 h-11 rounded-[0_0.5rem_0.5rem_0.5rem]" disabled>
    Commande envoyée
  </Button>
) : (
  <RequestSheet
    offerId={offer.id}
    supplierName={offer.supplier.companyName}
    type="ORDER"
    trigger={
      <Button className="flex-1 h-11 rounded-[0_0.5rem_0.5rem_0.5rem]" disabled={isExpired}>
        Souhaite commander
      </Button>
    }
    disabled={isExpired}
  />
)}
```

### Tests — Stratégie

**RequestSheet tests (`request-sheet.test.tsx`)** — ajouter :
- Test placeholder ORDER : ouvrir le sheet avec `type="ORDER"`, vérifier `getByPlaceholderText("Précisez quantité ou conditions (optionnel)")`
- Test submit ORDER : vérifier `mockCreateRequest` appelé avec `{ offerId, type: 'ORDER', message }`
- Test toast ORDER : vérifier `toast.success("Intention de commande envoyée !")`

**Page detail tests (`page.test.tsx`)** — ajouter :
- Mettre à jour le mock `RequestSheet` pour inclure `data-type` : `<div data-testid="request-sheet" data-disabled={disabled} data-type={type}>`
- Test `existingTypes = ['ORDER']` → affiche "Commande envoyée" disabled
- Test `existingTypes = []` → affiche "Souhaite commander" dans un `request-sheet`
- Test `existingTypes = ['INFO', 'ORDER']` → affiche "Demande envoyée" ET "Commande envoyée" (les deux disabled)
- Attention : les tests existants qui cherchent `screen.getByText('Souhaite commander')` doivent toujours passer (le texte est toujours dans le trigger du RequestSheet)

### Project Structure Notes

**Fichiers à modifier :**
- `src/components/custom/request-sheet.tsx` — placeholder dynamique + toast dynamique
- `src/components/custom/request-sheet.test.tsx` — 3 nouveaux tests ORDER
- `src/app/(store)/offers/[id]/page.tsx` — `hasOrderRequest` + RequestSheet ORDER
- `src/app/(store)/offers/[id]/page.test.tsx` — mock mis à jour + 3-4 nouveaux tests

**NE PAS modifier :**
- `src/lib/actions/requests.ts` — déjà complet
- `src/lib/validations/requests.ts` — déjà complet
- `src/lib/queries/requests.ts` — déjà complet
- `prisma/schema.prisma` — déjà complet
- `src/components/custom/bottom-navigation.tsx` — Story 4.3

### Previous Story Intelligence

**Story 4.1 (Schema Demandes & Envoi Demande Renseignements) — Patterns établis :**
- `RequestSheet` utilise `useTransition` + `useState` pour l'état + `Sheet` side="bottom"
- `createRequest` suit le pattern `createOffer` : validation Zod → auth → rôle → offre active → doublon → create → revalidate
- `getExistingRequestTypes` retourne `RequestType[]` (typage strict, pas `string[]`)
- Page détail = Server Component, seul `RequestSheet` est "use client"
- Tests mockent `@/lib/queries/requests`, `@/lib/supabase/server`, `@/components/custom/request-sheet`
- Code review a identifié : race condition → ajouté `@@unique([storeId, offerId, type])` + P2002 handling
- 627 tests passaient après Story 4.1 — NE PAS les casser

**Pattern du mock RequestSheet dans les tests :**
```tsx
vi.mock('@/components/custom/request-sheet', () => ({
  RequestSheet: ({ trigger, disabled }: { trigger: React.ReactNode; disabled?: boolean; offerId: string; supplierName: string; type: string }) => (
    <div data-testid="request-sheet" data-disabled={disabled}>
      {trigger}
    </div>
  ),
}))
```
→ Story 4.2 doit ajouter `data-type={type}` au mock pour distinguer INFO vs ORDER dans les assertions.

### Git Intelligence

**Commits récents :**
- Convention : `feat: Description en français (Story X.X)`
- Commit suggéré : `feat: Envoi intention de commande avec RequestSheet ORDER (Story 4.2)`

### Scope

Cette story est **petite** — 2 fichiers de code à modifier + 2 fichiers de tests. L'infrastructure créée dans Story 4.1 (Server Action, RequestSheet, query, Prisma) est réutilisée telle quelle. Le travail principal est le wiring du bouton ORDER dans la page détail et la personnalisation des messages.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.2: Envoi Intention de Commande]
- [Source: _bmad-output/planning-artifacts/epics.md#FR19: Intention de commande]
- [Source: _bmad-output/planning-artifacts/epics.md#FR20: Message personnalisé]
- [Source: _bmad-output/implementation-artifacts/4-1-schema-demandes-et-envoi-demande-renseignements.md — Story précédente]
- [Source: src/components/custom/request-sheet.tsx — Composant à modifier]
- [Source: src/app/(store)/offers/[id]/page.tsx — Page détail à modifier]
- [Source: src/lib/actions/requests.ts — Server Action existante (NE PAS modifier)]
- [Source: src/lib/queries/requests.ts — Query existante (NE PAS modifier)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

Aucun problème rencontré.

### Completion Notes List

- Task 1 : Ajouté dictionnaire `PLACEHOLDERS` par type (INFO/ORDER) dans `request-sheet.tsx`, Textarea utilise `PLACEHOLDERS[type]`
- Task 2 : Toast dynamique — ORDER affiche "Intention de commande envoyée !", INFO conserve "Demande envoyée à {supplierName}"
- Task 3 : Ajouté `hasOrderRequest` dans page détail, bouton ORDER conditionnel avec `RequestSheet` ou "Commande envoyée" disabled
- Task 4 : 3 nouveaux tests RequestSheet ORDER (placeholder, submit type, toast succès)
- Task 5 : Mock `RequestSheet` mis à jour avec `data-type`, 3 nouveaux tests page détail ORDER, tests Story 4.1 adaptés pour compatibilité 2 RequestSheets
- Task 6 : 633 tests passent (0 régression), build OK, lint 0 erreur

### Change Log

- 2026-02-10 : Story 4.2 implémentée — Envoi intention de commande avec placeholder dynamique, toast dynamique et bouton ORDER conditionnel

### File List

- `src/components/custom/request-sheet.tsx` — modifié (PLACEHOLDERS + toast dynamique)
- `src/components/custom/request-sheet.test.tsx` — modifié (+3 tests ORDER)
- `src/app/(store)/offers/[id]/page.tsx` — modifié (hasOrderRequest + RequestSheet ORDER)
- `src/app/(store)/offers/[id]/page.test.tsx` — modifié (mock data-type + 3 tests ORDER + 3 tests Story 4.1 adaptés)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — modifié (4-2 → in-progress → review → done)

### Senior Developer Review (AI)

**Reviewer:** Youssef — 2026-02-10
**Issues Found:** 0 HIGH, 4 MEDIUM, 2 LOW
**Issues Fixed:** 4 (4 MEDIUM)
**Action Items:** 2 LOW (non-bloquants, laissés en l'état)

**Fixes appliqués :**
1. **[MEDIUM] Test gap AC5 — envoi sans message** — Ajout 2 tests : submit vide (`message: undefined`) + whitespace-only trimé à `undefined`
2. **[MEDIUM] Test gap AC7 — Sheet ouvert après erreur** — Test enrichi : vérifie Sheet visible + message préservé dans textarea après erreur
3. **[MEDIUM] Test gap AC4 — indépendance INFO/ORDER** — Tests enrichis : `existingTypes=['ORDER']` vérifie INFO disponible et inversement
4. **[MEDIUM] Whitespace-only message** — Ajout `.trim()` dans `request-sheet.tsx:52` avant envoi (`message.trim() || undefined`)

**Issues LOW non corrigés (non-bloquants) :**
- Pattern incohérent pour le message de succès (ternaire vs dict) — cosmétique
- SheetDescription identique pour INFO/ORDER — cosmétique
