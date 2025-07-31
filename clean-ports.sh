#!/bin/bash

echo "🧹 Nettoyage des ports utilisés par l'application"
echo "==============================================="

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Ports à nettoyer
PORTS=(3000 4200 5432)
PORT_NAMES=("Backend" "Frontend" "PostgreSQL")

for i in "${!PORTS[@]}"; do
    PORT=${PORTS[i]}
    NAME=${PORT_NAMES[i]}
    
    echo -e "\n${YELLOW}🔍 Vérification du port $PORT ($NAME)${NC}"
    
    # Trouver les processus utilisant le port
    PIDS=$(lsof -ti :$PORT 2>/dev/null)
    
    if [ -z "$PIDS" ]; then
        echo -e "  ${GREEN}✓ Port $PORT libre${NC}"
    else
        echo -e "  ${RED}⚠ Port $PORT utilisé par le(s) processus: $PIDS${NC}"
        
        # Demander confirmation pour tuer les processus
        echo "  Processus trouvés:"
        lsof -i :$PORT 2>/dev/null | head -5
        
        read -p "  Tuer ces processus ? (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            for PID in $PIDS; do
                kill -9 $PID 2>/dev/null
                if [ $? -eq 0 ]; then
                    echo -e "    ${GREEN}✓ Processus $PID tué${NC}"
                else
                    echo -e "    ${RED}✗ Impossible de tuer le processus $PID${NC}"
                fi
            done
        else
            echo -e "    ${YELLOW}⏸ Processus conservés${NC}"
        fi
    fi
done

echo -e "\n${GREEN}🎉 Nettoyage terminé !${NC}"
echo ""
echo "Vous pouvez maintenant relancer votre application avec :"
echo -e "${YELLOW}pnpm dev${NC}"
