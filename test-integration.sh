#!/bin/bash

echo "🚀 Test d'intégration du monorepo Nx Fullstack"
echo "=================================================="

# Couleurs pour l'affichage
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Vérifier que les services sont démarrés
echo -e "\n${YELLOW}1. Vérification des services${NC}"
echo "Frontend (port 4200):"
if curl -s http://localhost:4200 > /dev/null; then
    echo -e "  ${GREEN}✓ Frontend actif${NC}"
else
    echo -e "  ${RED}✗ Frontend inactif${NC}"
fi

echo "Backend (port 3000):"
if curl -s http://localhost:3000/ping > /dev/null; then
    echo -e "  ${GREEN}✓ Backend actif${NC}"
else
    echo -e "  ${RED}✗ Backend inactif${NC}"
fi

echo "Base de données PostgreSQL:"
if docker ps | grep -q fullstack-postgres; then
    echo -e "  ${GREEN}✓ PostgreSQL actif${NC}"
else
    echo -e "  ${RED}✗ PostgreSQL inactif${NC}"
fi

# Test 2: Test de l'API
echo -e "\n${YELLOW}2. Test des endpoints API${NC}"

echo "Test du health check:"
PING_RESPONSE=$(curl -s http://localhost:3000/ping)
if echo "$PING_RESPONSE" | grep -q "pong"; then
    echo -e "  ${GREEN}✓ Health check OK${NC}"
    echo "    Response: $(echo $PING_RESPONSE | jq -r '.message')"
else
    echo -e "  ${RED}✗ Health check KO${NC}"
fi

echo "Test de l'API info:"
API_INFO=$(curl -s http://localhost:3000/api/info)
if echo "$API_INFO" | grep -q "Backend API"; then
    echo -e "  ${GREEN}✓ API info OK${NC}"
    echo "    API: $(echo $API_INFO | jq -r '.name + " v" + .version')"
else
    echo -e "  ${RED}✗ API info KO${NC}"
fi

echo "Test des utilisateurs:"
USERS_COUNT=$(curl -s http://localhost:3000/api/users | jq length)
echo -e "  ${GREEN}✓ Endpoint utilisateurs OK${NC}"
echo "    Nombre d'utilisateurs: $USERS_COUNT"

# Test 3: Test CRUD complet
echo -e "\n${YELLOW}3. Test CRUD complet${NC}"

# Créer un utilisateur de test
TEST_USER=$(curl -s -X POST http://localhost:3000/api/users \
    -H "Content-Type: application/json" \
    -d '{"name": "Test User", "email": "test@example.com"}')

if echo "$TEST_USER" | grep -q "Test User"; then
    USER_ID=$(echo $TEST_USER | jq -r '.id')
    echo -e "  ${GREEN}✓ Création utilisateur OK${NC}"
    echo "    ID: $USER_ID"
    
    # Récupérer l'utilisateur
    GET_USER=$(curl -s http://localhost:3000/api/users/$USER_ID)
    if echo "$GET_USER" | grep -q "Test User"; then
        echo -e "  ${GREEN}✓ Récupération utilisateur OK${NC}"
    else
        echo -e "  ${RED}✗ Récupération utilisateur KO${NC}"
    fi
    
    # Mettre à jour l'utilisateur
    UPDATE_USER=$(curl -s -X PUT http://localhost:3000/api/users/$USER_ID \
        -H "Content-Type: application/json" \
        -d '{"name": "Test User Updated", "email": "test-updated@example.com"}')
    
    if echo "$UPDATE_USER" | grep -q "Test User Updated"; then
        echo -e "  ${GREEN}✓ Mise à jour utilisateur OK${NC}"
    else
        echo -e "  ${RED}✗ Mise à jour utilisateur KO${NC}"
    fi
    
    # Supprimer l'utilisateur
    DELETE_RESPONSE=$(curl -s -X DELETE http://localhost:3000/api/users/$USER_ID)
    if echo "$DELETE_RESPONSE" | grep -q "supprimé"; then
        echo -e "  ${GREEN}✓ Suppression utilisateur OK${NC}"
    else
        echo -e "  ${RED}✗ Suppression utilisateur KO${NC}"
    fi
else
    echo -e "  ${RED}✗ Création utilisateur KO${NC}"
fi

# Test 4: Vérification de l'architecture
echo -e "\n${YELLOW}4. Vérification de l'architecture${NC}"

echo "Types partagés:"
if [ -f "libs/types/src/index.ts" ]; then
    echo -e "  ${GREEN}✓ Bibliothèque de types présente${NC}"
else
    echo -e "  ${RED}✗ Bibliothèque de types manquante${NC}"
fi

echo "Build des projets:"
if [ -d "dist/libs/types" ]; then
    echo -e "  ${GREEN}✓ Types compilés${NC}"
else
    echo -e "  ${RED}✗ Types non compilés${NC}"
fi

echo -e "\n${GREEN}🎉 Test d'intégration terminé !${NC}"
echo "=================================================="
echo ""
echo "Services actifs:"
echo "  • Frontend: http://localhost:4200"
echo "  • Backend: http://localhost:3000"
echo "  • API Documentation: http://localhost:3000/api/info"
echo "  • Drizzle Studio: https://local.drizzle.studio"
echo ""
echo "Commandes utiles:"
echo "  • pnpm dev          # Démarrer l'environnement complet"
echo "  • pnpm db:studio    # Ouvrir Drizzle Studio"
echo "  • pnpm nx build backend  # Build backend"
echo "  • pnpm nx build frontend # Build frontend"
