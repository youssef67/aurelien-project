# Story 2.6: Suppression d'Offre

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

En tant que **fournisseur**,
Je veux **supprimer une offre existante**,
Afin de **retirer une promotion que je ne souhaite plus proposer**.

## Acceptance Criteria

### AC1: Bouton Supprimer sur la page de détail
**Given** je suis sur le détail d'une de mes offres `/offers/[id]`
**When** la page se charge
**Then** un bouton "Supprimer" (icône Trash2, variant destructive/ghost) est visible
**And** il est séparé du bouton "Modifier" pour éviter les clics accidentels

### AC2: Boîte de dialogue de confirmation
**Given** je clique sur "Supprimer"
**When** la boîte de dialogue s'affiche
**Then** le message demande "Êtes-vous sûr de vouloir supprimer cette offre ?"
**And** une description précise "Cette action est irréversible. L'offre ne sera plus visible par les magasins."
**And** deux boutons sont visibles: "Annuler" (outline) et "Supprimer" (destructive)

### AC3: Annulation de la suppression
**Given** la confirmation est affichée
**When** je clique sur "Annuler"
**Then** la boîte de dialogue se ferme
**And** aucune action n'est effectuée

### AC4: Server Action deleteOffer avec soft delete
**Given** la confirmation est affichée et je clique sur "Supprimer"
**When** la Server Action `deleteOffer` est appelée
**Then** elle vérifie que l'offre m'appartient (`supplierId === user.id`)
**And** elle vérifie que l'offre n'est pas déjà supprimée (`deletedAt === null`)
**And** l'offre est soft-deletée: `deletedAt` est renseigné à `new Date()`
**And** si une photo existait, elle est supprimée de Supabase Storage
**And** elle retourne `ActionResult<{ offerId: string }>`

### AC5: Succès de la suppression
**Given** la suppression réussit
**When** l'offre est supprimée
**Then** un toast de succès s'affiche "Offre supprimée"
**And** je suis redirigé vers `/dashboard`
**And** l'offre n'apparaît plus dans la liste (filtrée par `deletedAt: null`)

### AC6: Refus si offre ne m'appartient pas
**Given** je tente de supprimer une offre qui ne m'appartient pas
**When** la requête est envoyée
**Then** une erreur FORBIDDEN est retournée

### AC7: Préservation des demandes associées (forward-compatible)
**Given** des demandes existeront sur cette offre (Epic 4)
**When** je supprime l'offre
**Then** l'offre est soft-deletée (pas de suppression physique)
**And** les demandes associées resteront en base (pour historique)
**And** le soft delete via `deletedAt` garantit cette préservation

## Tasks / Subtasks

- [x] **Task 1: Créer la Server Action `deleteOffer`** (AC: 4, 5, 6)
  - [x] 1.1 Dans `/src/lib/actions/offers.ts`, ajouter `deleteOffer`
  - [x] 1.2 Input: `{ id: string }` — validé avec Zod (`z.object({ id: z.string().uuid() })`)
  - [x] 1.3 Auth check (Supabase `getUser()`)
  - [x] 1.4 Vérifier rôle fournisseur (`prisma.supplier.findUnique`)
  - [x] 1.5 Fetch offre et vérifier `supplierId === user.id` ET `deletedAt === null`
  - [x] 1.6 Si ancienne photo existe → supprimer de Storage (même pattern que `updateOffer`)
  - [x] 1.7 `prisma.offer.update({ where: { id }, data: { deletedAt: new Date() } })` — SOFT DELETE
  - [x] 1.8 `revalidatePath('/dashboard')`, `revalidatePath('/offers')`
  - [x] 1.9 Retourner `{ success: true, data: { offerId: id } }`

- [x] **Task 2: Créer le composant `DeleteOfferButton`** (AC: 1, 2, 3, 5)
  - [x] 2.1 Créer `/src/components/custom/delete-offer-button.tsx` (`"use client"`)
  - [x] 2.2 Props: `{ offerId: string }`
  - [x] 2.3 Utiliser le composant `Dialog` existant (`@/components/ui/dialog`) pour la confirmation
  - [x] 2.4 Bouton trigger: icône `Trash2` + texte "Supprimer", variant `ghost`, className destructive (text-destructive)
  - [x] 2.5 Dialog avec `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
  - [x] 2.6 Bouton "Annuler" (`DialogClose` + variant `outline`) et "Supprimer" (variant `destructive`)
  - [x] 2.7 État `isLoading` pendant la suppression (Loader2 spinner sur le bouton)
  - [x] 2.8 onConfirm: appeler `deleteOffer({ id: offerId })`, toast succès, `router.push('/dashboard')`
  - [x] 2.9 Toast erreur si échec, dialog reste ouverte pour réessayer

- [x] **Task 3: Intégrer le bouton dans la page de détail** (AC: 1)
  - [x] 3.1 Modifier `/src/app/(supplier)/offers/[id]/page.tsx`
  - [x] 3.2 Ajouter `<DeleteOfferButton offerId={offer.id} />` dans le contenu de la page (en bas, AVANT le bouton "Retour aux offres")
  - [x] 3.3 Le bouton de suppression est un bouton pleine largeur, variant destructive outline, en bas de page — séparé visuellement du bouton Modifier en haut

- [x] **Task 4: Tests** (AC: 1-7)
  - [x] 4.1 `/src/lib/actions/offers.test.ts` — ajouter tests pour `deleteOffer`
  - [x] 4.2 `/src/components/custom/delete-offer-button.test.tsx` — tests composant
  - [x] 4.3 Tous les tests passent (`npm run test`)
  - [x] 4.4 `npm run build` passe
  - [x] 4.5 `npm run lint` passe

## Dev Notes

### Architecture Compliance

**Patterns OBLIGATOIRES à suivre:**
- Server Components par défaut — page détail est RSC, `DeleteOfferButton` est `"use client"` [Source: project-context.md#Next.js Rules]
- Fichiers en `kebab-case`, composants en `PascalCase` [Source: architecture.md#Naming Patterns]
- Tests co-localisés `*.test.ts(x)` à côté du source [Source: architecture.md#Structure Patterns]
- `ActionResult<T>` obligatoire pour `deleteOffer` [Source: architecture.md#Format Patterns]
- `supplierId` TOUJOURS depuis `user.id`, JAMAIS depuis l'input client [Source: lib/actions/offers.ts pattern]
- Soft delete via `deletedAt` — JAMAIS de `prisma.offer.delete()` [Source: project-context.md#Supabase Rules]

### Server Action deleteOffer — Pattern

```typescript
// Dans /src/lib/actions/offers.ts — AJOUTER

const deleteOfferSchema = z.object({
  id: z.string().uuid('ID offre invalide'),
})

export type DeleteOfferInput = z.infer<typeof deleteOfferSchema>

export async function deleteOffer(
  input: DeleteOfferInput
): Promise<ActionResult<{ offerId: string }>> {
  // 1. Validation Zod
  const validated = deleteOfferSchema.safeParse(input)
  if (!validated.success) { ... VALIDATION_ERROR }

  // 2. Auth check (Supabase getUser)
  // 3. Vérifier rôle fournisseur (prisma.supplier.findUnique)
  // 4. Fetch offre existante
  const existingOffer = await prisma.offer.findUnique({
    where: { id: validated.data.id },
  })
  if (!existingOffer || existingOffer.deletedAt) { ... NOT_FOUND }
  if (existingOffer.supplierId !== user.id) { ... FORBIDDEN }

  // 5. Supprimer la photo du Storage si elle existe
  // MÊME PATTERN que updateOffer (server-side Supabase Storage delete)
  if (existingOffer.photoUrl) {
    try {
      const url = new URL(existingOffer.photoUrl)
      const pathParts = url.pathname.split('/storage/v1/object/public/offer-photos/')
      const filePath = pathParts[1]
      if (filePath) {
        await supabase.storage.from('offer-photos').remove([filePath])
      }
    } catch {
      console.error('Failed to delete offer photo:', existingOffer.photoUrl)
    }
  }

  // 6. SOFT DELETE — ne pas utiliser prisma.offer.delete()
  await prisma.offer.update({
    where: { id: validated.data.id },
    data: { deletedAt: new Date() },
  })

  // 7. Revalidate
  revalidatePath('/dashboard')
  revalidatePath('/offers')

  return { success: true, data: { offerId: validated.data.id } }
}
```

**CRITIQUE:**
- **SOFT DELETE UNIQUEMENT** — `prisma.offer.update({ data: { deletedAt: new Date() } })`, PAS `prisma.offer.delete()`
- La raison: Epic 4 ajoutera les `requests` avec FK vers `offers`. Un hard delete casserait les demandes existantes.
- Toutes les queries existantes filtrent déjà par `deletedAt: null` — l'offre disparaîtra automatiquement de toutes les listes.

### DeleteOfferButton — Structure

```typescript
// src/components/custom/delete-offer-button.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from '@/components/ui/dialog'
import { deleteOffer } from '@/lib/actions/offers'

interface DeleteOfferButtonProps {
  offerId: string
}

export function DeleteOfferButton({ offerId }: DeleteOfferButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setIsLoading(true)
    try {
      const result = await deleteOffer({ id: offerId })
      if (result.success) {
        setOpen(false)
        toast.success('Offre supprimée')
        router.push('/dashboard')
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-11 text-destructive border-destructive/30 hover:bg-destructive/10">
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer cette offre
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer cette offre ?</DialogTitle>
          <DialogDescription>
            Cette action est irréversible. L'offre ne sera plus visible par les magasins.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>Annuler</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**Points clés:**
- Utilise `Dialog` de shadcn/ui (PAS AlertDialog qui n'est pas installé)
- État `open` contrôlé pour pouvoir fermer programmatiquement après succès
- `isLoading` pour disable les boutons pendant l'appel
- Le dialog ne se ferme PAS en cas d'erreur (l'utilisateur peut réessayer)
- Le bouton trigger est style destructive outline, pleine largeur, séparé du bouton Modifier

### Intégration dans la page de détail

```typescript
// Dans /src/app/(supplier)/offers/[id]/page.tsx — MODIFIER
// Ajouter AVANT le bouton "Retour aux offres"

import { DeleteOfferButton } from '@/components/custom/delete-offer-button'

// ... dans le JSX, avant le Link "Retour aux offres":
<DeleteOfferButton offerId={offer.id} />
```

**Placement:** Le bouton de suppression est en bas de page, juste avant "Retour aux offres". Il est visuellement séparé du bouton "Modifier" (qui est en haut dans le PageHeader). Cela minimise les clics accidentels.

### Project Structure Notes

**Fichiers à créer:**
- `/src/components/custom/delete-offer-button.tsx` — Bouton suppression avec dialog confirmation
- `/src/components/custom/delete-offer-button.test.tsx` — Tests composant

**Fichiers à modifier:**
- `/src/lib/actions/offers.ts` — Ajouter `deleteOffer` + `deleteOfferSchema` + `DeleteOfferInput`
- `/src/lib/actions/offers.test.ts` — Ajouter tests deleteOffer
- `/src/app/(supplier)/offers/[id]/page.tsx` — Ajouter `<DeleteOfferButton>`

**Fichiers existants à réutiliser (NE PAS recréer):**
- `/src/components/ui/dialog.tsx` → Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose
- `/src/components/ui/button.tsx` → Button (variants: outline, destructive)
- `/src/components/layout/page-header.tsx` → PageHeader (inchangé)
- `/src/lib/supabase/server.ts` → `createClient()` (server)
- `/src/lib/prisma/client.ts` → `prisma`
- `/src/types/api.ts` → `ActionResult`, `ErrorCode`
- `/src/lib/utils/offers.ts` → inchangé

**NE PAS installer de nouvelle dépendance.** Tout est déjà disponible.

### Previous Story Intelligence

**Story 2.5 — Learnings critiques:**
- Page détail `/offers/[id]/page.tsx` existe déjà — NE PAS recréer, seulement ajouter l'import et le composant DeleteOfferButton
- `PageHeader.actions` accepte `React.ReactNode` — le bouton Modifier y est déjà, NE PAS ajouter le delete dans le header (trop facile de cliquer par accident)
- Le pattern de suppression photo côté serveur est déjà dans `updateOffer` (lignes 163-176 de offers.ts) — RÉUTILISER le même pattern
- `params` est une `Promise` dans Next.js 15 → `const { id } = await params`
- `SerializedOffer` pas nécessaire ici (pas de passage RSC → client de données offre complètes)
- Tests avec `vitest` + `@testing-library/react`
- Mock `next/navigation` (`useRouter`, `redirect`), `next/cache` (`revalidatePath`), Supabase et Prisma

**Story 2.4 — Learnings critiques:**
- Toutes les queries Prisma sur les offres filtrent DÉJÀ par `deletedAt: null` → le soft delete fonctionnera automatiquement
- La page dashboard (`/dashboard/page.tsx`) filtre par `deletedAt: null`
- Pas besoin de modifier les queries existantes

**Story 2.2 — Code review issues (à ne pas reproduire):**
- Prisma utilise DATABASE_URL = service role → RLS contournée, le contrôle d'accès applicatif (`supplierId === user.id`) EST la vraie barrière
- Toujours filtrer par `supplierId: user.id` dans les vérifications

### Library & Framework Requirements

**Dépendances déjà installées (NE PAS réinstaller):**
- `next@16.1.6` — Framework
- `react@19.2.3` — UI
- `@prisma/client@^6.19.2` — ORM
- `zod` — Validation
- `lucide-react@^0.563.0` — Icônes (Trash2, Loader2)
- `sonner@^2.0.7` — Toast
- `radix-ui` — Dialog primitives (via shadcn/ui)

**Composants shadcn/ui disponibles:** Dialog (et sous-composants), Button, Badge, Card

**AUCUNE nouvelle dépendance requise.**

### Testing Requirements

**Tests deleteOffer action (`offers.test.ts` — ajouter):**
- Succès: soft-delete l'offre (vérifie `deletedAt` non null) et retourne offerId
- Succès avec photo: vérifie suppression Storage + soft delete
- Succès sans photo: vérifie soft delete sans appel Storage
- Échec validation: retourne VALIDATION_ERROR si id invalide
- Échec auth: retourne UNAUTHORIZED si pas connecté
- Échec rôle: retourne FORBIDDEN si pas fournisseur
- Échec propriété: retourne FORBIDDEN si offre ne m'appartient pas
- Échec offre inexistante: retourne NOT_FOUND
- Échec offre déjà supprimée: retourne NOT_FOUND si `deletedAt` non null
- Vérifie que `revalidatePath` est appelé pour `/dashboard` et `/offers`
- Vérifie que `prisma.offer.update` est appelé (PAS `prisma.offer.delete`)

**Tests DeleteOfferButton (`delete-offer-button.test.tsx`):**
- Affiche le bouton "Supprimer cette offre"
- Clic ouvre le dialog de confirmation
- Dialog contient titre, description, boutons Annuler et Supprimer
- Clic "Annuler" ferme le dialog sans appeler deleteOffer
- Clic "Supprimer" appelle deleteOffer avec le bon offerId
- Succès: toast "Offre supprimée" + router.push('/dashboard')
- Échec: toast erreur, dialog reste ouverte
- Boutons disabled pendant le chargement

**Pattern de test identique aux stories précédentes:**
- `@testing-library/react` + `vitest`
- Mock `next/navigation` (`useRouter`)
- Mock Server Action `deleteOffer`
- Mock `sonner` (`toast`)

### Security Considerations

- **Isolation FR32:** L'offre est TOUJOURS vérifiée `supplierId === user.id` dans la Server Action
- **Double source de vérité:** Page RSC vérifie `supplierId: user.id` (pour ne pas afficher le bouton) + Server Action re-vérifie (defense in depth)
- **Soft delete:** `deletedAt` préserve l'intégrité référentielle pour les futures FK (requests Epic 4)
- **Photo cleanup:** Best-effort — une erreur de suppression Storage NE bloque PAS le soft delete
- **Pas d'input supplierId:** La Server Action ne prend JAMAIS le supplierId depuis le client

### UX Considerations

- **Séparation Modifier / Supprimer:** Modifier est dans le header (action courante), Supprimer est en bas de page (action destructive rare) — réduit les erreurs
- **Confirmation obligatoire:** Dialog avec description claire de l'irréversibilité
- **Feedback:** Toast succès "Offre supprimée" + redirection vers dashboard
- **Loading state:** Spinner sur le bouton pendant l'appel, boutons disabled
- **Réessai:** En cas d'erreur, le dialog reste ouvert pour réessayer
- **Touch target:** Bouton h-11 (44px) pour mobile

### Prisma Schema — Rappel (AUCUNE modification nécessaire)

Le modèle `Offer` a déjà `deletedAt DateTime? @map("deleted_at")`. Le soft delete fonctionne sans migration. Toutes les queries existantes filtrent déjà par `deletedAt: null`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.6: Suppression d'Offre]
- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md#FR9 - Suppression offre]
- [Source: _bmad-output/planning-artifacts/prd.md#FR32 - Isolation données fournisseur]
- [Source: _bmad-output/project-context.md#Supabase Rules - Soft Delete]
- [Source: _bmad-output/project-context.md#API Response Pattern]
- [Source: _bmad-output/implementation-artifacts/2-5-modification-offre.md#Server Action updateOffer - photo delete pattern]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

Aucun problème majeur. Un test composant a nécessité un ajustement (le trigger button n'est plus visible quand le dialog est ouvert dans jsdom).

### Completion Notes List

- Task 1: Server Action `deleteOffer` implémentée dans `offers.ts` avec soft delete (`deletedAt`), vérification auth/ownership, suppression photo Storage best-effort, revalidation paths. Schema `deleteOfferSchema` ajouté dans `validations/offers.ts` pour cohérence avec le pattern existant.
- Task 2: Composant `DeleteOfferButton` créé en `"use client"` avec Dialog de confirmation, états loading, toast succès/erreur, redirection dashboard.
- Task 3: Bouton intégré dans `/offers/[id]/page.tsx` avant le lien "Retour aux offres", séparé visuellement du bouton Modifier (header vs bas de page).
- Task 4: 11 tests action `deleteOffer` (validation, auth, authorization, not found, soft-deleted, success, photo delete, photo cleanup failure, revalidation, server error) + 4 tests validation schema `deleteOfferSchema` + 9 tests composant `DeleteOfferButton` (render, dialog open, buttons, cancel, confirm, success toast+redirect, error toast, exception, loading state). Total suite: 451 tests verts. Build OK. Lint OK.

### File List

**Fichiers créés:**
- `src/components/custom/delete-offer-button.tsx`
- `src/components/custom/delete-offer-button.test.tsx`

**Fichiers modifiés:**
- `src/lib/validations/offers.ts` (ajout `deleteOfferSchema` + `DeleteOfferInput`)
- `src/lib/validations/offers.test.ts` (ajout tests `deleteOfferSchema`)
- `src/lib/actions/offers.ts` (ajout `deleteOffer` action)
- `src/lib/actions/offers.test.ts` (ajout tests `deleteOffer`)
- `src/app/(supplier)/offers/[id]/page.tsx` (ajout import + `<DeleteOfferButton>`)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (status: in-progress → review)
- `_bmad-output/implementation-artifacts/2-6-suppression-offre.md` (tasks marked, dev record)
