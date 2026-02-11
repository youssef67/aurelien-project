# Story 6.2: Notification Email

Status: done

## Story

As a fournisseur,
I want recevoir un email quand un magasin envoie une demande sur mon offre,
so that je suis notifié même si je ne suis pas sur l'application.

## Acceptance Criteria

1. **AC1 — Envoi email sur demande INFO**
   - Given une demande de type INFO est créée par un magasin
   - When la Server Action `createRequest` réussit
   - Then un email est envoyé au fournisseur via Resend
   - And l'objet est "Nouvelle demande de renseignements - [Nom offre]"
   - And le contenu inclut : nom magasin, enseigne, ville, offre concernée, message (si présent)
   - And un bouton CTA "Voir la demande" pointe vers `/requests/[requestId]`

2. **AC2 — Envoi email sur demande ORDER**
   - Given une demande de type ORDER est créée
   - When la Server Action `createRequest` réussit
   - Then un email est envoyé au fournisseur
   - And l'objet est "Intention de commande - [Nom offre]"
   - And le contenu met en avant l'intention d'achat
   - And le CTA est "Voir la demande" avec lien vers `/requests/[requestId]`

3. **AC3 — Design email responsive**
   - Given un email doit être envoyé
   - When le template est rendu
   - Then le design est responsive et sobre (compatible desktop + mobile)
   - And les emails sont en français
   - And l'expéditeur est configurable via variable d'environnement

4. **AC4 — Redirection CTA**
   - Given le fournisseur reçoit l'email
   - When il clique sur le bouton CTA
   - Then il est redirigé vers `/requests/[requestId]` dans l'application
   - And s'il n'est pas connecté, le middleware auth redirige vers login puis vers la page demandée

5. **AC5 — Résilience erreur email**
   - Given l'envoi d'email échoue (quota, service down, config manquante)
   - When une erreur survient
   - Then l'erreur est loggée (`console.error`) mais n'empêche PAS la création de la demande
   - And la notification in-app est quand même créée (indépendant)
   - And aucune erreur n'est renvoyée à l'utilisateur magasin

6. **AC6 — Configuration Resend**
   - Given le service d'email doit être configuré
   - When Resend est initialisé
   - Then le package `resend` est installé
   - And `RESEND_API_KEY` est dans `.env.local` et `.env.example`
   - And `EMAIL_FROM` est configurable (ex: `"Aurelien <noreply@aurelien-project.fr>"`)
   - And `NEXT_PUBLIC_APP_URL` est utilisé pour les liens CTA

7. **AC7 — Tests unitaires**
   - Given les composants email sont créés
   - When les tests s'exécutent
   - Then `sendEmailForRequest` est testée (mock Resend) : email envoyé pour INFO, email envoyé pour ORDER, erreur loggée si échec, pas d'erreur throw
   - And le template React est testable en isolation (render to string)
   - And l'intégration dans `createRequest` est testée (email + notification appelés)

## Tasks / Subtasks

- [x] **Task 1 — Installation et configuration Resend** (AC: #6)
  - [x] 1.1 `npm install resend`
  - [x] 1.2 Créer `src/lib/email/resend.ts` — client Resend singleton
  - [x] 1.3 Ajouter `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_APP_URL` dans `.env.example`

- [x] **Task 2 — Template email React** (AC: #1, #2, #3)
  - [x] 2.1 Créer `src/lib/email/templates/request-notification.tsx` — composant React email
  - [x] 2.2 Template INFO : objet "Nouvelle demande de renseignements - [offerName]", body avec infos magasin + message
  - [x] 2.3 Template ORDER : objet "Intention de commande - [offerName]", body avec accent intention d'achat
  - [x] 2.4 CTA button "Voir la demande" → `{APP_URL}/requests/{requestId}`
  - [x] 2.5 Footer sobre : "Cet email a été envoyé automatiquement par Aurelien"

- [x] **Task 3 — Service d'envoi email** (AC: #1, #2, #5)
  - [x] 3.1 Créer `src/lib/email/send-request-email.ts` — fonction `sendEmailForRequest()`
  - [x] 3.2 Fetch email fournisseur via Prisma (`supplier.email` depuis `supplierId`)
  - [x] 3.3 Appeler `resend.emails.send()` avec template React
  - [x] 3.4 Gestion erreur : `try/catch`, `console.error`, ne JAMAIS throw

- [x] **Task 4 — Intégration dans createRequest** (AC: #1, #2, #5)
  - [x] 4.1 Modifier `createNotificationForRequest()` dans `src/lib/actions/notifications.ts` pour aussi appeler `sendEmailForRequest()`
  - [x] 4.2 Appel fire-and-forget (même pattern que notification in-app)
  - [x] 4.3 L'échec email ne doit PAS empêcher la notification in-app

- [x] **Task 5 — Tests** (AC: #7)
  - [x] 5.1 Tests `sendEmailForRequest` — mock `resend.emails.send` : appel correct pour INFO, appel correct pour ORDER, erreur loggée sans throw, pas d'appel si `RESEND_API_KEY` manquant
  - [x] 5.2 Tests template React — render JSX et vérifier contenu (nom magasin, offre, CTA link)
  - [x] 5.3 Tests intégration — mock `sendEmailForRequest` dans `createNotificationForRequest`, vérifier appel

## Dev Notes

### Architecture & Patterns Obligatoires

- **Server-side only** : L'envoi d'email se fait côté serveur dans `src/lib/email/`, PAS dans une API route
- **Fire-and-forget** : Pattern identique à `createNotificationForRequest()` — `.catch(console.error)`, ne JAMAIS bloquer le flow principal
- **ActionResult<T>** : Non applicable ici (fonctions internes, pas des Server Actions publiques)
- **Resend SDK** : `new Resend(process.env.RESEND_API_KEY)` — client singleton
- **React templates** : Utiliser `react` param de `resend.emails.send()` avec JSX directement (pas besoin de `@react-email/components` pour le MVP)

### Resend SDK — Pattern Exact

```typescript
// src/lib/email/resend.ts
import { Resend } from 'resend'

// Singleton — ne pas recréer à chaque appel
export const resend = new Resend(process.env.RESEND_API_KEY)
```

### Fonction d'envoi — Pattern Exact

```typescript
// src/lib/email/send-request-email.ts
import { resend } from './resend'
import { prisma } from '@/lib/prisma/client'
import { RequestNotificationEmail } from './templates/request-notification'

const EMAIL_FROM = process.env.EMAIL_FROM || 'Aurelien <noreply@aurelien-project.fr>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function sendEmailForRequest({
  supplierId,
  requestType,
  storeName,
  storeBrand,
  storeCity,
  offerName,
  requestId,
  message,
}: {
  supplierId: string
  requestType: 'INFO' | 'ORDER'
  storeName: string
  storeBrand: string
  storeCity: string
  offerName: string
  requestId: string
  message: string | null
}): Promise<void> {
  try {
    // Pas de clé API = pas d'envoi (dev local sans Resend)
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set, skipping email')
      return
    }

    // Fetch supplier email
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { email: true },
    })

    if (!supplier) {
      console.error(`sendEmailForRequest: supplier ${supplierId} not found`)
      return
    }

    const subject = requestType === 'ORDER'
      ? `Intention de commande - ${offerName}`
      : `Nouvelle demande de renseignements - ${offerName}`

    const ctaUrl = `${APP_URL}/requests/${requestId}`

    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: supplier.email,
      subject,
      react: RequestNotificationEmail({
        requestType,
        storeName,
        storeBrand,
        storeCity,
        offerName,
        message,
        ctaUrl,
      }),
    })

    if (error) {
      console.error('Resend email error:', error)
    }
  } catch (error) {
    console.error('sendEmailForRequest failed:', error)
    // NEVER throw — fire-and-forget
  }
}
```

### Template Email React — Structure

```tsx
// src/lib/email/templates/request-notification.tsx
interface RequestNotificationEmailProps {
  requestType: 'INFO' | 'ORDER'
  storeName: string
  storeBrand: string
  storeCity: string
  offerName: string
  message: string | null
  ctaUrl: string
}

export function RequestNotificationEmail({
  requestType,
  storeName,
  storeBrand,
  storeCity,
  offerName,
  message,
  ctaUrl,
}: RequestNotificationEmailProps) {
  const isOrder = requestType === 'ORDER'
  const heading = isOrder ? 'Intention de commande' : 'Nouvelle demande de renseignements'

  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '24px', color: '#25224A' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
        {heading}
      </h1>
      <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '8px' }}>
        <strong>{storeName}</strong> ({storeBrand} - {storeCity})
        {isOrder ? ' souhaite passer commande sur votre offre :' : ' vous a envoyé une demande de renseignements pour :'}
      </p>
      <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
        {offerName}
      </p>
      {message && (
        <div style={{ backgroundColor: '#F5F5F5', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#666', margin: '0 0 4px' }}>Message :</p>
          <p style={{ fontSize: '14px', margin: 0 }}>{message}</p>
        </div>
      )}
      <a
        href={ctaUrl}
        style={{
          display: 'inline-block',
          backgroundColor: '#3E50F7',
          color: '#FFFFFF',
          padding: '12px 24px',
          borderRadius: '0 8px 8px 8px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '14px',
          marginTop: '8px',
        }}
      >
        Voir la demande
      </a>
      <hr style={{ border: 'none', borderTop: '1px solid #EEF2FE', margin: '24px 0 16px' }} />
      <p style={{ fontSize: '12px', color: '#999' }}>
        Cet email a été envoyé automatiquement par Aurelien.
      </p>
    </div>
  )
}
```

**Design tokens dans le template :**
- Cobalt primary `#3E50F7` pour le bouton CTA
- Bleu Nuit `#25224A` pour le texte principal
- Lavande `#EEF2FE` pour le séparateur
- Asymmetric border-radius `0 8px 8px 8px` sur le bouton CTA (signature design system)
- Font-family Inter (body)

### Intégration dans notifications.ts — Modification Exacte

```typescript
// src/lib/actions/notifications.ts — AJOUTER après createNotificationForRequest

import { sendEmailForRequest } from '@/lib/email/send-request-email'

// Modifier createNotificationForRequest pour accepter les nouveaux params
export async function createNotificationForRequest({
  supplierId,
  requestType,
  storeName,
  storeBrand,   // NOUVEAU
  storeCity,    // NOUVEAU
  offerName,
  requestId,
  message,      // NOUVEAU
}: {
  supplierId: string
  requestType: 'INFO' | 'ORDER'
  storeName: string
  storeBrand: string    // NOUVEAU
  storeCity: string     // NOUVEAU
  offerName: string
  requestId: string
  message: string | null // NOUVEAU
}): Promise<void> {
  // 1. Notification in-app (existant)
  const title = requestType === 'ORDER' ? 'Intention de commande' : 'Nouvelle demande'
  const body = `${storeName} - ${offerName}`

  await createNotification({
    userId: supplierId,
    userType: 'SUPPLIER',
    type: 'NEW_REQUEST',
    title,
    body,
    relatedId: requestId,
  })

  // 2. Email notification (NOUVEAU — fire-and-forget)
  sendEmailForRequest({
    supplierId,
    requestType,
    storeName,
    storeBrand,
    storeCity,
    offerName,
    requestId,
    message,
  }).catch((error) => {
    console.error('Failed to send email notification:', error)
  })
}
```

### Modification de createRequest — Ajout des champs manquants

Dans `src/lib/actions/requests.ts`, le store est déjà fetché (`prisma.store.findUnique`). Il faut ajouter `brand` et `city` au scope :

```typescript
// AVANT (actuel) :
const store = await prisma.store.findUnique({
  where: { id: user.id },
})

// APRÈS : store a déjà tous les champs (pas de select restrictif), donc brand et city sont déjà disponibles.

// Modifier l'appel à createNotificationForRequest :
createNotificationForRequest({
  supplierId: offer.supplierId,
  requestType: validated.data.type,
  storeName: store.name,
  storeBrand: store.brand,       // NOUVEAU — déjà disponible sur store
  storeCity: store.city,         // NOUVEAU — déjà disponible sur store
  offerName: offer.name,
  requestId: request.id,
  message: validated.data.message || null, // NOUVEAU — déjà dans validated.data
}).catch((error) => {
  console.error('Failed to create notification:', error)
})
```

**NOTE** : `store` est fetché sans `select`, donc tous les champs sont disponibles (`brand`, `city`). Pas de modification nécessaire sur la query store.

### Learnings from Story 6.1

- **fire-and-forget** : `createNotificationForRequest` est appelée avec `.catch()` — l'email doit suivre le MÊME pattern
- **Pas de `'use server'`** sur les modules internes (vulnérabilité sécurité corrigée en code review 6.1)
- **Tests** : Mock avec `vi.mock()` pour les dépendances externes (Prisma, Resend)
- **Prisma** : Pas besoin de migration — le modèle Notification n'est PAS modifié dans cette story
- **Realtime** : Non impacté — les notifications Realtime fonctionnent via la table `notifications` (aucun changement)
- **Le projet utilise `sonner` (pas shadcn `useToast`)** pour les toasts — non pertinent pour cette story (server-side uniquement)

### Project Structure Notes

**Nouveaux fichiers à créer :**
```
src/lib/email/resend.ts                           — Client Resend singleton
src/lib/email/send-request-email.ts               — Fonction d'envoi email
src/lib/email/send-request-email.test.ts          — Tests envoi email
src/lib/email/templates/request-notification.tsx   — Template React email
src/lib/email/templates/request-notification.test.tsx — Tests template
```

**Fichiers à modifier :**
```
package.json                                      — Ajout dépendance resend
.env.example                                      — Ajout RESEND_API_KEY, EMAIL_FROM, NEXT_PUBLIC_APP_URL
src/lib/actions/notifications.ts                   — Ajout appel sendEmailForRequest + nouveaux params
src/lib/actions/notifications.test.ts              — Ajout mock sendEmailForRequest
src/lib/actions/requests.ts                        — Passer brand, city, message à createNotificationForRequest
src/lib/actions/requests.test.ts                   — Update mock avec nouveaux params
```

**NE PAS toucher :**
- `prisma/schema.prisma` — Aucune modification schéma
- `src/components/ui/*` — Composants shadcn
- `src/lib/supabase/realtime.ts` — Pas d'impact Realtime
- `src/lib/hooks/use-notifications.ts` — Pas d'impact hook client
- `src/components/custom/notification-badge.tsx` — Pas d'impact UI

### ENV Variables Required

```env
# .env.example — AJOUTER :
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM="Aurelien <noreply@aurelien-project.fr>"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**IMPORTANT** : En dev sans `RESEND_API_KEY`, la fonction `sendEmailForRequest` doit return silencieusement (pas crash). Le `console.warn` suffit.

### Testing Strategy

**Mock Resend :**
```typescript
vi.mock('@/lib/email/resend', () => ({
  resend: {
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: 'email-123' }, error: null }),
    },
  },
}))
```

**Mock Prisma (supplier fetch) :**
```typescript
// Déjà mocké globalement dans le projet
vi.mocked(prisma.supplier.findUnique).mockResolvedValue({
  id: 'supplier-1',
  email: 'supplier@example.com',
  companyName: 'Test Supplier',
  phone: null,
  createdAt: new Date(),
  updatedAt: new Date(),
})
```

**Template test :** Utiliser `react-dom/server` `renderToStaticMarkup()` pour vérifier le HTML généré contient les bonnes informations (nom magasin, offre, lien CTA).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 6, Story 6.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Notification Strategy — Resend]
- [Source: _bmad-output/planning-artifacts/prd.md#FR29]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Notification Patterns]
- [Source: _bmad-output/implementation-artifacts/6-1-schema-notifications-et-notification-in-app.md]
- [Source: _bmad-output/project-context.md]
- [Source: Resend SDK docs — resend.com/docs/send-with-nextjs]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Full regression suite: 922/923 pass (1 pre-existing flaky timeout in create-offer-form.test.tsx, unrelated to changes)

### Completion Notes List

- Task 1: Installed `resend` package, created singleton client at `src/lib/email/resend.ts`, added `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_APP_URL` to `.env.example`
- Task 2: Created React email template `RequestNotificationEmail` with INFO/ORDER variants, responsive design, CTA button with Cobalt primary color and asymmetric border-radius, French content, footer
- Task 3: Created `sendEmailForRequest()` — fetches supplier email via Prisma, sends via Resend SDK, full error resilience (try/catch, console.error, never throws), graceful skip when `RESEND_API_KEY` missing
- Task 4: Integrated email sending into `createNotificationForRequest()` (fire-and-forget with `.catch()`), email failure does NOT block notification in-app. Updated `createRequest()` to pass `storeBrand`, `storeCity`, `message` to the notification function
- Task 5: 29 new tests total — 11 for `sendEmailForRequest`, 13 for template, 5 for email integration in notifications (incl. supplier-not-found). Updated existing tests in `notifications.test.ts` and `requests.test.ts` for new params

### Change Log

- 2026-02-11: Story 6.2 implemented — Email notifications via Resend for INFO/ORDER requests
- 2026-02-11: Code review fixes — M1: suppressed test stderr noise, M2: strengthened weak assertions, M3: moved Prisma supplier query out of email function (SRP), M4: added package-lock.json to File List

### File List

**New files:**
- `src/lib/email/resend.ts` — Resend client singleton
- `src/lib/email/send-request-email.ts` — Email sending function
- `src/lib/email/send-request-email.test.ts` — Tests (13)
- `src/lib/email/templates/request-notification.tsx` — React email template
- `src/lib/email/templates/request-notification.test.tsx` — Tests (13)

**Modified files:**
- `package.json` — Added `resend` dependency
- `package-lock.json` — Updated lockfile (resend installation)
- `.env.example` — Added `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_APP_URL`
- `src/lib/actions/notifications.ts` — Added email sending + new params (storeBrand, storeCity, message)
- `src/lib/actions/notifications.test.ts` — Added email integration tests + mock
- `src/lib/actions/requests.ts` — Pass storeBrand, storeCity, message to createNotificationForRequest
- `src/lib/actions/requests.test.ts` — Updated mock data with new params
