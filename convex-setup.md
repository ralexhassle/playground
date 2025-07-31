# Intégration Convex (Future)

Ce fichier prépare l'intégration future avec Convex.

## Installation

```bash
# Quand prêt à intégrer Convex :
pnpm add convex
npx convex dev
```

## Structure suggérée

```
convex/
  _generated/    # Fichiers générés par Convex
  functions/     # Fonctions Convex
  schema.ts      # Schéma Convex
```

## Types partagés

Les types Convex pourront être ajoutés à `libs/types` pour maintenir
la cohérence avec l'architecture existante.

## Migration depuis Drizzle

Si besoin de migrer depuis PostgreSQL/Drizzle vers Convex :

1. Mapper les schémas Drizzle vers les schémas Convex
2. Créer des scripts de migration des données
3. Mettre à jour les types partagés
4. Adapter les routes backend pour utiliser Convex
