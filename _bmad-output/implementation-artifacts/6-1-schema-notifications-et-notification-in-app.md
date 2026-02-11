# Story 6.1: Schéma Notifications & Notification In-App

Status: done

## Story

As a fournisseur,
I want recevoir une notification in-app quand un magasin envoie une demande,
so that je suis réactif et ne manque pas d'opportunités.

## Acceptance Criteria

1. **AC1 — Modèle Prisma Notification**
   - Given le schéma Prisma existe
   - When j'ajoute le modèle Notification
   - Then la table `notifications` est créée avec les champs :
     - `id` (UUID PK), `user_id` (UUID), `user_type` (enum SUPPLIER | STORE)
     - `type` (enum NEW_REQUEST, REQUEST_TREATED, etc.)
     - `title` (String), `body` (Text)
     - `related_id` (UUID optionnel — ID de la demande/offre concernée)
     - `read` (Boolean default false), `created_at` (DateTime)
   - And un index existe sur `(user_id, user_type, read)`

2. **AC2 — Policies RLS**
   - Given la table notifications existe
   - When je crée les policies RLS
   - Then un utilisateur ne peut voir que ses propres notifications
   - And un utilisateur peut marquer ses propres notifications comme lues

3. **AC3 — Création automatique de notification**
   - Given un magasin envoie une demande (INFO ou ORDER)
   - When la Server Action `createRequest` réussit
   - Then une notification est créée pour le fournisseur concerné
   - And le titre est "Nouvelle demande" ou "Intention de commande" selon le type
   - And le body contient "[Nom magasin] - [Nom offre]"
   - And `related_id` pointe vers la demande créée

4. **AC4 — Supabase Realtime**
   - Given une notification est créée en base
   - When le fournisseur est connecté à l'application
   - Then Supabase Realtime pousse la notification en temps réel
   - And le composant NotificationBadge se met à jour instantanément

5. **AC5 — Toast + Badge bottom nav**
   - Given je suis fournisseur connecté
   - When une nouvelle demande arrive
   - Then un toast apparaît brièvement avec le titre de la notification
   - And le badge sur l'icône "Demandes" dans la bottom nav s'incrémente

6. **AC6 — Stockage hors ligne**
   - Given le fournisseur n'est pas connecté
   - When une demande arrive
   - Then la notification est stockée en base
   - And elle sera visible à la prochaine connexion

7. **AC7 — Query & Serialization**
   - Given un fournisseur est connecté
   - When la page se charge
   - Then `getUnreadNotificationCount(userId)` retourne le nombre de non-lues
   - And ce compteur est passé au `SupplierBottomNavigation` pour le badge

## Tasks / Subtasks

- [x] **Task 1 — Modèle Prisma & Migration** (AC: #1)
  - [x] 1.1 Ajouter enum `NotificationType` (NEW_REQUEST, REQUEST_TREATED) dans `schema.prisma`
  - [x] 1.2 Ajouter enum `UserType` (SUPPLIER, STORE) dans `schema.prisma`
  - [x] 1.3 Ajouter modèle `Notification` avec tous les champs
  - [x] 1.4 Ajouter index `@@index([userId, userType, read])` sur Notification
  - [x] 1.5 Créer migration `prisma migrate dev --name add_notifications_table`

- [x] **Task 2 — Policies RLS** (AC: #2)
  - [x] 2.1 Créer migration SQL pour policy SELECT : `user_id = auth.uid()`
  - [x] 2.2 Créer policy UPDATE (read uniquement) : `user_id = auth.uid()`
  - [x] 2.3 Créer policy INSERT pour service role uniquement (les notifications sont créées côté serveur)

- [x] **Task 3 — Server Actions & Notification Creation** (AC: #3)
  - [x] 3.1 Créer `src/lib/actions/notifications.ts` avec `createNotification()` (interne, pas exportée publiquement)
  - [x] 3.2 Créer `src/lib/validations/notifications.ts` avec schémas Zod
  - [x] 3.3 Modifier `createRequest()` dans `src/lib/actions/requests.ts` pour appeler `createNotification()` après succès
  - [x] 3.4 Ajouter query Prisma pour récupérer le nom du magasin et de l'offre pour le body de la notification

- [x] **Task 4 — Queries & Serialization** (AC: #7)
  - [x] 4.1 Créer `src/lib/queries/notifications.ts` avec `getUnreadNotificationCount(userId)`
  - [x] 4.2 Créer `serializeNotification()` dans `src/lib/utils/notifications.ts`
  - [x] 4.3 Définir types `SerializedNotification`, `NOTIFICATION_TYPE_CONFIG`

- [x] **Task 5 — Supabase Realtime** (AC: #4)
  - [x] 5.1 Créer `src/lib/supabase/realtime.ts` avec helper pour subscription aux notifications
  - [x] 5.2 Créer `src/lib/hooks/use-notifications.ts` — hook custom avec `useEffect` + Supabase Realtime subscribe
  - [x] 5.3 Le hook gère reconnexion automatique et cleanup au unmount

- [x] **Task 6 — UI Components** (AC: #5)
  - [x] 6.1 Créer `src/components/custom/notification-badge.tsx` — cercle rouge avec compteur (1-99, puis "99+")
  - [x] 6.2 Modifier `SupplierBottomNavigation` pour accepter prop `unreadCount` et afficher `NotificationBadge` sur "Demandes"
  - [x] 6.3 Modifier le layout `(supplier)` pour fetch `getUnreadNotificationCount` et passer au nav
  - [x] 6.4 Intégrer `useNotifications` hook dans le layout client pour écouter les nouvelles notifications Realtime
  - [x] 6.5 Afficher toast via `sonner` quand une nouvelle notification arrive en temps réel

- [x] **Task 7 — Tests** (AC: tous)
  - [x] 7.1 Tests `createNotification` Server Action (10 tests)
  - [x] 7.2 Tests intégration dans `createRequest` (notification créée après succès, pas créée si erreur) — 3 tests
  - [x] 7.3 Tests `getUnreadNotificationCount` query — 3 tests
  - [x] 7.4 Tests `serializeNotification` et `NOTIFICATION_TYPE_CONFIG` — 8 tests
  - [x] 7.5 Tests `NotificationBadge` composant (variants dot/count, "99+", accessibility) — 12 tests
  - [x] 7.6 Tests `SupplierBottomNavigation` avec badge (unreadCount > 0, = 0) — 6 tests
  - [x] 7.7 Tests `useNotifications` hook (mock Supabase channel) — 10 tests

## Dev Notes

### Architecture & Patterns Obligatoires

- **Server Actions** : Pattern identique à `createRequest()` / `updateRequestStatus()` — validation Zod → auth check → Prisma → revalidatePath
- **Queries** : Wrapper `cache()` de React, export types avec `Awaited<ReturnType<...>>`
- **Serialization** : `Date → toISOString()`, `Decimal → Number()`, pattern `serializeNotification()`
- **ActionResult<T>** : Toujours retourner `{ success: true, data }` ou `{ success: false, error, code }`
- **Toasts** : `useToast()` de shadcn, border-radius `0 0.75rem 0.75rem 0.75rem` (déjà configuré globalement)

### Prisma Schema — Modèle Exact

```prisma
enum NotificationType {
  NEW_REQUEST
  REQUEST_TREATED
}

enum UserType {
  SUPPLIER
  STORE
}

model Notification {
  id        String           @id @default(uuid()) @db.Uuid
  userId    String           @map("user_id") @db.Uuid
  userType  UserType         @map("user_type")
  type      NotificationType
  title     String
  body      String           @db.Text
  relatedId String?          @map("related_id") @db.Uuid
  read      Boolean          @default(false)
  createdAt DateTime         @default(now()) @map("created_at")

  @@index([userId, userType, read])
  @@map("notifications")
}
```

**Convention** : `@map("snake_case")` pour les colonnes, `@@map("table_name")` pour la table — identique aux modèles existants (Request, Offer, etc.).

### RLS Policies SQL

```sql
-- SELECT: Un utilisateur ne voit que ses propres notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- UPDATE: Un utilisateur peut marquer ses notifications comme lues (colonne read uniquement)
CREATE POLICY "Users can mark own notifications as read"
ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- INSERT: Seul le service role peut créer des notifications
CREATE POLICY "Service role can insert notifications"
ON notifications FOR INSERT
WITH CHECK (auth.role() = 'service_role');
```

**ATTENTION** : La policy INSERT avec `service_role` signifie que l'insertion DOIT passer par `createAdminClient()` (de `src/lib/supabase/server.ts`) et non par le Prisma client standard. **Alternative** : Si Prisma utilise la connection string directe (pas via Supabase API), les RLS ne s'appliquent pas aux requêtes Prisma. Vérifier le setup actuel — si Prisma bypass RLS, la policy INSERT peut être simplifiée.

### Intégration dans createRequest — Code Exact

```typescript
// Dans src/lib/actions/requests.ts, APRÈS le prisma.request.create() réussi :
import { createNotificationForRequest } from './notifications'

// ... après const request = await prisma.request.create(...)
// Créer notification (fire-and-forget, ne PAS bloquer le retour)
createNotificationForRequest({
  supplierId: offer.supplierId,
  requestType: validated.data.type,
  storeName: store.name,     // Déjà disponible dans le scope
  offerName: offer.name,     // Nécessite d'ajouter 'name' au select de l'offre
  requestId: request.id,
}).catch((error) => {
  console.error('Failed to create notification:', error)
  // Ne PAS faire échouer la création de demande si la notif échoue
})
```

**IMPORTANT** : Ajouter `name` au select de l'offre dans `createRequest` (actuellement ne sélectionne que `id, supplierId, status, endDate`).

### Supabase Realtime — Pattern

```typescript
// src/lib/supabase/realtime.ts
import { createClient } from './client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function subscribeToNotifications(
  userId: string,
  onNewNotification: (notification: NotificationPayload) => void
): RealtimeChannel {
  const supabase = createClient()

  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onNewNotification(payload.new as NotificationPayload)
    )
    .subscribe()
}

export function unsubscribeFromNotifications(channel: RealtimeChannel): void {
  channel.unsubscribe()
}
```

**Pré-requis Supabase** : Activer Realtime sur la table `notifications` dans le dashboard Supabase (Database > Replication > activer `notifications`).

### Hook useNotifications

```typescript
// src/lib/hooks/use-notifications.ts
'use client'

import { useEffect, useState, useCallback } from 'react'
import { subscribeToNotifications, unsubscribeFromNotifications } from '@/lib/supabase/realtime'
import { useToast } from '@/hooks/use-toast'

export function useNotifications(userId: string | null, initialCount: number) {
  const [unreadCount, setUnreadCount] = useState(initialCount)
  const { toast } = useToast()

  useEffect(() => {
    if (!userId) return

    const channel = subscribeToNotifications(userId, (notification) => {
      setUnreadCount((prev) => prev + 1)
      toast({
        title: notification.title,
        description: notification.body,
      })
    })

    return () => {
      unsubscribeFromNotifications(channel)
    }
  }, [userId, toast])

  const decrementCount = useCallback((by: number = 1) => {
    setUnreadCount((prev) => Math.max(0, prev - by))
  }, [])

  const resetCount = useCallback(() => setUnreadCount(0), [])

  return { unreadCount, decrementCount, resetCount }
}
```

### NotificationBadge — Composant

```typescript
// src/components/custom/notification-badge.tsx
import { cn } from '@/lib/utils/cn'

interface NotificationBadgeProps {
  count: number
  variant?: 'dot' | 'count'
  className?: string
}

export function NotificationBadge({ count, variant = 'count', className }: NotificationBadgeProps) {
  if (count <= 0) return null

  const displayCount = count > 99 ? '99+' : String(count)

  return (
    <span
      aria-hidden="true"
      className={cn(
        'absolute -top-1 -right-1 flex items-center justify-center bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold leading-none',
        variant === 'dot' ? 'h-2.5 w-2.5' : 'h-4 min-w-4 px-1',
        className
      )}
    >
      {variant === 'count' && displayCount}
    </span>
  )
}
```

**UX** : `aria-hidden="true"` sur le badge, compteur dans `aria-label` du parent (bottom nav item).

### SupplierBottomNavigation — Modification

Le composant `SupplierBottomNavigation` est actuellement dans `src/components/custom/bottom-navigation.tsx` (composant partagé avec config supplier). Modifier pour :
1. Accepter prop `unreadRequestCount?: number`
2. Envelopper l'icône "Demandes" dans un `<span className="relative">` avec `<NotificationBadge />`
3. Ajouter `aria-label` dynamique : `Demandes${count > 0 ? ` (${count} non lues)` : ''}`

### Layout Supplier — Intégration

Le layout `(supplier)` est dans `src/app/(supplier)/layout.tsx`. C'est un Server Component. Pattern :
1. Fetch `getUnreadNotificationCount(user.id)` côté serveur
2. Passer `initialUnreadCount` au composant navigation
3. Le composant client utilise `useNotifications(userId, initialUnreadCount)` pour mise à jour Realtime

**ATTENTION** : Le layout supplier est un Server Component mais `useNotifications` nécessite un Client Component. Solution : créer un wrapper Client Component `<SupplierLayoutClient>` qui reçoit `initialUnreadCount` et `userId`, utilise le hook, et rend le `SupplierBottomNavigation`.

### Project Structure Notes

**Nouveaux fichiers à créer :**
```
prisma/migrations/YYYYMMDD_add_notifications_table/migration.sql
prisma/migrations/YYYYMMDD_add_notifications_rls/migration.sql
src/lib/actions/notifications.ts
src/lib/actions/notifications.test.ts
src/lib/queries/notifications.ts
src/lib/validations/notifications.ts
src/lib/utils/notifications.ts
src/lib/utils/notifications.test.ts
src/lib/supabase/realtime.ts
src/lib/hooks/use-notifications.ts
src/components/custom/notification-badge.tsx
src/components/custom/notification-badge.test.tsx
```

**Fichiers à modifier :**
```
prisma/schema.prisma                                    — Ajout modèle + enums
src/lib/actions/requests.ts                             — Trigger notification dans createRequest
src/lib/actions/requests.test.ts                        — Tests intégration notification
src/components/custom/bottom-navigation.tsx              — Ajout badge sur nav supplier
src/components/custom/bottom-navigation.test.tsx         — Tests badge
src/app/(supplier)/layout.tsx                           — Fetch unread count + wrapper client
```

**NE PAS toucher :**
- `src/components/ui/*` — composants shadcn, ne pas modifier
- `src/app/(store)/*` — pas de notifications côté magasin dans cette story (Story 6.3)

### Design System Compliance

- **Badge** : Cercle rouge `bg-destructive text-destructive-foreground`, pas de `bg-red-*` hardcodé
- **Toast** : Utiliser `useToast()` existant, border-radius asymétrique déjà configuré globalement
- **Font** : Headings en `font-display` (Plus Jakarta Sans)
- **Skeletons** : Si loading state, utiliser `bg-secondary` pas `bg-accent`

### Learnings from Story 5.3

- **Mobile detection** : Utiliser `navigator.maxTouchPoints > 0` (pas `'ontouchstart' in window`)
- **Test mocking** : `vi.mock('@/lib/actions/...')` pour les Server Actions
- **useTransition** : Pattern `startTransition(() => { ... })` pour les mutations côté client
- **revalidatePath** : Toujours revalidate les paths impactés (3+ paths si nécessaire)
- **Error resilience** : Les opérations secondaires (notification) ne doivent JAMAIS bloquer l'opération principale
- **Design tokens** : Utiliser `text-success`, `text-destructive` — pas de couleurs Tailwind directes

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 6, Story 6.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Notification Strategy, Communication Patterns, Data Model]
- [Source: _bmad-output/planning-artifacts/prd.md#FR28, FR30, FR31]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#NotificationBadge, Notification Patterns, BottomNavigation badges]
- [Source: _bmad-output/implementation-artifacts/5-3-traitement-demande.md#Dev Notes]
- [Source: _bmad-output/project-context.md]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- Prisma validate/generate nécessite env vars placeholder (pas de DB locale)
- Le projet utilise `sonner` (pas shadcn `useToast`) pour les toasts
- Les icônes Lucide ont `aria-hidden="true"` — tests badge adaptés en conséquence

### Completion Notes List
- **Task 1**: Ajout enums `NotificationType`, `UserType` et modèle `Notification` dans schema.prisma avec index composite. Migration SQL créée manuellement.
- **Task 2**: Policies RLS — SELECT (propres notifications), UPDATE (mark as read), INSERT (service_role only). Migration SQL séparée.
- **Task 3**: `createNotificationForRequest()` fire-and-forget intégrée dans `createRequest()`. Ajout `name` au select offre. Schéma Zod de validation.
- **Task 4**: Query `getUnreadNotificationCount` avec `cache()` React. Serialization `serializeNotification()` avec types `SerializedNotification` et `NOTIFICATION_TYPE_CONFIG`.
- **Task 5**: Helper Supabase Realtime `subscribeToNotifications` + hook `useNotifications` avec state management, toast sonner, et cleanup.
- **Task 6**: `NotificationBadge` (dot/count, 99+, aria-hidden). `SupplierBottomNavigation` avec prop `unreadRequestCount` et aria-label dynamique. `SupplierNavWrapper` client component pour intégrer le hook Realtime. Layout supplier fetch le count côté serveur.
- **Task 7**: 52 nouveaux tests couvrant toutes les couches (actions, queries, utils, hooks, composants).

### File List

**Nouveaux fichiers :**
- `prisma/migrations/20260211_add_notifications_table/migration.sql`
- `prisma/migrations/20260211_add_notifications_rls/migration.sql`
- `src/lib/actions/notifications.ts`
- `src/lib/actions/notifications.test.ts`
- `src/lib/validations/notifications.ts`
- `src/lib/queries/notifications.ts`
- `src/lib/queries/notifications.test.ts`
- `src/lib/utils/notifications.ts`
- `src/lib/utils/notifications.test.ts`
- `src/lib/supabase/realtime.ts`
- `src/lib/hooks/use-notifications.ts`
- `src/lib/hooks/use-notifications.test.ts`
- `src/components/custom/notification-badge.tsx`
- `src/components/custom/notification-badge.test.tsx`
- `src/components/custom/supplier-nav-wrapper.tsx`

**Fichiers modifiés :**
- `prisma/schema.prisma` — Ajout enums NotificationType, UserType + modèle Notification
- `src/lib/actions/requests.ts` — Import + appel createNotificationForRequest, ajout name au select offre
- `src/lib/actions/requests.test.ts` — Mock notification + 3 tests intégration
- `src/components/custom/supplier-bottom-navigation.tsx` — Props unreadRequestCount, NotificationBadge, aria-label dynamique
- `src/components/custom/supplier-bottom-navigation.test.tsx` — 6 tests badge ajoutés
- `src/app/(supplier)/layout.tsx` — Fetch unreadCount, SupplierNavWrapper client component

### Change Log
- 2026-02-11: Story 6.1 implémentée — Schéma notifications, RLS, notification automatique à la création de demande, Supabase Realtime, badge bottom nav, toast, 52 nouveaux tests (892 total)
- 2026-02-11: **Code Review (AI)** — 6 issues corrigées :
  - CRITICAL: Supprimé `'use server'` de `notifications.ts` (vulnérabilité sécurité — Server Action publique sans auth)
  - HIGH: Ajouté filtre `userType` à `getUnreadNotificationCount` (utilisation correcte de l'index composite)
  - HIGH: Supprimé `decrementCount`/`resetCount` non persistés du hook `useNotifications`
  - MEDIUM: Ajouté `updatedAt` au modèle Notification (convention projet)
  - MEDIUM: Types stricts sur `NotificationPayload` (union types au lieu de string)
  - MEDIUM: Ajouté tests de validation error pour `createNotificationForRequest`
  - 83 tests passent après corrections
