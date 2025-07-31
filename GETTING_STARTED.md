# Guide de démarrage du projet

## 🚀 Mise en route

### 1. Vérification des prérequis

```bash
# Vérifier Node.js (recommandé: utiliser nvm)
node --version  # Doit être 18+ pour le backend, 20+ pour le frontend
pnpm --version  # Doit être installé
docker --version && docker-compose --version  # Doit être installé et démarré
```

### 2. Installation des dépendances

```bash
pnpm install
```

### 3. Démarrage de la base de données

```bash
# Si Docker fonctionne
docker-compose up -d postgres

# Vérifier que PostgreSQL est démarré
docker ps | grep postgres
```

### 4. Test de la configuration

```bash
# Test de build du backend
pnpm nx build backend

# Test de build du frontend
pnpm nx build frontend

# Test des types partagés
pnpm nx build types
```

### 5. Démarrage en développement

#### Option A: Tout en une fois

```bash
pnpm dev
```

#### Option B: Services séparés (plus de contrôle)

```bash
# Terminal 1: Backend avec hot reload
pnpm backend:dev

# Terminal 2: Frontend avec Vite
pnpm frontend:dev
```

## 🔧 Dépannage

### Problème Docker

Si Docker n'est pas disponible, vous pouvez :

1. Installer PostgreSQL localement
2. Mettre à jour `DATABASE_URL` dans les variables d'environnement
3. Démarrer PostgreSQL manuellement

### Problème de permissions

```bash
# Sur macOS/Linux, assurer que Docker est démarré
sudo systemctl start docker  # Linux
# ou ouvrir Docker Desktop sur macOS

# Vérifier les permissions
sudo chmod 666 /var/run/docker.sock  # Si nécessaire
```

### Problème de ports

Vérifier que les ports sont libres :

```bash
lsof -i :3000  # Backend
lsof -i :4200  # Frontend
lsof -i :5432  # PostgreSQL
```

### Problème de types

Si les imports `@/types` ne fonctionnent pas :

```bash
# Vérifier la configuration des paths
cat tsconfig.base.json | grep -A 5 paths

# Rebuilder les types
pnpm nx build types
```

## 📊 Vérification du bon fonctionnement

### Backend

```bash
curl http://localhost:3000/ping
# Doit retourner un JSON avec "pong"
```

### Frontend

Ouvrir http://localhost:4200 dans le navigateur

### Base de données

```bash
# Se connecter à PostgreSQL
docker exec -it fullstack-postgres psql -U postgres -d fullstack_db

# Vérifier les tables
\dt app.*
```

## 🎯 Points d'entrée pour le développement

- **Frontend** : `apps/frontend/src/main.tsx`
- **Backend** : `apps/backend/src/main.ts`
- **Types** : `libs/types/src/index.ts`
- **Base de données** : `apps/backend/src/db/schema.ts`

Bon développement ! 🚀
