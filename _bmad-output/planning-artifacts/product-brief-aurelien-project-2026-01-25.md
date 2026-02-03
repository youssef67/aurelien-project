---
stepsCompleted: [1, 2, "MVP-REVISION"]
inputDocuments: []
date: 2026-01-25
revised: 2026-02-02
author: Youssef
elicitationMethods: [User Persona Focus Group, Shark Tank Pitch, Pre-mortem Analysis, 5 Whys Deep Dive, First Principles Analysis]
lastSession: 2026-02-02
sessionStatus: "Product Brief révisé suite au pivot MVP marketplace. Prêt pour PRD."
nextAction: "Lancer le workflow PRD pour créer le Product Requirements Document"
---

# Product Brief: aurelien-project

---

## Révision MVP - 2 Février 2026

### Pivot Stratégique

**Changement majeur :** Passage de l'approche "single-player first" (outil solo pour magasins d'abord) à une **marketplace simplifiée** connectant directement fournisseurs et magasins dès le MVP.

**Raison du pivot :** L'associé de Youssef est commercial terrain et peut immédiatement tester l'application avec ses magasins clients. Cette opportunité de validation terrain rapide justifie de démarrer directement par la connexion fournisseur-magasin.

### Nouveau Scope MVP Validé

#### Côté Fournisseur
- **Authentification :** Compte dédié fournisseur
- **Fonctionnalité principale :** Publier des produits en promotion
- **Données produit :**
  - Nom du produit
  - Prix promo et remise %
  - Dates de validité (début/fin)
  - Catégorie produit
  - Photo produit
  - Marge proposée
  - Volume estimé
  - Conditions commerciales
  - Animations prévues
- **Notifications :** Email + In-app (demande de renseignements / intention commande)

#### Côté Magasin
- **Authentification :** Compte dédié magasin
- **Inscription :** Nom magasin, enseigne, email, adresse/ville, téléphone
- **Enseignes cibles MVP :** Indépendants uniquement (Leclerc, Intermarché, Super U, Système U)
- **Fonctionnalités :**
  - Consulter les offres (liste)
  - Filtrer par : catégorie, date, fournisseur, enseigne
  - Interagir : "Demande de renseignements" / "Souhaite passer commande"

#### Hors scope MVP (Phase 2+)
- Gestion des zones/allées centrales
- Planification visuelle des emplacements
- Chat intégré
- Paiement en ligne

### Impact sur la Stratégie

Ce pivot permet de :
1. **Valider rapidement** le product-market fit avec de vrais utilisateurs terrain
2. **Tester les deux côtés** du marketplace simultanément
3. **Collecter des données** sur les interactions fournisseur-magasin
4. **Itérer** sur les fonctionnalités avant d'ajouter la complexité de la gestion d'espace

---

## Executive Summary

**aurelien-project** est une application B2B destinée à la grande distribution qui révolutionne la gestion des promotions entre fournisseurs et magasins. Face à un constat terrain : 30% des rendez-vous commerciaux annulés, des mails ignorés, des chefs de rayon débordés et des allées centrales mal optimisées, la solution propose une approche en deux temps.

**Phase 1** : Un outil d'organisation pour les chefs de rayon leur permettant d'optimiser leurs zones promotionnelles (allées centrales, têtes de gondole) - utilisable directement sur le terrain, devant l'allée.

**Phase 2** : Une plateforme de mise en relation avec les fournisseurs, offrant une visibilité complète sur les offres disponibles avec argumentaires (marge, CA, place au sol) et traçabilité des interactions.

**Cible prioritaire** : Les enseignes indépendantes (Leclerc, Intermarché, Super U) - les "vrais commerçants" qui ont la liberté de travailler les promotions hors catalogue.

**Proposition de valeur** : Transformer 10 heures de rendez-vous en 1 heure sur l'application, tout en maximisant la rentabilité au m².

**Positionnement stratégique** : L'app gère la PLACE, pas le PRODUIT. Les centrales gèrent le catalogue, l'app gère l'optimisation du m² promo. Aucune concurrence avec les centrales d'achat.

---

## Core Vision

### Problem Statement

La relation commerciale en grande distribution souffre d'inefficiences chroniques des deux côtés :

**Côté chefs de rayon :**
- Manque de temps chronique dû à l'absentéisme (plus de temps en rayon qu'au bureau)
- Organisation des allées centrales "au dernier moment" avec des trous et des promos en réserve
- Impossibilité de comparer efficacement les offres de multiples fournisseurs
- Rendez-vous commerciaux chronophages (discussions hors-sujet, temps perdu)
- Imprévus terrain : promos non livrées, négociations nationales qui coupent des produits au dernier moment
- Excel pas transportable : obligation de remonter au bureau pour consulter le plan

**Côté commerciaux/fournisseurs :**
- 30% des rendez-vous annulés (70% honorés)
- Secteurs géographiques de plus en plus grands
- Mails envoyés sans visibilité sur leur lecture ou leur traitement
- Temps de route improductif
- Impossibilité de couvrir tout le parc client (logique 20/80 subie)
- Secteurs vacants ou congés = magasins non couverts

### Problem Impact

- **Pour les magasins** : Manque à gagner sur le chiffre d'affaires, m² au sol sous-optimisés, zones promotionnelles mal travaillées, stress quotidien
- **Pour les fournisseurs** : Coûts commerciaux élevés pour un ROI incertain, difficulté à atteindre tous les magasins du secteur, frustration des équipes
- **Pour le secteur** : Un métier de commercial terrain qui perd son sens et risque de disparaître sans transformation. Culture du "tête dans le guidon" - on accepte de subir.

### Why Existing Solutions Fall Short

| Solution existante | Limitation |
|-------------------|------------|
| CRM commerciaux (Sidely, Salesforce) | Outils POUR le commercial, pas de lien avec le chef de rayon. Uniquement du reporting interne sur les objectifs. |
| Logiciels centrales (Caroline chez Carrefour) | Référencement et commandes permanentes, pas les promos hors catalogue |
| Emails / téléphone | Aucune traçabilité, pas de comparaison possible, mails non lus |
| Excel | Utilisé pour les plans d'allée centrale mais : pas transportable, modifications difficiles, plan perdu/imprimé, pas de lien avec les offres |
| Sharly | Gestion des accès visiteurs, pas des offres |
| Consentio | Producteurs locaux uniquement |

**Le gap identifié** : Aucune solution ne permet au chef de rayon de voir toutes les offres promotionnelles disponibles, de les comparer sur des critères business (marge, CA, encombrement), et de décider sans rendez-vous physique. Aucun outil ne fait le lien entre "gestion d'espace promo" et "marketplace d'offres fournisseurs".

### Proposed Solution

**Architecture révisée (Pivot MVP Février 2026) :**

**MVP - Marketplace Simplifiée (Priorité immédiate) :**
- **Côté Fournisseur :**
  - Création de compte fournisseur
  - Publication de produits en promotion (nom, prix promo, remise %, dates validité)
  - Enrichissement des offres (catégorie, photo, marge, volume estimé, conditions, animations)
  - Réception de notifications (email + in-app) sur les demandes magasins
- **Côté Magasin :**
  - Création de compte magasin (nom, enseigne, email, adresse, téléphone)
  - Consultation des offres en liste
  - Filtrage multi-critères (catégorie, date, fournisseur, enseigne)
  - Interactions simplifiées : "Demande de renseignements" / "Souhaite passer commande"
- **Focus enseignes :** Indépendants (Leclerc, Intermarché, Super U, Système U)

**Phase 2 - Outil de planification (Post-MVP) :**
- Planification et visualisation des allées centrales et têtes de gondole
- Optimisation du m² promotionnel (éviter les trous, maximiser la rentabilité)
- Calendrier des périodes promotionnelles
- Accessible sur mobile/tablette DEVANT l'allée centrale
- Multi-utilisateurs : le second ou remplaçant accède au même plan
- Historique consultable : "Qu'est-ce qu'on avait mis ici le mois dernier ?"
- Suggestions automatiques de remplacement quand un trou apparaît

**Phase 3 - Fonctionnalités avancées (Futur) :**
- Chat intégré fournisseur-magasin
- Paiement en ligne
- Analytics avancés

**Format technique : Web App (PWA)**
- Accessible via navigateur sur tout appareil (PC, téléphone, tablette, boîtier magasin)
- Pas d'installation requise = moins de friction
- Compatible avec les politiques IT restrictives des entreprises
- Un seul développement pour tous les supports
- Mises à jour instantanées pour tous les utilisateurs

### Key Differentiators

| Différenciateur | Avantage |
|-----------------|----------|
| **Marketplace bilatérale immédiate** | Connexion directe fournisseur-magasin dès le MVP, validation terrain rapide |
| **Validation par commercial terrain** | L'associé peut tester immédiatement avec ses magasins clients |
| **Focus hors catalogue** | Là où le chef de rayon a de la marge de manœuvre et peut vraiment développer son CA |
| **Traçabilité complète** | Fini le flou des mails : le commercial sait si son offre est vue/traitée |
| **Interactions simplifiées** | Demande de renseignements / Intention de commande = friction minimale |
| **Continuité de service** | Congés, secteurs vacants, absentéisme = l'app assure la continuité des deux côtés |
| **Expertise insider** | Fondateur avec 15 ans de terrain en GD, réseau établi sur le Grand Est |
| **Timing post-COVID** | Métier en mutation, turnover élevé, besoin d'optimisation reconnu |
| **Ciblage indépendants** | Leclerc, Intermarché, Super U, Système U - les enseignes en croissance avec liberté de décision |
| **Aucun conflit avec les centrales** | L'app gère les promos hors catalogue, pas le référencement |
| **Évolutivité vers outil de planification** | Phase 2 prévue pour ajouter la gestion des espaces promo |

---

## User Personas

### Persona 1 : Julien, Chef de rayon Épicerie - Leclerc (Grand Est)

**Profil** : 34 ans, 8 ans d'expérience, gère 3 allées + zone promo, équipe de 2 personnes (souvent en sous-effectif)

**Contexte quotidien** :
- Arrive le matin, regarde ce qu'il a en stock, ce qui arrive, et bricole son allée centrale
- Voit défiler 5-6 commerciaux par semaine, certains font perdre 45 minutes pour 2 palettes
- Informations éparpillées : bouts de papier, mails pas lus, souvenirs de conversations

**Besoins exprimés** :
- Visualiser toutes les offres au même endroit
- Comparer rapidement (marge, CA potentiel)
- Ne PAS rajouter de charge de travail
- Filtrer les offres pertinentes pour son enseigne

**Frustrations** :
- RDV commerciaux chronophages
- Informations éparpillées (mails, papiers, mémoire)
- Sentiment de bricoler au lieu de piloter
- Pas de vue d'ensemble des promos disponibles

**Motivations variables selon le profil** :
- Gain de temps (motivation première)
- Prime sur CA/marge/stock
- Reconnaissance de la hiérarchie
- Tranquillité / moins de stress

**Interactions MVP** :
- Consulte la liste des offres promotionnelles
- Filtre par catégorie, fournisseur, dates, enseigne
- Envoie une "Demande de renseignements" si intéressé
- Indique "Souhaite passer commande" pour les offres retenues

### Persona 2 : Sophie, Commerciale terrain - PME agroalimentaire régionale

**Profil** : 42 ans, 15 ans de terrain, secteur Grand Est (180 magasins), voiture 40 000 km/an

**Contexte quotidien** :
- Cale des RDV, les recale, se fait annuler (30% d'annulations)
- Envoie 50 mails par semaine sans savoir qui les lit
- Doit reporter à son boss mais pas de visibilité sur les commandes passées
- Ne peut pas couvrir tous ses magasins (logique 20/80 subie)

**Besoins exprimés** :
- Visibilité sur l'engagement client (vu, lu, commandé)
- Optimiser ses déplacements (aller là où c'est utile)
- Couvrir tout son parc, pas seulement les 20% habituels
- Garder sa valeur ajoutée relationnelle

**Craintes** :
- Devenir un "catalogue humain" remplaçable
- Perdre le lien relationnel avec les clients
- Que l'app la court-circuite

**Ce que l'app lui apporte** :
- Couverture de tout le parc client
- Moins de frustration (moins de RDV dans le vent)
- Continuité pendant ses congés ou secteur vacant
- Visibilité sur l'engagement des magasins

**Interactions MVP** :
- Publie ses offres promotionnelles avec tous les détails (prix, remise, marge, volume, conditions)
- Ajoute photos et informations sur les animations
- Reçoit des notifications (email + in-app) quand un magasin demande des renseignements
- Reçoit des alertes quand un magasin souhaite passer commande
- Peut suivre l'engagement sur ses offres

---

## Business Model

### Modèle économique recommandé

**Phase 1 - Amorçage :**
- **Magasin** : GRATUIT (outil de planification allée centrale)
- **Fournisseur** : Accès de base gratuit pour tester

**Phase 2 - Monétisation :**
- **Magasin** : Reste gratuit (ou freemium avec features premium)
- **Fournisseur** : Abonnement mensuel par entreprise
  - Ex : 99€/mois pour PME, 299€/mois pour ETI, sur-mesure pour grands comptes
  - Inclut : publication illimitée d'offres, alertes de lecture, analytics

**Logique** : "Si le produit est gratuit, c'est toi le produit" - Le magasin EST la valeur. Les fournisseurs paient pour y accéder.

### Décideurs et signataires

| Côté | Utilisateur | Décideur/Signataire |
|------|-------------|---------------------|
| Magasin | Chef de rayon | Direction du magasin / Adhérent |
| Fournisseur | Commercial | Directeur commercial / DAF / Responsable achat |

### Arguments de vente par cible

| Cible | Argument principal |
|-------|-------------------|
| Chef de rayon | "Gagne du temps, fini le stress de l'allée centrale" |
| Chef de rayon primé | "Augmente ta prime en optimisant ton CA/m²" |
| Patron/Adhérent | "Optimise le CA de tes zones promo sans effort supplémentaire" |
| Commercial | "Couvre tout ton parc, fini les RDV dans le vent" |
| Direction fournisseur | "Réduis les frais de déplacement, couvre les secteurs vacants, élargis au-delà du 20/80" |

---

## Go-to-Market Strategy

### Stratégie d'amorçage

| Étape | Action | Objectif |
|-------|--------|----------|
| **1. Test** | 2-3 magasins indépendants (réseau personnel Grand Est) | Valider le produit, collecter des retours |
| **2. Témoins** | Ces magasins deviennent des références | Preuve sociale, cas concrets |
| **3. Centrale régionale** | Approcher avec les témoins comme argument | Signer 50 magasins d'un coup |
| **4. Scale** | Répliquer sur d'autres centrales régionales | Croissance accélérée |

### Pourquoi les indépendants d'abord

- Plus de liberté et flexibilité dans les décisions
- En meilleure santé financière (CA en croissance vs intégrés)
- Plus "commerçants" - travaillent vraiment les promos hors catalogue
- Le fondateur a un réseau établi sur le Grand Est

### Acquisition des premiers utilisateurs

- **Chefs de rayon** : Démonstration directe du gain de temps, approche terrain via le réseau existant
- **Fournisseurs** : Montrer que les magasins sont déjà sur l'app (effet réseau)

---

## Risk Analysis (Pre-mortem)

### Risque 1 : "L'app fantôme" (adoption sans usage)

**Risque** : Les chefs de rayon téléchargent l'app mais n'y reviennent jamais.

**Prévention** :
- Le plan du jour = réflexe matinal (comme consulter son planning)
- Alertes "trou détecté" si emplacement non assigné
- Notifications "nouvelles offres matchées"
- Multi-utilisateurs = l'app devient LA source de vérité
- Historique consultable = mémoire du magasin

**Hook principal** : "L'app est l'endroit où se trouve MON plan. Si je ne l'ouvre pas, je ne sais pas ce que je fais aujourd'hui."

### Risque 2 : "La guerre des features" (usine à gaz)

**Risque** : Trop de demandes de features, l'app devient incompréhensible.

**Prévention** :
- Cœur sacré intouchable : (1) Organisation allée centrale + (2) Relation fournisseurs
- Principe "Trop d'infos tue l'info" = filtre naturel pour dire NON
- Expliquer le pourquoi du refus (c'est pour le gain de temps du client)
- Roadmap "peut-être" pour les bonnes idées futures
- Critère d'ajout : pertinent + en lien avec le cœur + faisable

---

## Root Cause Analysis (5 Whys)

| Why | Question | Réponse |
|-----|----------|---------|
| **#1** | Pourquoi les allées centrales sont mal optimisées ? | Plans faits au dernier moment, trous, pas de vision globale |
| **#2** | Pourquoi au dernier moment ? | Manque de temps (sous-effectif, absentéisme) + Contraintes de négociation nationale (promos coupées au dernier moment) |
| **#3** | Pourquoi le manque de temps empêche la bonne planification ? | Outils fragmentés + Excel pas transportable + Urgences terrain (promo pas livrée = emplacement vide, il faut remonter au bureau) |
| **#4** | Pourquoi les outils demandent trop d'effort ? | Pas d'outil unique qui centralise plan + offres + critères de décision |
| **#5** | Pourquoi cet outil n'existe pas ? | Personne n'a fait le lien + Culture du "tête dans le guidon" - on accepte de subir |

**Cause racine** : Les outils sont fragmentés (Excel pour le plan, mails pour les offres, mémoire pour les décisions). L'effort de centralisation est laissé au chef de rayon. L'app fait ce travail à sa place.

**Insight clé** : L'app n'est pas juste un outil de planification. C'est un outil DE TERRAIN, utilisable physiquement devant l'allée centrale, qui fait le lien entre le PLAN et la RÉALITÉ. Excel est un outil de bureau. Cette app est un outil de rayon.

---

## Validated Assumptions (First Principles)

| Hypothèse | Statut | Conclusion |
|-----------|--------|------------|
| Chefs de rayon veulent optimiser | Nuancé | Pas tous, mais leurs patrons OUI. Adapter le discours selon l'interlocuteur (temps/argent/prime) |
| Gain de temps = motivation principale | Confirmé | Le temps est lié à tout : argent, reconnaissance, tranquillité, moins de stress |
| Adoption du digital | Nuancé | Les +50 ans peuvent s'adapter si l'outil est simple. Prévoir aussi l'usage sur boîtiers magasin existants |
| Commerciaux accepteront | Confirmé | Ils gagnent : couverture de tout le parc, moins de frustration, continuité pendant les congés/vacances secteur |
| Fournisseurs paieront | Confirmé | ROI = élargir au-delà du 20/80, couvrir secteurs vacants, réduire frais de déplacement |
| Format de l'app | Décidé | Web App (PWA) pour Phase 1 - moins de friction, multi-support, compatible boîtiers |
| Cible indépendants | Confirmé | Indépendants en meilleure santé financière, plus de liberté. Stratégie : test → témoins → centrale régionale |

---

## Competitive Landscape

### Solutions existantes analysées

| Solution | Ce qu'elle fait | Écart avec ce projet |
|----------|-----------------|----------------------|
| **Sidely** | CRM GMS pour commerciaux : tournées, relevés, gestion promos | Outil POUR le commercial, pas de liaison avec le chef de rayon |
| **Sharly** | Gestion des accès/visites commerciaux en magasin | Traçabilité des visites, pas des offres promo |
| **Consentio** | Mise en relation producteurs locaux / chefs de rayon | Orienté local/frais, pas promotions nationales |
| **SimpliField** | Retail execution, remplace Excel par mobile | Orienté merchandising/exécution terrain |
| **UpClear** | Trade Promotion Management pour CPG | Gestion interne côté fournisseur, pas de lien magasin |
| **B-APPLI** | Apps pour fournisseurs GMS | Outils internes, pas de plateforme de liaison |

### Gap non adressé

Aucune solution ne permet au chef de rayon de :
1. Voir toutes les offres promotionnelles disponibles
2. Les comparer sur des critères business (marge, CA, encombrement)
3. Décider sans rendez-vous physique
4. Avoir son plan accessible en rayon sur mobile

---

## Founder Advantage

| Avantage | Détail |
|----------|--------|
| **Expertise terrain** | 15 ans commercial en grande distribution |
| **Entreprise indépendante** | Comprend les contraintes des PME avec peu de moyens |
| **Double vision** | Comprend les problématiques des deux côtés (commercial ET chef de rayon) |
| **Réseau établi** | Contacts commerciaux ET magasins sur le Grand Est |
| **Timing** | Post-COVID, turnover massif, métier en mutation, marges compressées |
| **Motivation personnelle** | Vit le problème au quotidien, veut le résoudre |

---

## Why Now

- **Post-COVID** : Le métier a changé, turnover élevé, digitalisation accélérée
- **Avant qu'un autre ne lance** : Le marché est mûr mais non adressé
- **Avant que le métier ne perde son sens** : Les commerciaux terrain risquent de disparaître sans transformation
- **Guerre des parts de marché** : Enseignes qui s'allient, besoin d'optimisation accru
- **Marges compressées** : Chaque m² doit être optimisé pour maximiser la rentabilité
