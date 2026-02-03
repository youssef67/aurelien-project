# Story 1.1: Initialisation du Projet

Status: done

## Story

En tant que **développeur**,
Je veux **initialiser le projet avec le stack technique défini**,
Afin de **disposer d'une base de code fonctionnelle et configurée**.

## Acceptance Criteria

### AC1: Création du projet Next.js
**Given** aucun projet n'existe
**When** j'exécute la commande d'initialisation Next.js
**Then** un projet Next.js 15 est créé avec TypeScript, Tailwind CSS, App Router et src directory
**And** l'alias d'import `@/*` est configuré dans tsconfig.json

### AC2: Configuration Supabase
**Given** le projet Next.js est initialisé
**When** je configure Supabase
**Then** un projet Supabase est créé en région EU-Frankfurt
**And** les variables d'environnement sont configurées dans `.env.local`
**And** le fichier `.env.example` documente les variables requises

### AC3: Initialisation Prisma
**Given** Supabase est configuré
**When** j'initialise Prisma
**Then** Prisma est installé avec le provider PostgreSQL
**And** la connexion à Supabase est configurée via DATABASE_URL
**And** le client Prisma singleton est créé dans `/lib/prisma/client.ts`

### AC4: Installation des dépendances essentielles
**Given** le projet est configuré
**When** j'installe les dépendances essentielles
**Then** React Query (TanStack Query), Zod, et React Hook Form sont installés
**And** le QueryClientProvider est configuré dans le layout racine

## Tasks / Subtasks

- [x] **Task 1: Créer le projet Next.js** (AC: 1)
  - [x] 1.1 Exécuter `npx create-next-app@latest` avec les options spécifiées
  - [x] 1.2 Vérifier que TypeScript strict mode est activé
  - [x] 1.3 Vérifier que l'alias `@/*` fonctionne

- [x] **Task 2: Configurer Supabase** (AC: 2)
  - [x] 2.1 Installer `@supabase/supabase-js` et `@supabase/ssr`
  - [x] 2.2 Créer `.env.local` avec les variables Supabase
  - [x] 2.3 Créer `.env.example` documentant les variables requises
  - [x] 2.4 Créer le client Supabase browser dans `/lib/supabase/client.ts`
  - [x] 2.5 Créer le client Supabase server dans `/lib/supabase/server.ts`

- [x] **Task 3: Initialiser Prisma** (AC: 3)
  - [x] 3.1 Installer Prisma CLI et client
  - [x] 3.2 Exécuter `npx prisma init`
  - [x] 3.3 Configurer `DATABASE_URL` dans `.env.local`
  - [x] 3.4 Créer le client Prisma singleton dans `/lib/prisma/client.ts`
  - [x] 3.5 Ajouter Prisma aux scripts npm

- [x] **Task 4: Installer les dépendances core** (AC: 4)
  - [x] 4.1 Installer `@tanstack/react-query`
  - [x] 4.2 Installer `zod`
  - [x] 4.3 Installer `react-hook-form` et `@hookform/resolvers`
  - [x] 4.4 Créer le QueryClientProvider wrapper
  - [x] 4.5 Intégrer le provider dans le layout racine

- [x] **Task 5: Configuration finale**
  - [x] 5.1 Vérifier que le projet démarre sans erreur (`npm run dev`)
  - [x] 5.2 Créer un `.gitignore` approprié
  - [x] 5.3 Vérifier la structure des dossiers conforme à l'architecture

## Dev Notes

### Commande d'initialisation exacte

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

**IMPORTANT:** Le projet doit être créé dans le répertoire courant (`.`) car le dossier `aurelien-project` existe déjà.

### Packages à installer

```bash
# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Prisma
npm install prisma @prisma/client
npx prisma init

# Core dependencies
npm install @tanstack/react-query zod react-hook-form @hookform/resolvers
```

### Structure cible après cette story

```
aurelien-project/
├── .env.local           # Variables d'environnement (non commité)
├── .env.example         # Template des variables
├── .gitignore
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── prisma/
│   └── schema.prisma    # Schéma vide pour l'instant
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx   # Avec QueryClientProvider
    │   └── page.tsx
    └── lib/
        ├── supabase/
        │   ├── client.ts  # Browser client
        │   └── server.ts  # Server client
        └── prisma/
            └── client.ts  # Singleton Prisma
```

### Configuration TypeScript requise

Le fichier `tsconfig.json` doit avoir `strict: true`. Vérifier que ces options sont présentes :

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Client Prisma Singleton Pattern

```typescript
// src/lib/prisma/client.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Client Supabase Browser

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Client Supabase Server

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}
```

### QueryClientProvider Setup

```typescript
// src/app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### Variables d'environnement requises

```bash
# .env.example
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Database (Prisma)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Optional: Direct connection for migrations
DIRECT_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### Project Structure Notes

- Le projet utilise App Router (pas Pages Router)
- Tous les imports doivent utiliser l'alias `@/*` (ex: `@/lib/prisma/client`)
- Les Server Components sont par défaut, utiliser `'use client'` uniquement si nécessaire
- Le client Prisma est un singleton pour éviter les connexions multiples en dev

### Architecture Compliance

**Références Architecture:**
- [Source: architecture.md#Starter Template Evaluation]
- [Source: architecture.md#Core Architectural Decisions]
- [Source: project-context.md#Technology Stack & Versions]

**Patterns à respecter:**
- TypeScript strict mode obligatoire
- Import alias `@/*` pour tous les imports internes
- Singleton pattern pour Prisma client
- Supabase SSR pour la gestion des cookies/sessions

### Testing Requirements

Cette story est une story d'infrastructure. Les tests seront :
- Vérification que `npm run dev` démarre sans erreur
- Vérification que `npm run build` compile sans erreur
- Vérification que `npm run lint` passe sans erreur

## References

- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation]
- [Source: _bmad-output/planning-artifacts/architecture.md#Code Organization]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]
- [Source: _bmad-output/project-context.md#Technology Stack & Versions]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Prisma 7.x a une nouvelle API qui requiert des arguments obligatoires pour le constructeur PrismaClient
- Solution: downgrade vers Prisma 6.x qui utilise l'API classique compatible avec le pattern singleton standard
- Le dossier existant nécessitait la création du projet Next.js dans un dossier temporaire puis copie des fichiers

### Completion Notes List

1. **Next.js 16.1.6** créé avec TypeScript strict, Tailwind CSS 4, ESLint, App Router, et alias `@/*`
2. **Supabase** configuré avec clients browser et server utilisant @supabase/ssr pour la gestion SSR des cookies
3. **Prisma 6.19.2** initialisé avec provider PostgreSQL et pattern singleton pour éviter les connexions multiples en dev
4. **React Query 5.x**, **Zod 4.x**, **React Hook Form 7.x** installés avec QueryClientProvider dans le layout racine
5. Tous les tests d'infrastructure passent: `npm run dev`, `npm run build`, `npm run lint`

### File List

**Fichiers créés:**
- `.env.local` - Variables d'environnement (Supabase, DATABASE_URL)
- `.env.example` - Template des variables d'environnement
- `.gitignore` - Configuration Git
- `package.json` - Dépendances et scripts npm
- `package-lock.json` - Lock file npm
- `tsconfig.json` - Configuration TypeScript avec strict mode
- `next.config.ts` - Configuration Next.js
- `next-env.d.ts` - Types Next.js générés
- `eslint.config.mjs` - Configuration ESLint
- `postcss.config.mjs` - Configuration PostCSS
- `README.md` - Documentation projet
- `prisma/schema.prisma` - Schéma Prisma avec directUrl
- `public/` - Assets statiques (dossier)
- `src/app/layout.tsx` - Layout racine avec Providers
- `src/app/page.tsx` - Page d'accueil par défaut
- `src/app/providers.tsx` - QueryClientProvider wrapper
- `src/app/globals.css` - Styles globaux Tailwind
- `src/lib/supabase/client.ts` - Client Supabase browser avec validation env
- `src/lib/supabase/server.ts` - Client Supabase server avec validation env
- `src/lib/prisma/client.ts` - Client Prisma singleton

## Senior Developer Review (AI)

**Review Date:** 2026-02-03
**Reviewer:** Claude Opus 4.5
**Outcome:** Approved (after fixes)

### Action Items (All Resolved)

- [x] [Med] Déplacer `prisma` de dependencies vers devDependencies (`package.json`)
- [x] [Med] Mettre à jour README.md avec contenu projet (`README.md`)
- [x] [Med] Supprimer duplication dans .gitignore (`.gitignore:46-48`)
- [x] [Med] Ajouter directUrl pour migrations Supabase (`prisma/schema.prisma`)
- [x] [Med] Compléter la File List dans la story
- [x] [Low] Ajouter validation des variables d'environnement (`src/lib/supabase/*.ts`)
- [x] [Low] Initialiser le dépôt git
- [x] [Low] Import React explicite dans providers.tsx (`src/app/providers.tsx`)

### Review Notes

Story d'infrastructure bien implémentée. Les 8 issues identifiées ont été corrigées automatiquement. Le build passe sans erreur après les corrections.

## Change Log

| Date | Changement |
|------|------------|
| 2026-02-03 | Story 1.1 implémentée - Initialisation complète du projet Next.js avec stack technique |
| 2026-02-03 | Code review - 8 issues corrigées (5 Medium, 3 Low) |
