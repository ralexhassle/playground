# TheSession Database - Résumé du Projet

## 🎵 Vue d'Ensemble

**TheSession Database** est une architecture de base de données complète pour analyser, stocker et rechercher les données musicales traditionnelles irlandaises de [TheSession.org](https://thesession.org/). Le projet offre des capacités de recherche avancées, d'analyse musicale et de découverte géospatiale.

## 🎯 Objectifs Principaux

- **Recherche musicale intelligente** avec correspondance floue et similarité mélodique
- **Géolocalisation des sessions** pour découvrir la musique traditionnelle par région
- **Analyse des relations musicales** entre morceaux, sets, albums et lieux
- **Architecture évolutive** prête pour intégration dans un mono-repo NX
- **Types TypeScript stricts** pour un développement sûr

## 📊 Entités de Données

### 🎼 Entités Musicales Core

| Entité            | Description                         | Données Clés                                     |
| ----------------- | ----------------------------------- | ------------------------------------------------ |
| **Tunes**         | Morceaux musicaux                   | Nom, type (reel/jig), notation ABC, mode musical |
| **Tune Sets**     | Séquences ordonnées de morceaux     | Groupement thématique, ordre de jeu              |
| **Recordings**    | Albums et pistes commerciales       | Artistes, albums, mapping vers morceaux          |
| **Tune Settings** | Arrangements multiples d'un morceau | Variations, contributeurs, versions              |

### 🌍 Entités Géographiques & Sociales

| Entité       | Description                           | Données Clés                         |
| ------------ | ------------------------------------- | ------------------------------------ |
| **Sessions** | Lieux physiques de sessions musicales | Adresses, coordonnées GPS, fréquence |
| **Users**    | Contributeurs et musiciens            | Noms d'utilisateur, contributions    |

### 🔗 Métadonnées & Relations

| Entité           | Description                     | Données Clés                               |
| ---------------- | ------------------------------- | ------------------------------------------ |
| **Aliases**      | Noms alternatifs des morceaux   | Amélioration de la recherche textuelle     |
| **Popularity**   | Statistiques d'engagement       | Scores de popularité multi-critères        |
| **Similarities** | Similarités musicales calculées | Scores mélodiques, rythmiques, harmoniques |

## 🏗️ Architecture Technique

### Base de Données (PostgreSQL + PostGIS)

```
🎵 Tables Core:
├── tunes (données canoniques des morceaux)
├── tune_settings (notation ABC + analyse musicale)
├── tune_sets + set_compositions (séquences ordonnées)
├── recordings + tracks + track_tunes (discographie)
├── sessions (emplacements géographiques)
└── tune_similarities (scores de similarité précalculés)

🔍 Recherche & Analyse:
├── Index full-text avec tsvector
├── Requêtes géospatiales PostGIS
├── Similarité trigram pour correspondance floue
└── Vues matérialisées pour performance
```

### Moteur de Recherche (Elasticsearch)

```
📑 Index:
├── tunes (noms, alias, caractéristiques musicales)
├── recordings (albums, artistes, pistes)
├── sessions (lieux, localisations)
└── Synchronisation temps réel depuis PostgreSQL
```

## 🚀 Capacités de Recherche Avancées

### 1. **Recherche Floue de Morceaux**

```sql
-- Trouve des morceaux avec des noms similaires
SELECT t.*, similarity(t.canonical_name, 'cooley') as score
FROM tunes t
WHERE similarity(t.canonical_name, 'cooley') > 0.3
ORDER BY score DESC;
```

### 2. **Découverte Géographique de Sessions**

```sql
-- Sessions dans un rayon de 50km
SELECT s.venue_name, ST_Distance(...) / 1000 as distance_km
FROM sessions s
WHERE ST_DWithin(s.location::geography, ST_Point(-2.244, 53.483)::geography, 50000)
ORDER BY distance_km;
```

### 3. **Recherche de Similarité Musicale**

```sql
-- Morceaux similaires par analyse mélodique
SELECT t2.canonical_name, ts.composite_similarity
FROM tune_similarities ts
JOIN tunes t2 ON ts.tune_id_2 = t2.tune_id
WHERE ts.tune_id_1 = 1 AND ts.composite_similarity > 0.7
ORDER BY ts.composite_similarity DESC;
```

## 🎶 Analyse Musicale

### Caractéristiques Extraites

```typescript
interface MusicalFeatures {
  melodic_contour: number[]; // [-1,1,0,1,-1] = direction mélodique
  intervals: number[]; // [2,-3,4,-2] = intervalles en demi-tons
  rhythmic_pattern: string; // "XLXS-XLS" = pattern rythmique encodé
  harmonic_analysis?: object; // Progressions d'accords
}
```

### Métriques de Similarité

- **Mélodique**: Comparaison des contours et intervalles
- **Rythmique**: Analyse des patterns temporels
- **Harmonique**: Progressions d'accords et modulations
- **Composite**: Score pondéré multi-dimensionnel

## 📋 Workflow d'Utilisation

### 1. **Traitement des Données**

```bash
# Installation et compilation
npm install && npm run build

# Traitement des fichiers JSON
npm run process

# Import en base de données
psql thesession < schema.sql
# Puis import des fichiers processed_*.json
```

### 2. **Cas d'Usage Typiques**

#### **"Recherche de Cooley's"**

→ Trouve le morceau + variantes + albums contenant + sets populaires + sessions proches

#### **"Sessions près de Dublin"**

→ Géolocalisation avec rayon, filtrage par activité

#### **"Morceaux similaires à X"**

→ Analyse musicale automatique, suggestions basées sur la similarité

#### **"Sets populaires de reels"**

→ Scoring multi-critères, composition des sets

## 🔧 Stack Technologique

| Composant            | Technologie              | Usage                                 |
| -------------------- | ------------------------ | ------------------------------------- |
| **Base de données**  | PostgreSQL 15+ + PostGIS | Données relationnelles + géospatiales |
| **Recherche**        | Elasticsearch 8+         | Recherche textuelle floue avancée     |
| **Cache**            | Redis                    | Données fréquemment accédées          |
| **Backend**          | Node.js + TypeScript     | API et traitement de données          |
| **Analyse musicale** | ABC notation parsing     | Extraction de caractéristiques        |

## 📈 Performance & Optimisation

### Index Clés

```sql
-- Recherche textuelle
CREATE INDEX idx_tunes_search ON tunes USING GIN(search_vector);
CREATE INDEX idx_tunes_name_trgm ON tunes USING GIN(canonical_name gin_trgm_ops);

-- Géospatial
CREATE INDEX idx_sessions_location ON sessions USING GIST(location);

-- Similarité
CREATE INDEX idx_similarities_score ON tune_similarities(composite_similarity DESC);
```

### Stratégie de Cache

- **PostgreSQL**: Requêtes transactionnelles et géospatiales
- **Elasticsearch**: Toutes les recherches textuelles
- **Redis**: Données de morceaux fréquemment accédées
- **Vues matérialisées**: Morceaux populaires précalculés

## 🎯 Exemple de Requête Complexe

**"Trouve les sets populaires contenant 'Cooley's' avec sessions à proximité de Dublin"**

```sql
WITH tune_sets AS (
  SELECT sc.set_id, ts.set_name, COUNT(*) as set_size
  FROM set_compositions sc
  JOIN tune_sets ts ON sc.set_id = ts.set_id
  WHERE sc.tune_id = 1 -- "Cooley's"
  GROUP BY sc.set_id, ts.set_name
)
SELECT ts.set_name, s.venue_name, s.town,
       ST_Distance(s.location::geography, ST_Point(-6.266, 53.350)::geography) / 1000 as distance_km
FROM tune_sets ts
CROSS JOIN sessions s
WHERE s.is_active = true
  AND ST_DWithin(s.location::geography, ST_Point(-6.266, 53.350)::geography, 100000)
ORDER BY ts.set_size DESC, distance_km ASC;
```

## 🚀 Prochaines Étapes

### Court Terme

- [ ] **Intégration NX**: Mono-repo avec packages séparés
- [ ] **API REST/GraphQL**: Endpoints pour recherche avancée
- [ ] **Tests automatisés**: Couverture complète des fonctionnalités

### Moyen Terme

- [ ] **Machine Learning**: Modèles pour améliorer la similarité musicale
- [ ] **Interface utilisateur**: Frontend React pour exploration des données
- [ ] **Audio matching**: Correspondance avec enregistrements audio

### Long Terme

- [ ] **Recommandations personnalisées**: Système de recommandation basé sur le comportement
- [ ] **Communauté sociale**: Fonctionnalités collaboratives pour musiciens
- [ ] **Mobile**: Application mobile avec géolocalisation

## 💡 Points Forts du Projet

✅ **Architecture évolutive** avec séparation claire des responsabilités  
✅ **Types TypeScript stricts** pour un développement sûr  
✅ **Recherche multicritères** (textuelle, géographique, musicale)  
✅ **Analyse musicale automatisée** depuis notation ABC  
✅ **Performance optimisée** avec indexes et cache appropriés  
✅ **Données réelles** de TheSession.org (communauté active)

## 📚 Ressources

- **Documentation technique complète**: `TECHNICAL_README.md`
- **Analyse des entités**: `DATABASE_ANALYSIS.md`
- **Types TypeScript**: `types.ts`
- **Schéma de base**: `schema.sql`
- **Processeur de données**: `data-processor.ts`

---

**Résumé**: Ce projet constitue une base solide pour développer des applications de recherche et d'analyse musicale avancées, avec un focus sur la musique traditionnelle irlandaise et des capacités d'extension vers d'autres domaines musicaux.
