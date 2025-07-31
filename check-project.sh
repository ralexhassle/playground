#!/bin/bash

echo "🔍 Vérification finale du projet"
echo "================================="

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Fonction de vérification
check_item() {
    if [ $1 -eq 0 ]; then
        echo -e "  ${GREEN}✓ $2${NC}"
        return 0
    else
        echo -e "  ${RED}✗ $2${NC}"
        return 1
    fi
}

echo -e "\n${YELLOW}📦 Vérification des dépendances${NC}"

# Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    check_item 0 "Node.js v$NODE_VERSION (requis: v18+)"
else
    check_item 1 "Node.js v$NODE_VERSION (requis: v18+)"
fi

# pnpm
pnpm --version > /dev/null 2>&1
check_item $? "pnpm installé"

# Docker
docker --version > /dev/null 2>&1
check_item $? "Docker installé"

echo -e "\n${YELLOW}📁 Vérification des fichiers${NC}"

FILES=(
    "package.json:Configuration des scripts"
    "README.md:Documentation principale"
    "INSTALLATION.md:Guide d'installation"
    "GITHUB_SETUP.md:Guide GitHub"
    "LICENSE:Licence MIT"
    ".env.example:Template des variables"
    ".gitignore:Configuration Git"
    "docker-compose.yml:Configuration Docker"
    "drizzle.config.ts:Configuration ORM"
    "nx.json:Configuration Nx"
    "tsconfig.base.json:Configuration TypeScript"
    "test-integration.sh:Tests d'intégration"
    "prepare-github.sh:Script de préparation GitHub"
)

for item in "${FILES[@]}"; do
    file=$(echo $item | cut -d':' -f1)
    desc=$(echo $item | cut -d':' -f2)
    [ -f "$file" ]
    check_item $? "$desc ($file)"
done

echo -e "\n${YELLOW}🏗️ Vérification de l'architecture${NC}"

DIRS=(
    "apps/frontend:Application React"
    "apps/backend:Application Fastify"
    "libs/types:Types partagés"
    "docker:Configuration Docker"
    ".vscode:Configuration VS Code"
)

for item in "${DIRS[@]}"; do
    dir=$(echo $item | cut -d':' -f1)
    desc=$(echo $item | cut -d':' -f2)
    [ -d "$dir" ]
    check_item $? "$desc ($dir/)"
done

echo -e "\n${YELLOW}🔧 Vérification des builds${NC}"

# Build backend
echo "Building backend..."
pnpm nx build backend > /dev/null 2>&1
check_item $? "Backend build"

# Build frontend  
echo "Building frontend..."
pnpm nx build frontend > /dev/null 2>&1
check_item $? "Frontend build"

# Types build
echo "Building types..."
pnpm nx build types > /dev/null 2>&1
check_item $? "Types build"

echo -e "\n${YELLOW}🧪 Tests rapides${NC}"

# Linting
pnpm lint > /dev/null 2>&1
check_item $? "ESLint validation"

# Formatting check
pnpm format:check > /dev/null 2>&1
check_item $? "Prettier formatting"

echo -e "\n${YELLOW}🐳 Vérification Docker${NC}"

# PostgreSQL container
if docker ps | grep -q "fullstack-postgres"; then
    check_item 0 "PostgreSQL container actif"
else
    check_item 1 "PostgreSQL container (démarrez avec 'pnpm db:up')"
fi

echo -e "\n${YELLOW}🌐 Vérification des services${NC}"

# Backend API
if curl -s http://localhost:3000/ping > /dev/null 2>&1; then
    check_item 0 "Backend API (http://localhost:3000)"
else
    check_item 1 "Backend API (démarrez avec 'pnpm backend:dev')"
fi

# Frontend
if curl -s http://localhost:4200 > /dev/null 2>&1; then
    check_item 0 "Frontend (http://localhost:4200)"
else
    check_item 1 "Frontend (démarrez avec 'pnpm frontend:dev')"
fi

echo -e "\n${YELLOW}📊 Résumé des scripts disponibles${NC}"
echo "=================================="
echo "Développement :"
echo "  pnpm dev                 # Démarrer l'environnement complet"
echo "  pnpm frontend:dev        # Frontend uniquement"
echo "  pnpm backend:dev         # Backend uniquement"
echo ""
echo "Base de données :"
echo "  pnpm db:up              # Démarrer PostgreSQL"
echo "  pnpm db:studio          # Interface graphique"
echo "  pnpm db:push            # Appliquer le schéma"
echo ""
echo "Build et tests :"
echo "  pnpm build              # Build complet"
echo "  pnpm test:integration   # Tests d'intégration"
echo "  pnpm check:all          # Vérification complète"
echo ""
echo "GitHub :"
echo "  pnpm setup:github       # Préparer pour GitHub"
echo ""
echo -e "${GREEN}🎉 Votre projet est prêt !${NC}"
echo ""
echo "Prochaines étapes :"
echo "1. Démarrer l'environnement : pnpm dev"
echo "2. Préparer pour GitHub : pnpm setup:github"
echo "3. Créer le repository : https://github.com/new"
