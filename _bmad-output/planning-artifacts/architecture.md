---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowStatus: 'complete'
completedAt: '2026-02-03'
inputDocuments:
  - 'product-brief-aurelien-project-2026-01-25.md'
  - 'prd.md'
  - 'prd-validation-report.md'
  - 'ux-design-specification.md'
workflowType: 'architecture'
project_name: 'aurelien-project'
user_name: 'Youssef'
date: '2026-02-03'
---

# Architecture Decision Document

_Ce document se construit de manière collaborative à travers une découverte étape par étape. Les sections sont ajoutées au fur et à mesure que nous travaillons ensemble sur chaque décision architecturale._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
34 exigences fonctionnelles organisées en 7 domaines :
- **Gestion des comptes (FR1-5)** : Authentification, inscription, reset password pour 2 populations
- **Offres Fournisseur (FR6-11)** : CRUD complet des offres promotionnelles
- **Découverte Magasin (FR12-17)** : Consultation, filtrage multi-critères
- **Interactions (FR18-22)** : Demandes de renseignements, intentions de commande
- **Gestion demandes Fournisseur (FR23-27)** : Réception, traitement, filtrage
- **Notifications (FR28-31)** : Email + In-app, temps réel
- **Isolation données (FR32-34)** : Multi-tenancy, confidentialité commerciale

**Non-Functional Requirements:**
18 NFRs répartis en 4 catégories :
- **Performance** : < 2s chargement, < 500ms interactions, 60fps UI
- **Sécurité** : JWT, TLS 1.2+, isolation tenant, RGPD
- **Disponibilité** : 99.5% uptime, RTO < 4h
- **Compatibilité** : PWA, multi-device (mobile-first), responsive 320px-1920px

**Scale & Complexity:**
- Primary domain: Full-stack Web Application (PWA)
- Complexity level: Medium
- Estimated architectural components: 8-12 (Auth, Users, Offers, Requests, Notifications, Storage, API, Frontend)

### Technical Constraints & Dependencies

| Contrainte | Source | Impact |
|------------|--------|--------|
| PWA obligatoire | Product Brief + PRD | Architecture frontend orientée Service Worker |
| Hébergement France/EU | RGPD (NFR11) | Choix provider cloud limité |
| Mobile-first | UX Spec | API optimisée mobile, payloads légers |
| Pas d'intégrations MVP | PRD | Application standalone, API interne uniquement |
| Pilote contrôlé | Stratégie MVP | Scalabilité progressive, pas d'over-engineering |

### Cross-Cutting Concerns Identified

| Concern | Description | Stratégie |
|---------|-------------|-----------|
| **Authentication** | JWT stateless, 2 rôles distincts | Middleware centralisé |
| **Authorization** | RBAC Fournisseur/Magasin | Guards par route/endpoint |
| **Data Isolation** | tenant_id sur toutes les entités | Filtrage systématique |
| **Notifications** | Push + In-app + Email | Service dédié |
| **Performance** | Mobile 3G, < 2s | CDN, cache, optimisation |
| **Observability** | Logs, métriques, alertes | Monitoring centralisé |

## Starter Template Evaluation

### Primary Technology Domain

Full-stack Web Application (PWA) basée sur les exigences du projet : marketplace B2B, mobile-first, notifications temps réel.

### Starter Options Considered

| Option | Description | Verdict |
|--------|-------------|---------|
| `create-next-app` officiel | Base Next.js 15 + TypeScript + Tailwind | ✅ Recommandé |
| `with-supabase` example | Next.js + Supabase pré-configuré | Alternative viable |
| T3 Stack | Next.js + tRPC + Prisma + Tailwind | Over-engineered pour MVP |
| Next.js Commerce | E-commerce focused | Pas adapté (marketplace B2B) |

### Selected Starter: create-next-app + Stack Custom

**Rationale for Selection:**
- Contrôle total sur la configuration
- Alignement exact avec les spécifications UX (shadcn/ui)
- Flexibilité pour ajouter Supabase et Prisma selon nos besoins
- Pas de dépendances inutiles

**Initialization Command:**

```bash
npx create-next-app@latest aurelien-project \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### Architectural Decisions Provided by Stack

**Language & Runtime:**
- TypeScript 5.x strict mode
- Node.js 20+ LTS
- React 19 (via Next.js 15)

**Database & Backend:**
- Supabase (PostgreSQL) — Région EU (Frankfurt) pour RGPD
- Supabase Auth — JWT, refresh tokens, social login ready
- Supabase Realtime — Pour notifications temps réel
- Row Level Security — Pour isolation multi-tenant

**ORM:**
- Prisma ORM avec Prisma Studio
- Migrations versionées
- Types générés automatiquement

**Styling Solution:**
- Tailwind CSS 3.x
- shadcn/ui components (installation séparée)
- CSS Variables pour theming

**Build Tooling:**
- Next.js Turbopack (dev)
- Webpack (production)
- SWC pour compilation TypeScript

**Code Organization:**
```
src/
├── app/              # App Router (pages, layouts, API routes)
├── components/       # UI components (shadcn + custom)
├── lib/              # Utilities, Supabase client, Prisma
├── types/            # TypeScript types
└── styles/           # Global styles
```

**Development Experience:**
- Hot reload avec Turbopack
- ESLint + Prettier pré-configurés
- TypeScript strict
- Vercel CLI pour preview deployments

**Note:** L'initialisation du projet avec cette stack sera la première story d'implémentation.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Multi-tenant isolation via Supabase RLS
- Authentication flow avec Supabase Auth
- Data model (Supplier, Store, Offer, Request)

**Important Decisions (Shape Architecture):**
- Server Actions pour les mutations
- React Query pour le cache client
- Zod pour la validation

**Deferred Decisions (Post-MVP):**
- Offline mode (PWA cache strategy)
- Advanced analytics
- Rate limiting fin (au-delà de Vercel Edge)

### Data Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | Supabase PostgreSQL (EU-Frankfurt) | RGPD, Auth intégré, RLS |
| ORM | Prisma | DX, types, migrations |
| Validation | Zod | Runtime validation, TypeScript-first |
| Cache | React Query (TanStack Query) | Server state management |

**Data Model:**
- `Supplier` — Fournisseur (id, company_name, email, phone, created_at)
- `Store` — Magasin (id, name, brand, email, city, phone, created_at)
- `Offer` — Offre (id, supplier_id, name, promo_price, discount_pct, start_date, end_date, category, photo_url, margin, volume, conditions, status)
- `Request` — Demande (id, store_id, offer_id, type[info|order], message, status, created_at)
- `Notification` — Notification (id, user_id, user_type, title, body, read, created_at)

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth Provider | Supabase Auth | JWT, built-in, EU compliant |
| Session | JWT + Refresh tokens | Stateless, secure |
| Multi-tenant | Supabase RLS | Database-level isolation |
| API Security | Vercel Edge Middleware | Rate limiting, CORS |

**RBAC Model:**
- Role `supplier` → CRUD own offers, view requests on own offers
- Role `store` → Read all offers, CRUD own requests

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Mutations | Next.js Server Actions | Type-safe, collocated |
| Data Fetching | React Server Components | Streaming, performance |
| External Webhooks | API Routes | Flexibility |
| Error Format | Result<T> pattern | Consistent handling |

**Notification Strategy:**
- In-app: Supabase Realtime subscriptions
- Email: Resend (ou Supabase Email) via Edge Functions
- Push: Web Push API (post-MVP)

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State (Server) | React Query | Cache, invalidation |
| State (Client) | React Context | Simple, built-in |
| Components | shadcn/ui + custom | As per UX Spec |
| Forms | React Hook Form + Zod | Validation, performance |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Hosting | Vercel | Next.js native, CD |
| Database | Supabase Cloud (EU) | Managed, RGPD |
| CDN | Vercel Edge Network | Global, automatic |
| Monitoring | Vercel Analytics | Core Web Vitals |

**Environment Strategy:**
- `development` → Local + Supabase dev project
- `preview` → Vercel preview + Supabase dev
- `production` → Vercel prod + Supabase prod (EU)

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**15+ points de conflit potentiels identifiés et adressés**

### Naming Patterns

**Database (PostgreSQL/Prisma):**
- Tables: `snake_case` pluriel (`suppliers`, `offers`, `requests`)
- Columns: `snake_case` (`company_name`, `promo_price`)
- Primary keys: `id` (UUID)
- Foreign keys: `{table}_id` (`supplier_id`)
- Indexes: `idx_{table}_{column}`
- Enums: `PascalCase` (`RequestType`, `OfferStatus`)

**API & Routes (Next.js):**
- Routes: `kebab-case` (`/api/offers`, `/my-requests`)
- Dynamic params: `[param]` (`/offers/[id]`)
- Query params: `camelCase` (`?supplierId=123`)
- Server Actions: `camelCase` verb+noun (`createOffer`)

**Code (TypeScript/React):**
- Components: `PascalCase` (`OfferCard`)
- Files: `kebab-case.tsx` (`offer-card.tsx`)
- Functions: `camelCase` (`getOfferById`)
- Variables: `camelCase` (`currentUser`)
- Constants: `SCREAMING_SNAKE_CASE` (`MAX_FILE_SIZE`)
- Types: `PascalCase` (`Offer`, `CreateOfferInput`)
- Hooks: `use` + `PascalCase` (`useOffers`)

### Structure Patterns

**Project Organization:**
- App Router groups: `(auth)`, `(supplier)`, `(store)`
- Components: `/components/ui/` (shadcn), `/components/custom/` (métier)
- Server Actions: `/lib/actions/`
- Queries: `/lib/queries/`
- Utilities: `/lib/utils/`
- Types: `/types/`

**Test Location:**
- Unit tests: Co-located (`*.test.ts` next to source)
- E2E tests: `/e2e/` at root

### Format Patterns

**API Response Format (MANDATORY):**
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

**Date Formats:**
- Database: `timestamptz`
- JSON/API: ISO 8601 (`"2026-02-15T09:00:00Z"`)
- UI Display: `dd/MM/yyyy`

**JSON Naming:** `camelCase` in API responses

### Communication Patterns

**Supabase Realtime:**
- Channel: `{entity}:{id}` (`supplier:123`)
- Event: `{entity}.{action}` (`request.created`)

**React Query Keys:**
- List: `[entity, 'list', filters]`
- Detail: `[entity, 'detail', id]`

### Process Patterns

**Error Handling:**
- Error Boundary at app level
- Toast for action errors
- Console.error for debugging

**Loading States:**
- Initial load: Skeleton components
- Action pending: Spinner in button
- Refresh: Pull-to-refresh

**Validation:**
- Client: Zod + React Hook Form
- Server: Zod (always re-validate)
- Database: Prisma constraints

### Enforcement Guidelines

**All AI Agents MUST:**
1. Follow naming conventions exactly as specified
2. Use the `ActionResult<T>` pattern for all Server Actions
3. Place files in correct directories per structure patterns
4. Co-locate unit tests with source files
5. Use React Query for server state management
6. Validate with Zod on both client and server

## Project Structure & Boundaries

### Complete Project Directory Structure

```
aurelien-project/
├── README.md
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json
├── .env.local / .env.example
├── .github/workflows/ci.yml
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── public/
│   ├── manifest.json (PWA)
│   └── images/
│
├── e2e/ (Playwright tests)
│
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── loading.tsx
    │   ├── error.tsx
    │   ├── not-found.tsx
    │   │
    │   ├── (auth)/                 # FR1-5: Authentication
    │   │   ├── layout.tsx
    │   │   ├── login/page.tsx
    │   │   ├── register/
    │   │   │   ├── page.tsx
    │   │   │   ├── supplier/page.tsx
    │   │   │   └── store/page.tsx
    │   │   ├── forgot-password/page.tsx
    │   │   └── reset-password/page.tsx
    │   │
    │   ├── (supplier)/             # FR6-11, FR23-27: Supplier space
    │   │   ├── layout.tsx
    │   │   ├── dashboard/page.tsx
    │   │   ├── offers/
    │   │   │   ├── page.tsx
    │   │   │   ├── new/page.tsx
    │   │   │   └── [id]/
    │   │   │       ├── page.tsx
    │   │   │       └── edit/page.tsx
    │   │   ├── requests/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/page.tsx
    │   │   └── profile/page.tsx
    │   │
    │   ├── (store)/                # FR12-22: Store space
    │   │   ├── layout.tsx
    │   │   ├── offers/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/page.tsx
    │   │   ├── my-requests/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/page.tsx
    │   │   └── profile/page.tsx
    │   │
    │   └── api/webhooks/
    │       └── email/route.ts
    │
    ├── components/
    │   ├── ui/                     # shadcn/ui components
    │   ├── custom/                 # Business components
    │   │   ├── offer-card.tsx
    │   │   ├── offer-list.tsx
    │   │   ├── offer-filters.tsx
    │   │   ├── request-card.tsx
    │   │   ├── request-list.tsx
    │   │   ├── bottom-navigation.tsx
    │   │   ├── notification-badge.tsx
    │   │   ├── filter-chips.tsx
    │   │   └── photo-upload.tsx
    │   ├── forms/
    │   │   ├── login-form.tsx
    │   │   ├── register-supplier-form.tsx
    │   │   ├── register-store-form.tsx
    │   │   ├── offer-form.tsx
    │   │   └── request-form.tsx
    │   └── layout/
    │       ├── mobile-layout.tsx
    │       ├── page-header.tsx
    │       └── error-fallback.tsx
    │
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts
    │   │   ├── server.ts
    │   │   ├── middleware.ts
    │   │   └── realtime.ts
    │   ├── prisma/
    │   │   └── client.ts
    │   ├── actions/
    │   │   ├── auth.ts
    │   │   ├── offers.ts
    │   │   ├── requests.ts
    │   │   └── notifications.ts
    │   ├── queries/
    │   │   ├── offers.ts
    │   │   ├── requests.ts
    │   │   ├── notifications.ts
    │   │   └── user.ts
    │   ├── hooks/
    │   │   ├── use-auth.ts
    │   │   ├── use-offers.ts
    │   │   ├── use-requests.ts
    │   │   └── use-notifications.ts
    │   └── utils/
    │       ├── validation.ts
    │       ├── format.ts
    │       ├── cn.ts
    │       └── constants.ts
    │
    ├── types/
    │   ├── database.ts
    │   └── api.ts
    │
    └── middleware.ts
```

### Architectural Boundaries

**API Boundaries:**
- Auth: `lib/supabase/` + `middleware.ts`
- Mutations: `lib/actions/*.ts` (Server Actions)
- Queries: `lib/queries/*.ts` (RSC data fetching)
- External: `app/api/webhooks/`

**Component Boundaries:**
- UI primitives: `components/ui/` (shadcn, no business logic)
- Business components: `components/custom/` (typed props, hooks)
- Forms: `components/forms/` (RHF + Zod + Actions)

**Data Boundaries:**
- Multi-tenant isolation: Supabase RLS
- Role-based access: Middleware + RLS
- Public data: Offers visible to all stores

### Requirements to Structure Mapping

| FR Category | Primary Location |
|-------------|------------------|
| FR1-5 (Auth) | `app/(auth)/`, `lib/actions/auth.ts` |
| FR6-11 (Supplier Offers) | `app/(supplier)/offers/` |
| FR12-17 (Store Discovery) | `app/(store)/offers/` |
| FR18-22 (Interactions) | `app/(store)/my-requests/` |
| FR23-27 (Supplier Requests) | `app/(supplier)/requests/` |
| FR28-31 (Notifications) | `lib/supabase/realtime.ts` |
| FR32-34 (Isolation) | `prisma/schema.prisma`, RLS |

### Integration Points

**Internal Communication:**
- Server Components → `lib/queries/` → Prisma → Supabase
- Client Components → Server Actions → Prisma → Supabase
- Realtime → Supabase Realtime subscriptions

**External Integrations:**
- Email notifications: Resend via `app/api/webhooks/email/`
- (Post-MVP) Payments: Stripe via `app/api/webhooks/stripe/`

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
Toutes les technologies sélectionnées sont compatibles et fonctionnent ensemble nativement :
- Next.js 15 + Supabase (intégration officielle @supabase/ssr)
- Prisma + PostgreSQL (Supabase)
- shadcn/ui + Tailwind CSS (conçus ensemble)
- Vercel + Next.js (plateforme native)

**Pattern Consistency:**
Les patterns d'implémentation sont alignés avec le stack :
- Conventions de nommage cohérentes (snake_case DB, camelCase code)
- Server Actions conformes à Next.js 15 App Router
- RLS natif à Supabase pour l'isolation multi-tenant

**Structure Alignment:**
La structure du projet supporte toutes les décisions architecturales :
- Route groups alignés avec les rôles utilisateur
- Séparation claire actions/queries/components
- Tests co-localisés selon les patterns définis

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
- FR1-5 (Auth): Supabase Auth + app/(auth)/
- FR6-11 (Supplier Offers): app/(supplier)/offers/ + lib/actions/offers.ts
- FR12-17 (Store Discovery): app/(store)/offers/ + lib/queries/offers.ts
- FR18-22 (Interactions): lib/actions/requests.ts
- FR23-27 (Supplier Requests): app/(supplier)/requests/
- FR28-31 (Notifications): Supabase Realtime + components
- FR32-34 (Isolation): Supabase RLS + middleware.ts

**Coverage: 34/34 FRs (100%)**

**Non-Functional Requirements Coverage:**
- Performance: Vercel Edge + RSC + React Query
- Security: Supabase Auth (JWT) + RLS + Vercel TLS
- Availability: Managed services (99.5%+)
- RGPD: Supabase EU-Frankfurt region
- PWA: manifest.json + Service Worker ready

**Coverage: 18/18 NFRs (100%)**

### Implementation Readiness Validation ✅

**Decision Completeness:** All critical decisions documented with rationale
**Structure Completeness:** Full directory tree with file-level mapping
**Pattern Completeness:** Comprehensive naming, format, and process patterns

### Gap Analysis Results

**Critical Gaps:** 0
**Important Gaps:** 0
**Minor Gaps:** 3 (PWA Service Worker details, Email service selection, Error tracking)

All minor gaps are post-MVP concerns and do not block implementation.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Medium)
- [x] Technical constraints identified (RGPD, PWA, Mobile-first)
- [x] Cross-cutting concerns mapped (Auth, RLS, Notifications)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established (DB, API, Code)
- [x] Structure patterns defined
- [x] Communication patterns specified (Realtime, React Query)
- [x] Process patterns documented (Errors, Loading, Validation)

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
- Stack moderne et cohérent (Next.js 15 + Supabase)
- Isolation multi-tenant native (RLS)
- Performance optimisée (Vercel Edge, RSC)
- RGPD compliant (EU region)
- Patterns clairs pour les agents AI

**Areas for Future Enhancement:**
- PWA offline mode (Post-MVP)
- Advanced analytics (Post-MVP)
- Chat intégré (Phase 3)
- Paiement en ligne (Phase 3)

### Implementation Handoff

**AI Agent Guidelines:**
1. Follow all architectural decisions exactly as documented
2. Use implementation patterns consistently across all components
3. Respect project structure and boundaries
4. Use `ActionResult<T>` for ALL Server Actions
5. Apply Zod validation on client AND server
6. Refer to this document for all architectural questions

**First Implementation Priority:**

```bash
npx create-next-app@latest aurelien-project \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

Then setup: Supabase project (EU), Prisma, shadcn/ui, environment variables.

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2026-02-03
**Document Location:** `_bmad-output/planning-artifacts/architecture.md`

### Final Architecture Deliverables

**📋 Complete Architecture Document**
- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**
- 25+ architectural decisions made
- 15+ implementation patterns defined
- 8 architectural components specified
- 52 requirements (34 FR + 18 NFR) fully supported

**📚 AI Agent Implementation Guide**
- Technology stack with verified versions
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing aurelien-project. Follow all decisions, patterns, and structures exactly as documented.

**First Implementation Priority:**

```bash
npx create-next-app@latest aurelien-project \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

**Development Sequence:**
1. Initialize project using documented starter template
2. Set up Supabase project (EU-Frankfurt region)
3. Configure Prisma with Supabase connection
4. Install shadcn/ui components
5. Build features following established patterns
6. Maintain consistency with documented rules

### Quality Assurance Checklist

**✅ Architecture Coherence**
- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**✅ Requirements Coverage**
- [x] All functional requirements are supported (34/34)
- [x] All non-functional requirements are addressed (18/18)
- [x] Cross-cutting concerns are handled
- [x] Integration points are defined

**✅ Implementation Readiness**
- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Examples are provided for clarity

### Project Success Factors

**🎯 Clear Decision Framework**
Every technology choice was made collaboratively with clear rationale, ensuring all stakeholders understand the architectural direction.

**🔧 Consistency Guarantee**
Implementation patterns and rules ensure that multiple AI agents will produce compatible, consistent code that works together seamlessly.

**📋 Complete Coverage**
All project requirements are architecturally supported, with clear mapping from business needs to technical implementation.

**🏗️ Solid Foundation**
The chosen starter template and architectural patterns provide a production-ready foundation following current best practices.

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.

