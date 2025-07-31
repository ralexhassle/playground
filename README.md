# 🚀 Monorepo Fullstack Nx

![Nx](https://img.shields.io/badge/Nx-21.3.10-143055?logo=nx)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Fastify](https://img.shields.io/badge/Fastify-5-000000?logo=fastify)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)
![License](https://img.shields.io/badge/License-MIT-green)

> 🚀 **Production-ready fullstack TypeScript monorepo** built with Nx, React, Fastify, and PostgreSQL. Features hot reload, Docker support, and shared type libraries.

Un monorepo moderne et prêt à l'emploi avec Nx, React, Fastify et PostgreSQL.

## 🚀 Démarrage Rapide

```bash
# 1. Cloner le repository
git clone https://github.com/ralexhassle/playground.git
cd playground

# 2. Installer les dépendances
pnpm install

# 3. Configurer l'environnement
cp .env.example .env

# 4. Démarrer l'environnement complet
pnpm dev
```

**🎉 C'est tout !** Votre stack complète est maintenant accessible :

- **Frontend** : http://localhost:4200
- **Backend API** : http://localhost:3000
- **Database Studio** : `pnpm db:studio`

📖 **Pour plus de détails** : consultez [INSTALLATION.md](./INSTALLATION.md)

## ✨ Fonctionnalités

- **🔥 Hot Reload** : Frontend (Vite) et Backend (tsx)
- **📦 Types partagés** : Communication typée entre frontend et backend
- **🗄️ Base de données** : PostgreSQL dockerisée avec Drizzle ORM
- **🛠️ Outils de développement** : ESLint, Prettier, gestion des versions Node
- **🐳 Docker** : Configuration complète pour développement et production
- **🤖 Agent-friendly** : Documentation complète pour les outils d'IA

## 🏗️ Architecture

```
apps/
├── frontend/          # React + Vite + TypeScript
│   ├── src/main.tsx   # Point d'entrée
│   └── src/app/       # Composants React
└── backend/           # Node.js + Fastify + Drizzle
    ├── src/main.ts    # Serveur Fastify
    ├── src/db/        # Configuration base de données
    └── src/routes/    # Routes API

libs/
└── types/             # Types TypeScript partagés
    └── src/index.ts   # Exports des types

docker/
├── postgres/          # Configuration PostgreSQL
└── backend/           # Dockerfile backend
```

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ (voir `.nvmrc`)
- pnpm
- Docker & Docker Compose

### Installation

```bash
# Cloner et installer les dépendances
pnpm install

# Démarrer l'environnement complet
pnpm dev
```

Cette commande lance :

- 🐘 PostgreSQL (port 5432)
- 🚀 Backend Fastify (port 3000)
- ⚡ Frontend React (port 4200)

## 📋 Scripts disponibles

### Développement

```bash
pnpm dev                # Lance tout l'environnement
pnpm frontend:dev       # Frontend seulement
pnpm backend:dev        # Backend seulement
```

### Base de données

```bash
pnpm db:up             # Démarre PostgreSQL
pnpm db:down           # Arrête PostgreSQL
pnpm db:reset          # Recrée la base de données
pnpm db:studio         # Interface Drizzle Studio
pnpm db:generate       # Génère les migrations
pnpm db:push           # Applique les changements
```

### Build et qualité

```bash
pnpm build             # Build frontend + backend
pnpm lint              # Linting ESLint
pnpm format            # Formatage Prettier
```

### Docker

```bash
pnpm docker:up         # Lance tous les services
pnpm docker:down       # Arrête tous les services
pnpm docker:logs       # Voir les logs
```

## 🌐 Endpoints

- **Frontend** : http://localhost:4200
- **Backend API** : http://localhost:3000
- **Base de données** : localhost:5432
- **Adminer** : http://localhost:8080 (avec `--profile tools`)

### API Endpoints

- `GET /ping` - Health check avec status DB
- `GET /api/info` - Informations sur l'API
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Mettre à jour un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur

## 🗄️ Base de données

### Drizzle ORM

Ce projet utilise Drizzle ORM pour une approche moderne et typée :

```typescript
// Schéma défini dans apps/backend/src/db/schema.ts
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  // ...
});
```

### Commandes utiles

```bash
# Introspection avec Drizzle Studio
pnpm db:studio

# Voir le schéma PostgreSQL
docker exec -it fullstack-postgres psql -U postgres -d fullstack_db -c "\dt app.*"

# Se connecter à la base
docker exec -it fullstack-postgres psql -U postgres -d fullstack_db
```

## 🔧 Configuration

### Versions Node.js

Le projet utilise différentes versions Node via `.nvmrc` :

- **Racine & Frontend** : Node 20+
- **Backend** : Node 18+ (compatibilité serveur)

```bash
# Utiliser la bonne version
nvm use
```

### Variables d'environnement

Créer un `.env` si nécessaire :

```env
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fullstack_db
LOG_LEVEL=info
```

## 🛠️ Développement

### Types partagés

Les types sont centralisés dans `libs/types` et importés via `@/types` :

```typescript
// Backend
import type { PingResponse, User } from '@/types';

// Frontend
import type { ApiInfo, User } from '@/types';
```

### Hot Reload

- **Frontend** : Vite (rechargement instantané)
- **Backend** : tsx (redémarrage automatique)

### Ajout de nouvelles routes

1. Créer le fichier de route dans `apps/backend/src/routes/`
2. Enregistrer dans `apps/backend/src/main.ts`
3. Ajouter les types dans `libs/types/src/index.ts`
4. Mettre à jour `agent.yaml` et la documentation

## 🐳 Docker

### Développement

```bash
# PostgreSQL seulement
pnpm db:up

# Tous les services (dev)
pnpm docker:up
```

### Production

```bash
# Build avec profil production
docker-compose --profile production up -d
```

## 🤖 Agent-Friendly

Le projet est optimisé pour les outils d'IA avec :

- **`agent.yaml`** : Documentation complète de l'architecture
- **`.github/copilot-instructions.md`** : Instructions spécifiques à Copilot
- **Types partagés** : Communication typée
- **Structure claire** : Organisation modulaire et predictible

## 🔮 Intégrations futures

### Convex (préparé)

Le projet est prêt pour une intégration Convex :

```bash
# Quand nécessaire
pnpm add convex
npx convex dev
```

Voir `convex-setup.md` pour plus de détails.

## 📄 Licence

MIT

---

**Happy coding! 🎉**
