---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
workflowStatus: 'complete'
completedAt: '2026-02-03'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
project_name: 'aurelien-project'
user_name: 'Youssef'
date: '2026-02-03'
---

# aurelien-project - Epic Breakdown

## Overview

Ce document fournit le découpage complet en epics et stories pour aurelien-project, décomposant les exigences du PRD, de l'UX Design et de l'Architecture en stories implémentables.

## Requirements Inventory

### Functional Requirements

**Gestion des comptes utilisateurs (FR1-FR5)**
- FR1: Un fournisseur peut créer un compte avec ses informations professionnelles (nom entreprise, email, téléphone)
- FR2: Un magasin peut créer un compte avec ses informations (nom magasin, enseigne, email, adresse/ville, téléphone)
- FR3: Un utilisateur (fournisseur ou magasin) peut se connecter à son compte
- FR4: Un utilisateur (fournisseur ou magasin) peut se déconnecter de son compte
- FR5: Un utilisateur peut réinitialiser son mot de passe via un lien envoyé par email

**Gestion des offres - Fournisseur (FR6-FR11)**
- FR6: Un fournisseur peut créer une offre promotionnelle avec les informations obligatoires (nom produit, prix promo, remise %, dates de validité)
- FR7: Un fournisseur peut enrichir une offre avec des informations complémentaires (catégorie, photo, marge, volume estimé, conditions commerciales, animations prévues)
- FR8: Un fournisseur peut modifier une offre existante
- FR9: Un fournisseur peut supprimer une offre existante
- FR10: Un fournisseur peut consulter la liste de ses propres offres
- FR11: Un fournisseur peut voir le statut de ses offres (active, expirée)

**Découverte des offres - Magasin (FR12-FR17)**
- FR12: Un magasin peut consulter la liste de toutes les offres disponibles
- FR13: Un magasin peut filtrer les offres par catégorie
- FR14: Un magasin peut filtrer les offres par date de validité
- FR15: Un magasin peut filtrer les offres par fournisseur
- FR16: Un magasin peut filtrer les offres par enseigne compatible
- FR17: Un magasin peut voir le détail complet d'une offre

**Interactions Magasin → Fournisseur (FR18-FR22)**
- FR18: Un magasin peut envoyer une "Demande de renseignements" sur une offre
- FR19: Un magasin peut envoyer une intention "Souhaite passer commande" sur une offre
- FR20: Un magasin peut ajouter un message personnalisé à sa demande
- FR21: Un magasin peut consulter l'historique de ses demandes envoyées
- FR22: Un magasin peut voir le statut de ses demandes (en attente, répondu)

**Gestion des demandes - Fournisseur (FR23-FR27)**
- FR23: Un fournisseur peut voir les demandes reçues sur ses offres
- FR24: Un fournisseur peut voir les informations du magasin demandeur (nom, enseigne, ville, contact)
- FR25: Un fournisseur peut marquer une demande comme traitée
- FR26: Un fournisseur peut filtrer ses demandes par type (renseignements / commande)
- FR27: Un fournisseur peut filtrer ses demandes par statut (nouveau, traité)

**Notifications (FR28-FR31)**
- FR28: Un fournisseur reçoit une notification in-app quand un magasin envoie une demande sur son offre
- FR29: Un fournisseur reçoit une notification email quand un magasin envoie une demande sur son offre
- FR30: Un utilisateur peut voir ses notifications non lues
- FR31: Un utilisateur peut marquer une notification comme lue

**Isolation des données (FR32-FR34)**
- FR32: Un fournisseur ne peut voir que ses propres offres et les demandes associées
- FR33: Un magasin ne peut voir que ses propres demandes envoyées
- FR34: Les données commerciales sensibles (marges proposées) ne sont visibles que par les magasins, pas par les autres fournisseurs

### NonFunctional Requirements

**Performance (NFR1-NFR5)**
- NFR1: Temps de chargement initial < 2 secondes sur connexion 3G
- NFR2: Temps de réponse actions utilisateur < 500ms pour les interactions (clic, filtre, navigation)
- NFR3: Temps d'affichage liste offres < 1 seconde pour afficher 50 offres
- NFR4: Fluidité de l'interface < 16ms frame time (60fps minimum) lors du scroll ou des transitions
- NFR5: Taille du bundle PWA < 500KB pour le chargement initial

**Sécurité (NFR6-NFR11)**
- NFR6: Authentification avec tokens JWT avec expiration et refresh token sécurisé
- NFR7: Isolation des données - 100% des requêtes filtrées par tenant_id vérifié côté serveur
- NFR8: Chiffrement transit - HTTPS obligatoire (TLS 1.2+)
- NFR9: Chiffrement stockage - Données sensibles chiffrées au repos
- NFR10: Protection des marges - Marges visibles uniquement par les magasins, jamais exposées aux autres fournisseurs
- NFR11: Conformité RGPD - Consentement explicite, droit de suppression, données hébergées en France/EU

**Disponibilité (NFR12-NFR14)**
- NFR12: Uptime cible 99.5% disponibilité (hors maintenance planifiée)
- NFR13: Maintenance planifiée - Fenêtres hors heures ouvrées (avant 7h ou après 20h)
- NFR14: Récupération panne - RTO (Recovery Time Objective) < 4 heures

**Compatibilité Multi-devices (NFR15-NFR18)**
- NFR15: Navigateurs supportés - Chrome, Safari, Firefox (2 dernières versions majeures)
- NFR16: Devices supportés - Mobile (iOS/Android), Tablette, PC, Boîtiers magasin
- NFR17: PWA installable - Ajout à l'écran d'accueil fonctionnel sur mobile
- NFR18: Responsive design - Interface adaptée de 320px à 1920px de largeur

### Additional Requirements

**Exigences Architecture (Starter Template & Infrastructure)**
- ARCH-01: Initialisation avec create-next-app (Next.js 15, TypeScript, Tailwind, App Router, src directory)
- ARCH-02: Supabase PostgreSQL hébergé en région EU-Frankfurt pour conformité RGPD
- ARCH-03: Supabase Auth pour authentification JWT avec refresh tokens
- ARCH-04: Prisma ORM pour la gestion de la base de données et les migrations
- ARCH-05: shadcn/ui comme bibliothèque de composants UI
- ARCH-06: Supabase Realtime pour les notifications temps réel
- ARCH-07: Row Level Security (RLS) obligatoire pour l'isolation multi-tenant
- ARCH-08: Déploiement sur Vercel avec preview deployments
- ARCH-09: Server Actions pour toutes les mutations (pas d'API REST)
- ARCH-10: React Query (TanStack Query) pour la gestion du cache client
- ARCH-11: Pattern ActionResult<T> obligatoire pour toutes les Server Actions
- ARCH-12: Validation Zod côté client ET serveur

**Exigences UX Design**
- UX-01: Design mobile-first (320px à 1920px)
- UX-02: Touch targets minimum 44x44px sur mobile
- UX-03: Bottom navigation à 3 items (Offres, Demandes, Profil)
- UX-04: Layout basé sur des cards pour les offres (OfferCard component)
- UX-05: Filter chips horizontaux scrollables pour le filtrage
- UX-06: Toast notifications pour le feedback des actions
- UX-07: Skeleton loading states pendant le chargement
- UX-08: Pull-to-refresh pour actualisation des listes
- UX-09: Sheet (bottom) pour les panels mobiles
- UX-10: Accessibilité WCAG 2.1 AA (contraste 4.5:1, focus visible, ARIA labels)
- UX-11: Palette Slate monochrome avec couleurs sémantiques (success, warning, destructive)
- UX-12: Typographie Inter avec échelle cohérente
- UX-13: Espacements base 4px (système Tailwind)

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | Création compte fournisseur |
| FR2 | Epic 1 | Création compte magasin |
| FR3 | Epic 1 | Connexion |
| FR4 | Epic 1 | Déconnexion |
| FR5 | Epic 1 | Reset mot de passe |
| FR6 | Epic 2 | Création offre (champs obligatoires) |
| FR7 | Epic 2 | Enrichissement offre (champs optionnels) |
| FR8 | Epic 2 | Modification offre |
| FR9 | Epic 2 | Suppression offre |
| FR10 | Epic 2 | Liste des offres fournisseur |
| FR11 | Epic 2 | Statut des offres |
| FR12 | Epic 3 | Consultation liste offres |
| FR13 | Epic 3 | Filtre par catégorie |
| FR14 | Epic 3 | Filtre par date |
| FR15 | Epic 3 | Filtre par fournisseur |
| FR16 | Epic 3 | Filtre par enseigne |
| FR17 | Epic 3 | Détail offre |
| FR18 | Epic 4 | Demande de renseignements |
| FR19 | Epic 4 | Intention de commande |
| FR20 | Epic 4 | Message personnalisé |
| FR21 | Epic 4 | Historique demandes magasin |
| FR22 | Epic 4 | Statut demandes magasin |
| FR23 | Epic 5 | Liste demandes fournisseur |
| FR24 | Epic 5 | Infos magasin demandeur |
| FR25 | Epic 5 | Marquer demande traitée |
| FR26 | Epic 5 | Filtre par type demande |
| FR27 | Epic 5 | Filtre par statut demande |
| FR28 | Epic 6 | Notification in-app fournisseur |
| FR29 | Epic 6 | Notification email fournisseur |
| FR30 | Epic 6 | Liste notifications non lues |
| FR31 | Epic 6 | Marquer notification lue |
| FR32 | Epic 2 | Isolation données fournisseur |
| FR33 | Epic 4 | Isolation demandes magasin |
| FR34 | Epic 3 | Visibilité marges (magasins only) |

## Epic List

### Epic 1: Fondation Projet & Authentification
Les fournisseurs et magasins peuvent créer un compte, se connecter et gérer leur profil de manière sécurisée. Infrastructure complète du projet avec design system et authentification fonctionnelle.
**FRs couverts:** FR1, FR2, FR3, FR4, FR5
**NFRs couverts:** NFR6, NFR7, NFR8, NFR11
**ARCH couverts:** ARCH-01 à ARCH-12
**UX couverts:** UX-01 à UX-13

### Epic 2: Gestion des Offres Fournisseur
Un fournisseur peut publier, modifier et gérer ses offres promotionnelles avec toutes les informations nécessaires (nom, prix, remise, dates, catégorie, photo, marge, conditions).
**FRs couverts:** FR6, FR7, FR8, FR9, FR10, FR11, FR32
**NFRs couverts:** NFR1, NFR2, NFR3, NFR4

### Epic 3: Découverte des Offres Magasin
Un magasin peut consulter, filtrer et explorer les offres disponibles pour trouver les promotions pertinentes par catégorie, date, fournisseur ou enseigne.
**FRs couverts:** FR12, FR13, FR14, FR15, FR16, FR17, FR34
**NFRs couverts:** NFR1, NFR2, NFR3, NFR4, NFR5

### Epic 4: Interactions Magasin (Système de Demandes)
Un magasin peut exprimer son intérêt pour une offre via "Demande de renseignements" ou "Souhaite passer commande" et suivre l'historique de ses demandes.
**FRs couverts:** FR18, FR19, FR20, FR21, FR22, FR33

### Epic 5: Gestion des Demandes Fournisseur
Un fournisseur peut recevoir, consulter et traiter les demandes des magasins intéressés avec les informations de contact du magasin.
**FRs couverts:** FR23, FR24, FR25, FR26, FR27

### Epic 6: Système de Notifications
Les utilisateurs sont notifiés en temps réel (in-app et email) des événements importants comme les nouvelles demandes et peuvent gérer leurs notifications.
**FRs couverts:** FR28, FR29, FR30, FR31
**NFRs couverts:** NFR12, NFR13, NFR14

---

## Epic 1: Fondation Projet & Authentification

Les fournisseurs et magasins peuvent créer un compte, se connecter et gérer leur profil de manière sécurisée. Infrastructure complète du projet avec design system et authentification fonctionnelle.

### Story 1.1: Initialisation du Projet

En tant que développeur,
Je veux initialiser le projet avec le stack technique défini,
Afin de disposer d'une base de code fonctionnelle et configurée.

**Acceptance Criteria:**

**Given** aucun projet n'existe
**When** j'exécute la commande d'initialisation Next.js
**Then** un projet Next.js 15 est créé avec TypeScript, Tailwind CSS, App Router et src directory
**And** l'alias d'import `@/*` est configuré dans tsconfig.json

**Given** le projet Next.js est initialisé
**When** je configure Supabase
**Then** un projet Supabase est créé en région EU-Frankfurt
**And** les variables d'environnement sont configurées dans `.env.local`
**And** le fichier `.env.example` documente les variables requises

**Given** Supabase est configuré
**When** j'initialise Prisma
**Then** Prisma est installé avec le provider PostgreSQL
**And** la connexion à Supabase est configurée via DATABASE_URL
**And** le client Prisma singleton est créé dans `/lib/prisma/client.ts`

**Given** le projet est configuré
**When** j'installe les dépendances essentielles
**Then** React Query (TanStack Query), Zod, et React Hook Form sont installés
**And** le QueryClientProvider est configuré dans le layout racine

**Références:** ARCH-01, ARCH-02, ARCH-04, ARCH-10, ARCH-12

---

### Story 1.2: Fondation Design System

En tant que développeur,
Je veux configurer le design system avec shadcn/ui et les tokens de design,
Afin d'avoir une base UI cohérente et accessible.

**Acceptance Criteria:**

**Given** le projet Next.js est initialisé
**When** j'installe et configure shadcn/ui
**Then** le fichier `components.json` est créé avec la configuration
**And** les composants de base sont disponibles dans `/components/ui/`
**And** la fonction utilitaire `cn()` est créée dans `/lib/utils/cn.ts`

**Given** shadcn/ui est installé
**When** je configure les design tokens
**Then** les CSS variables sont définies dans `globals.css` (palette Slate monochrome)
**And** les couleurs sémantiques (success, warning, destructive) sont configurées
**And** la typographie Inter est configurée avec l'échelle définie

**Given** les tokens sont configurés
**When** je crée les composants de layout de base
**Then** `MobileLayout` est créé avec safe areas et structure header/content/bottom-nav
**And** `PageHeader` est créé avec titre et actions optionnelles
**And** `BottomNavigation` est créé avec 3 items (placeholder pour l'instant)

**Given** les composants de layout existent
**When** je vérifie le responsive design
**Then** l'interface s'adapte de 320px à 1920px
**And** les touch targets font minimum 44x44px sur mobile

**Références:** ARCH-05, UX-01 à UX-13

---

### Story 1.3: Schéma Base de Données & Configuration Auth

En tant que développeur,
Je veux créer le schéma de base de données pour les utilisateurs et configurer l'authentification,
Afin de supporter l'inscription et la connexion sécurisée.

**Acceptance Criteria:**

**Given** Prisma est configuré
**When** je crée le schéma pour les fournisseurs
**Then** la table `suppliers` existe avec les champs: id (UUID), email, company_name, phone, created_at, updated_at
**And** un index unique existe sur email

**Given** le schéma suppliers existe
**When** je crée le schéma pour les magasins
**Then** la table `stores` existe avec les champs: id (UUID), email, name, brand (enum: LECLERC, INTERMARCHE, SUPER_U, SYSTEME_U), city, phone, created_at, updated_at
**And** un index unique existe sur email

**Given** les schémas existent
**When** j'exécute la migration Prisma
**Then** les tables sont créées dans Supabase
**And** les types TypeScript sont générés

**Given** les tables existent
**When** je configure Supabase Auth
**Then** l'authentification email/password est activée
**And** les templates d'email sont configurés en français
**And** la région de stockage est EU

**Given** Supabase Auth est configuré
**When** je crée les policies RLS
**Then** chaque utilisateur ne peut lire/modifier que son propre profil
**And** les policies sont testées avec des utilisateurs différents

**Given** l'auth est configurée
**When** je crée le middleware d'authentification
**Then** `/middleware.ts` vérifie la session Supabase
**And** les routes protégées redirigent vers `/login` si non authentifié
**And** les route groups `(auth)`, `(supplier)`, `(store)` sont créés

**Références:** ARCH-03, ARCH-07, NFR6, NFR7, NFR8, NFR11

---

### Story 1.4: Inscription Fournisseur

En tant que fournisseur,
Je veux créer un compte avec mes informations professionnelles,
Afin d'accéder à la plateforme et publier mes offres.

**Acceptance Criteria:**

**Given** je suis sur la page d'inscription fournisseur `/register/supplier`
**When** je remplis le formulaire avec nom entreprise, email et téléphone
**Then** le formulaire valide les champs avec Zod (email valide, téléphone format français)
**And** les erreurs de validation s'affichent inline sous chaque champ

**Given** le formulaire est valide
**When** je soumets l'inscription
**Then** un compte Supabase Auth est créé avec l'email et mot de passe
**And** un profil fournisseur est créé dans la table `suppliers`
**And** un email de confirmation est envoyé

**Given** l'inscription réussit
**When** le compte est créé
**Then** un toast de succès s'affiche "Compte créé ! Vérifiez votre email."
**And** je suis redirigé vers la page de login

**Given** l'email existe déjà
**When** je tente de m'inscrire
**Then** un message d'erreur s'affiche "Cet email est déjà utilisé"
**And** le formulaire reste affiché avec les données saisies

**Given** une erreur serveur survient
**When** la création échoue
**Then** un toast d'erreur s'affiche avec un message explicite
**And** je peux réessayer sans perdre mes données

**Références:** FR1, ARCH-09, ARCH-11, ARCH-12

---

### Story 1.5: Inscription Magasin

En tant que chef de rayon,
Je veux créer un compte magasin avec les informations de mon point de vente,
Afin d'accéder aux offres promotionnelles des fournisseurs.

**Acceptance Criteria:**

**Given** je suis sur la page d'inscription magasin `/register/store`
**When** je remplis le formulaire avec nom magasin, enseigne (dropdown), email, ville et téléphone
**Then** le formulaire valide les champs avec Zod
**And** l'enseigne est sélectionnée parmi: Leclerc, Intermarché, Super U, Système U
**And** les erreurs de validation s'affichent inline

**Given** le formulaire est valide
**When** je soumets l'inscription
**Then** un compte Supabase Auth est créé
**And** un profil magasin est créé dans la table `stores` avec l'enseigne sélectionnée
**And** un email de confirmation est envoyé

**Given** l'inscription réussit
**When** le compte est créé
**Then** un toast de succès s'affiche
**And** je suis redirigé vers la page de login

**Given** l'email existe déjà
**When** je tente de m'inscrire
**Then** un message d'erreur s'affiche "Cet email est déjà utilisé"

**Références:** FR2, ARCH-09, ARCH-11, ARCH-12

---

### Story 1.6: Connexion Utilisateur

En tant qu'utilisateur (fournisseur ou magasin),
Je veux me connecter à mon compte,
Afin d'accéder à mon espace personnel.

**Acceptance Criteria:**

**Given** je suis sur la page de login `/login`
**When** je saisis mon email et mot de passe
**Then** le formulaire valide le format de l'email
**And** le mot de passe est masqué par défaut avec option d'affichage

**Given** les identifiants sont corrects
**When** je soumets le formulaire
**Then** la session Supabase Auth est créée avec JWT
**And** le refresh token est stocké de manière sécurisée

**Given** la connexion réussit
**When** mon profil est chargé
**Then** je suis redirigé vers `/dashboard` (fournisseur) ou `/offers` (magasin) selon mon rôle
**And** la bottom navigation affiche les items correspondant à mon rôle

**Given** les identifiants sont incorrects
**When** je soumets le formulaire
**Then** un message d'erreur s'affiche "Email ou mot de passe incorrect"
**And** le champ mot de passe est vidé
**And** je peux réessayer

**Given** mon compte n'est pas vérifié
**When** je tente de me connecter
**Then** un message m'invite à vérifier mon email
**And** un lien permet de renvoyer l'email de confirmation

**Références:** FR3, NFR6, ARCH-03

---

### Story 1.7: Déconnexion Utilisateur

En tant qu'utilisateur connecté,
Je veux me déconnecter de mon compte,
Afin de sécuriser mon accès sur un appareil partagé.

**Acceptance Criteria:**

**Given** je suis connecté
**When** j'accède à la page profil
**Then** un bouton "Se déconnecter" est visible

**Given** je clique sur "Se déconnecter"
**When** l'action est exécutée
**Then** la session Supabase Auth est invalidée
**And** les tokens sont supprimés du stockage local
**And** je suis redirigé vers la page de login

**Given** la déconnexion réussit
**When** j'essaie d'accéder à une page protégée
**Then** je suis redirigé vers `/login`

**Références:** FR4, ARCH-03

---

### Story 1.8: Réinitialisation Mot de Passe

En tant qu'utilisateur,
Je veux réinitialiser mon mot de passe si je l'ai oublié,
Afin de récupérer l'accès à mon compte.

**Acceptance Criteria:**

**Given** je suis sur la page de login
**When** je clique sur "Mot de passe oublié ?"
**Then** je suis redirigé vers `/forgot-password`

**Given** je suis sur la page forgot-password
**When** je saisis mon email et soumets
**Then** un email de réinitialisation est envoyé via Supabase Auth
**And** un message confirme "Si cet email existe, un lien de réinitialisation a été envoyé"
**And** le message est identique que l'email existe ou non (sécurité)

**Given** je reçois l'email de réinitialisation
**When** je clique sur le lien
**Then** je suis redirigé vers `/reset-password` avec le token dans l'URL

**Given** je suis sur la page reset-password avec un token valide
**When** je saisis un nouveau mot de passe et le confirme
**Then** le formulaire valide que les mots de passe correspondent
**And** le mot de passe respecte les critères de sécurité (min 8 caractères)

**Given** le nouveau mot de passe est valide
**When** je soumets le formulaire
**Then** le mot de passe est mis à jour dans Supabase Auth
**And** un toast de succès s'affiche
**And** je suis redirigé vers `/login`

**Given** le token est expiré ou invalide
**When** j'accède à la page reset-password
**Then** un message d'erreur s'affiche "Lien expiré ou invalide"
**And** un lien permet de demander un nouveau lien

**Références:** FR5, ARCH-03

---

### Story 1.9: Landing Page Publique

En tant que visiteur non connecté,
Je veux voir une page d'accueil qui présente l'application et me guide vers l'inscription ou la connexion,
Afin de comprendre la valeur de l'application et choisir comment y accéder.

**Acceptance Criteria:**

**Given** je ne suis pas connecté
**When** j'accède à la racine de l'application `/`
**Then** une page d'accueil attractive s'affiche avec la proposition de valeur
**And** un bouton "Créer un compte" mène vers `/register`
**And** un lien "Déjà inscrit ? Se connecter" mène vers `/login`

**Given** je suis déjà connecté en tant que fournisseur
**When** j'accède à `/`
**Then** je suis automatiquement redirigé vers `/dashboard`

**Given** je suis déjà connecté en tant que magasin
**When** j'accède à `/`
**Then** je suis automatiquement redirigé vers `/offers`

**Given** je visualise la landing page sur mobile
**When** l'écran fait entre 320px et 767px
**Then** le contenu est lisible et les CTAs font minimum 44x44px

**Références:** Support FR1, FR2, FR3, NFR1, NFR18, UX-01, UX-02, UX-10

---

## Epic 2: Gestion des Offres Fournisseur

Un fournisseur peut publier, modifier et gérer ses offres promotionnelles avec toutes les informations nécessaires (nom, prix, remise, dates, catégorie, photo, marge, conditions).

### Story 2.1: Schéma Offres & Page Liste Vide

En tant que développeur,
Je veux créer le schéma de données pour les offres et la page liste,
Afin de permettre aux fournisseurs de gérer leurs offres promotionnelles.

**Acceptance Criteria:**

**Given** le schéma Prisma existe
**When** j'ajoute le modèle Offer
**Then** la table `offers` est créée avec les champs:
- id (UUID), supplier_id (FK), name, promo_price (Decimal), discount_percent (Int)
- start_date, end_date, category (enum), subcategory (optional)
- photo_url (optional), margin (optional Decimal), volume (optional), conditions (optional text)
- animation (optional text), status (enum: DRAFT, ACTIVE, EXPIRED), created_at, updated_at
**And** un index existe sur supplier_id
**And** un index existe sur (status, start_date, end_date)

**Given** la table offers existe
**When** je crée les policies RLS
**Then** un fournisseur ne peut voir que ses propres offres (FR32)
**And** un fournisseur ne peut créer/modifier/supprimer que ses propres offres
**And** les policies sont testées

**Given** les RLS sont configurés
**When** j'accède à `/dashboard` en tant que fournisseur
**Then** la page affiche la liste de mes offres
**And** si aucune offre n'existe, un empty state s'affiche avec illustration
**And** le message dit "Publiez votre première offre pour la rendre visible aux magasins"
**And** un bouton CTA "Nouvelle offre" est visible

**Given** la page liste existe
**When** je clique sur le bouton "+" (FAB) ou "Nouvelle offre"
**Then** je suis redirigé vers `/offers/new`

**Références:** FR10, FR32, ARCH-04, ARCH-07, UX-04

---

### Story 2.2: Création d'Offre (Champs Obligatoires)

En tant que fournisseur,
Je veux créer une offre promotionnelle avec les informations essentielles,
Afin de la rendre visible aux magasins.

**Acceptance Criteria:**

**Given** je suis sur la page `/offers/new`
**When** la page se charge
**Then** un formulaire en étapes s'affiche avec un indicateur de progression (StepIndicator)
**And** l'étape 1 "Produit & Prix" est active

**Given** je suis à l'étape 1
**When** je remplis les champs obligatoires
**Then** je peux saisir: nom du produit, prix promo (décimal), remise en % (entier)
**And** la validation Zod vérifie que le prix > 0 et la remise entre 1 et 99
**And** les erreurs s'affichent inline

**Given** l'étape 1 est valide
**When** je clique sur "Suivant"
**Then** l'étape 2 "Dates de validité" s'affiche
**And** je peux sélectionner date de début et date de fin
**And** la date de fin doit être >= date de début
**And** la date de début doit être >= aujourd'hui

**Given** les étapes 1 et 2 sont complètes
**When** je clique sur "Publier"
**Then** une Server Action `createOffer` est appelée
**And** elle retourne `ActionResult<Offer>`
**And** l'offre est créée avec status ACTIVE

**Given** la création réussit
**When** l'offre est enregistrée
**Then** un toast de succès s'affiche "Offre publiée !"
**And** je suis redirigé vers `/offers` (liste)
**And** la nouvelle offre apparaît dans la liste

**Given** une erreur de validation serveur survient
**When** la création échoue
**Then** un toast d'erreur s'affiche avec le message
**And** je reste sur le formulaire avec mes données

**Given** je quitte le formulaire avant de publier
**When** j'ai saisi des données
**Then** un brouillon est sauvegardé automatiquement (localStorage)
**And** au retour sur `/offers/new`, mes données sont restaurées

**Références:** FR6, ARCH-09, ARCH-11, ARCH-12, UX-06

---

### Story 2.3: Enrichissement d'Offre (Champs Optionnels)

En tant que fournisseur,
Je veux enrichir mon offre avec des informations complémentaires,
Afin d'augmenter son attractivité auprès des magasins.

**Acceptance Criteria:**

**Given** je suis sur le formulaire de création d'offre
**When** j'ai complété les champs obligatoires (étapes 1-2)
**Then** une étape 3 "Détails" optionnelle est accessible
**And** je peux passer directement à "Publier" sans la remplir

**Given** je suis à l'étape 3 "Détails"
**When** je remplis les champs optionnels
**Then** je peux sélectionner une catégorie (Épicerie, Frais, DPH, Surgelés, Boissons, Autres)
**And** je peux saisir une sous-catégorie (texte libre)
**And** je peux saisir la marge proposée (décimal, %)
**And** je peux saisir le volume estimé (texte: "2 palettes", "50 colis")
**And** je peux saisir les conditions commerciales (textarea)
**And** je peux saisir l'animation prévue (textarea: "PLV tête de gondole", etc.)

**Given** je veux ajouter une photo
**When** je clique sur le bouton d'upload
**Then** je peux sélectionner une image depuis mon appareil
**And** l'image est uploadée vers Supabase Storage
**And** un aperçu de l'image s'affiche
**And** je peux supprimer l'image et en choisir une autre

**Given** j'ai rempli des champs optionnels
**When** je publie l'offre
**Then** tous les champs (obligatoires + optionnels) sont enregistrés
**And** la photo_url est stockée si une image a été uploadée

**Given** je modifie une offre existante
**When** j'accède à l'édition
**Then** les champs optionnels existants sont pré-remplis
**And** je peux les modifier ou les vider

**Références:** FR7, ARCH-09, UX-04

---

### Story 2.4: Liste des Offres Fournisseur

En tant que fournisseur,
Je veux voir la liste de mes offres avec leur statut,
Afin de gérer mon portefeuille promotionnel.

**Acceptance Criteria:**

**Given** je suis connecté en tant que fournisseur
**When** j'accède à `/offers` (via bottom nav ou dashboard)
**Then** la liste de MES offres uniquement s'affiche (FR32)
**And** les offres sont affichées sous forme de cards (OfferCard)
**And** les offres sont triées par date de création (plus récentes en premier)

**Given** des offres existent
**When** la liste se charge
**Then** chaque OfferCard affiche: photo (ou placeholder), nom produit, prix promo, remise %, dates
**And** un badge de statut est visible: "Active" (vert), "Expirée" (gris), "Brouillon" (orange)

**Given** une offre a une date de fin passée
**When** la liste se charge
**Then** le statut de l'offre est automatiquement "Expirée" (FR11)
**And** la card est visuellement atténuée (opacity réduite)

**Given** la liste contient plus de 10 offres
**When** je scroll
**Then** le scroll est fluide (60fps - NFR4)
**And** un skeleton loading s'affiche si les données chargent

**Given** je veux actualiser la liste
**When** j'effectue un pull-to-refresh
**Then** la liste est rechargée depuis le serveur
**And** un indicateur de chargement s'affiche pendant le refresh

**Given** je clique sur une OfferCard
**When** l'action est déclenchée
**Then** je suis redirigé vers `/offers/[id]` (détail de l'offre)

**Références:** FR10, FR11, FR32, NFR1, NFR2, NFR3, NFR4, UX-04, UX-07, UX-08

---

### Story 2.5: Modification d'Offre

En tant que fournisseur,
Je veux modifier une offre existante,
Afin de corriger ou mettre à jour ses informations.

**Acceptance Criteria:**

**Given** je suis sur le détail d'une de mes offres `/offers/[id]`
**When** la page se charge
**Then** toutes les informations de l'offre sont affichées
**And** un bouton "Modifier" est visible

**Given** je clique sur "Modifier"
**When** la page d'édition se charge `/offers/[id]/edit`
**Then** le formulaire est pré-rempli avec toutes les données existantes
**And** la même structure en étapes que la création est utilisée
**And** je peux naviguer entre les étapes

**Given** je modifie des champs
**When** je sauvegarde
**Then** une Server Action `updateOffer` est appelée
**And** elle vérifie que l'offre m'appartient (RLS + vérification serveur)
**And** elle retourne `ActionResult<Offer>`

**Given** la modification réussit
**When** l'offre est mise à jour
**Then** un toast de succès s'affiche "Offre modifiée"
**And** je suis redirigé vers le détail de l'offre
**And** les nouvelles données sont affichées

**Given** je tente de modifier une offre qui ne m'appartient pas
**When** la requête est envoyée
**Then** une erreur FORBIDDEN est retournée
**And** je suis redirigé vers ma liste d'offres

**Given** je modifie la photo
**When** j'uploade une nouvelle image
**Then** l'ancienne image est supprimée de Supabase Storage
**And** la nouvelle image est enregistrée

**Références:** FR8, FR32, ARCH-09, ARCH-11

---

### Story 2.6: Suppression d'Offre

En tant que fournisseur,
Je veux supprimer une offre,
Afin de retirer une promotion que je ne souhaite plus proposer.

**Acceptance Criteria:**

**Given** je suis sur le détail d'une de mes offres
**When** je clique sur "Supprimer"
**Then** une boîte de dialogue de confirmation s'affiche
**And** le message demande "Êtes-vous sûr de vouloir supprimer cette offre ?"
**And** deux boutons sont visibles: "Annuler" et "Supprimer"

**Given** la confirmation est affichée
**When** je clique sur "Annuler"
**Then** la boîte de dialogue se ferme
**And** aucune action n'est effectuée

**Given** la confirmation est affichée
**When** je clique sur "Supprimer"
**Then** une Server Action `deleteOffer` est appelée
**And** elle vérifie que l'offre m'appartient
**And** l'offre est supprimée (soft delete: deleted_at renseigné)
**And** si une photo existait, elle est supprimée de Supabase Storage

**Given** la suppression réussit
**When** l'offre est supprimée
**Then** un toast de succès s'affiche "Offre supprimée"
**And** je suis redirigé vers `/offers`
**And** l'offre n'apparaît plus dans la liste

**Given** des demandes existent sur cette offre
**When** je supprime l'offre
**Then** les demandes associées restent en base (pour historique)
**And** l'offre est marquée comme supprimée mais les demandes restent consultables

**Références:** FR9, FR32, ARCH-09, ARCH-11

---

## Epic 3: Découverte des Offres Magasin

Un magasin peut consulter, filtrer et explorer les offres disponibles pour trouver les promotions pertinentes par catégorie, date, fournisseur ou enseigne.

### Story 3.1: Liste des Offres Disponibles

En tant que chef de rayon,
Je veux voir la liste de toutes les offres promotionnelles disponibles,
Afin de découvrir les opportunités de mes fournisseurs.

**Acceptance Criteria:**

**Given** je suis connecté en tant que magasin
**When** j'accède à `/offers` (page d'accueil magasin via bottom nav)
**Then** la liste de TOUTES les offres actives de TOUS les fournisseurs s'affiche
**And** seules les offres avec status ACTIVE et date de fin >= aujourd'hui sont visibles
**And** les offres sont triées par date de création (plus récentes en premier)

**Given** des offres existent
**When** la liste se charge
**Then** chaque OfferCard affiche: photo (ou placeholder), nom produit, prix promo, remise %, fournisseur, catégorie
**And** les dates de validité sont affichées (format: "15 fév - 28 fév")
**And** un badge "Nouveau" apparaît sur les offres créées dans les 48h

**Given** je n'ai jamais vu une offre
**When** je la consulte pour la première fois
**Then** le badge "Nouveau" disparaît pour cette offre (stockage local)

**Given** la liste contient de nombreuses offres
**When** je scroll
**Then** le scroll est fluide (60fps - NFR4)
**And** les images sont chargées en lazy loading
**And** des skeletons s'affichent pendant le chargement initial

**Given** aucune offre n'est disponible
**When** la liste se charge
**Then** un empty state s'affiche avec message "Aucune offre disponible pour le moment"
**And** une illustration accompagne le message

**Given** je veux actualiser
**When** j'effectue un pull-to-refresh
**Then** la liste est rechargée
**And** les nouvelles offres apparaissent avec le badge "Nouveau"

**Given** le temps de chargement
**When** la page se charge sur connexion 3G
**Then** le contenu s'affiche en moins de 2 secondes (NFR1)
**And** la liste de 50 offres s'affiche en moins d'1 seconde (NFR3)

**Références:** FR12, NFR1, NFR2, NFR3, NFR4, NFR5, UX-04, UX-07, UX-08

---

### Story 3.2: Filtrage par Catégorie

En tant que chef de rayon,
Je veux filtrer les offres par catégorie,
Afin de voir uniquement les promotions pertinentes pour mon rayon.

**Acceptance Criteria:**

**Given** je suis sur la liste des offres
**When** la page se charge
**Then** une barre de FilterChips horizontale s'affiche en haut de la liste
**And** les chips disponibles sont: "Tout", "Épicerie", "Frais", "DPH", "Surgelés", "Boissons", "Autres"
**And** "Tout" est sélectionné par défaut

**Given** les FilterChips sont affichés
**When** je tape sur une catégorie (ex: "Épicerie")
**Then** le chip devient actif (style primary)
**And** la liste se filtre instantanément (< 500ms - NFR2)
**And** seules les offres de catégorie "Épicerie" s'affichent

**Given** un filtre est actif
**When** je tape sur "Tout"
**Then** le filtre est réinitialisé
**And** toutes les offres s'affichent à nouveau

**Given** j'ai sélectionné un filtre
**When** je quitte et reviens sur la page
**Then** mon filtre est mémorisé (persistance localStorage)
**And** la liste affiche directement les offres filtrées

**Given** un filtre est actif et aucune offre ne correspond
**When** la liste est filtrée
**Then** un empty state s'affiche "Aucune offre dans cette catégorie"
**And** un bouton "Voir toutes les offres" permet de réinitialiser

**Given** il y a plus de 6 catégories
**When** les chips dépassent la largeur de l'écran
**Then** la barre est scrollable horizontalement
**And** un indicateur visuel montre qu'il y a plus de chips

**Références:** FR13, NFR2, UX-05

---

### Story 3.3: Filtrage par Date et Fournisseur

En tant que chef de rayon,
Je veux filtrer les offres par date de validité et par fournisseur,
Afin d'affiner ma recherche selon mes besoins.

**Acceptance Criteria:**

**Given** je suis sur la liste des offres
**When** je clique sur l'icône de filtres avancés
**Then** un Sheet (bottom panel) s'ouvre avec les options de filtrage
**And** le Sheet contient: filtre par date, filtre par fournisseur

**Given** le Sheet de filtres est ouvert
**When** je sélectionne un filtre de date
**Then** je peux choisir parmi: "Cette semaine", "Ce mois", "Personnalisé"
**And** si "Personnalisé", un date picker permet de choisir une plage

**Given** je sélectionne "Cette semaine"
**When** j'applique le filtre
**Then** seules les offres dont les dates chevauchent la semaine en cours s'affichent
**And** le Sheet se ferme
**And** un indicateur montre qu'un filtre date est actif

**Given** le Sheet de filtres est ouvert
**When** je veux filtrer par fournisseur
**Then** une liste des fournisseurs ayant des offres actives s'affiche
**And** je peux sélectionner un ou plusieurs fournisseurs
**And** une barre de recherche permet de trouver un fournisseur par nom

**Given** j'ai sélectionné des filtres (date + fournisseur)
**When** je clique sur "Appliquer"
**Then** la liste est filtrée avec les deux critères combinés (AND)
**And** le Sheet se ferme
**And** un badge indique le nombre de filtres actifs

**Given** des filtres sont actifs
**When** je veux les réinitialiser
**Then** un bouton "Réinitialiser" dans le Sheet efface tous les filtres
**And** la liste affiche toutes les offres

**Given** j'ai des filtres actifs
**When** je quitte et reviens sur la page
**Then** mes filtres sont mémorisés (persistance localStorage)

**Références:** FR14, FR15, NFR2, UX-09

---

### Story 3.4: Filtrage par Enseigne Compatible

En tant que chef de rayon,
Je veux filtrer les offres compatibles avec mon enseigne,
Afin de voir uniquement les promotions que je peux commander.

**Acceptance Criteria:**

**Given** mon profil magasin a une enseigne définie (ex: Leclerc)
**When** j'accède à la liste des offres
**Then** par défaut, toutes les offres sont affichées (pas de filtre enseigne automatique)

**Given** le Sheet de filtres avancés est ouvert
**When** je consulte les options de filtre
**Then** un filtre "Enseigne compatible" est disponible
**And** les options sont: "Toutes", "Mon enseigne uniquement"

**Given** je sélectionne "Mon enseigne uniquement"
**When** j'applique le filtre
**Then** seules les offres compatibles avec mon enseigne s'affichent
**And** (Note: pour le MVP, toutes les offres sont compatibles avec toutes les enseignes - ce filtre prépare l'évolution future)

**Given** un fournisseur a marqué une offre comme exclusive à certaines enseignes (évolution future)
**When** le filtre "Mon enseigne" est actif
**Then** seules les offres incluant mon enseigne s'affichent

**Given** le filtre enseigne est actif
**When** je reviens sur la page
**Then** le filtre est mémorisé

**Références:** FR16, UX-09

---

### Story 3.5: Détail Complet d'une Offre

En tant que chef de rayon,
Je veux voir le détail complet d'une offre incluant la marge proposée,
Afin de prendre une décision d'achat éclairée.

**Acceptance Criteria:**

**Given** je suis sur la liste des offres
**When** je clique sur une OfferCard
**Then** je suis redirigé vers `/offers/[id]`
**And** la page de détail se charge

**Given** je suis sur la page de détail
**When** la page se charge
**Then** toutes les informations de l'offre sont affichées:
- Photo en grand (ou placeholder)
- Nom du produit
- Nom du fournisseur (avec possibilité de voir son profil)
- Prix promo et remise %
- **Marge proposée** (visible car je suis un magasin - FR34)
- Dates de validité
- Catégorie et sous-catégorie
- Volume estimé
- Conditions commerciales
- Animation prévue

**Given** l'offre a une marge renseignée
**When** je consulte le détail en tant que magasin
**Then** la marge est affichée clairement (ex: "Marge: 22%")
**And** cette information n'est JAMAIS visible par les autres fournisseurs (FR34)

**Given** je suis sur le détail
**When** je veux agir sur cette offre
**Then** deux boutons CTA sont visibles en bas de l'écran (fixed):
- "Demande de renseignements" (secondary)
- "Souhaite commander" (primary)
**And** les boutons font minimum 44x44px (touch target)

**Given** l'offre n'a pas de photo
**When** le détail s'affiche
**Then** un placeholder illustré est affiché à la place

**Given** je veux revenir à la liste
**When** je clique sur le bouton retour (header)
**Then** je reviens à la liste avec mes filtres préservés
**And** ma position de scroll est restaurée

**Given** l'offre a expiré entre-temps
**When** j'accède au détail
**Then** un bandeau "Offre expirée" s'affiche
**And** les boutons CTA sont désactivés

**Références:** FR17, FR34, UX-02, UX-04

---

## Epic 4: Interactions Magasin (Système de Demandes)

Un magasin peut exprimer son intérêt pour une offre via "Demande de renseignements" ou "Souhaite passer commande" et suivre l'historique de ses demandes.

### Story 4.1: Schéma Demandes & Envoi Demande de Renseignements

En tant que chef de rayon,
Je veux envoyer une demande de renseignements sur une offre,
Afin d'obtenir plus d'informations avant de commander.

**Acceptance Criteria:**

**Given** le schéma Prisma existe
**When** j'ajoute le modèle Request
**Then** la table `requests` est créée avec les champs:
- id (UUID), store_id (FK), offer_id (FK), supplier_id (FK dénormalisé pour performance)
- type (enum: INFO, ORDER), message (optional text)
- status (enum: PENDING, TREATED), created_at, updated_at
**And** un index existe sur store_id
**And** un index existe sur supplier_id
**And** un index existe sur offer_id

**Given** la table requests existe
**When** je crée les policies RLS
**Then** un magasin ne peut voir que ses propres demandes (FR33)
**And** un magasin peut créer des demandes sur n'importe quelle offre active
**And** un magasin ne peut pas modifier/supprimer ses demandes une fois envoyées

**Given** je suis sur le détail d'une offre
**When** je clique sur "Demande de renseignements"
**Then** un Sheet (bottom panel) s'ouvre
**And** le type INFO est pré-sélectionné
**And** un champ textarea permet d'ajouter un message optionnel (FR20)
**And** un placeholder suggère: "Précisez votre question (optionnel)"

**Given** le Sheet est ouvert
**When** je clique sur "Envoyer"
**Then** une Server Action `createRequest` est appelée
**And** elle crée une demande avec type=INFO et status=PENDING
**And** elle retourne `ActionResult<Request>`

**Given** l'envoi réussit
**When** la demande est créée
**Then** le Sheet se ferme
**And** un toast de succès s'affiche "Demande envoyée à [Fournisseur]"
**And** un feedback haptique (vibration courte) confirme l'action
**And** sur la page détail, un badge "Demandé" apparaît

**Given** j'ai déjà envoyé une demande INFO sur cette offre
**When** je retourne sur le détail de l'offre
**Then** le bouton "Demande de renseignements" est remplacé par "Demande envoyée" (désactivé)
**And** je peux toujours envoyer une intention de commande

**Given** une erreur survient
**When** l'envoi échoue
**Then** un toast d'erreur s'affiche
**And** le Sheet reste ouvert avec mon message préservé
**And** je peux réessayer

**Références:** FR18, FR20, FR33, ARCH-04, ARCH-07, ARCH-09, ARCH-11, UX-06, UX-09

---

### Story 4.2: Envoi Intention de Commande

En tant que chef de rayon,
Je veux exprimer mon intention de passer commande sur une offre,
Afin que le fournisseur me contacte pour finaliser.

**Acceptance Criteria:**

**Given** je suis sur le détail d'une offre
**When** je clique sur "Souhaite commander"
**Then** un Sheet (bottom panel) s'ouvre
**And** le type ORDER est pré-sélectionné
**And** un champ textarea permet d'ajouter un message optionnel (FR20)
**And** un placeholder suggère: "Précisez quantité ou conditions (optionnel)"

**Given** le Sheet est ouvert
**When** je clique sur "Envoyer"
**Then** une Server Action `createRequest` est appelée
**And** elle crée une demande avec type=ORDER et status=PENDING
**And** elle retourne `ActionResult<Request>`

**Given** l'envoi réussit
**When** la demande est créée
**Then** le Sheet se ferme
**And** un toast de succès s'affiche "Intention de commande envoyée !"
**And** un feedback haptique confirme l'action
**And** sur la page détail, un badge "Commandé" apparaît (priorité sur "Demandé")

**Given** j'ai déjà envoyé une intention ORDER sur cette offre
**When** je retourne sur le détail de l'offre
**Then** le bouton "Souhaite commander" est remplacé par "Commande envoyée" (désactivé)
**And** le bouton "Demande de renseignements" reste disponible si non utilisé

**Given** je veux commander rapidement
**When** je suis familier avec le fournisseur
**Then** je peux envoyer sans message (le champ est optionnel)
**And** l'envoi prend moins de 3 secondes (2 taps: bouton + confirmer)

**Given** l'offre a expiré
**When** je tente d'envoyer une demande
**Then** une erreur s'affiche "Cette offre n'est plus disponible"
**And** aucune demande n'est créée

**Références:** FR19, FR20, ARCH-09, ARCH-11, UX-06

---

### Story 4.3: Historique des Demandes Magasin

En tant que chef de rayon,
Je veux consulter l'historique de mes demandes envoyées,
Afin de suivre mes interactions avec les fournisseurs.

**Acceptance Criteria:**

**Given** je suis connecté en tant que magasin
**When** j'accède à "Mes demandes" via la bottom navigation
**Then** la page `/my-requests` s'affiche
**And** la liste de MES demandes uniquement s'affiche (FR33)
**And** les demandes sont triées par date (plus récentes en premier)

**Given** des demandes existent
**When** la liste se charge
**Then** chaque demande affiche:
- Nom de l'offre concernée
- Nom du fournisseur
- Type de demande (badge: "Renseignements" ou "Commande")
- Statut (badge: "En attente" jaune ou "Traité" vert) (FR22)
- Date d'envoi (format relatif: "il y a 2h", "hier")

**Given** une demande a le statut PENDING
**When** elle s'affiche
**Then** le badge "En attente" est visible (couleur warning)

**Given** une demande a le statut TREATED
**When** elle s'affiche
**Then** le badge "Traité" est visible (couleur success)
**And** cela signifie que le fournisseur a pris en compte ma demande

**Given** je clique sur une demande
**When** l'action est déclenchée
**Then** je suis redirigé vers `/my-requests/[id]`
**And** le détail de la demande s'affiche:
- Toutes les infos de l'offre
- Mon message (si j'en ai envoyé un)
- Statut actuel
- Date d'envoi

**Given** aucune demande n'existe
**When** la liste se charge
**Then** un empty state s'affiche "Vous n'avez pas encore envoyé de demande"
**And** un CTA "Découvrir les offres" redirige vers `/offers`

**Given** je veux actualiser la liste
**When** j'effectue un pull-to-refresh
**Then** la liste est rechargée
**And** les statuts mis à jour par les fournisseurs apparaissent

**Given** le nombre de demandes augmente
**When** la liste contient plus de 20 demandes
**Then** le scroll reste fluide
**And** une pagination ou infinite scroll est implémentée si nécessaire

**Références:** FR21, FR22, FR33, UX-07, UX-08

---

## Epic 5: Gestion des Demandes Fournisseur

Un fournisseur peut recevoir, consulter et traiter les demandes des magasins intéressés avec les informations de contact du magasin.

### Story 5.1: Liste des Demandes Reçues

En tant que fournisseur,
Je veux voir les demandes reçues sur mes offres avec les informations des magasins,
Afin de traiter les demandes et contacter les magasins intéressés.

**Acceptance Criteria:**

**Given** les policies RLS existent pour requests
**When** je les étends pour les fournisseurs
**Then** un fournisseur peut voir les demandes sur SES offres uniquement
**And** un fournisseur peut modifier le statut des demandes sur ses offres
**And** un fournisseur ne peut pas supprimer les demandes

**Given** je suis connecté en tant que fournisseur
**When** j'accède à "Demandes" via la bottom navigation
**Then** la page `/requests` s'affiche
**And** la liste des demandes reçues sur MES offres s'affiche (FR23)
**And** les demandes sont triées par date (plus récentes en premier)

**Given** des demandes existent
**When** la liste se charge
**Then** chaque RequestCard affiche:
- Nom du magasin demandeur (FR24)
- Enseigne du magasin (badge: Leclerc, Intermarché, etc.) (FR24)
- Ville du magasin (FR24)
- Type de demande (badge: "Renseignements" bleu ou "Commande" vert)
- Nom de l'offre concernée
- Date de réception (format relatif: "il y a 2h")
- Statut (badge: "Nouveau" ou "Traité")

**Given** une demande a le statut PENDING
**When** elle s'affiche
**Then** le badge "Nouveau" est visible (couleur accent)
**And** la card a un fond légèrement mis en évidence

**Given** une demande a le statut TREATED
**When** elle s'affiche
**Then** le badge "Traité" est visible (couleur muted)
**And** la card a une opacité réduite

**Given** je clique sur une RequestCard
**When** l'action est déclenchée
**Then** je suis redirigé vers `/requests/[id]`
**And** le détail complet de la demande s'affiche

**Given** je suis sur le détail d'une demande
**When** la page se charge
**Then** je vois toutes les informations du magasin:
- Nom du magasin
- Enseigne
- Ville
- Email de contact (FR24)
- Téléphone de contact (FR24)
**And** je vois les détails de la demande:
- Offre concernée (avec lien vers le détail)
- Type de demande
- Message du magasin (si présent)
- Date de réception
- Statut actuel

**Given** aucune demande n'existe
**When** la liste se charge
**Then** un empty state s'affiche "Les demandes de vos clients apparaîtront ici"
**And** un message encourage "Publiez des offres pour recevoir des demandes"

**Références:** FR23, FR24, UX-04, UX-07

---

### Story 5.2: Filtrage des Demandes

En tant que fournisseur,
Je veux filtrer mes demandes par type et par statut,
Afin de prioriser mon traitement.

**Acceptance Criteria:**

**Given** je suis sur la liste des demandes
**When** la page se charge
**Then** une barre de FilterChips s'affiche en haut
**And** deux groupes de filtres sont disponibles:
- Type: "Tous", "Renseignements", "Commandes"
- Statut: "Tous", "Nouveaux", "Traités"

**Given** les FilterChips sont affichés
**When** je tape sur "Commandes" (type)
**Then** seules les demandes de type ORDER s'affichent (FR26)
**And** le chip devient actif
**And** le filtrage est instantané (< 500ms)

**Given** les FilterChips sont affichés
**When** je tape sur "Nouveaux" (statut)
**Then** seules les demandes avec status PENDING s'affichent (FR27)
**And** le chip devient actif

**Given** je combine les filtres
**When** je sélectionne "Commandes" + "Nouveaux"
**Then** seules les demandes de type ORDER ET status PENDING s'affichent
**And** les deux chips sont actifs

**Given** des filtres sont actifs
**When** je tape sur "Tous" dans un groupe
**Then** le filtre de ce groupe est réinitialisé
**And** l'autre groupe reste filtré si applicable

**Given** j'ai des filtres actifs
**When** je quitte et reviens sur la page
**Then** mes filtres sont mémorisés (persistance localStorage)

**Given** un filtre est actif et aucune demande ne correspond
**When** la liste est filtrée
**Then** un empty state contextuel s'affiche:
- "Aucune demande de renseignements" ou
- "Aucune nouvelle demande" selon le filtre

**Given** je veux voir les demandes urgentes
**When** je filtre sur "Commandes" + "Nouveaux"
**Then** je vois immédiatement les intentions de commande non traitées
**And** je peux prioriser mes rappels clients

**Références:** FR26, FR27, NFR2, UX-05

---

### Story 5.3: Traitement d'une Demande

En tant que fournisseur,
Je veux marquer une demande comme traitée,
Afin de suivre mon avancement et ne pas oublier de clients.

**Acceptance Criteria:**

**Given** je suis sur le détail d'une demande avec statut PENDING
**When** la page se charge
**Then** les informations de contact du magasin sont visibles
**And** deux boutons d'action sont disponibles:
- "Appeler" (lien tel:)
- "Marquer comme traitée"

**Given** je clique sur "Appeler"
**When** l'action est déclenchée
**Then** l'application téléphone s'ouvre avec le numéro du magasin pré-rempli
**And** (sur desktop, le numéro est copié dans le presse-papier avec toast de confirmation)

**Given** je clique sur "Marquer comme traitée"
**When** l'action est déclenchée
**Then** une Server Action `updateRequestStatus` est appelée
**And** elle met à jour le statut à TREATED
**And** elle retourne `ActionResult<Request>`

**Given** le marquage réussit
**When** le statut est mis à jour
**Then** un toast de succès s'affiche "Demande marquée comme traitée"
**And** le badge passe de "Nouveau" à "Traité"
**And** les boutons d'action sont remplacés par un indicateur "✓ Traitée le [date]"

**Given** une demande est déjà traitée
**When** j'accède à son détail
**Then** le statut "Traité" est affiché
**And** la date de traitement est visible
**And** je peux toujours voir les infos de contact pour un rappel éventuel

**Given** je suis sur la liste des demandes
**When** je veux traiter rapidement sans ouvrir le détail
**Then** un swipe vers la gauche sur une RequestCard révèle le bouton "Traiter"
**And** je peux marquer comme traitée en un geste

**Given** une erreur survient lors du marquage
**When** la mise à jour échoue
**Then** un toast d'erreur s'affiche
**And** le statut reste inchangé
**And** je peux réessayer

**Given** le magasin consulte sa demande
**When** le fournisseur l'a marquée comme traitée
**Then** le magasin voit le statut passer à "Traité" (FR22)
**And** cela indique que le fournisseur a pris en compte sa demande

**Références:** FR25, ARCH-09, ARCH-11, UX-06

---

## Epic 6: Système de Notifications

Les utilisateurs sont notifiés en temps réel (in-app et email) des événements importants comme les nouvelles demandes et peuvent gérer leurs notifications.

### Story 6.1: Schéma Notifications & Notification In-App

En tant que fournisseur,
Je veux recevoir une notification in-app quand un magasin envoie une demande,
Afin d'être réactif et ne pas manquer d'opportunités.

**Acceptance Criteria:**

**Given** le schéma Prisma existe
**When** j'ajoute le modèle Notification
**Then** la table `notifications` est créée avec les champs:
- id (UUID), user_id (UUID), user_type (enum: SUPPLIER, STORE)
- type (enum: NEW_REQUEST, REQUEST_TREATED, etc.)
- title (string), body (text)
- related_id (UUID optional - ID de la demande/offre concernée)
- read (boolean default false), created_at
**And** un index existe sur (user_id, user_type, read)

**Given** la table notifications existe
**When** je crée les policies RLS
**Then** un utilisateur ne peut voir que ses propres notifications
**And** un utilisateur peut marquer ses notifications comme lues

**Given** un magasin envoie une demande (INFO ou ORDER)
**When** la Server Action `createRequest` réussit
**Then** une notification est créée pour le fournisseur concerné
**And** le titre est "Nouvelle demande" ou "Intention de commande" selon le type
**And** le body contient "[Nom magasin] - [Nom offre]"
**And** related_id pointe vers la demande créée

**Given** une notification est créée
**When** le fournisseur est connecté à l'application
**Then** Supabase Realtime pousse la notification en temps réel
**And** le composant NotificationBadge se met à jour instantanément
**And** le compteur de notifications non lues s'incrémente

**Given** je suis fournisseur connecté
**When** une nouvelle demande arrive
**Then** un toast apparaît brièvement avec le titre de la notification (FR28)
**And** le badge sur l'icône "Demandes" dans la bottom nav s'incrémente
**And** un son subtil peut accompagner (si autorisé par le navigateur)

**Given** le fournisseur n'est pas connecté
**When** une demande arrive
**Then** la notification est stockée en base
**And** elle sera visible à la prochaine connexion

**Given** je configure Supabase Realtime
**When** j'implémente les subscriptions
**Then** le client s'abonne au channel `notifications:supplier:{supplier_id}`
**And** les événements INSERT sur la table notifications sont écoutés
**And** la connexion se reconnecte automatiquement en cas de coupure

**Références:** FR28, FR30, ARCH-06, ARCH-07

---

### Story 6.2: Notification Email

En tant que fournisseur,
Je veux recevoir un email quand un magasin envoie une demande,
Afin d'être notifié même si je ne suis pas sur l'application.

**Acceptance Criteria:**

**Given** un magasin envoie une demande (INFO ou ORDER)
**When** la Server Action `createRequest` réussit
**Then** en plus de la notification in-app, un email est envoyé au fournisseur (FR29)

**Given** l'email doit être envoyé
**When** je configure le service d'email
**Then** Resend (ou Supabase Email) est configuré
**And** les templates d'email sont créés en français
**And** les emails sont envoyés depuis une adresse @aurelien-project.fr (ou domaine configuré)

**Given** une demande de type INFO est créée
**When** l'email est envoyé
**Then** l'objet est "Nouvelle demande de renseignements - [Nom offre]"
**And** le contenu inclut:
- Nom du magasin et enseigne
- Ville du magasin
- Offre concernée
- Message du magasin (si présent)
- Bouton CTA "Voir la demande" avec lien vers l'app
**And** le design est responsive et sobre

**Given** une demande de type ORDER est créée
**When** l'email est envoyé
**Then** l'objet est "🛒 Intention de commande - [Nom offre]"
**And** le contenu met en avant l'intention d'achat
**And** le CTA est "Contacter le magasin"

**Given** le fournisseur reçoit l'email
**When** il clique sur le bouton CTA
**Then** il est redirigé vers `/requests/[id]` dans l'application
**And** s'il n'est pas connecté, il passe par le login puis est redirigé

**Given** l'envoi d'email échoue
**When** une erreur survient (quota, service down)
**Then** l'erreur est loggée mais n'empêche pas la création de la demande
**And** la notification in-app est quand même créée
**And** un retry peut être tenté via une queue (évolution future)

**Given** le fournisseur ne veut plus recevoir d'emails
**When** il accède à ses préférences (évolution future)
**Then** il peut désactiver les notifications email
**And** les notifications in-app restent actives

**Références:** FR29, NFR12

---

### Story 6.3: Gestion des Notifications

En tant qu'utilisateur,
Je veux voir mes notifications non lues et les marquer comme lues,
Afin de gérer mon flux d'informations.

**Acceptance Criteria:**

**Given** je suis connecté (fournisseur ou magasin)
**When** j'ai des notifications non lues
**Then** un badge compteur apparaît sur l'icône appropriée dans la bottom nav
**And** le badge affiche le nombre (1-99, puis "99+")
**And** le badge est rouge pour attirer l'attention

**Given** je veux voir mes notifications
**When** je clique sur l'icône avec le badge (ou accède à une page dédiée)
**Then** la liste de mes notifications s'affiche (FR30)
**And** les notifications sont triées par date (plus récentes en premier)
**And** les non lues sont visuellement distinctes (fond accent léger)

**Given** la liste de notifications s'affiche
**When** je consulte une notification
**Then** je vois: titre, body, date relative ("il y a 5 min")
**And** un indicateur visuel montre si elle est lue ou non

**Given** je clique sur une notification
**When** l'action est déclenchée
**Then** la notification est marquée comme lue automatiquement (FR31)
**And** je suis redirigé vers l'élément concerné (related_id)
**And** le badge compteur se décrémente

**Given** je veux marquer plusieurs notifications comme lues
**When** je clique sur "Tout marquer comme lu"
**Then** une Server Action `markAllNotificationsRead` est appelée
**And** toutes mes notifications non lues passent à read=true
**And** le badge compteur disparaît (ou affiche 0)

**Given** une notification est marquée comme lue
**When** elle s'affiche dans la liste
**Then** son style est atténué (pas de fond accent)
**And** elle reste visible dans l'historique

**Given** je reçois une notification en temps réel
**When** je suis déjà sur la liste des notifications
**Then** la nouvelle notification apparaît en haut de la liste avec animation
**And** pas besoin de rafraîchir la page

**Given** j'ai beaucoup de notifications
**When** la liste dépasse 50 éléments
**Then** une pagination ou infinite scroll est implémentée
**And** les anciennes notifications (> 30 jours) peuvent être archivées (évolution future)

**Given** aucune notification n'existe
**When** la liste se charge
**Then** un empty state s'affiche "Aucune notification"
**And** un message contextuel explique quand des notifications arriveront

**Références:** FR30, FR31, UX-06

