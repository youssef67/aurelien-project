# Story 1.2: Fondation Design System

Status: done

## Story

En tant que **développeur**,
Je veux **configurer le design system avec shadcn/ui et les tokens de design**,
Afin d'avoir **une base UI cohérente et accessible**.

## Acceptance Criteria

### AC1: Installation et configuration de shadcn/ui
**Given** le projet Next.js est initialisé
**When** j'installe et configure shadcn/ui
**Then** le fichier `components.json` est créé avec la configuration
**And** les composants de base sont disponibles dans `/components/ui/`
**And** la fonction utilitaire `cn()` est créée dans `/lib/utils/cn.ts`

### AC2: Configuration des design tokens
**Given** shadcn/ui est installé
**When** je configure les design tokens
**Then** les CSS variables sont définies dans `globals.css` (palette Slate monochrome)
**And** les couleurs sémantiques (success, warning, destructive) sont configurées
**And** la typographie Inter est configurée avec l'échelle définie

### AC3: Création des composants de layout de base
**Given** les tokens sont configurés
**When** je crée les composants de layout de base
**Then** `MobileLayout` est créé avec safe areas et structure header/content/bottom-nav
**And** `PageHeader` est créé avec titre et actions optionnelles
**And** `BottomNavigation` est créé avec 3 items (placeholder pour l'instant)

### AC4: Responsive design et accessibilité
**Given** les composants de layout existent
**When** je vérifie le responsive design
**Then** l'interface s'adapte de 320px à 1920px
**And** les touch targets font minimum 44x44px sur mobile

## Tasks / Subtasks

- [x] **Task 1: Installer shadcn/ui** (AC: 1)
  - [x] 1.1 Exécuter `npx shadcn@latest init` avec la configuration appropriée
  - [x] 1.2 Vérifier que `components.json` est créé correctement
  - [x] 1.3 Créer la fonction `cn()` dans `/src/lib/utils/cn.ts`
  - [x] 1.4 Installer les composants shadcn de base (Button, Card, Badge, Toast, Skeleton)

- [x] **Task 2: Configurer les design tokens** (AC: 2)
  - [x] 2.1 Définir la palette Slate monochrome dans `globals.css`
  - [x] 2.2 Configurer les couleurs sémantiques (success, warning, destructive)
  - [x] 2.3 Configurer la typographie Inter (via Next.js font optimization)
  - [x] 2.4 Définir le système d'espacement (base 4px)
  - [x] 2.5 Configurer les shadows et border-radius

- [x] **Task 3: Créer les composants de layout** (AC: 3)
  - [x] 3.1 Créer `MobileLayout` dans `/src/components/layout/mobile-layout.tsx`
  - [x] 3.2 Créer `PageHeader` dans `/src/components/layout/page-header.tsx`
  - [x] 3.3 Créer `BottomNavigation` dans `/src/components/custom/bottom-navigation.tsx`
  - [x] 3.4 Créer le dossier `/src/components/custom/` pour les composants métier

- [x] **Task 4: Valider le responsive et l'accessibilité** (AC: 4)
  - [x] 4.1 Tester sur viewports 320px, 375px, 768px, 1024px, 1920px
  - [x] 4.2 Vérifier les touch targets (min 44x44px)
  - [x] 4.3 Vérifier le contraste WCAG AA (4.5:1)
  - [x] 4.4 Vérifier que `npm run build` passe sans erreur

## Dev Notes

### Commande d'initialisation shadcn/ui

```bash
npx shadcn@latest init
```

**Réponses attendues :**
- Style: Default
- Base color: Slate
- CSS variables: Yes
- Tailwind config: tailwind.config.ts
- Components directory: @/components
- Utils directory: @/lib/utils
- React Server Components: Yes
- Write to components.json: Yes

### Installation des composants de base

```bash
npx shadcn@latest add button card badge toast skeleton sheet tabs input textarea select avatar dialog
```

### Palette de couleurs (CSS Variables)

```css
/* Palette principale — Slate Monochrome */
--primary: 222.2 47.4% 11.2%;          /* Slate 900 - #0F172A */
--primary-foreground: 0 0% 100%;        /* White */
--secondary: 210 40% 96.1%;             /* Slate 100 - #F1F5F9 */
--secondary-foreground: 222.2 47.4% 11.2%;
--accent: 215.4 16.3% 46.9%;            /* Slate 600 - #475569 */
--accent-foreground: 0 0% 100%;

/* Couleurs sémantiques */
--success: 160 84% 39%;                 /* Emerald 600 - #059669 */
--success-foreground: 0 0% 100%;
--warning: 32 95% 44%;                  /* Amber 600 - #D97706 */
--warning-foreground: 0 0% 100%;
--destructive: 346.8 77.2% 49.8%;       /* Rose 600 - #E11D48 */
--destructive-foreground: 0 0% 100%;

/* Surfaces */
--background: 0 0% 100%;                /* White */
--foreground: 222.2 47.4% 11.2%;        /* Slate 900 */
--card: 0 0% 100%;
--card-foreground: 222.2 47.4% 11.2%;
--muted: 210 40% 96.1%;                 /* Slate 100 */
--muted-foreground: 215.4 16.3% 46.9%;  /* Slate 500 - #64748B */
--border: 214.3 31.8% 91.4%;            /* Slate 200 - #E2E8F0 */
--input: 214.3 31.8% 91.4%;
--ring: 215.4 20.2% 65.1%;              /* Slate 400 - #94A3B8 */
```

### Typographie Inter

```typescript
// Dans layout.tsx, utiliser next/font
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
```

**Échelle typographique :**
| Token | Taille | Line Height | Weight | Usage |
|-------|--------|-------------|--------|-------|
| text-xs | 12px | 16px | 400 | Badges, labels |
| text-sm | 14px | 20px | 400 | Texte secondaire |
| text-base | 16px | 24px | 400 | Corps de texte |
| text-lg | 18px | 28px | 500 | Titres cards |
| text-xl | 20px | 28px | 600 | Titres sections |
| text-2xl | 24px | 32px | 600 | Titres écrans |

### Système d'espacement (base 4px)

Utiliser les classes Tailwind standard : `space-1` (4px), `space-2` (8px), `space-4` (16px), etc.

### Structure des composants

```
src/components/
├── ui/                     # shadcn/ui (installé automatiquement)
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   └── ...
├── custom/                 # Composants métier
│   └── bottom-navigation.tsx
└── layout/                 # Layouts partagés
    ├── mobile-layout.tsx
    └── page-header.tsx
```

### MobileLayout Component

```typescript
// src/components/layout/mobile-layout.tsx
interface MobileLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  showBottomNav?: boolean
}

export function MobileLayout({ children, header, showBottomNav = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {header && (
        <header className="sticky top-0 z-50 bg-background border-b border-border">
          {header}
        </header>
      )}
      <main className="flex-1 overflow-auto pb-16">
        {children}
      </main>
      {showBottomNav && <BottomNavigation />}
    </div>
  )
}
```

### PageHeader Component

```typescript
// src/components/layout/page-header.tsx
interface PageHeaderProps {
  title: string
  actions?: React.ReactNode
  showBack?: boolean
  onBack?: () => void
}

export function PageHeader({ title, actions, showBack, onBack }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between h-14 px-4">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={onBack}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Retour"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
```

### BottomNavigation Component

```typescript
// src/components/custom/bottom-navigation.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { href: '/offers', label: 'Offres', icon: <Package className="h-5 w-5" /> },
  { href: '/requests', label: 'Demandes', icon: <MessageSquare className="h-5 w-5" /> },
  { href: '/profile', label: 'Profil', icon: <User className="h-5 w-5" /> },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-2',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

### Fonction utilitaire cn()

```typescript
// src/lib/utils/cn.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Dépendances requises :**
```bash
npm install clsx tailwind-merge
```

### Icônes (Lucide React)

```bash
npm install lucide-react
```

Utiliser les icônes Lucide pour tous les éléments visuels :
- `Package` - Offres
- `MessageSquare` - Demandes
- `User` - Profil
- `ChevronLeft` - Retour
- etc.

### Project Structure Notes

- Les composants shadcn/ui sont copiés dans `/src/components/ui/` (pas de dépendance npm)
- Les composants métier vont dans `/src/components/custom/`
- Les layouts partagés vont dans `/src/components/layout/`
- Utiliser l'alias `@/` pour tous les imports

### Architecture Compliance

**Références Architecture:**
- [Source: architecture.md#Design System Choice - shadcn/ui + Tailwind CSS]
- [Source: architecture.md#Implementation Patterns & Consistency Rules]
- [Source: ux-design-specification.md#Design System Foundation]
- [Source: project-context.md#Naming Conventions]

**Patterns à respecter:**
- Components: `PascalCase` (ex: `MobileLayout`)
- Files: `kebab-case.tsx` (ex: `mobile-layout.tsx`)
- CSS Variables: préfixées avec `--` dans `:root`
- Touch targets: minimum 44x44px (`min-w-[44px] min-h-[44px]`)

### Testing Requirements

- Vérification que `npm run build` compile sans erreur
- Vérification que `npm run lint` passe sans erreur
- Test visuel sur mobile (375px) et desktop (1024px+)
- Test des touch targets (44x44px minimum)
- Test du contraste WCAG AA

### Accessibilité

- `role="navigation"` sur BottomNavigation avec `aria-label`
- `aria-current="page"` sur l'item actif
- `aria-label` sur les boutons sans texte visible
- Focus visible sur tous les éléments interactifs
- Contraste minimum 4.5:1 (palette Slate garantit AAA sur primary)

### Dependencies à installer

```bash
# shadcn/ui dependencies (installées automatiquement)
# clsx, tailwind-merge, class-variance-authority

# Icônes
npm install lucide-react

# Si pas déjà installé
npm install clsx tailwind-merge
```

## References

- [Source: _bmad-output/planning-artifacts/architecture.md#Design System Choice]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design System Foundation]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Visual Design Foundation]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2]
- [Source: _bmad-output/project-context.md#File Structure Reference]

## Previous Story Intelligence

### Learnings from Story 1.1

- **Prisma 6.x** utilisé (pas 7.x) pour compatibilité avec le pattern singleton
- **Next.js 16.1.6** avec Tailwind CSS 4 déjà configuré
- **QueryClientProvider** déjà en place dans le layout racine
- Structure de base créée : `src/app/`, `src/lib/supabase/`, `src/lib/prisma/`
- Le projet utilise l'alias `@/*` pour tous les imports internes

### Files Created in Previous Story

- `src/app/layout.tsx` - À modifier pour ajouter la font Inter
- `src/app/providers.tsx` - QueryClientProvider déjà configuré
- `src/app/globals.css` - À remplacer avec les design tokens
- `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts` - Déjà créés
- `src/lib/prisma/client.ts` - Singleton Prisma déjà créé

### Key Patterns Established

- Import alias: `@/*` → `./src/*`
- TypeScript strict mode activé
- Server Components par défaut (`"use client"` uniquement si nécessaire)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- shadcn/ui v3.8.2 initialisé avec Tailwind CSS v4 (format OKLCH)
- Composants installés via `npx shadcn@latest add` - 12 fichiers générés
- sonner utilisé au lieu de toast (évolution shadcn/ui)

### Completion Notes List

- ✅ Task 1: shadcn/ui installé avec style "new-york", base color Slate, CSS variables activées
- ✅ Task 2: Design tokens configurés en OKLCH (Tailwind CSS v4), couleurs sémantiques (success, warning) ajoutées, Inter font configurée
- ✅ Task 3: MobileLayout, PageHeader, BottomNavigation créés avec accessibilité (aria-labels, role="navigation", min-h/w 44px pour touch targets)
- ✅ Task 4: `npm run build` et `npm run lint` passent sans erreur

### Change Log

- 2026-02-03: Story 1.2 implémentée - Design system shadcn/ui + composants layout
- 2026-02-03: Code Review - 9 issues identifiés et corrigés (3 HIGH, 4 MEDIUM, 2 LOW)

## Senior Developer Review (AI)

**Review Date:** 2026-02-03
**Review Outcome:** Approved (after fixes)
**Total Action Items:** 9 (9 resolved)

### Action Items

- [x] [HIGH] Aucun test écrit - Framework vitest configuré + 20 tests créés
- [x] [HIGH] PageHeader onBack undefined - Ajouté router.back() par défaut
- [x] [HIGH] Routes hardcodées 404 - Créé pages placeholder /offers, /requests, /profile
- [x] [MEDIUM] Aucun framework de test - Vitest + testing-library configurés
- [x] [MEDIUM] Missing focus-visible - Ajouté sur BottomNavigation links
- [x] [MEDIUM] next-themes non utilisé - Conservé pour future implémentation dark mode
- [x] [MEDIUM] File List mismatch - Documentation corrigée (sonner.tsx au lieu de toast.tsx)
- [x] [LOW] Geist_Mono importé - Conservé pour code blocks éventuels
- [x] [LOW] MobileLayout pattern - Acceptable en Next.js 15

### File List

**Fichiers créés:**
- `components.json` - Configuration shadcn/ui
- `src/components/ui/button.tsx` - Composant Button shadcn
- `src/components/ui/card.tsx` - Composant Card shadcn
- `src/components/ui/badge.tsx` - Composant Badge shadcn
- `src/components/ui/sonner.tsx` - Composant Toast (Sonner)
- `src/components/ui/skeleton.tsx` - Composant Skeleton shadcn
- `src/components/ui/sheet.tsx` - Composant Sheet shadcn
- `src/components/ui/tabs.tsx` - Composant Tabs shadcn
- `src/components/ui/input.tsx` - Composant Input shadcn
- `src/components/ui/textarea.tsx` - Composant Textarea shadcn
- `src/components/ui/select.tsx` - Composant Select shadcn
- `src/components/ui/avatar.tsx` - Composant Avatar shadcn
- `src/components/ui/dialog.tsx` - Composant Dialog shadcn
- `src/components/layout/mobile-layout.tsx` - Layout mobile principal
- `src/components/layout/page-header.tsx` - Header de page
- `src/components/custom/bottom-navigation.tsx` - Navigation bottom
- `src/lib/utils/cn.ts` - Fonction utilitaire cn()
- `src/lib/utils.ts` - Re-export de cn pour compatibilité

**Fichiers modifiés:**
- `src/app/layout.tsx` - Inter font + Toaster ajoutés
- `src/app/globals.css` - Design tokens OKLCH avec couleurs sémantiques

**Routes placeholder (Code Review fix):**
- `src/app/offers/page.tsx` - Page Offres placeholder
- `src/app/requests/page.tsx` - Page Demandes placeholder
- `src/app/profile/page.tsx` - Page Profil placeholder

**Tests (Code Review fix):**
- `vitest.config.ts` - Configuration Vitest
- `vitest.setup.ts` - Setup testing-library
- `src/components/layout/page-header.test.tsx` - Tests PageHeader (7 tests)
- `src/components/layout/mobile-layout.test.tsx` - Tests MobileLayout (7 tests)
- `src/components/custom/bottom-navigation.test.tsx` - Tests BottomNavigation (6 tests)

**Dépendances ajoutées:**
- lucide-react, clsx, tailwind-merge, class-variance-authority, sonner, tw-animate-css, @radix-ui/*
- vitest, @testing-library/react, @testing-library/dom, @testing-library/jest-dom, @vitejs/plugin-react, jsdom
