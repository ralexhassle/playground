# Instructions Copilot pour le Monorepo Fullstack

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Architecture du Projet

Ce monorepo utilise Nx avec pnpm et contient :

- **Frontend** (`apps/frontend`): Application React avec Vite et TypeScript
- **Backend** (`apps/backend`): Serveur Node.js avec Fastify et Drizzle ORM
- **Types partagés** (`libs/types`): Bibliothèque TypeScript partagée
- **Base de données**: PostgreSQL dockerisée avec Drizzle ORM

## Conventions de Code

### Types et Imports

- Utilisez les types partagés via `@/types`
- Préférez les imports nommés aux imports par défaut
- Types explicites pour les paramètres API Fastify

### Base de Données

- Utilisez Drizzle ORM pour toutes les interactions DB
- Schémas définis dans `apps/backend/src/db/schema.ts`
- Connexion configurée dans `apps/backend/src/db/connection.ts`
- Migrations avec `drizzle-kit`

### API Backend

- Routes organisées dans `apps/backend/src/routes/`
- Validation avec Zod (schémas Drizzle)
- Typage strict des réponses Fastify
- Gestion d'erreurs cohérente

### Frontend

- Composants fonctionnels avec hooks
- CSS Modules pour le styling
- Types API importés depuis `@/types`
- React Router pour la navigation

## Commandes Utiles

### Développement

- `pnpm dev`: Lance l'environnement complet
- `pnpm frontend:dev`: Frontend seulement
- `pnpm backend:dev`: Backend seulement (avec hot reload tsx)

### Base de Données

- `pnpm db:up`: Démarre PostgreSQL
- `pnpm db:studio`: Interface Drizzle Studio
- `pnpm db:generate`: Génère les migrations
- `pnpm db:push`: Applique les changements sans migration

### Outils

- `pnpm format`: Formatage Prettier
- `pnpm lint`: Vérification ESLint

## Structure des Fichiers

```
apps/
  frontend/
    src/main.tsx          # Point d'entrée React
    src/app/app.tsx       # Composant principal
    vite.config.ts        # Configuration Vite
  backend/
    src/main.ts           # Point d'entrée Fastify
    src/db/connection.ts  # Connexion Drizzle
    src/db/schema.ts      # Schémas de base
    src/routes/           # Routes API
libs/
  types/src/index.ts      # Types partagés
```

## Bonnes Pratiques

1. **Toujours** utiliser les types partagés pour la communication API
2. **Valider** les données avec les schémas Drizzle/Zod
3. **Organiser** les routes backend par domaine métier
4. **Documenter** les nouveaux endpoints dans `agent.yaml`
5. **Tester** la connexion DB avant les opérations
6. **Gérer** les erreurs de façon cohérente côté API

## Configuration Spécifique

- **Path mapping**: `@/types` pointe vers `libs/types/src/index.ts`
- **Versions Node**: Frontend (20+), Backend (18+) avec `.nvmrc`
- **Hot reload**: Vite (frontend) et tsx (backend)
- **CORS**: Configuré pour localhost:4200
- **Docker**: PostgreSQL sur port 5432

Lors de modifications des schémas DB, pensez à :

1. Mettre à jour `libs/types` si nécessaire
2. Générer/appliquer les migrations Drizzle
3. Mettre à jour la documentation API
