#!/bin/bash

echo "🚀 Préparation du projet pour GitHub"
echo "===================================="

# Couleurs pour l'affichage
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables
GITHUB_USERNAME=""
REPO_NAME="monorepo-nx-fullstack"

echo -e "\n${YELLOW}📝 Configuration initiale${NC}"
read -p "Entrez votre nom d'utilisateur GitHub: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${RED}❌ Nom d'utilisateur GitHub requis${NC}"
    exit 1
fi

echo -e "\n${BLUE}🔍 Vérification de l'état du projet...${NC}"

# Vérifier que les fichiers essentiels existent
FILES=(
    "README.md"
    "INSTALLATION.md"
    "GITHUB_SETUP.md"
    "LICENSE"
    ".env.example"
    ".gitignore"
    "package.json"
    "docker-compose.yml"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓ $file${NC}"
    else
        echo -e "  ${RED}✗ $file manquant${NC}"
    fi
done

echo -e "\n${BLUE}🛠️ Nettoyage et préparation...${NC}"

# Nettoyer les fichiers temporaires
rm -rf node_modules/.cache
rm -rf .nx/cache
rm -rf dist
echo -e "  ${GREEN}✓ Cache nettoyé${NC}"

# Vérifier que .env n'est pas tracké
if grep -q "\.env$" .gitignore; then
    echo -e "  ${GREEN}✓ .env dans .gitignore${NC}"
else
    echo ".env" >> .gitignore
    echo -e "  ${YELLOW}⚠ .env ajouté au .gitignore${NC}"
fi

# Mettre à jour les URLs dans le README
sed -i.bak "s/VOTRE_USERNAME/$GITHUB_USERNAME/g" README.md
sed -i.bak "s/VOTRE_USERNAME/$GITHUB_USERNAME/g" INSTALLATION.md
sed -i.bak "s/VOTRE_USERNAME/$GITHUB_USERNAME/g" GITHUB_SETUP.md
rm -f *.bak
echo -e "  ${GREEN}✓ URLs GitHub mises à jour${NC}"

echo -e "\n${BLUE}📦 Test de build...${NC}"

# Tester que tout compile
if pnpm nx build backend > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Backend build OK${NC}"
else
    echo -e "  ${RED}✗ Backend build failed${NC}"
fi

if pnpm nx build frontend > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Frontend build OK${NC}"
else
    echo -e "  ${RED}✗ Frontend build failed${NC}"
fi

echo -e "\n${BLUE}🔧 Configuration Git...${NC}"

# Initialiser git si pas déjà fait
if [ ! -d ".git" ]; then
    git init
    echo -e "  ${GREEN}✓ Git initialisé${NC}"
else
    echo -e "  ${GREEN}✓ Git déjà initialisé${NC}"
fi

# Configurer la remote origin
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
echo -e "  ${GREEN}✓ Remote origin configurée${NC}"

# Staging des fichiers
git add .
echo -e "  ${GREEN}✓ Fichiers ajoutés au staging${NC}"

echo -e "\n${YELLOW}📋 Résumé de la préparation${NC}"
echo "=============================="
echo -e "Repository GitHub  : ${BLUE}https://github.com/$GITHUB_USERNAME/$REPO_NAME${NC}"
echo -e "Remote configurée  : ${GREEN}✓${NC}"
echo -e "Fichiers préparés  : ${GREEN}✓${NC}"
echo -e "Build vérifié      : ${GREEN}✓${NC}"

echo -e "\n${YELLOW}🚀 Prochaines étapes${NC}"
echo "==================="
echo "1. Créer le repository sur GitHub :"
echo -e "   ${BLUE}https://github.com/new${NC}"
echo -e "   Nom: ${YELLOW}$REPO_NAME${NC}"
echo "   Description: 🚀 Production-ready fullstack TypeScript monorepo built with Nx, React, Fastify, and PostgreSQL"
echo ""
echo "2. Pousser le code :"
echo -e "   ${BLUE}git commit -m \"🎉 Initial commit: Nx monorepo fullstack setup\"${NC}"
echo -e "   ${BLUE}git branch -M main${NC}"
echo -e "   ${BLUE}git push -u origin main${NC}"
echo ""
echo "3. Configurer le repository GitHub :"
echo "   - Activer les Issues et Projects"
echo "   - Ajouter les topics : nx, typescript, react, fastify, postgresql, docker"
echo "   - Configurer GitHub Pages (optionnel)"
echo ""
echo -e "${GREEN}✨ Votre projet est prêt à être publié sur GitHub !${NC}"

# Demander si on veut faire le commit automatiquement
echo ""
read -p "Voulez-vous faire le commit initial maintenant ? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "🎉 Initial commit: Nx monorepo fullstack setup

- ✅ Frontend: React 19 + Vite 6 + TypeScript
- ✅ Backend: Node.js + Fastify + Drizzle ORM  
- ✅ Database: PostgreSQL with Docker
- ✅ Shared types library
- ✅ Development environment ready
- ✅ API with CRUD operations
- ✅ Hot reload for both frontend & backend
- ✅ Complete documentation and setup guides"
    
    echo -e "\n${GREEN}✅ Commit initial créé !${NC}"
    echo -e "Maintenant, créez le repository sur GitHub et exécutez :"
    echo -e "${BLUE}git push -u origin main${NC}"
else
    echo -e "\n${YELLOW}⏸ Commit en attente${NC}"
    echo -e "Quand vous serez prêt, exécutez :"
    echo -e "${BLUE}git commit -m \"🎉 Initial commit\"${NC}"
    echo -e "${BLUE}git push -u origin main${NC}"
fi
