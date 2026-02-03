# Aurelien Project

Plateforme de mise en relation fournisseurs-magasins.

## Stack Technique

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod

## Getting Started

1. Copier les variables d'environnement :
   ```bash
   cp .env.example .env.local
   ```

2. Configurer les variables dans `.env.local` avec vos valeurs Supabase

3. Installer les dépendances :
   ```bash
   npm install
   ```

4. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```

5. Ouvrir [http://localhost:3000](http://localhost:3000)

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run lint` | Linting ESLint |
| `npm run db:generate` | Générer le client Prisma |
| `npm run db:migrate` | Exécuter les migrations |
| `npm run db:push` | Push schema vers la DB |
| `npm run db:studio` | Interface Prisma Studio |

## Structure du Projet

```
src/
├── app/           # Routes Next.js (App Router)
├── lib/
│   ├── supabase/  # Clients Supabase (browser/server)
│   └── prisma/    # Client Prisma singleton
└── ...
```
