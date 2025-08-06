# 🔐 Guide d'authentification et d'utilisation de l'API

## 📋 Résumé des problèmes résolus

### ✅ Problèmes corrigés :

1. **Erreur 500 lors de l'authentification**

   - **Cause** : Colonne `password_hash` manquante dans la base de données
   - **Solution** : Application du schéma Drizzle avec `pnpm db:push`

2. **Gestion d'erreurs non canonique**

   - **Ajout** : Gestionnaire d'erreurs global avec réponses standardisées
   - **Format** : Réponses JSON cohérentes avec `success`, `error`, `message`, `timestamp`

3. **Absence d'utilisateur de test**
   - **Solution 1** : Script de création d'admin via variables d'environnement
   - **Solution 2** : Endpoint `/api/auth/register` pour créer des utilisateurs

## 🚀 Démarrage rapide

### 1. Démarrer l'environnement complet

```bash
# Base de données
pnpm db:up

# Backend + Frontend
pnpm dev
```

### 2. Créer un utilisateur administrateur

```bash
# Configurer les variables dans .env
ADMIN_EMAIL=admin@example.com
ADMIN_NAME=Alexandre
ADMIN_PASSWORD=admin123456

# Créer l'utilisateur
pnpm create:admin
```

### 3. Tester l'authentification

**Via curl :**

```bash
# Connexion
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123456"}'

# Créer un utilisateur
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User", "password": "test123456"}'
```

**Via Postman :**

- Importer `postman-collection.json`
- Utiliser "Login Admin" pour s'authentifier
- Le token sera automatiquement sauvegardé pour les autres requêtes

## 🔑 Endpoints d'authentification

### POST `/api/auth/login`

Connexion utilisateur

**Requête :**

```json
{
  "email": "admin@example.com",
  "password": "admin123456"
}
```

**Réponse (succès) :**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "739343c1-2154-47b8-882f-ef60fa0ce0c5",
    "name": "Alexandre",
    "email": "admin@example.com",
    "createdAt": "2025-08-04T13:49:32.849Z"
  }
}
```

**Réponse (erreur) :**

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### POST `/api/auth/register`

Création d'un nouvel utilisateur

**Requête :**

```json
{
  "email": "nouveau@example.com",
  "name": "Nouvel Utilisateur",
  "password": "motdepasse123"
}
```

**Réponse (succès) :**

```json
{
  "id": "5931ac34-21c2-4e7a-9380-48a96f96843b",
  "name": "Nouvel Utilisateur",
  "email": "nouveau@example.com",
  "createdAt": "2025-08-04T13:50:11.021Z",
  "updatedAt": "2025-08-04T13:50:11.021Z"
}
```

**Réponse (conflit) :**

```json
{
  "success": false,
  "message": "Un utilisateur avec cet email existe déjà"
}
```

## 🛡️ Utilisation du token d'authentification

Une fois connecté, utilisez le token dans le header `Authorization` :

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🗄️ Gestion de la base de données

### Commandes utiles :

```bash
# Appliquer le schéma
pnpm db:push

# Ouvrir Drizzle Studio
pnpm db:studio

# Réinitialiser la base de données
pnpm db:reset
```

### Structure de la table `users` :

- `id` : UUID (clé primaire)
- `email` : VARCHAR(255) (unique)
- `name` : VARCHAR(255)
- `password_hash` : VARCHAR(255)
- `created_at` : TIMESTAMP
- `updated_at` : TIMESTAMP

## 🧪 Tests et validation

### Avec curl :

```bash
# Test de santé
curl http://localhost:3000/ping

# Test d'authentification
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123456"}'

# Test des utilisateurs (avec token)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Avec Postman :

1. Importer `postman-collection.json`
2. Exécuter "Login Admin" dans le dossier "Auth"
3. Tester les autres endpoints (le token est auto-configuré)

### Avec le frontend :

1. Ouvrir http://localhost:4200
2. Aller sur la page de connexion
3. Se connecter avec `admin@example.com` / `admin123456`

## 🎯 Procédures recommandées

### Pour créer le premier utilisateur :

1. **Option 1 (Recommandée)** : Utiliser le script `pnpm create:admin`
2. **Option 2** : Utiliser l'endpoint `/api/auth/register` via Postman
3. **Option 3** : Utiliser curl pour créer un utilisateur

### Pour les tests d'API :

1. **Postman** : Collection complète avec variables automatiques
2. **curl** : Scripts rapides pour tests ponctuels
3. **Frontend** : Interface utilisateur complète

### Pour le développement :

1. Utiliser `pnpm dev` pour l'environnement complet
2. Utiliser `pnpm db:studio` pour inspecter la base de données
3. Vérifier les logs du backend pour debugger

## 🔧 Dépannage

### "column password_hash does not exist"

```bash
pnpm db:push
```

### "Invalid credentials" inattendu

Vérifier que l'utilisateur existe dans la base de données avec `pnpm db:studio`

### Port 3000 occupé

```bash
pnpm clean:ports
```

### Réinitialisation complète

```bash
pnpm db:reset
pnpm create:admin
pnpm dev
```
