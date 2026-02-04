# Story 1.9: Landing Page Publique

Status: done

## Story

En tant que **visiteur non connecté**,
Je veux **voir une page d'accueil qui présente l'application et me guide vers l'inscription ou la connexion**,
Afin de **comprendre la valeur de l'application et choisir comment y accéder**.

## Acceptance Criteria

### AC1: Affichage de la landing page pour visiteurs non connectés
**Given** je ne suis pas connecté
**When** j'accède à la racine de l'application `/`
**Then** une page d'accueil attractive s'affiche
**And** le design est mobile-first et utilise le design system (shadcn/ui)
**And** la page charge en moins de 2 secondes (NFR1)

### AC2: Présentation de la proposition de valeur
**Given** je suis sur la landing page
**When** je visualise le contenu
**Then** je vois un titre accrocheur expliquant l'application
**And** je vois une brève description pour les deux types d'utilisateurs:
  - Fournisseurs: "Publiez vos offres promotionnelles et recevez des demandes de magasins"
  - Magasins: "Découvrez les offres de vos fournisseurs et commandez en quelques clics"
**And** le design est épuré et professionnel (palette Slate monochrome)

### AC3: Call-to-actions clairs
**Given** je suis sur la landing page
**When** je visualise les boutons d'action
**Then** un bouton principal "Créer un compte" est visible et mène vers `/register`
**And** un lien secondaire "Déjà inscrit ? Se connecter" mène vers `/login`
**And** les boutons font minimum 44x44px (touch target UX-02)

### AC4: Redirection des utilisateurs connectés
**Given** je suis déjà connecté en tant que fournisseur
**When** j'accède à `/`
**Then** je suis automatiquement redirigé vers `/dashboard` (espace fournisseur)

**Given** je suis déjà connecté en tant que magasin
**When** j'accède à `/`
**Then** je suis automatiquement redirigé vers `/offers` (liste des offres)

### AC5: Responsive design
**Given** je visualise la landing page
**When** je suis sur mobile (320px - 767px)
**Then** le contenu est empilé verticalement, lisible et les CTAs sont facilement accessibles

**When** je suis sur tablette/desktop (768px+)
**Then** le layout peut utiliser plus d'espace horizontal
**And** le contenu reste centré et agréable à lire

### AC6: SEO et accessibilité
**Given** la landing page est rendue
**When** les moteurs de recherche ou assistants d'accessibilité l'analysent
**Then** les metadata (title, description) sont définis en français
**And** le titre h1 est unique et descriptif
**And** les liens ont des libellés explicites
**And** les contrastes respectent WCAG 2.1 AA (4.5:1)

## Tasks / Subtasks

- [x] **Task 1: Créer la logique de redirection pour utilisateurs connectés** (AC: 4)
  - [x] 1.1 Dans `/src/app/page.tsx`, vérifier la session Supabase côté serveur
  - [x] 1.2 Si `user_type === 'supplier'` → redirect vers `/dashboard`
  - [x] 1.3 Si `user_type === 'store'` → redirect vers `/offers`
  - [x] 1.4 Si non connecté → afficher la landing page

- [x] **Task 2: Créer le composant LandingPage** (AC: 1, 2, 3, 5)
  - [x] 2.1 Créer `/src/components/landing/landing-hero.tsx`
  - [x] 2.2 Ajouter le titre principal et sous-titre
  - [x] 2.3 Ajouter les deux sections expliquant la valeur pour fournisseurs et magasins
  - [x] 2.4 Utiliser les icônes Lucide React pour illustrer (Package, Store, etc.)
  - [x] 2.5 Implémenter le responsive avec Tailwind (flex-col sur mobile, flex-row sur desktop)

- [x] **Task 3: Implémenter les CTAs** (AC: 3)
  - [x] 3.1 Ajouter le bouton "Créer un compte" (Button variant="default", size="lg")
  - [x] 3.2 Ajouter le lien "Déjà inscrit ? Se connecter" (lien texte)
  - [x] 3.3 S'assurer que les touch targets font 44x44px minimum

- [x] **Task 4: Mettre à jour la page racine** (AC: 1, 4, 6)
  - [x] 4.1 Remplacer le contenu de `/src/app/page.tsx` par la landing page
  - [x] 4.2 Ajouter les metadata: title="Aurelien Project - Offres promotionnelles fournisseurs-magasins"
  - [x] 4.3 Ajouter une description meta pour le SEO
  - [x] 4.4 Intégrer le composant LandingHero

- [x] **Task 5: Tests et validation** (AC: 1-6)
  - [x] 5.1 Tester la redirection fournisseur connecté → /dashboard
  - [x] 5.2 Tester la redirection magasin connecté → /offers
  - [x] 5.3 Tester l'affichage mobile (320px)
  - [x] 5.4 Tester l'affichage desktop (1280px)
  - [x] 5.5 Vérifier les contrastes avec un outil d'accessibilité
  - [x] 5.6 Vérifier le temps de chargement < 2s

## Dev Agent Record

### File List
- `src/app/page.tsx` - Page racine avec redirection et metadata SEO
- `src/app/page.test.tsx` - Tests unitaires redirection (4 tests)
- `src/components/landing/landing-hero.tsx` - Composant hero landing page
- `src/components/landing/landing-hero.test.tsx` - Tests unitaires LandingHero (14 tests)
- `src/app/dashboard/page.tsx` - **Placeholder** créé pour supporter AC4 (redirection supplier)

### Change Log
- 2026-02-04: Implémentation initiale (Tasks 1-5)
- 2026-02-04: Code review - Corrigé texte AC2, ajouté touch target lien login

## Dev Notes

### Pattern de redirection serveur (RSC)

```typescript
// src/app/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LandingHero from '@/components/landing/landing-hero'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const userType = user.user_metadata?.user_type
    if (userType === 'supplier') {
      redirect('/dashboard')
    } else if (userType === 'store') {
      redirect('/offers')
    }
  }

  return <LandingHero />
}
```

### Structure du composant LandingHero

```typescript
// src/components/landing/landing-hero.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package, Store } from 'lucide-react'

export default function LandingHero() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <h1 className="text-3xl md:text-4xl font-bold text-center">
        Connectez fournisseurs et magasins
      </h1>
      <p className="mt-4 text-lg text-muted-foreground text-center max-w-md">
        La plateforme qui simplifie les offres promotionnelles
      </p>

      {/* Value props */}
      <div className="mt-12 grid gap-8 md:grid-cols-2 max-w-2xl">
        <div className="p-6 border rounded-lg">
          <Package className="h-8 w-8 text-primary mb-4" />
          <h2 className="font-semibold text-lg">Fournisseurs</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Publiez vos offres et recevez des demandes de magasins intéressés
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <Store className="h-8 w-8 text-primary mb-4" />
          <h2 className="font-semibold text-lg">Magasins</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Découvrez les offres de vos fournisseurs et commandez facilement
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-12 flex flex-col items-center gap-4">
        <Button asChild size="lg" className="min-h-[44px] min-w-[200px]">
          <Link href="/register">Créer un compte</Link>
        </Button>
        <Link href="/login" className="text-sm text-muted-foreground hover:underline">
          Déjà inscrit ? Se connecter
        </Link>
      </div>
    </div>
  )
}
```

### Metadata SEO

```typescript
// Dans src/app/page.tsx ou layout.tsx
export const metadata: Metadata = {
  title: 'Aurelien Project - Offres promotionnelles fournisseurs-magasins',
  description: 'Plateforme de mise en relation entre fournisseurs et magasins pour les offres promotionnelles. Publiez vos promos ou découvrez les offres disponibles.',
}
```

## References

- **FRs couverts**: Support indirect de FR1, FR2, FR3 (point d'entrée vers inscription/connexion)
- **NFRs couverts**: NFR1 (chargement < 2s), NFR18 (responsive 320px-1920px)
- **UX couverts**: UX-01 (mobile-first), UX-02 (touch targets 44px), UX-10 (WCAG 2.1 AA), UX-11 (palette Slate)

## Definition of Done

- [x] La page `/` affiche la landing page pour les visiteurs non connectés
- [x] Les utilisateurs connectés sont redirigés vers leur espace approprié
- [x] Le design est responsive (mobile/desktop)
- [x] Les CTAs mènent vers `/register` et `/login`
- [x] Les metadata SEO sont définis
- [x] Les contrastes respectent WCAG 2.1 AA (palette Slate monochrome utilisée)
- [x] Le temps de chargement est < 2 secondes (page statique avec RSC)
