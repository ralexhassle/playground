# 📋 Guide d'Installation et de Déploiement

## 🛠️ Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants :

### Outils requis

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **pnpm** v8+ (package manager) : `npm install -g pnpm`
- **Docker & Docker Compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

### Vérification des versions

```bash
node --version    # v18+
pnpm --version    # v8+
docker --version  # v20+
git --version     # v2+
```

## 📦 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/ralexhassle/monorepo-nx-fullstack.git
cd monorepo-nx-fullstack
```

### 2. Installer les dépendances

```bash
# Installation de toutes les dépendances du monorepo
pnpm install

# Vérifier que l'installation s'est bien passée
pnpm nx --version
```

### 3. Configuration de l'environnement

```bash
# Copier le fichier d'exemple des variables d'environnement
cp .env.example .env

# Optionnel : Modifier les variables selon vos besoins
# Les valeurs par défaut fonctionnent pour le développement local
nano .env  # ou votre éditeur préféré
```

### 4. Préparer la base de données

```bash
# Démarrer PostgreSQL avec Docker
pnpm db:up

# Attendre quelques secondes que PostgreSQL soit prêt, puis appliquer le schéma
pnpm db:push
```

## 🚀 Lancement du Projet

### Démarrage complet (recommandé)

```bash
# Lance frontend + backend + base de données
pnpm dev
```

Cette commande démarre :

- **Frontend React** : http://localhost:4200
- **Backend Fastify** : http://localhost:3000
- **PostgreSQL** : localhost:5432
- **Drizzle Studio** : https://local.drizzle.studio (avec `pnpm db:studio`)

### Démarrage individuel des services

```bash
# Frontend uniquement
pnpm frontend:dev

# Backend uniquement
pnpm backend:dev

# Base de données uniquement
pnpm db:up
```

### Vérification que tout fonctionne

```bash
# Tester l'API backend
curl http://localhost:3000/ping

# Lancer le script de test d'intégration
./test-integration.sh
```

## 🐳 Environnement Docker Complet

### Option 1 : Docker Compose (Production-like)

```bash
# Construire et démarrer tous les services
pnpm docker:up

# Voir les logs en temps réel
pnpm docker:logs

# Arrêter tous les services
pnpm docker:down
```

### Option 2 : Docker pour développement

```bash
# Base de données uniquement (recommandé pour le dev)
pnpm db:up

# Frontend et Backend en mode développement (hot reload)
pnpm dev
```

## 🔧 Commandes Utiles

### Développement

```bash
pnpm dev              # Environnement complet
pnpm lint             # Vérification ESLint
pnpm format           # Formatage Prettier
pnpm build            # Build production (frontend + backend)
```

### Base de données

```bash
pnpm db:studio        # Interface graphique Drizzle
pnpm db:push          # Appliquer le schéma (dev)
pnpm db:generate      # Générer les migrations
pnpm db:reset         # Reset complet de la DB
```

### Docker

```bash
pnpm docker:up        # Démarrer tous les containers
pnpm docker:down      # Arrêter tous les containers
pnpm docker:logs      # Voir les logs
```

### Tests

```bash
./test-integration.sh # Test complet de l'intégration
pnpm test            # Tests unitaires (à configurer)
```

## 📚 Structure du Projet

```
monorepo-nx-fullstack/
├── apps/
│   ├── frontend/          # React + Vite + TypeScript
│   └── backend/           # Node.js + Fastify + Drizzle ORM
├── libs/
│   └── types/             # Types TypeScript partagés
├── docker/
│   ├── Dockerfile.backend # Image Docker backend
│   └── init.sql          # Init script PostgreSQL
├── .env.example          # Variables d'environnement
├── docker-compose.yml    # Configuration Docker
├── drizzle.config.ts     # Configuration Drizzle ORM
└── package.json          # Scripts et dépendances
```

## 🌐 URLs des Services

| Service            | URL de développement           | Description         |
| ------------------ | ------------------------------ | ------------------- |
| **Frontend**       | http://localhost:4200          | Interface React     |
| **Backend API**    | http://localhost:3000          | API RESTful         |
| **Health Check**   | http://localhost:3000/ping     | Status des services |
| **API Docs**       | http://localhost:3000/api/info | Documentation API   |
| **Drizzle Studio** | https://local.drizzle.studio   | Interface BDD       |
| **PostgreSQL**     | localhost:5432                 | Base de données     |

## ⚠️ Résolution de Problèmes

### Docker n'est pas accessible

```bash
# macOS/Linux : Démarrer Docker Desktop
# Ou vérifier les permissions Docker
sudo usermod -aG docker $USER
```

### Port déjà utilisé

```bash
# Trouver le processus qui utilise le port 3000 ou 4200
lsof -ti:3000 | xargs kill -9
lsof -ti:4200 | xargs kill -9
```

### Base de données inaccessible

```bash
# Redémarrer PostgreSQL
pnpm db:down
pnpm db:up
pnpm db:push
```

### Problème de build TypeScript

```bash
# Nettoyer et rebuilder
pnpm nx reset
pnpm install
pnpm nx build backend
```

## 🚀 Prêt pour le Développement !

Une fois l'installation terminée :

1. **Démarrez l'environnement** : `pnpm dev`
2. **Ouvrez votre navigateur** : http://localhost:4200
3. **Testez l'API** : http://localhost:3000/ping
4. **Explorez la base de données** : `pnpm db:studio`

Pour plus de détails, consultez le [README.md](./README.md) principal.
