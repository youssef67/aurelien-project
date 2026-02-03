---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
workflowStatus: 'complete'
completedAt: '2026-02-02'
inputDocuments:
  - '_bmad-output/planning-artifacts/product-brief-aurelien-project-2026-01-25.md'
workflowType: 'prd'
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
classification:
  projectType: 'saas_b2b'
  domain: 'retail_trade_promotion'
  complexity: 'medium'
  projectContext: 'greenfield'
---

# Product Requirements Document - aurelien-project

**Author:** Youssef
**Date:** 2026-02-02

## Executive Summary

### Vision

**aurelien-project** est une marketplace B2B qui connecte les fournisseurs de la grande distribution avec les chefs de rayon des enseignes indépendantes (Leclerc, Intermarché, Super U, Système U) pour les promotions hors catalogue.

### Problème adressé

| Côté | Problème |
|------|----------|
| **Chefs de rayon** | Noyés sous les mails, RDV chronophages, pas de vue d'ensemble des offres disponibles |
| **Commerciaux terrain** | 30% de RDV annulés, mails ignorés, couverture limitée au 20/80 du parc client |

### Solution

Une PWA légère permettant aux fournisseurs de publier leurs offres promotionnelles et aux magasins de les consulter, filtrer et exprimer leur intérêt ("Demande de renseignements" / "Souhaite passer commande") sans rendez-vous physique.

### Différenciateur clé

Aucune solution existante ne connecte les deux côtés (fournisseur ↔ magasin) pour les promos hors catalogue. L'app gère la **PLACE** promo, pas le produit - aucune concurrence avec les centrales d'achat.

### Utilisateurs cibles

| Persona | Rôle | Besoin principal |
|---------|------|------------------|
| **Julien** | Chef de rayon Épicerie, Leclerc | Voir toutes les offres, commander sans RDV |
| **Sophie** | Commerciale terrain, PME | Couvrir tout son parc, visibilité sur l'engagement |

### Approche MVP

Pilote contrôlé avec un seul fournisseur (Aurélien, associé) et ses magasins clients existants. Validation terrain sur plusieurs mois avant élargissement.

## Success Criteria

### User Success

**Succès Magasin (Chef de rayon)**
- **Signal principal :** "Je commande plus facilement, moins de temps passé en RDV"
- Consultation des offres perçue comme rapide et fluide
- Filtrage des offres pertinentes sans friction
- Interactions "Demande de renseignements" / "Commande" en 2-3 clics max
- Sentiment de contrôle : le chef de rayon choisit quand consulter, pas le commercial

**Succès Fournisseur (Commercial terrain)**
- **Signal principal :** "Mes RDV sont plus qualitatifs, prospection plus qualitative"
- Visibilité sur l'engagement des magasins (offres vues, demandes reçues)
- Couverture élargie au-delà du 20/80 habituel
- Moins de déplacements "dans le vent" (RDV annulés)
- Continuité de service pendant congés ou secteurs vacants

### Business Success

**Approche Lean - Phase Alpha/Beta**
- Pas de métriques chiffrées à 3-6 mois
- Objectif : collecter des données terrain pour établir les baselines
- Indicateurs à définir après les premiers tests :
  - Taux d'adoption (à mesurer)
  - Fréquence d'utilisation (à mesurer)
  - Conversion "consultation → demande" (à mesurer)
  - NPS ou équivalent qualitatif (à définir)

**Signal de validation :**
- Retours positifs simultanés des deux côtés (magasins ET commerciaux)
- Usage organique sans relance constante
- Demande spontanée de nouvelles fonctionnalités (signe d'engagement)

### Technical Success

**Critères non négociables :**

| Critère | Exigence |
|---------|----------|
| **Temps de chargement** | Très court - critique pour l'usage terrain |
| **Fluidité** | Application très fluide et rapide, pas de latence perceptible |
| **Disponibilité** | Haute disponibilité (objectif 99.5%+) |
| **Accessibilité** | PWA fonctionnelle sur mobile, tablette, PC, boîtiers magasin |
| **Offline** | Considérer le mode dégradé (connexion instable en rayon) |

### Measurable Outcomes

**Phase 1 - Test avec Aurélien (associé commercial)**
- Validation qualitative avec quelques magasins clients
- Objectif : identifier les frictions, collecter les retours terrain
- Durée : itérations rapides jusqu'à stabilisation

**Phase 2 - Élargissement**
- Autres commerciaux + mêmes magasins
- Affiner l'offre selon les retours
- Établir des métriques quantitatives basées sur les données collectées

**Indicateurs qualitatifs à tracker :**
- Verbatims spontanés des utilisateurs
- Fréquence d'usage sans relance
- Demandes de fonctionnalités
- Points de friction identifiés

## Product Scope

### MVP - Minimum Viable Product

**Côté Fournisseur :**
- Authentification compte fournisseur
- Publication de produits en promotion (nom, prix promo, remise %, dates validité)
- Enrichissement : catégorie, photo, marge, volume estimé, conditions, animations
- Notifications email + in-app (demandes magasins)

**Côté Magasin :**
- Authentification compte magasin
- Inscription : nom, enseigne, email, adresse/ville, téléphone
- Consultation des offres (liste)
- Filtrage : catégorie, date, fournisseur, enseigne
- Interactions : "Demande de renseignements" / "Souhaite passer commande"

**Enseignes MVP :** Indépendants uniquement (Leclerc, Intermarché, Super U, Système U)

**Exigences techniques MVP :**
- PWA performante (temps de chargement < 2s)
- Interface fluide et réactive
- Notifications temps réel

### Growth Features (Post-MVP)

- Gestion des zones/allées centrales
- Planification visuelle des emplacements promotionnels
- Historique des promotions et analyses
- Suggestions automatiques de remplacement (trous)
- Multi-utilisateurs par magasin

### Vision (Future)

- Chat intégré fournisseur-magasin
- Paiement en ligne
- Analytics avancés (CA/m², performance par catégorie)
- Extension nationale au-delà du Grand Est
- API pour intégration avec systèmes existants (CRM, ERP)

## User Journeys

### Journey 1 : Julien découvre et adopte l'outil (Chef de rayon - Onboarding)

**Persona** : Julien, 34 ans, Chef de rayon Épicerie chez Leclerc, Grand Est

**Scène d'ouverture** :
Mardi matin, 7h30. Julien arrive au magasin en pensant à son allée centrale. Sophie, la commerciale Nestlé, passe dans la matinée. Il a reçu 12 mails de fournisseurs la semaine dernière, pas le temps de tous les lire. Il y a un "trou" dans son plan promo de la semaine prochaine - une animation Danone annulée au dernier moment par la centrale.

Sophie arrive à 9h. Après les nouvelles habituelles, elle lui montre quelque chose sur sa tablette : "Julien, j'ai commencé à utiliser un nouvel outil pour mes promos. Regarde, toutes mes offres sont là. T'as même pas besoin de me recevoir pour voir ce que je propose."

Julien est sceptique - encore un truc de plus ? Mais Sophie lui montre la liste des offres, avec les marges affichées, les remises, les dates. "Et tu peux filtrer par catégorie, par date... Tu reçois une notif si t'es intéressé par une offre."

**Action montante** :
Julien crée son compte en 2 minutes : nom du magasin, Leclerc, son email, Strasbourg. Il voit immédiatement 8 offres de fournisseurs du secteur. Il filtre sur "Épicerie" - 3 offres pertinentes apparaissent.

Une offre de Ferrero l'intéresse pour combler son trou : Nutella en promo avec 22% de marge, animation présentoir incluse. Il clique "Demande de renseignements" pour avoir les conditions exactes de livraison.

**Climax** :
Le lendemain, sans avoir eu de RDV, sans mail perdu, Julien a reçu la réponse du commercial Ferrero dans l'app. Il clique "Souhaite passer commande". C'est réglé. Son trou est comblé.

**Résolution** :
Trois semaines plus tard, Julien ouvre l'app chaque matin comme un réflexe. C'est devenu son point d'entrée pour voir les offres disponibles. Quand un commercial passe, le RDV est plus court et plus qualitatif : on parle des offres déjà vues, pas de présentation PowerPoint.

### Journey 2 : Sophie optimise sa couverture terrain (Commerciale - Usage quotidien)

**Persona** : Sophie, 42 ans, Commerciale terrain PME agroalimentaire, secteur Grand Est (180 magasins)

**Scène d'ouverture** :
Lundi matin. Sophie consulte son planning : 6 RDV prévus cette semaine, elle sait que 2 seront probablement annulés au dernier moment. 180 magasins dans son secteur, elle n'en voit que 40 régulièrement. Les autres ? Des mails envoyés dans le vide.

Elle prépare une nouvelle promo sur une gamme de biscuits : 25% de remise, marge attractive pour les magasins, animation tête de gondole incluse. Avant, elle aurait envoyé 150 mails identiques.

**Action montante** :
Sophie ouvre l'app et publie son offre :
- Nom produit, prix promo, 25% de remise
- Dates de validité : du 15 au 28 février
- Catégorie : Épicerie sucrée / Biscuits
- Photo du produit et du présentoir
- Marge proposée : 24%
- Volume estimé : 2 palettes
- Conditions : livraison J+3, minimum 50 colis
- Animation : PLV tête de gondole offerte

En 5 minutes, c'est publié et visible par tous les magasins du secteur.

**Climax** :
À 14h, première notification : "Leclerc Strasbourg - Demande de renseignements". À 17h : "Intermarché Colmar - Souhaite passer commande". Le lendemain matin, 3 nouvelles demandes.

Pour la première fois, Sophie a touché des magasins qu'elle ne visite jamais. Un Super U de Mulhouse qu'elle n'a pas vu depuis 8 mois lui demande des renseignements.

**Résolution** :
Sophie publie désormais chaque nouvelle promo "de valeur" sur l'app. Ses déplacements sont ciblés : elle va voir les magasins qui ont montré de l'intérêt. Ses RDV sont plus courts et plus productifs - le magasin a déjà vu l'offre, on parle concret. Elle couvre maintenant 60% de son parc au lieu de 20%.

### Journey 3 : Julien gère une semaine type (Chef de rayon - Usage récurrent)

**Persona** : Julien, Chef de rayon Épicerie, Leclerc

**Scène d'ouverture** :
Lundi matin, 7h45. Julien arrive, pose son café, ouvre l'app sur son téléphone. C'est devenu un réflexe, comme vérifier ses mails.

**Action montante** :
Il voit 4 nouvelles offres depuis vendredi. Il filtre sur "Épicerie" et "Cette semaine". Deux offres l'intéressent :
- Une promo Barilla avec marge à 21%
- Une offre Panzani avec animation présentoir

Il envoie "Demande de renseignements" sur Barilla (veut vérifier les délais de livraison) et "Souhaite passer commande" directement sur Panzani (il connaît déjà les conditions, c'est son fournisseur habituel).

À 10h, un commercial Lu passe pour un RDV prévu. Le RDV dure 15 minutes au lieu de 45 : Julien a déjà vu les offres dans l'app, ils discutent uniquement des points qui nécessitent un échange direct.

**Climax** :
Mercredi, l'offre qu'il avait réservée chez un petit fournisseur est annulée (problème de stock). Julien ouvre l'app, filtre sur la même catégorie, trouve une alternative en 3 clics. Le commercial répond dans l'heure. Crise évitée.

**Résolution** :
L'app est devenue l'outil de référence de Julien. Il ne subit plus les commerciaux, il choisit quand consulter. Ses RDV sont réduits mais plus qualitatifs. Quand un collègue lui demande comment il gère, il répond : "Je commande plus facilement, moins de temps passé en RDV."

### Journey 4 : Premier fournisseur sans réseau (Onboarding commercial secondaire)

**Persona** : Marc, 29 ans, Commercial junior dans une PME de confiserie, nouveau sur le secteur

**Scène d'ouverture** :
Marc vient d'être embauché. Il hérite d'un secteur "en friche" - le commercial précédent est parti il y a 3 mois, aucun suivi pendant cette période. Il a une liste de 120 magasins, aucun contact personnel, aucune relation établie.

Son chef lui parle de l'app que certains commerciaux utilisent déjà : "Publie tes promos là-dessus, c'est un bon moyen de te faire connaître des magasins."

**Action montante** :
Marc crée son compte fournisseur et publie sa première offre : bonbons de Pâques, dates de validité mars, marge attractive. Il n'y croit qu'à moitié - qui va le voir, il ne connaît personne.

**Climax** :
Deux jours plus tard : première notification. Un Intermarché à 80 km de chez lui demande des renseignements. Puis un Super U. En une semaine, 5 contacts avec des magasins qu'il n'aurait jamais pu démarcher directement.

**Résolution** :
Marc utilise l'app pour établir le premier contact. Quand un magasin montre de l'intérêt via l'app, il appelle pour se présenter. L'app devient son outil de prospection : il ne débarque plus "à froid", il contacte des magasins qui ont déjà vu ses offres.

### Journey Requirements Summary

Ces 4 journeys couvrent les parcours critiques du MVP :

| Journey | Persona | Scénario couvert |
|---------|---------|------------------|
| **J1** | Julien (Magasin) | Onboarding et première commande |
| **J2** | Sophie (Fournisseur) | Publication d'offres et réception de demandes |
| **J3** | Julien (Magasin) | Usage quotidien récurrent |
| **J4** | Marc (Fournisseur) | Onboarding commercial sans réseau existant |

→ Les capacités fonctionnelles détaillées sont documentées dans la section **Functional Requirements** (FR1-FR34).

## SaaS B2B Specific Requirements

### Project-Type Overview

Application SaaS B2B de type marketplace verticale pour la grande distribution. Deux populations d'utilisateurs distinctes (fournisseurs et magasins) avec isolation stricte des données entre entités concurrentes.

### Technical Architecture Considerations

#### Tenant Model (Isolation des données)

| Règle | Description |
|-------|-------------|
| **Isolation Fournisseur** | Un fournisseur ne voit QUE ses propres offres et les demandes reçues sur SES offres |
| **Isolation Magasin** | Un magasin ne voit QUE ses propres demandes envoyées |
| **Visibilité Offres** | Tous les magasins voient toutes les offres publiées (données publiques côté marketplace) |
| **Visibilité Demandes** | Les demandes sont privées : visibles uniquement par l'émetteur (magasin) et le destinataire (fournisseur) |

#### RBAC Matrix (Modèle de permissions MVP)

| Rôle | Permissions |
|------|-------------|
| **Fournisseur** | Créer/modifier/supprimer ses offres ; Voir les demandes reçues sur ses offres ; Répondre aux demandes |
| **Magasin** | Consulter toutes les offres ; Filtrer les offres ; Envoyer "Demande de renseignements" ; Envoyer "Souhaite passer commande" ; Voir ses propres demandes envoyées |

**Simplification MVP :**
- 1 compte = 1 utilisateur (pas de multi-utilisateurs par entité)
- Pas de distinction de rôles internes (chef de rayon vs direction)
- Évolution post-MVP : multi-utilisateurs, rôles, hiérarchie

#### Subscription Tiers

| Phase | Fournisseur | Magasin |
|-------|-------------|---------|
| **MVP** | Gratuit | Gratuit |
| **Post-MVP** | Abonnement payant (cible monétisation) | Gratuit (le magasin est la valeur) |

**Logique économique :** Les magasins sont l'audience que les fournisseurs veulent atteindre. Monétisation côté fournisseur uniquement.

#### Integration List

| Intégration | Statut MVP | Post-MVP |
|-------------|------------|----------|
| ERP fournisseurs | ❌ Non prévu | À évaluer |
| CRM fournisseurs | ❌ Non prévu | À évaluer |
| Systèmes magasins | ❌ Non prévu | À évaluer |
| API ouverte | ❌ Non prévu | À évaluer selon demande |

**MVP = Application standalone**, sans dépendance externe.

#### Compliance Requirements

| Exigence | Statut |
|----------|--------|
| **RGPD** | Standard (données personnelles : email, téléphone, adresse) |
| **Hébergement** | France (conformité données EU) |
| **Données commerciales** | Confidentialité des marges/prix entre concurrents (isolation technique) |

### Implementation Considerations

**Architecture recommandée pour l'isolation :**
- Chaque entité (fournisseur/magasin) = tenant_id dans la base
- Toutes les requêtes filtrées par tenant_id
- Audit logs pour traçabilité des accès

**Évolutivité prévue :**
- Structure de données pensée pour multi-utilisateurs futurs
- Modèle de permissions extensible (ajout de rôles)
- API interne structurée pour ouverture future

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**Approche MVP :** Pilote contrôlé / Validation terrain
- Un seul fournisseur (Aurélien - produits d'entretien)
- Quelques magasins clients existants d'Aurélien
- Test sur plusieurs mois avant élargissement
- Objectif : valider l'usage réel, identifier les frictions

**Timeline :** 1-2 mois pour un outil fonctionnel, pas de contrainte dure

**Avantage de cette approche :**
- Pas de problème "cold start" (marketplace vide)
- Feedback direct et rapide (relation de confiance existante)
- Itérations possibles avant ouverture à d'autres fournisseurs

### MVP Feature Set (Phase 1)

**Core User Journeys Supportés :**
- ✅ Journey 1 : Magasin découvre et adopte l'outil
- ✅ Journey 2 : Fournisseur publie et reçoit des demandes
- ✅ Journey 3 : Usage récurrent magasin
- ✅ Journey 4 : Onboarding nouveau commercial (préparation pour Phase 2)

**Must-Have Capabilities MVP :**

| Capability | Justification |
|------------|---------------|
| Authentification fournisseur/magasin | Accès sécurisé, isolation données |
| Publication d'offres complète | Cœur de valeur fournisseur |
| Consultation + filtrage offres | Cœur de valeur magasin |
| "Demande de renseignements" | Interaction minimale viable |
| "Souhaite passer commande" | Conversion de l'intérêt |
| Notifications email + in-app | Réactivité critique pour l'engagement |
| PWA performante | Usage terrain mobile |

### Post-MVP Features

**Phase 2 (Growth) - Après validation pilote :**
- Ouverture à d'autres fournisseurs
- Ouverture à d'autres magasins
- Multi-utilisateurs par entité
- Historique des interactions
- Analytics basiques (offres vues, taux de conversion)

**Phase 3 (Expansion) :**
- Gestion des zones/allées centrales
- Planification visuelle des emplacements
- Chat intégré
- Monétisation (abonnement fournisseurs)
- API pour intégrations

**Phase 4 (Vision) :**
- Paiement en ligne
- Analytics avancés (CA/m²)
- Extension géographique nationale
- Suggestions automatiques

### Risk Mitigation Strategy

| Risque | Mitigation |
|--------|------------|
| **Technique** : Performance terrain (connexion instable) | PWA optimisée, interface légère, mode dégradé à considérer |
| **Marché** : Adoption magasin | Pilote contrôlé avec magasins connus, relation de confiance |
| **Produit** : Friction UX | Itérations rapides pendant le pilote, feedback direct |
| **Ressources** : Scope trop large | MVP minimaliste validé, pas de feature creep |

## Functional Requirements

### Gestion des comptes utilisateurs

- **FR1:** Un fournisseur peut créer un compte avec ses informations professionnelles (nom entreprise, email, téléphone)
- **FR2:** Un magasin peut créer un compte avec ses informations (nom magasin, enseigne, email, adresse/ville, téléphone)
- **FR3:** Un utilisateur (fournisseur ou magasin) peut se connecter à son compte
- **FR4:** Un utilisateur (fournisseur ou magasin) peut se déconnecter de son compte
- **FR5:** Un utilisateur peut réinitialiser son mot de passe via un lien envoyé par email

### Gestion des offres (Fournisseur)

- **FR6:** Un fournisseur peut créer une offre promotionnelle avec les informations obligatoires (nom produit, prix promo, remise %, dates de validité)
- **FR7:** Un fournisseur peut enrichir une offre avec des informations complémentaires (catégorie, photo, marge, volume estimé, conditions commerciales, animations prévues)
- **FR8:** Un fournisseur peut modifier une offre existante
- **FR9:** Un fournisseur peut supprimer une offre existante
- **FR10:** Un fournisseur peut consulter la liste de ses propres offres
- **FR11:** Un fournisseur peut voir le statut de ses offres (active, expirée)

### Découverte des offres (Magasin)

- **FR12:** Un magasin peut consulter la liste de toutes les offres disponibles
- **FR13:** Un magasin peut filtrer les offres par catégorie
- **FR14:** Un magasin peut filtrer les offres par date de validité
- **FR15:** Un magasin peut filtrer les offres par fournisseur
- **FR16:** Un magasin peut filtrer les offres par enseigne compatible
- **FR17:** Un magasin peut voir le détail complet d'une offre

### Interactions Magasin → Fournisseur

- **FR18:** Un magasin peut envoyer une "Demande de renseignements" sur une offre
- **FR19:** Un magasin peut envoyer une intention "Souhaite passer commande" sur une offre
- **FR20:** Un magasin peut ajouter un message personnalisé à sa demande
- **FR21:** Un magasin peut consulter l'historique de ses demandes envoyées
- **FR22:** Un magasin peut voir le statut de ses demandes (en attente, répondu)

### Gestion des demandes (Fournisseur)

- **FR23:** Un fournisseur peut voir les demandes reçues sur ses offres
- **FR24:** Un fournisseur peut voir les informations du magasin demandeur (nom, enseigne, ville, contact)
- **FR25:** Un fournisseur peut marquer une demande comme traitée
- **FR26:** Un fournisseur peut filtrer ses demandes par type (renseignements / commande)
- **FR27:** Un fournisseur peut filtrer ses demandes par statut (nouveau, traité)

### Notifications

- **FR28:** Un fournisseur reçoit une notification in-app quand un magasin envoie une demande sur son offre
- **FR29:** Un fournisseur reçoit une notification email quand un magasin envoie une demande sur son offre
- **FR30:** Un utilisateur peut voir ses notifications non lues
- **FR31:** Un utilisateur peut marquer une notification comme lue

### Isolation des données

- **FR32:** Un fournisseur ne peut voir que ses propres offres et les demandes associées
- **FR33:** Un magasin ne peut voir que ses propres demandes envoyées
- **FR34:** Les données commerciales sensibles (marges proposées) ne sont visibles que par les magasins, pas par les autres fournisseurs

## Non-Functional Requirements

### Performance

| NFR | Critère mesurable |
|-----|-------------------|
| **NFR1:** Temps de chargement initial | < 2 secondes sur connexion 3G |
| **NFR2:** Temps de réponse actions utilisateur | < 500ms pour les interactions (clic, filtre, navigation) |
| **NFR3:** Temps d'affichage liste offres | < 1 seconde pour afficher 50 offres |
| **NFR4:** Fluidité de l'interface | < 16ms frame time (60fps minimum) lors du scroll ou des transitions |
| **NFR5:** Taille du bundle PWA | < 500KB pour le chargement initial |

### Sécurité

| NFR | Critère mesurable |
|-----|-------------------|
| **NFR6:** Authentification | Tokens JWT avec expiration, refresh token sécurisé |
| **NFR7:** Isolation des données | 100% des requêtes filtrées par tenant_id vérifié côté serveur |
| **NFR8:** Chiffrement transit | HTTPS obligatoire (TLS 1.2+) |
| **NFR9:** Chiffrement stockage | Données sensibles chiffrées au repos |
| **NFR10:** Protection des marges | Marges visibles uniquement par les magasins, jamais exposées aux autres fournisseurs |
| **NFR11:** Conformité RGPD | Consentement explicite, droit de suppression, données hébergées en France/EU |

### Disponibilité

| NFR | Critère mesurable |
|-----|-------------------|
| **NFR12:** Uptime cible | 99.5% disponibilité (hors maintenance planifiée) |
| **NFR13:** Maintenance planifiée | Fenêtres de maintenance hors heures ouvrées (avant 7h ou après 20h) |
| **NFR14:** Récupération panne | RTO (Recovery Time Objective) < 4 heures |

### Compatibilité (Multi-devices)

| NFR | Critère mesurable |
|-----|-------------------|
| **NFR15:** Navigateurs supportés | Chrome, Safari, Firefox (2 dernières versions majeures) |
| **NFR16:** Devices supportés | Mobile (iOS/Android), Tablette, PC, Boîtiers magasin |
| **NFR17:** PWA installable | Ajout à l'écran d'accueil fonctionnel sur mobile |
| **NFR18:** Responsive design | Interface adaptée de 320px à 1920px de largeur |

### Considérations futures (Post-MVP)

| NFR | Phase |
|-----|-------|
| Mode offline / dégradé | Phase 2 - si connexion instable confirmée comme problème |
| Scalabilité multi-fournisseurs | Phase 2 - ouverture marketplace |
| Accessibilité WCAG 2.1 AA | Phase 2 - si requis par clients enterprise |

