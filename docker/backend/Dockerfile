# Dockerfile pour l'application backend
FROM node:20-alpine AS base

# Installation de pnpm
RUN npm install -g pnpm

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers de configuration
COPY package.json pnpm-lock.yaml ./
COPY tsconfig.base.json ./

# Installation des dépendances
RUN pnpm install --frozen-lockfile

# Copie du code source
COPY apps/backend ./apps/backend
COPY libs ./libs

# Build de l'application
RUN pnpm nx build backend

# Stage de production
FROM node:20-alpine AS production

# Installation de pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copie des fichiers nécessaires
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copie de l'application buildée
COPY --from=base /app/dist ./dist
COPY --from=base /app/libs ./libs

# Exposition du port
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Commande de démarrage
CMD ["node", "dist/apps/backend/main.js"]
