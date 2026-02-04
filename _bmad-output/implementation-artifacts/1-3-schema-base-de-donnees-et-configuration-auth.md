# Story 1.3: Schéma Base de Données & Configuration Auth

Status: done

## Story

En tant que **développeur**,
Je veux **créer le schéma de base de données pour les utilisateurs et configurer l'authentification**,
Afin de **supporter l'inscription et la connexion sécurisée**.

## Acceptance Criteria

### AC1: Schéma Prisma pour les Fournisseurs
**Given** Prisma est configuré
**When** je crée le schéma pour les fournisseurs
**Then** la table `suppliers` existe avec les champs: id (UUID), email, company_name, phone, created_at, updated_at
**And** un index unique existe sur email

### AC2: Schéma Prisma pour les Magasins
**Given** le schéma suppliers existe
**When** je crée le schéma pour les magasins
**Then** la table `stores` existe avec les champs: id (UUID), email, name, brand (enum: LECLERC, INTERMARCHE, SUPER_U, SYSTEME_U), city, phone, created_at, updated_at
**And** un index unique existe sur email

### AC3: Exécution des migrations
**Given** les schémas existent
**When** j'exécute la migration Prisma
**Then** les tables sont créées dans Supabase
**And** les types TypeScript sont générés

### AC4: Configuration Supabase Auth
**Given** les tables existent
**When** je configure Supabase Auth
**Then** l'authentification email/password est activée
**And** les templates d'email sont configurés en français
**And** la région de stockage est EU

### AC5: Policies RLS
**Given** Supabase Auth est configuré
**When** je crée les policies RLS
**Then** chaque utilisateur ne peut lire/modifier que son propre profil
**And** les policies sont testées avec des utilisateurs différents

### AC6: Middleware d'authentification
**Given** l'auth est configurée
**When** je crée le middleware d'authentification
**Then** `/middleware.ts` vérifie la session Supabase
**And** les routes protégées redirigent vers `/login` si non authentifié
**And** les route groups `(auth)`, `(supplier)`, `(store)` sont créés

## Tasks / Subtasks

- [x] **Task 1: Créer le schéma Prisma pour Suppliers** (AC: 1)
  - [x] 1.1 Définir le modèle `Supplier` dans `prisma/schema.prisma`
  - [x] 1.2 Ajouter les champs: id (UUID @default(uuid())), email, company_name, phone, created_at, updated_at
  - [x] 1.3 Configurer `@@map("suppliers")` pour le nommage snake_case de la table
  - [x] 1.4 Ajouter `@@unique([email])` et `@@index([email])`

- [x] **Task 2: Créer le schéma Prisma pour Stores** (AC: 2)
  - [x] 2.1 Définir l'enum `Brand` avec les valeurs LECLERC, INTERMARCHE, SUPER_U, SYSTEME_U
  - [x] 2.2 Définir le modèle `Store` dans `prisma/schema.prisma`
  - [x] 2.3 Ajouter les champs: id (UUID), email, name, brand (enum), city, phone, created_at, updated_at
  - [x] 2.4 Configurer `@@map("stores")` et ajouter les indexes

- [x] **Task 3: Exécuter les migrations Prisma** (AC: 3)
  - [x] 3.1 Exécuter `npx prisma migrate dev --name init_users`
  - [x] 3.2 Vérifier que les tables sont créées dans Supabase Dashboard
  - [x] 3.3 Exécuter `npx prisma generate` pour les types TypeScript
  - [x] 3.4 Vérifier que les types sont disponibles dans le code

- [x] **Task 4: Configurer Supabase Auth** (AC: 4)
  - [ ] 4.1 Activer Email/Password auth dans Supabase Dashboard > Authentication > Providers (MANUEL)
  - [ ] 4.2 Configurer les URL de redirection (localhost:3000 + domaine prod) (MANUEL)
  - [ ] 4.3 Personnaliser les templates email en français (confirmation, reset password) (MANUEL)
  - [x] 4.4 Créer les helpers d'authentification dans `/src/lib/supabase/auth.ts`
  - [x] 4.5 Définir le type `ActionResult<T>` dans `/src/types/api.ts`

- [x] **Task 5: Créer les policies RLS** (AC: 5)
  - [x] 5.1 Créer une migration SQL pour les policies RLS sur `suppliers`
  - [x] 5.2 Créer une migration SQL pour les policies RLS sur `stores`
  - [x] 5.3 Policy SELECT: `auth.uid() = id`
  - [x] 5.4 Policy UPDATE: `auth.uid() = id`
  - [x] 5.5 Policy INSERT: permettre l'insertion si l'utilisateur est authentifié
  - [x] 5.6 Activer RLS sur les tables via `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`

- [x] **Task 6: Créer le middleware d'authentification** (AC: 6)
  - [x] 6.1 Mettre à jour `/src/middleware.ts` avec la vérification de session Supabase
  - [x] 6.2 Définir les routes publiques (`/login`, `/register/*`, `/forgot-password`, `/reset-password`)
  - [x] 6.3 Définir les routes protégées et rediriger vers `/login` si non authentifié
  - [x] 6.4 Créer la structure des route groups: `(auth)`, `(supplier)`, `(store)`
  - [x] 6.5 Créer les layouts pour chaque route group

- [x] **Task 7: Créer les pages d'authentification de base** (AC: 6)
  - [x] 7.1 Créer `/src/app/(auth)/layout.tsx` - Layout auth sans bottom nav
  - [x] 7.2 Créer `/src/app/(auth)/login/page.tsx` - Page placeholder
  - [x] 7.3 Créer `/src/app/(auth)/register/page.tsx` - Page choix type d'inscription
  - [x] 7.4 Créer `/src/app/(auth)/register/supplier/page.tsx` - Placeholder
  - [x] 7.5 Créer `/src/app/(auth)/register/store/page.tsx` - Placeholder
  - [x] 7.6 Créer `/src/app/(auth)/forgot-password/page.tsx` - Placeholder
  - [x] 7.7 Créer `/src/app/(auth)/reset-password/page.tsx` - Placeholder

- [x] **Task 8: Validation et tests** (AC: 1-6)
  - [x] 8.1 Vérifier que `npm run build` passe sans erreur
  - [x] 8.2 Vérifier que `npm run lint` passe sans erreur
  - [x] 8.3 Créer des tests unitaires pour les helpers auth
  - [ ] 8.4 Tester les policies RLS via Supabase Dashboard avec différents users (MANUEL)

## Dev Notes

### Schéma Prisma complet

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// Enum pour les enseignes de magasins
enum Brand {
  LECLERC
  INTERMARCHE
  SUPER_U
  SYSTEME_U

  @@map("brand")
}

// Modèle Fournisseur
model Supplier {
  id          String   @id @default(uuid()) @db.Uuid
  email       String   @unique
  companyName String   @map("company_name")
  phone       String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("suppliers")
  @@index([email])
}

// Modèle Magasin
model Store {
  id        String   @id @default(uuid()) @db.Uuid
  email     String   @unique
  name      String
  brand     Brand
  city      String
  phone     String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("stores")
  @@index([email])
}
```

### Policies RLS SQL

```sql
-- Migration: enable_rls_policies.sql

-- Activer RLS sur les tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Policies pour suppliers
CREATE POLICY "Users can view own supplier profile" ON suppliers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own supplier profile" ON suppliers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own supplier profile" ON suppliers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies pour stores
CREATE POLICY "Users can view own store profile" ON stores
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own store profile" ON stores
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own store profile" ON stores
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Type ActionResult (OBLIGATOIRE)

```typescript
// src/types/api.ts
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'SERVER_ERROR'

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: ErrorCode }
```

### Middleware d'authentification

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes publiques (pas besoin d'être authentifié)
const publicRoutes = [
  '/login',
  '/register',
  '/register/supplier',
  '/register/store',
  '/forgot-password',
  '/reset-password',
]

// Routes fournisseur uniquement
const supplierRoutes = ['/dashboard', '/offers/new', '/offers/[id]/edit', '/requests']

// Routes magasin uniquement
const storeRoutes = ['/my-requests']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Permettre les routes publiques
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  if (isPublicRoute) {
    // Si déjà connecté et sur une page auth, rediriger vers l'accueil
    if (user && (pathname === '/login' || pathname.startsWith('/register'))) {
      return NextResponse.redirect(new URL('/offers', request.url))
    }
    return supabaseResponse
  }

  // Vérifier l'authentification pour les routes protégées
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Helpers d'authentification

```typescript
// src/lib/supabase/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ActionResult } from '@/types/api'

export async function getSession() {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export async function signOut(): Promise<ActionResult<null>> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { success: false, error: error.message, code: 'SERVER_ERROR' }
  }

  redirect('/login')
}

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { user: null, profile: null, userType: null }
  }

  // Essayer de trouver le profil fournisseur
  const { data: supplier } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', user.id)
    .single()

  if (supplier) {
    return { user, profile: supplier, userType: 'supplier' as const }
  }

  // Sinon, chercher le profil magasin
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('id', user.id)
    .single()

  if (store) {
    return { user, profile: store, userType: 'store' as const }
  }

  return { user, profile: null, userType: null }
}
```

### Structure des Route Groups

```
src/app/
├── (auth)/                    # Routes publiques d'authentification
│   ├── layout.tsx            # Layout sans bottom nav
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   ├── page.tsx          # Choix: fournisseur ou magasin
│   │   ├── supplier/
│   │   │   └── page.tsx
│   │   └── store/
│   │       └── page.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   └── reset-password/
│       └── page.tsx
│
├── (supplier)/                # Espace fournisseur (protégé)
│   ├── layout.tsx            # Layout avec bottom nav fournisseur
│   ├── dashboard/
│   │   └── page.tsx
│   ├── offers/
│   │   ├── page.tsx          # Déjà créé (placeholder)
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── edit/
│   │           └── page.tsx
│   ├── requests/
│   │   ├── page.tsx          # Déjà créé (placeholder)
│   │   └── [id]/
│   │       └── page.tsx
│   └── profile/
│       └── page.tsx          # Déjà créé (placeholder)
│
└── (store)/                   # Espace magasin (protégé)
    ├── layout.tsx            # Layout avec bottom nav magasin
    ├── offers/
    │   ├── page.tsx
    │   └── [id]/
    │       └── page.tsx
    ├── my-requests/
    │   ├── page.tsx
    │   └── [id]/
    │       └── page.tsx
    └── profile/
        └── page.tsx
```

### Layout Auth (sans bottom nav)

```typescript
// src/app/(auth)/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentification - aurelien-project',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  )
}
```

### Configuration Supabase Dashboard

**Étapes manuelles dans Supabase Dashboard :**

1. **Authentication > Providers**
   - Activer "Email" provider
   - Désactiver "Confirm email" pour le dev local (optionnel)

2. **Authentication > URL Configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `https://votre-domaine.vercel.app/auth/callback`

3. **Authentication > Email Templates** (français)
   - Confirmation: "Confirmez votre email pour aurelien-project"
   - Reset Password: "Réinitialisation de votre mot de passe"
   - Magic Link: "Connexion à aurelien-project"

4. **Settings > General**
   - Vérifier que la région est EU (Frankfurt)

### Variables d'environnement

Déjà configurées dans `.env.local` depuis Story 1.1:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `DIRECT_URL`

### Project Structure Notes

- Les pages existantes `/offers`, `/requests`, `/profile` (créées en 1.2) seront déplacées dans les route groups appropriés
- Le middleware doit être à la racine de `src/` pour Next.js App Router
- Les helpers auth utilisent le pattern Server Actions avec `'use server'`

### Architecture Compliance

**Références Architecture:**
- [Source: architecture.md#Authentication & Security - Supabase Auth]
- [Source: architecture.md#Data Architecture - Prisma ORM]
- [Source: architecture.md#Implementation Patterns - RLS obligatoire]
- [Source: project-context.md#Supabase & Database Rules]
- [Source: project-context.md#API Response Pattern - ActionResult<T>]

**Patterns OBLIGATOIRES:**
- `ActionResult<T>` pour toutes les Server Actions
- RLS activé sur TOUTES les tables
- UUID v4 pour les clés primaires
- `created_at` et `updated_at` sur chaque table
- snake_case pour les noms de tables/colonnes en DB
- camelCase pour les propriétés TypeScript (mapping Prisma)

### Testing Requirements

- `npm run build` doit passer sans erreur
- `npm run lint` doit passer sans erreur
- Tests unitaires pour les helpers auth
- Test manuel des policies RLS dans Supabase Dashboard
- Vérifier la redirection middleware sur les routes protégées

### Dépendances

Déjà installées depuis Story 1.1:
- `@supabase/supabase-js`
- `@supabase/ssr`
- `prisma`
- `@prisma/client`

Aucune nouvelle dépendance requise.

## Previous Story Intelligence

### Learnings from Story 1.1
- Prisma 6.x avec pattern singleton dans `/src/lib/prisma/client.ts`
- Supabase clients créés: `/src/lib/supabase/client.ts` et `/src/lib/supabase/server.ts`
- QueryClientProvider configuré dans `/src/app/providers.tsx`
- Variables d'environnement configurées dans `.env.local`

### Learnings from Story 1.2
- shadcn/ui utilise Tailwind CSS v4 (format OKLCH pour les couleurs)
- Components layout créés: MobileLayout, PageHeader, BottomNavigation
- Pages placeholder créées: `/offers`, `/requests`, `/profile`
- Vitest + Testing Library configurés pour les tests
- **IMPORTANT**: Les pages placeholder doivent être déplacées dans les route groups

### Files Created in Previous Stories

**À modifier:**
- `/src/middleware.ts` - Ajouter la logique d'authentification
- Pages placeholder à déplacer dans les route groups

**À créer:**
- `/src/types/api.ts` - Type ActionResult
- `/src/lib/supabase/auth.ts` - Helpers d'authentification
- Route groups et layouts
- Migrations Prisma et RLS

### Key Patterns Established

- Import alias: `@/*` → `./src/*`
- TypeScript strict mode
- Server Components par défaut
- `cn()` utility pour les classes CSS
- Touch targets minimum 44x44px

## References

- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3]
- [Source: _bmad-output/planning-artifacts/prd.md#Gestion des comptes utilisateurs]
- [Source: _bmad-output/planning-artifacts/prd.md#Non-Functional Requirements - Security]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Form Patterns]
- [Source: _bmad-output/project-context.md#Supabase & Database Rules]
- [Source: _bmad-output/project-context.md#Prisma Rules]
- [Source: _bmad-output/project-context.md#API Response Pattern]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Migration Prisma init_users: `prisma/migrations/20260204141110_init_users/migration.sql`
- Migration RLS policies: `prisma/migrations/20260204150000_add_rls_policies/migration.sql`

### Completion Notes List

- ✅ Schéma Prisma créé avec modèles Supplier, Store et enum Brand
- ✅ Migration exécutée avec succès - tables créées dans Supabase
- ✅ Types TypeScript générés via Prisma Client
- ✅ Policies RLS créées via migration Prisma (intégrées au workflow de migration)
- ✅ Type ActionResult<T> créé pour les Server Actions
- ✅ Helpers d'authentification créés (getSession, getUser, signOut, getUserProfile)
- ✅ Middleware d'authentification créé avec protection des routes
- ✅ Route groups créés: (auth), (supplier), (store)
- ✅ Pages d'authentification placeholder créées
- ✅ Tests unitaires créés et passent (45 tests)
- ✅ Tests du middleware ajoutés (11 tests)
- ✅ Build et lint passent sans erreur
- ⚠️ Configuration manuelle Supabase Dashboard requise (4.1, 4.2, 4.3, 8.4)
- ⚠️ Next.js 16 middleware deprecation warning - migration vers "proxy" à prévoir

### Change Log

- 2026-02-04: Implémentation complète de la Story 1.3
- 2026-02-04: Code Review - Corrections appliquées:
  - Suppression des index redondants sur email (@@index supprimés, @unique suffit)
  - RLS policies migrées de fichier séparé vers migration Prisma intégrée
  - Documentation ajoutée sur signOut() comportement avec redirect()
  - Tests middleware ajoutés (11 nouveaux tests)
  - Documentation ajoutée aux layouts (supplier) et (store)

### File List

**Fichiers créés:**
- `prisma/migrations/20260204141110_init_users/migration.sql`
- `prisma/migrations/20260204150000_add_rls_policies/migration.sql`
- `src/types/api.ts`
- `src/types/api.test.ts`
- `src/lib/supabase/auth.ts`
- `src/lib/supabase/auth.test.ts`
- `src/middleware.ts`
- `src/middleware.test.ts`
- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/(auth)/register/supplier/page.tsx`
- `src/app/(auth)/register/store/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`
- `src/app/(supplier)/layout.tsx`
- `src/app/(store)/layout.tsx`

**Fichiers modifiés:**
- `prisma/schema.prisma` - Ajout modèles Supplier, Store, enum Brand (index redondants supprimés)

**Fichiers supprimés:**
- `prisma/rls_policies.sql` - Remplacé par migration Prisma intégrée
