# Story 6.3: Gestion des Notifications

Status: done

## Story

En tant qu'utilisateur (fournisseur ou magasin),
Je veux voir mes notifications non lues et les marquer comme lues,
Afin de gérer mon flux d'informations et ne manquer aucune opportunité.

## Acceptance Criteria

1. **AC1 — Badge compteur bottom nav (FR30)**
   - Badge compteur sur l'icône appropriée dans la bottom nav (supplier ET store)
   - Badge affiche nombre (1-99, puis "99+"), rouge (`bg-destructive`)
   - Supplier : badge déjà en place sur "Demandes" — **aucun changement**
   - Store : ajouter badge sur "Demandes" dans `BottomNavigation` (même pattern que supplier)

2. **AC2 — Page liste des notifications (FR30)**
   - Accessible via une page dédiée `/notifications`
   - Notifications triées par date décroissante (plus récentes en premier)
   - Non lues : fond `bg-secondary` (Lavande) pour distinction visuelle
   - Lues : fond transparent, texte atténué (`text-muted-foreground`)

3. **AC3 — Contenu notification**
   - Chaque notification affiche : icône par type, titre, body, date relative (`formatRelativeDate`)
   - Indicateur visuel point bleu (`bg-primary`) sur les non lues
   - Utiliser `NOTIFICATION_TYPE_CONFIG` existant pour icône et label

4. **AC4 — Marquage comme lue au clic (FR31)**
   - Clic sur notification → Server Action `markNotificationAsRead(id)`
   - Notification marquée `read=true` en base
   - Redirection vers l'élément lié : `/requests/[relatedId]` (supplier) ou `/my-requests` (store)
   - Badge compteur se décrémente en temps réel

5. **AC5 — Tout marquer comme lu**
   - Bouton "Tout marquer comme lu" en haut de la page
   - Server Action `markAllNotificationsAsRead(userId, userType)`
   - Toutes notifications non lues → `read=true`
   - Badge compteur passe à 0

6. **AC6 — Style notification lue vs non lue**
   - Non lue : `bg-secondary`, point bleu, texte normal
   - Lue : fond transparent, pas de point, `text-muted-foreground`
   - Transition douce au marquage

7. **AC7 — Temps réel (Realtime)**
   - Nouvelle notification apparaît en haut de la liste instantanément
   - Réutiliser `useNotifications` hook existant enrichi
   - Pas besoin de rafraîchir la page

8. **AC8 — Pagination**
   - Chargement initial : 50 premières notifications
   - Bouton "Charger plus" si > 50 notifications
   - Query `getNotifications` avec offset/limit

9. **AC9 — Empty state**
   - Aucune notification → composant empty state dédié
   - Icône Bell, titre "Aucune notification"
   - Message : "Vous serez notifié lorsqu'un magasin enverra une demande." (fournisseur) / "Vous serez notifié lorsqu'un fournisseur traitera votre demande." (magasin)

## Tasks / Subtasks

- [x] Task 1 — Server Actions mark-as-read (AC: #4, #5)
  - [x] 1.1 Créer `markNotificationAsRead(notificationId: string)` dans `src/lib/actions/notifications.ts`
  - [x] 1.2 Créer `markAllNotificationsAsRead()` dans `src/lib/actions/notifications.ts`
  - [x] 1.3 Tests unitaires pour les deux actions
- [x] Task 2 — Query notifications paginées (AC: #2, #8)
  - [x] 2.1 Créer `getNotifications(userId, userType, offset, limit)` dans `src/lib/queries/notifications.ts`
  - [x] 2.2 Créer `serializeNotification()` pour la sérialisation (déjà existant dans utils — vérifier compatibilité)
  - [x] 2.3 Tests unitaires pour la query
- [x] Task 3 — Enrichir le hook `useNotifications` (AC: #4, #7)
  - [x] 3.1 Ajouter `decrementCount` et `resetCount` au hook
  - [x] 3.2 Supporter la notification en temps réel dans la liste (callback `onNewNotification`)
  - [x] 3.3 Tests du hook enrichi
- [x] Task 4 — Composant `NotificationItem` (AC: #3, #6)
  - [x] 4.1 Créer `src/components/custom/notification-item.tsx`
  - [x] 4.2 Icône par type (MessageSquare pour NEW_REQUEST, CheckCircle pour REQUEST_TREATED)
  - [x] 4.3 Date relative via `formatRelativeDate` (déjà présent dans `src/lib/utils/format.ts`)
  - [x] 4.4 Styles lue/non lue
  - [x] 4.5 Tests composant
- [x] Task 5 — Composant `NotificationList` (AC: #2, #7, #8, #9)
  - [x] 5.1 Créer `src/components/custom/notification-list.tsx`
  - [x] 5.2 Bouton "Tout marquer comme lu" (visible si notifications non lues)
  - [x] 5.3 Liste avec empty state
  - [x] 5.4 Bouton "Charger plus" pour pagination
  - [x] 5.5 Intégration realtime (nouvelles notifications en haut)
  - [x] 5.6 Tests composant
- [x] Task 6 — Page `/notifications` (AC: #2)
  - [x] 6.1 Créer `src/app/(supplier)/notifications/page.tsx` (Server Component)
  - [x] 6.2 Créer `src/app/(store)/notifications/page.tsx` (Server Component)
  - [x] 6.3 Créer `loading.tsx` pour chaque route
  - [x] 6.4 Tests pages
- [x] Task 7 — Intégration store-side badge (AC: #1)
  - [x] 7.1 Créer `StoreNavWrapper` client component (même pattern que `SupplierNavWrapper`)
  - [x] 7.2 Modifier `BottomNavigation` pour accepter `unreadNotificationCount` prop
  - [x] 7.3 Modifier `src/app/(store)/layout.tsx` pour fetch `getUnreadNotificationCount` et passer au wrapper
  - [x] 7.4 Ajouter `NotificationBadge` sur l'icône "Demandes" dans `BottomNavigation`
  - [x] 7.5 Tests composant et layout
- [x] Task 8 — Navigation vers notifications depuis bottom nav (AC: #2)
  - [x] 8.1 Ajouter icône Bell dans supplier et store bottom nav pour accéder à `/notifications`
  - [x] 8.2 Choix UX : onglet Bell dans la bottom nav (4 items : Offres, Demandes, Notifs, Profil)
- [x] Task 9 — Notification REQUEST_TREATED (complète le cycle)
  - [x] 9.1 Dans `updateRequestStatus` action (`src/lib/actions/requests.ts`), créer notification pour le store quand fournisseur traite une demande
  - [x] 9.2 Utiliser `createNotificationForTreatedRequest` pattern existant adapté
  - [x] 9.3 Tests intégration

## Dev Notes

### Patterns existants à réutiliser

- **Server Actions** : Pattern `ActionResult<T>` avec validation Zod → auth check → Prisma → revalidatePath. Voir `src/lib/actions/notifications.ts` pour le pattern exact.
- **Queries** : Wrapper `cache()` de React, types exportés. Voir `src/lib/queries/notifications.ts`.
- **Fire-and-forget** : Notification creation is `.catch(console.error)`, jamais `throw`.
- **Serialization** : `serializeNotification()` existe dans `src/lib/utils/notifications.ts`.
- **Realtime** : `subscribeToNotifications()` dans `src/lib/supabase/realtime.ts`.
- **Hook** : `useNotifications()` dans `src/lib/hooks/use-notifications.ts` — enrichir, ne pas recréer.
- **Toast** : `toast()` de sonner (pas `useToast` de shadcn), asymmetric border-radius déjà configuré.

### Anti-patterns à éviter

- **NE PAS** créer de `'use server'` sur des modules internes — seulement sur les fonctions exportées directement appelées par le client.
- **NE PAS** ajouter `decrementCount`/`resetCount` sans persistance DB — le code review de 6.1 les a supprimés pour cette raison. Les ajouter UNIQUEMENT couplés avec l'appel Server Action.
- **NE PAS** utiliser `useEffect` pour fetch les notifications — utiliser React Query ou Server Component.
- **NE PAS** créer d'API routes REST — utiliser Server Actions.
- **NE PAS** réinventer `NotificationBadge` — le composant existe déjà.

### Architecture clés

- **Auth** : `createClient()` de `@/lib/supabase/server` pour Server Components, vérifier `user.id` correspond au `userId` de la notification avant `markAsRead`.
- **RLS** : Policies déjà en place — `user_id = auth.uid()` pour SELECT et UPDATE. Les Server Actions passent par Prisma (service role), mais valider côté code que l'utilisateur est propriétaire.
- **Realtime** : Channel pattern `notifications:{userId}` — déjà configuré pour INSERT events.

### Redirect logic sur clic notification

```typescript
// Fournisseur : demande reçue
if (userType === 'SUPPLIER' && notification.relatedId) {
  router.push(`/requests/${notification.relatedId}`)
}
// Magasin : demande traitée
if (userType === 'STORE' && notification.relatedId) {
  router.push(`/my-requests`)  // ou page détail si existante
}
```

### Date relative helper

Ajouter `formatRelativeDate(date: string): string` dans `src/lib/utils/format.ts` :
- "il y a X min", "il y a X h", "il y a X j", "il y a X sem"
- Si > 30 jours : date formatée classique

### Project Structure Notes

- Pages notifications dans les deux route groups : `(supplier)/notifications/` et `(store)/notifications/`
- Composants partagés dans `src/components/custom/` (NotificationItem, NotificationList)
- Server Actions dans `src/lib/actions/notifications.ts` (fichier existant — ajouter les nouvelles)
- Query dans `src/lib/queries/notifications.ts` (fichier existant — ajouter la nouvelle)
- Hook dans `src/lib/hooks/use-notifications.ts` (enrichir l'existant)

### Design system reminders

- **Cards** : border-radius asymétrique `0 16px 16px 16px`
- **Headings** : classe `font-display` pour Plus Jakarta Sans
- **Skeletons** : `bg-secondary` (pas `bg-accent`)
- **Empty states** : Même pattern que `EmptyOffersState`, `EmptyRequestsState`
- **Bouton "Tout marquer comme lu"** : `variant="ghost"` ou `variant="outline"`, pas primary

### Fichiers existants à modifier

| Fichier | Modification |
|---------|-------------|
| `src/lib/actions/notifications.ts` | Ajouter `markNotificationAsRead`, `markAllNotificationsAsRead` |
| `src/lib/queries/notifications.ts` | Ajouter `getNotifications` paginée |
| `src/lib/hooks/use-notifications.ts` | Enrichir avec `decrementCount`, `resetCount`, callback liste |
| `src/lib/utils/format.ts` | Ajouter `formatRelativeDate` |
| `src/components/custom/bottom-navigation.tsx` | Ajouter prop `unreadNotificationCount` + badge |
| `src/app/(store)/layout.tsx` | Intégrer `StoreNavWrapper` avec notification count |
| `src/lib/actions/requests.ts` | Ajouter notification REQUEST_TREATED dans `treatRequest` |

### Fichiers à créer

| Fichier | Description |
|---------|-------------|
| `src/components/custom/notification-item.tsx` | Item de notification individuel |
| `src/components/custom/notification-item.test.tsx` | Tests NotificationItem |
| `src/components/custom/notification-list.tsx` | Liste des notifications avec pagination |
| `src/components/custom/notification-list.test.tsx` | Tests NotificationList |
| `src/components/custom/store-nav-wrapper.tsx` | Wrapper client pour store bottom nav |
| `src/components/custom/store-nav-wrapper.test.tsx` | Tests StoreNavWrapper |
| `src/app/(supplier)/notifications/page.tsx` | Page notifications fournisseur |
| `src/app/(supplier)/notifications/loading.tsx` | Loading state |
| `src/app/(store)/notifications/page.tsx` | Page notifications magasin |
| `src/app/(store)/notifications/loading.tsx` | Loading state |

### Learnings from Stories 6.1 & 6.2

- **Code review 6.1** : `'use server'` ne doit JAMAIS être sur un module interne — vulnérabilité de sécurité. Seules les fonctions exportées directement appelées par le client doivent l'avoir.
- **Code review 6.1** : Toujours filtrer par `userType` dans les queries notifications pour éviter les fuites cross-type.
- **Code review 6.1** : Le hook `useNotifications` retourne seulement `{ unreadCount }` après review — pas de `decrementCount`/`resetCount` car ils ne persistaient pas. Pour cette story, les coupler avec Server Actions.
- **Code review 6.2** : Fire-and-forget est critique — ne jamais bloquer une action métier pour une notification.
- **Pattern email** : `sendEmailForRequest` dans `src/lib/email/send-request-email.ts` — singleton Resend, skip si pas de clé API.
- **Tests** : Mocker Prisma avec `vi.mock()`, mocker Supabase realtime channel. Pattern bien établi dans `notifications.test.ts`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 6 — Story 6.3]
- [Source: _bmad-output/planning-artifacts/prd.md#FR30, FR31]
- [Source: _bmad-output/planning-artifacts/architecture.md#Notification Strategy]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#NotificationBadge, Notification Patterns]
- [Source: _bmad-output/implementation-artifacts/6-1-schema-notifications-et-notification-in-app.md]
- [Source: _bmad-output/implementation-artifacts/6-2-notification-email.md]
- [Source: _bmad-output/project-context.md]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- Aucun bug bloquant rencontré

### Completion Notes List
- Task 1: Ajouté `markNotificationAsRead` et `markAllNotificationsAsRead` Server Actions avec inline `'use server'` pour éviter d'exposer les fonctions internes. Validation UUID + ownership check + Prisma update. 13 tests ajoutés.
- Task 2: Ajouté `getNotifications` paginée avec `serializeNotification` existant. Query cache wrappée avec React `cache()`. 7 tests ajoutés.
- Task 3: Enrichi `useNotifications` avec `decrementCount`, `resetCount`, et callback `onNewNotification` via ref pour éviter les re-subscriptions. 6 tests modifiés/ajoutés.
- Task 4: Créé `NotificationItem` avec icônes par type (MessageSquare/CheckCircle), styles lue/non-lue (bg-secondary vs text-muted-foreground), point bleu indicateur. 11 tests.
- Task 5: Créé `NotificationList` avec empty state par userType, bouton "Tout marquer comme lu", pagination "Charger plus", intégration realtime via `onNewNotification` callback. 12 tests.
- Task 6: Créé pages `/notifications` pour supplier et store (Server Components), avec loading skeletons. 7 tests.
- Task 7: Créé `StoreNavWrapper` (même pattern que `SupplierNavWrapper`), modifié `BottomNavigation` pour accepter `unreadRequestCount` prop avec `NotificationBadge`, modifié store layout pour fetch le unreadCount. 12 tests.
- Task 8: Ajouté onglet "Notifs" (icône Bell) dans les deux bottom navs (store et supplier). Tests mis à jour.
- Task 9: Ajouté `createNotificationForTreatedRequest` et intégré dans `updateRequestStatus` (fire-and-forget). Include offer relation dans la query. 6 tests ajoutés.

### Change Log
- 2026-02-11: Implémentation complète Story 6.3 — Gestion des notifications (9 tasks, 990 tests passent)
- 2026-02-11: Code Review — 8 issues corrigés (1 CRITICAL, 1 HIGH, 4 MEDIUM, 2 LOW). Pagination remplacée par Server Action, formatRelativeDate enrichi avec semaines, useNotifications sync initialCount, NotificationItem utilise NOTIFICATION_TYPE_CONFIG, toast erreur ajouté, imports dédupliqués. 1003 tests passent.

### File List
- `src/lib/actions/notifications.ts` — Modifié (ajout markNotificationAsRead, markAllNotificationsAsRead, loadMoreNotifications, createNotificationForTreatedRequest)
- `src/lib/actions/notifications.test.ts` — Modifié (ajout 24 tests pour les nouvelles fonctions)
- `src/lib/queries/notifications.ts` — Modifié (ajout getNotifications paginée)
- `src/lib/queries/notifications.test.ts` — Modifié (ajout 7 tests pour getNotifications)
- `src/lib/hooks/use-notifications.ts` — Modifié (ajout decrementCount, resetCount, onNewNotification, sync initialCount)
- `src/lib/hooks/use-notifications.test.ts` — Modifié (ajout 8 tests pour nouvelles fonctionnalités)
- `src/lib/utils/format.ts` — Modifié (ajout formatRelativeDate avec tier semaines)
- `src/lib/utils/format.test.ts` — Modifié (ajout 12 tests pour formatRelativeDate)
- `src/components/custom/notification-item.tsx` — Nouveau (utilise NOTIFICATION_TYPE_CONFIG)
- `src/components/custom/notification-item.test.tsx` — Nouveau (11 tests)
- `src/components/custom/notification-list.tsx` — Nouveau (pagination via Server Action, toast erreur)
- `src/components/custom/notification-list.test.tsx` — Nouveau (14 tests)
- `src/components/custom/bottom-navigation.tsx` — Modifié (ajout unreadRequestCount prop, badge, onglet Notifs)
- `src/components/custom/bottom-navigation.test.tsx` — Modifié (ajout 4 tests badge, MAJ pour onglet Notifs)
- `src/components/custom/supplier-bottom-navigation.tsx` — Modifié (ajout onglet Notifs)
- `src/components/custom/supplier-bottom-navigation.test.tsx` — Modifié (MAJ pour onglet Notifs)
- `src/components/custom/store-nav-wrapper.tsx` — Nouveau
- `src/components/custom/store-nav-wrapper.test.tsx` — Nouveau (2 tests)
- `src/app/(supplier)/notifications/page.tsx` — Nouveau
- `src/app/(supplier)/notifications/page.test.tsx` — Nouveau (4 tests)
- `src/app/(supplier)/notifications/loading.tsx` — Nouveau
- `src/app/(store)/notifications/page.tsx` — Nouveau
- `src/app/(store)/notifications/page.test.tsx` — Nouveau (3 tests)
- `src/app/(store)/notifications/loading.tsx` — Nouveau
- `src/app/(store)/layout.tsx` — Modifié (StoreNavWrapper + getUnreadNotificationCount)
- `src/lib/actions/requests.ts` — Modifié (notification REQUEST_TREATED dans updateRequestStatus)
- `src/lib/actions/requests.test.ts` — Modifié (ajout 2 tests notification traitée)
