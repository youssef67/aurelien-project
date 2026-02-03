---
project_name: 'aurelien-project'
user_name: 'Youssef'
date: '2026-02-03'
sections_completed: ['technology_stack', 'implementation_rules', 'naming_conventions', 'api_patterns', 'testing_rules', 'security_rules', 'anti_patterns', 'file_structure', 'quick_reference']
architecture_reference: '_bmad-output/planning-artifacts/architecture.md'
---

# Project Context for AI Agents

_Ce fichier contient les règles critiques et patterns que les agents AI doivent suivre lors de l'implémentation du code. Focus sur les détails non évidents._

---

## Technology Stack & Versions

| Technology | Version | Notes |
|------------|---------|-------|
| Node.js | 20+ LTS | Runtime |
| Next.js | 15.x | App Router uniquement |
| React | 19.x | Via Next.js |
| TypeScript | 5.x | Mode strict obligatoire |
| Supabase | Latest | Région EU-Frankfurt |
| PostgreSQL | 15+ | Via Supabase |
| Prisma | Latest | ORM + migrations |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | Latest | Composants UI |
| React Query | 5.x | TanStack Query |
| Zod | Latest | Validation |
| React Hook Form | Latest | Formulaires |

---

## Critical Implementation Rules

### TypeScript Rules

- **STRICT MODE** : `strict: true` obligatoire dans tsconfig.json
- **NO ANY** : Interdiction de `any` - utiliser `unknown` si type inconnu
- **Explicit Return Types** : Obligatoire sur les fonctions exportées
- **Import Paths** : Utiliser `@/*` alias (ex: `@/components/ui/button`)

### Next.js App Router Rules

- **Server Components par défaut** : Ne pas ajouter `"use client"` sauf si nécessaire
- **Server Actions** : Utiliser pour toutes les mutations (pas de API routes REST)
- **Route Groups** : `(auth)`, `(supplier)`, `(store)` pour organiser par rôle
- **Metadata** : Toujours définir `metadata` export dans les pages
- **Loading** : Créer `loading.tsx` pour chaque route dynamique

### Supabase & Database Rules

- **RLS OBLIGATOIRE** : Chaque table DOIT avoir des policies Row Level Security
- **Région EU** : Toujours utiliser Frankfurt (eu-central-1) pour RGPD
- **UUID** : Utiliser UUID v4 pour toutes les clés primaires
- **Timestamps** : `created_at` et `updated_at` sur chaque table
- **Soft Delete** : Préférer `deleted_at` à la suppression physique

### Prisma Rules

- **Schema Location** : `/prisma/schema.prisma`
- **Migrations** : Toujours créer via `prisma migrate dev`
- **Client Singleton** : Utiliser `/lib/prisma/client.ts`
- **Relations** : Définir explicitement les relations bidirectionnelles

### React Query Rules

- **Query Keys** : Format `[entity, 'list'|'detail', ...params]`
- **Stale Time** : 5 minutes par défaut pour les données
- **Invalidation** : Après chaque mutation Server Action
- **Optimistic Updates** : Pour les actions utilisateur critiques

---

## Naming Conventions

### Database (PostgreSQL/Prisma)

| Element | Convention | Example |
|---------|------------|---------|
| Tables | snake_case pluriel | `suppliers`, `offers` |
| Columns | snake_case | `company_name`, `promo_price` |
| Primary Keys | `id` | `id UUID PRIMARY KEY` |
| Foreign Keys | `{table}_id` | `supplier_id`, `store_id` |
| Indexes | `idx_{table}_{column}` | `idx_offers_category` |
| Enums | PascalCase | `RequestType`, `OfferStatus` |

### Code (TypeScript/React)

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `OfferCard`, `RequestList` |
| Files | kebab-case | `offer-card.tsx` |
| Functions | camelCase | `getOfferById` |
| Variables | camelCase | `currentUser` |
| Constants | SCREAMING_SNAKE | `MAX_FILE_SIZE` |
| Types | PascalCase | `Offer`, `CreateOfferInput` |
| Hooks | use + PascalCase | `useOffers` |

### API & Routes

| Element | Convention | Example |
|---------|------------|---------|
| Routes | kebab-case | `/my-requests` |
| Query Params | camelCase | `?supplierId=123` |
| Server Actions | camelCase verb+noun | `createOffer` |

---

## API Response Pattern (MANDATORY)

**TOUTES les Server Actions DOIVENT retourner ce format :**

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: ErrorCode }

type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'SERVER_ERROR'
```

**Exemple d'implémentation :**

```typescript
export async function createOffer(input: CreateOfferInput): Promise<ActionResult<Offer>> {
  const validated = offerSchema.safeParse(input)
  if (!validated.success) {
    return { success: false, error: validated.error.message, code: 'VALIDATION_ERROR' }
  }
  // ... implementation
  return { success: true, data: offer }
}
```

---

## Testing Rules

- **Location** : Tests co-localisés (`offer-card.test.tsx` à côté de `offer-card.tsx`)
- **E2E** : Dossier `/e2e/` à la racine avec Playwright
- **Naming** : `*.test.ts` pour unit, `*.spec.ts` pour E2E
- **Coverage** : Minimum 80% sur les Server Actions

---

## Code Quality Rules

### ESLint

- Utiliser config Next.js par défaut + règles TypeScript strict
- **NO console.log** en production (warning en dev)
- **NO unused variables** (error)

### Formatting

- Prettier avec config par défaut
- Semicolons : Non (style Next.js)
- Quotes : Single quotes
- Tab Width : 2 spaces

---

## Security Rules (CRITICAL)

- **JAMAIS** de secrets dans le code (utiliser `.env.local`)
- **TOUJOURS** valider avec Zod côté serveur (même si validé côté client)
- **RLS** : Tester les policies avec des users différents
- **CORS** : Restreint au domaine de production
- **Rate Limiting** : Via Vercel Edge Middleware

---

## Anti-Patterns to Avoid

| DON'T | DO |
|-------|-----|
| `"use client"` sur tout | Server Components par défaut |
| API Routes pour CRUD | Server Actions |
| `any` type | Types explicites ou `unknown` |
| `console.log` debugging | Proper error handling |
| Fetch dans useEffect | React Query |
| État global partout | React Query pour server state |
| RLS désactivé | RLS sur chaque table |
| Validation client only | Zod client + server |

---

## File Structure Reference

```
src/
├── app/
│   ├── (auth)/           # Pages auth publiques
│   ├── (supplier)/       # Espace fournisseur (protégé)
│   ├── (store)/          # Espace magasin (protégé)
│   └── api/webhooks/     # Webhooks externes uniquement
├── components/
│   ├── ui/               # shadcn/ui (NE PAS MODIFIER)
│   ├── custom/           # Composants métier
│   ├── forms/            # Formulaires (RHF + Zod)
│   └── layout/           # Layouts partagés
├── lib/
│   ├── supabase/         # Clients Supabase
│   ├── prisma/           # Client Prisma
│   ├── actions/          # Server Actions
│   ├── queries/          # Data fetching (RSC)
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Utilitaires (format, cn, validation)
├── types/                # Types TypeScript
└── middleware.ts         # Auth middleware
```

---

## Quick Reference

### Créer un composant

```typescript
// components/custom/my-component.tsx
import { cn } from '@/lib/utils/cn'

interface MyComponentProps {
  className?: string
  // ... autres props typées
}

export function MyComponent({ className, ...props }: MyComponentProps) {
  return (
    <div className={cn('base-styles', className)} {...props}>
      {/* content */}
    </div>
  )
}
```

### Créer une Server Action

```typescript
// lib/actions/offers.ts
'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma/client'
import type { ActionResult } from '@/types/api'

const createOfferSchema = z.object({
  name: z.string().min(1),
  promoPrice: z.number().positive(),
  // ...
})

export async function createOffer(
  input: z.infer<typeof createOfferSchema>
): Promise<ActionResult<Offer>> {
  const validated = createOfferSchema.safeParse(input)
  if (!validated.success) {
    return { success: false, error: 'Validation failed', code: 'VALIDATION_ERROR' }
  }

  const offer = await prisma.offer.create({ data: validated.data })
  return { success: true, data: offer }
}
```

---

**Document Version:** 1.0
**Last Updated:** 2026-02-03
**Architecture Reference:** `_bmad-output/planning-artifacts/architecture.md`
