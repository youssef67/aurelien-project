# Guide Visuel - aurelien-project

**Auteur:** Youssef + Sally (UX Designer)
**Date:** 2026-02-08
**Inspiration:** acquire.com
**Status:** Reference pour implementation

---

## 1. Philosophie Visuelle

### ADN du design

Inspire par acquire.com, le design d'aurelien-project repose sur 4 piliers :

| Pilier | Description |
|--------|-------------|
| **Epure** | Beaucoup d'espace blanc, le contenu respire |
| **Pro** | Palette sombre/bleu profond qui inspire confiance |
| **Identite** | Formes asymetriques signature, typographie display forte |
| **Simplicite** | Moins d'elements = plus d'impact, chaque chose a sa place |

### Principe cle : le contenu apporte la couleur

L'interface reste neutre (bleu-nuit, blanc, lavande). Ce sont les **photos produits**, les **badges de statut** et les **CTAs** qui apportent les touches de couleur. L'interface ne rivalise jamais avec le contenu.

---

## 2. Palette de Couleurs

### Couleurs principales

| Token | Nom | Hex | Usage |
|-------|-----|-----|-------|
| `--primary` | Cobalt | `#3E50F7` | Boutons CTA, liens actifs, accents |
| `--primary-foreground` | Blanc | `#FFFFFF` | Texte sur fond primary |
| `--foreground` | Bleu Nuit | `#25224A` | Texte principal, titres |
| `--background` | Blanc | `#FFFFFF` | Fond principal des pages |
| `--card` | Blanc | `#FFFFFF` | Fond des cartes |
| `--card-foreground` | Bleu Nuit | `#25224A` | Texte dans les cartes |

### Couleurs secondaires

| Token | Nom | Hex | Usage |
|-------|-----|-----|-------|
| `--secondary` | Lavande | `#EEF2FE` | Fonds de sections alternees, hover leger |
| `--secondary-foreground` | Bleu Nuit | `#25224A` | Texte sur fond secondary |
| `--muted` | Neige | `#F8FAFF` | Fonds subtils, zones desactivees |
| `--muted-foreground` | Gris Mauve | `#6B6580` | Texte secondaire, placeholders |
| `--accent` | Lavande | `#EEF2FE` | Hover, etats actifs legers |
| `--accent-foreground` | Bleu Nuit | `#25224A` | Texte sur fond accent |

### Couleurs de surface

| Token | Nom | Hex | Usage |
|-------|-----|-----|-------|
| `--border` | Lavande Gris | `#E6E8FB` | Bordures cartes, separateurs |
| `--input` | Lavande Gris | `#E6E8FB` | Bordures champs de saisie |
| `--ring` | Cobalt | `#3E50F7` | Focus ring accessibilite |

### Couleurs semantiques

| Token | Nom | Hex | Usage |
|-------|-----|-----|-------|
| `--success` | Emeraude | `#059669` | Confirmations, statut "Active" |
| `--success-foreground` | Blanc | `#FFFFFF` | Texte sur success |
| `--warning` | Ambre | `#D97706` | Alertes, statut "Brouillon", expiration proche |
| `--warning-foreground` | Blanc | `#FFFFFF` | Texte sur warning |
| `--destructive` | Rose | `#E11D48` | Erreurs, suppression |
| `--destructive-foreground` | Blanc | `#FFFFFF` | Texte sur destructive |

### Couleur speciale : Hero / Dark

| Token | Nom | Hex | Usage |
|-------|-----|-----|-------|
| `--hero-bg` | Twilight | `#25224A` | Fond hero landing page, header sombre, CTA secondaire fort |
| `--hero-foreground` | Blanc | `#FFFFFF` | Texte sur fond hero |

### Alternance de sections

L'alternance de fonds entre sections cree du rythme visuel :

```
Section 1 : fond --background (#FFFFFF)
Section 2 : fond --secondary (#EEF2FE)
Section 3 : fond --background (#FFFFFF)
Section 4 : fond --muted (#F8FAFF)
Hero/CTA  : fond --hero-bg (#25224A)
```

---

## 3. Typographie

### Polices

| Role | Police | Source | Usage |
|------|--------|--------|-------|
| **Display / Titres** | Plus Jakarta Sans | Google Fonts | h1, h2, h3, boutons CTA |
| **Corps / UI** | Inter | Google Fonts | Body, labels, descriptions, inputs |

**Pourquoi Plus Jakarta Sans ?** C'est une police geometrique moderne, similaire a Lufga (utilisee par Acquire.com), avec une forte identite visuelle en bold/extrabold. Gratuite sur Google Fonts.

### Echelle typographique

| Element | Police | Taille | Weight | Line Height | Usage |
|---------|--------|--------|--------|-------------|-------|
| **Hero title** | Plus Jakarta Sans | 36px / `text-4xl` | 800 (extrabold) | 1.1 | Landing page hero uniquement |
| **Page title (h1)** | Plus Jakarta Sans | 28px / `text-3xl` | 700 (bold) | 1.2 | Titre de chaque page |
| **Section title (h2)** | Plus Jakarta Sans | 22px / `text-2xl` | 700 (bold) | 1.3 | Titres de sections |
| **Card title (h3)** | Plus Jakarta Sans | 18px / `text-lg` | 600 (semibold) | 1.4 | Titres dans les cartes |
| **Subtitle** | Plus Jakarta Sans | 16px / `text-base` | 600 (semibold) | 1.5 | Sous-titres, labels importants |
| **Body** | Inter | 16px / `text-base` | 400 (regular) | 1.6 | Corps de texte |
| **Body small** | Inter | 14px / `text-sm` | 400 (regular) | 1.5 | Descriptions, texte secondaire |
| **Caption** | Inter | 12px / `text-xs` | 500 (medium) | 1.4 | Badges, metadata, dates |
| **Button** | Plus Jakarta Sans | 15px | 600 (semibold) | 1 | Boutons CTA |
| **Nav label** | Inter | 12px / `text-xs` | 500 (medium) | 1.2 | Labels bottom navigation |

### Regles typographiques

- **Titres** : Toujours en Plus Jakarta Sans, jamais en Inter
- **Chiffres** : `font-variant-numeric: tabular-nums` pour les prix, %, marges
- **Couleur titres** : `--foreground` (#25224A Bleu Nuit)
- **Couleur body** : `--foreground` pour le principal, `--muted-foreground` pour le secondaire

---

## 4. Formes & Arrondis

### Border-radius signature

Inspire d'Acquire.com, le projet utilise un **border-radius asymetrique** comme element d'identite :

```
border-radius: 0 16px 16px 16px;
```

Le coin **haut-gauche est carre**, les 3 autres sont arrondis. Cela cree une forme distinctive et reconnaissable.

### Application par composant

| Composant | Border Radius | Valeur |
|-----------|---------------|--------|
| **Cards (OfferCard, RequestCard)** | Asymetrique | `0 16px 16px 16px` |
| **Boutons CTA principaux** | Asymetrique | `0 8px 8px 8px` |
| **Boutons secondaires/ghost** | Symetrique standard | `8px` |
| **Inputs / Selects** | Symetrique standard | `8px` |
| **Badges** | Pill | `9999px` (full round) |
| **Avatars** | Cercle | `50%` |
| **Sheets / Modals** | Top arrondi | `16px 16px 0 0` |
| **Images dans cards** | Suit la card | `0 16px 0 0` (top) |

### Variables CSS pour les radius

```css
--radius: 0.5rem;        /* 8px - base */
--radius-lg: 1rem;       /* 16px - cards */
--radius-asymmetric: 0 1rem 1rem 1rem;  /* signature */
--radius-btn: 0 0.5rem 0.5rem 0.5rem;  /* boutons signature */
```

---

## 5. Ombres & Elevation

| Token | Valeur | Usage |
|-------|--------|-------|
| `shadow-none` | `none` | Etat par defaut des cards (bordure seulement) |
| `shadow-sm` | `0 1px 3px rgba(37,34,74,0.06)` | Cards au repos (subtil) |
| `shadow-md` | `0 4px 12px rgba(37,34,74,0.08)` | Cards hover, elements survoles |
| `shadow-lg` | `0 8px 24px rgba(37,34,74,0.12)` | Dropdowns, sheets, modals |
| `shadow-header` | `0 1px 7px rgba(0,0,0,0.08)` | Header fixe (comme Acquire) |

### Principe d'elevation

Les **cartes au repos** n'ont **pas de shadow** mais une **bordure subtile** `1px solid var(--border)`. L'ombre apparait au **hover** pour indiquer l'interactivite.

---

## 6. Espacement

### Systeme base 4px (Tailwind)

| Token | Valeur | Usage |
|-------|--------|-------|
| `space-1` | 4px | Micro-gaps (icone ↔ label) |
| `space-2` | 8px | Padding interne compact |
| `space-3` | 12px | Gap entre elements lies |
| `space-4` | 16px | Padding standard mobile, marges |
| `space-5` | 20px | Padding cards |
| `space-6` | 24px | Entre groupes d'elements |
| `space-8` | 32px | Entre sections |
| `space-10` | 40px | Marges larges |
| `space-12` | 48px | Espacement sections majeures |
| `space-16` | 64px | Sections hero, grandes respirations |

### Principe : genereux

L'espacement est **volontairement genereux** pour creer une sensation d'epure et de respiration. On ne tasse jamais les elements.

---

## 7. Composants UI

### 7.1 Boutons

#### Bouton Primaire (CTA principal)

```
Fond       : --primary (#3E50F7 cobalt)
Texte      : blanc
Radius     : 0 8px 8px 8px (asymetrique)
Padding    : 14px 28px
Font       : Plus Jakarta Sans, 15px, semibold
Hover      : fond #4D5EFD (plus clair)
Icone      : fleche → a droite (optionnel)
```

#### Bouton Secondaire Sombre

```
Fond       : --hero-bg (#25224A twilight)
Texte      : blanc
Radius     : 0 8px 8px 8px (asymetrique)
Padding    : 14px 28px
Font       : Plus Jakarta Sans, 15px, semibold
Hover      : fond #30305B (plus clair)
```

#### Bouton Outline

```
Fond       : transparent
Bordure    : 1px solid --border (#E6E8FB)
Texte      : --foreground (#25224A)
Radius     : 8px (symetrique)
Padding    : 12px 24px
Font       : Inter, 14px, medium
Hover      : fond --secondary (#EEF2FE)
```

#### Bouton Ghost

```
Fond       : transparent
Texte      : --muted-foreground (#6B6580)
Radius     : 8px
Padding    : 8px 16px
Font       : Inter, 14px, medium
Hover      : fond --muted (#F8FAFF)
```

#### Bouton Destructif

```
Fond       : --destructive (#E11D48)
Texte      : blanc
Radius     : 8px (symetrique, pas asymetrique)
Padding    : 12px 24px
Hover      : fond plus sombre
```

### 7.2 Cards

#### OfferCard (Card d'offre)

```
Fond          : blanc (#FFFFFF)
Bordure       : 1px solid --border (#E6E8FB)
Radius        : 0 16px 16px 16px (asymetrique signature)
Shadow repos  : aucune (bordure seulement)
Shadow hover  : shadow-md
Padding       : 0 (image edge-to-edge en haut)
Padding body  : 16px 20px

Structure :
┌─────────────────────────────────┐
│ [Photo produit edge-to-edge]    │
│                      [Badge]    │
├─────────────────────────────────┤
│ Categorie (caption, muted)      │
│ Nom produit (h3, bold)          │
│ Fournisseur (body small, muted) │
├─────────────────────────────────┤
│ Prix promo  │ Remise  │ Marge   │
│ 12,99€      │ -25%    │ 22%     │
├─────────────────────────────────┤
│ 15 fev - 28 fev (caption)       │
└─────────────────────────────────┘
```

#### Etats de la card

| Etat | Visuel |
|------|--------|
| **Default** | Bordure --border, pas de shadow |
| **Hover** | shadow-md, legere elevation |
| **Nouveau** | Badge vert "Nouveau" en haut-droite |
| **Demande** | Badge bleu "Demande" |
| **Expire** | Opacity 50%, badge gris "Expire" |

#### RequestCard (Card de demande)

```
Fond          : blanc
Bordure       : 1px solid --border
Radius        : 0 16px 16px 16px
Padding       : 16px 20px

Structure :
┌─────────────────────────────────┐
│ Nom magasin    [Badge Commande] │
│ Enseigne • Ville (caption)      │
├─────────────────────────────────┤
│ → Offre concernee               │
│ il y a 2h (caption, muted)      │
├─────────────────────────────────┤
│ [Appeler]        [Marquer traite]│
└─────────────────────────────────┘
```

### 7.3 Badges

| Variant | Fond | Texte | Usage |
|---------|------|-------|-------|
| **Nouveau** | `#059669` (success) | blanc | Nouvelles offres < 48h |
| **Active** | `#059669` (success) | blanc | Statut offre active |
| **Brouillon** | `#D97706` (warning) | blanc | Statut offre brouillon |
| **Expire** | `#94A3B8` (gris) | blanc | Statut offre expiree |
| **Renseignements** | `#3E50F7` (primary) | blanc | Type demande INFO |
| **Commande** | `#059669` (success) | blanc | Type demande ORDER |
| **En attente** | `#D97706` (warning) | blanc | Statut demande PENDING |
| **Traite** | `#94A3B8` (gris) | blanc | Statut demande TREATED |
| **Enseigne** | `#EEF2FE` (secondary) | `#25224A` | Badge enseigne (Leclerc, etc.) |

```
Radius  : 9999px (pill)
Padding : 4px 10px
Font    : Inter, 12px, medium
```

### 7.4 Navigation

#### Header fixe

```
Fond       : blanc (#FFFFFF)
Shadow     : 0 1px 7px rgba(0,0,0,0.08)
Height     : 56px mobile / 64px desktop
Position   : fixed top
Contenu    : Logo a gauche, actions a droite
Z-index    : 50
```

#### Bottom Navigation (mobile)

```
Fond       : blanc (#FFFFFF)
Bordure    : 1px solid --border en haut
Height     : 64px + safe area bottom
Position   : fixed bottom

Item actif :
  Icone    : --primary (#3E50F7)
  Label    : --primary (#3E50F7)
  Font     : Inter, 12px, medium

Item inactif :
  Icone    : --muted-foreground (#6B6580)
  Label    : --muted-foreground
  Font     : Inter, 12px, regular

Badge notification :
  Fond     : --destructive (#E11D48)
  Texte    : blanc
  Taille   : 18px min
  Position : top-right de l'icone
```

#### Sidebar (desktop, lg+)

```
Fond       : --muted (#F8FAFF)
Largeur    : 240px
Bordure    : 1px solid --border a droite
```

### 7.5 Formulaires

#### Inputs

```
Fond        : blanc (#FFFFFF)
Bordure     : 1px solid --border (#E6E8FB)
Radius      : 8px (symetrique)
Padding     : 12px 16px
Font        : Inter, 16px, regular
Placeholder : --muted-foreground (#6B6580)

Focus :
  Bordure   : 2px solid --primary (#3E50F7)
  Ring      : 0 0 0 2px rgba(62,80,247,0.15)

Erreur :
  Bordure   : 1px solid --destructive (#E11D48)
  Message   : Inter, 14px, --destructive
```

#### Labels

```
Font    : Inter, 14px, medium
Couleur : --foreground (#25224A)
Margin  : 0 0 6px 0
```

#### Select / Dropdown

```
Meme style que Input
Icone chevron a droite
Options : fond blanc, hover --secondary
```

### 7.6 Filter Chips

```
Chip inactif :
  Fond    : --muted (#F8FAFF)
  Bordure : 1px solid --border (#E6E8FB)
  Texte   : --foreground (#25224A)
  Radius  : 9999px (pill)
  Padding : 8px 16px
  Font    : Inter, 14px, medium

Chip actif :
  Fond    : --primary (#3E50F7)
  Bordure : none
  Texte   : blanc
  Radius  : 9999px
  Padding : 8px 16px

Comportement : scroll horizontal si > 4 chips
```

### 7.7 Toasts

```
Position    : bottom-center (mobile), bottom-right (desktop)
Fond        : --hero-bg (#25224A) pour success/info
              --destructive (#E11D48) pour erreurs
Texte       : blanc
Radius      : 0 12px 12px 12px (asymetrique)
Padding     : 14px 20px
Shadow      : shadow-lg
Font        : Inter, 14px, medium
Duree       : 3 secondes
```

### 7.8 Empty States

```
Illustration : icone Lucide grande (48px) en --muted-foreground
Message      : Plus Jakarta Sans, 18px, semibold, --foreground
Description  : Inter, 14px, regular, --muted-foreground
CTA          : Bouton primaire en dessous
Padding      : 48px vertical
Alignement   : centre
```

### 7.9 Skeleton Loading

```
Fond         : --secondary (#EEF2FE)
Animation    : shimmer (pulse subtil)
Radius       : meme que l'element qu'il remplace
```

---

## 8. Layouts par Page

### 8.1 Landing Page (`/`)

```
┌──────────────────────────────────────────┐
│ HEADER blanc, logo + "Se connecter"      │
├──────────────────────────────────────────┤
│ HERO fond --hero-bg (#25224A)            │
│   Titre: Plus Jakarta Sans, 36px, 800    │
│   "La plateforme qui connecte            │
│    fournisseurs et magasins"             │
│   Sous-titre: Inter, 16px, blanc 70%     │
│   [Creer un compte →] (CTA cobalt)      │
│   [Deja inscrit ? Se connecter]          │
├──────────────────────────────────────────┤
│ SECTION fond --secondary (#EEF2FE)       │
│   Stats: "X offres", "X magasins"        │
├──────────────────────────────────────────┤
│ SECTION fond blanc                        │
│   3 blocs valeur (icone + titre + desc)  │
│   - Fournisseurs: publiez vos offres     │
│   - Magasins: consultez, comparez        │
│   - Simple: en 2 clics                   │
├──────────────────────────────────────────┤
│ CTA SECTION fond --hero-bg               │
│   "Pret a commencer ?"                   │
│   [S'inscrire →]                         │
├──────────────────────────────────────────┤
│ FOOTER fond --muted                      │
└──────────────────────────────────────────┘
```

### 8.2 Pages Auth (`/login`, `/register/*`)

```
┌──────────────────────────────────────────┐
│ HEADER minimal (logo centre)             │
├──────────────────────────────────────────┤
│ Fond: blanc                              │
│ Carte centree max-width 440px            │
│                                          │
│   Titre: Plus Jakarta Sans, 24px, bold   │
│   "Connectez-vous"                       │
│                                          │
│   [Form inputs]                          │
│   [Bouton CTA primaire full-width]       │
│   [Lien secondaire]                      │
│                                          │
│ Pas de bordure sur la carte mobile       │
│ Bordure + shadow-sm sur desktop          │
└──────────────────────────────────────────┘
```

### 8.3 Liste Offres Fournisseur (`/dashboard`)

```
┌──────────────────────────────────────────┐
│ HEADER: "Mes offres" + [+ Nouvelle offre]│
├──────────────────────────────────────────┤
│ Fond: --muted (#F8FAFF)                  │
│                                          │
│ Compteur: "12 offres"                    │
│                                          │
│ ┌─OfferCard─────────────────────────┐    │
│ │ [Photo]                 [Active]  │    │
│ │ Nom produit                       │    │
│ │ 12,99€  -25%                      │    │
│ │ 15 fev - 28 fev                   │    │
│ └───────────────────────────────────┘    │
│                                          │
│ ┌─OfferCard─────────────────────────┐    │
│ │ [Photo]                 [Expiree] │    │
│ │ ...                               │    │
│ └───────────────────────────────────┘    │
│                                          │
│ [FAB + en bas a droite]                  │
├──────────────────────────────────────────┤
│ BOTTOM NAV: Offres* | Demandes | Profil  │
└──────────────────────────────────────────┘
```

### 8.4 Creation Offre (`/offers/new`)

```
┌──────────────────────────────────────────┐
│ HEADER: "← Nouvelle offre"              │
├──────────────────────────────────────────┤
│ Fond: blanc                              │
│                                          │
│ StepIndicator: ●───●───○───○             │
│ "Etape 1 sur 4 : Produit & Prix"        │
│                                          │
│ [Formulaire etape courante]              │
│   Label                                  │
│   [Input]                                │
│   Label                                  │
│   [Input]                                │
│                                          │
├──────────────────────────────────────────┤
│ FOOTER FIXE:                             │
│ [← Retour]          [Suivant →] (CTA)   │
└──────────────────────────────────────────┘
```

### 8.5 Liste Offres Magasin (`/offers` - espace magasin)

```
┌──────────────────────────────────────────┐
│ HEADER: "Offres disponibles" + [Filtres] │
├──────────────────────────────────────────┤
│ Fond: --muted (#F8FAFF)                  │
│                                          │
│ FilterChips:                             │
│ [Tout] [Epicerie] [Frais] [DPH] [→]     │
│                                          │
│ Grid 1 col mobile / 2 cols tablet / 3 desktop │
│                                          │
│ ┌─OfferCard──────┐ ┌─OfferCard──────┐   │
│ │ [Photo]        │ │ [Photo]        │   │
│ │ [Nouveau]      │ │                │   │
│ │ Categorie      │ │ Categorie      │   │
│ │ Nom produit    │ │ Nom produit    │   │
│ │ Fournisseur    │ │ Fournisseur    │   │
│ │ 12,99€ -25%    │ │ 8,49€ -20%    │   │
│ │ 15-28 fev      │ │ 10-25 fev     │   │
│ └────────────────┘ └────────────────┘   │
│                                          │
├──────────────────────────────────────────┤
│ BOTTOM NAV: Offres* | Demandes | Profil  │
└──────────────────────────────────────────┘
```

### 8.6 Detail Offre (`/offers/[id]`)

```
┌──────────────────────────────────────────┐
│ HEADER: "← Retour" + [Partager]         │
├──────────────────────────────────────────┤
│ [Photo produit full-width]               │
│                                          │
│ Section fond blanc :                     │
│   Categorie (badge)                      │
│   Nom produit (h1, Plus Jakarta, bold)   │
│   Fournisseur (body, lien)               │
│                                          │
│ ┌─ Bloc chiffres fond --secondary ──┐   │
│ │ Prix promo  │ Remise  │ Marge     │   │
│ │ 12,99€      │ -25%    │ 22%      │   │
│ └────────────────────────────────────┘   │
│                                          │
│ Dates de validite                        │
│ Volume estime                            │
│ Conditions commerciales                  │
│ Animation prevue                         │
│                                          │
├──────────────────────────────────────────┤
│ FOOTER FIXE (magasin):                   │
│ [Renseignements] [Souhaite commander →]  │
│                                          │
│ FOOTER FIXE (fournisseur):               │
│ [Modifier]              [Supprimer]      │
└──────────────────────────────────────────┘
```

### 8.7 Historique Demandes Magasin (`/my-requests`)

```
┌──────────────────────────────────────────┐
│ HEADER: "Mes demandes"                   │
├──────────────────────────────────────────┤
│ Fond: --muted                            │
│                                          │
│ ┌─RequestCard────────────────────────┐   │
│ │ Nom offre           [Commande]     │   │
│ │ Fournisseur                        │   │
│ │ il y a 2h           [En attente]   │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ┌─RequestCard────────────────────────┐   │
│ │ Nom offre           [Renseign.]    │   │
│ │ Fournisseur                        │   │
│ │ Hier                [Traite]       │   │
│ └────────────────────────────────────┘   │
│                                          │
├──────────────────────────────────────────┤
│ BOTTOM NAV: Offres | Demandes* | Profil  │
└──────────────────────────────────────────┘
```

### 8.8 Liste Demandes Fournisseur (`/requests`)

```
┌──────────────────────────────────────────┐
│ HEADER: "Demandes recues"                │
├──────────────────────────────────────────┤
│ FilterChips (2 groupes):                 │
│ Type: [Tous] [Renseign.] [Commandes]     │
│ Statut: [Tous] [Nouveaux] [Traites]      │
│                                          │
│ Fond: --muted                            │
│                                          │
│ ┌─RequestCard────────────────────────┐   │
│ │ Leclerc Strasbourg  [Commande]     │   │
│ │ Epicerie • il y a 2h [Nouveau]     │   │
│ │ → Nutella 1kg - Promo Fevrier      │   │
│ └────────────────────────────────────┘   │
│                                          │
├──────────────────────────────────────────┤
│ BOTTOM NAV: Offres | Demandes* | Profil  │
└──────────────────────────────────────────┘
```

### 8.9 Detail Demande Fournisseur (`/requests/[id]`)

```
┌──────────────────────────────────────────┐
│ HEADER: "← Retour"                      │
├──────────────────────────────────────────┤
│ Fond blanc:                              │
│                                          │
│ ┌─ Info magasin fond --secondary ────┐   │
│ │ Nom magasin (h2)                   │   │
│ │ Enseigne (badge)  •  Ville         │   │
│ │ Email   •  Telephone               │   │
│ └────────────────────────────────────┘   │
│                                          │
│ Type de demande (badge)                  │
│ Date de reception                        │
│ Message du magasin (si present)          │
│                                          │
│ Offre concernee (lien vers detail)       │
│                                          │
├──────────────────────────────────────────┤
│ FOOTER FIXE:                             │
│ [Appeler]       [Marquer comme traitee]  │
└──────────────────────────────────────────┘
```

### 8.10 Page Profil (`/profile`)

```
┌──────────────────────────────────────────┐
│ HEADER: "Mon profil"                     │
├──────────────────────────────────────────┤
│ Fond: --muted                            │
│                                          │
│ ┌─ Carte identite fond blanc ────────┐   │
│ │ Avatar (initiales ou photo)        │   │
│ │ Nom entreprise / magasin (h2)      │   │
│ │ Email                              │   │
│ │ Telephone                          │   │
│ │ (Enseigne + Ville pour magasin)    │   │
│ └────────────────────────────────────┘   │
│                                          │
│ [Se deconnecter] (bouton outline rouge)  │
│                                          │
├──────────────────────────────────────────┤
│ BOTTOM NAV: Offres | Demandes | Profil*  │
└──────────────────────────────────────────┘
```

### 8.11 Notifications (`/notifications` ou Sheet)

```
┌──────────────────────────────────────────┐
│ HEADER: "Notifications" + [Tout lire]    │
├──────────────────────────────────────────┤
│                                          │
│ ┌─ Notification non lue ─────────────┐   │
│ │ ● Nouvelle demande                 │   │
│ │   Leclerc Strasbourg - Nutella     │   │
│ │   il y a 5 min                     │   │
│ └─ fond --secondary ────────────────┘   │
│                                          │
│ ┌─ Notification lue ─────────────────┐   │
│ │   Intention de commande            │   │
│ │   Intermache Colmar - Barilla      │   │
│ │   Hier                             │   │
│ └─ fond blanc ───────────────────────┘   │
│                                          │
└──────────────────────────────────────────┘
```

---

## 9. Animations & Micro-interactions

### Transitions

| Element | Type | Duree | Easing |
|---------|------|-------|--------|
| Hover bouton | Background color | 150ms | ease-out |
| Hover card | Box-shadow | 200ms | ease-out |
| Navigation page | Slide horizontal | 200ms | ease-in-out |
| Sheet ouverture | Slide from bottom | 250ms | ease-out |
| Toast apparition | Slide up + fade in | 200ms | ease-out |
| Badge "Nouveau" | Subtle pulse | 2s | ease-in-out, infini |

### Regles

- Respecter `prefers-reduced-motion` : desactiver les animations
- Jamais de transition > 300ms
- Les animations servent le feedback, pas la decoration

---

## 10. Implementation Technique

### Fichiers a modifier

| Fichier | Changement |
|---------|------------|
| `src/app/globals.css` | Nouvelle palette de couleurs (CSS variables) |
| `src/app/layout.tsx` | Ajout de Plus Jakarta Sans |
| Composants `src/components/custom/*` | Classes Tailwind mises a jour |
| Composants `src/components/forms/*` | Styles formulaires |
| Composants `src/components/layout/*` | Header, BottomNav, layouts |

### Variables CSS a remplacer dans globals.css

Les couleurs actuelles (oklch) seront remplacees par la nouvelle palette. Les equivalents oklch des hex seront calcules lors de l'implementation.

### Fonts dans layout.tsx

```tsx
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
})
```

### Classes Tailwind a definir

```css
@theme inline {
  --font-sans: var(--font-inter);
  --font-display: var(--font-display);
}
```

Usage dans les composants :
```html
<h1 class="font-display text-3xl font-bold">Titre</h1>
<p class="font-sans text-base">Corps de texte</p>
```

---

## 11. Checklist Implementation

- [ ] Mettre a jour la palette dans `globals.css`
- [ ] Ajouter Plus Jakarta Sans dans `layout.tsx`
- [ ] Configurer `--font-display` dans le theme Tailwind
- [ ] Mettre a jour les border-radius (asymetriques)
- [ ] Mettre a jour les ombres
- [ ] Appliquer les styles sur tous les composants existants (cards, boutons, inputs)
- [ ] Mettre a jour les layouts (header, bottom nav)
- [ ] Mettre a jour les pages auth (login, register)
- [ ] Mettre a jour la landing page
- [ ] Mettre a jour les pages offres fournisseur
- [ ] Mettre a jour les pages offres magasin
- [ ] Verifier le responsive (mobile, tablette, desktop)
- [ ] Verifier l'accessibilite (contraste, focus)

---

**Document Version:** 1.0
**Inspiration Source:** acquire.com
**Complementaire a:** `_bmad-output/planning-artifacts/ux-design-specification.md`
