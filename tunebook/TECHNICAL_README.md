# TheSession Database Project

A comprehensive database architecture for traditional Irish music data from [TheSession.org](https://thesession.org/), designed for advanced musical search, analysis, and discovery.

## Project Overview

This project provides a complete solution for processing, storing, and querying traditional music data with support for:

- **Fuzzy text search** with PostgreSQL and Elasticsearch integration
- **Geospatial queries** for session location discovery
- **Musical similarity analysis** based on melodic contour, intervals, and rhythmic patterns
- **Scalable architecture** ready for NX monorepo integration
- **Type-safe TypeScript** interfaces for all data entities

## Data Entities

### Core Musical Entities

- **Tunes**: Musical compositions with metadata (type, meter, mode, ABC notation)
- **Tune Sets**: Ordered sequences of tunes played together in sessions
- **Recordings**: Commercial albums and tracks containing tunes
- **Tune Settings**: Multiple arrangements/versions of each tune

### Geographic & Social Entities

- **Sessions**: Physical locations for traditional music sessions
- **Users**: Contributors and community members

### Metadata & Reference

- **Aliases**: Alternative names for tunes to enhance search
- **Popularity**: Usage statistics and community engagement metrics
- **Similarities**: Computed musical similarity scores between tunes

## Architecture

### Database (PostgreSQL + PostGIS)

```
Core Tables:
├── tunes (canonical tune data)
├── tune_settings (ABC notation + musical analysis)
├── tune_sets + set_compositions (ordered tune sequences)
├── recordings + tracks + track_tunes (discography)
├── sessions (geographic locations)
└── tune_similarities (computed similarity scores)

Search & Analysis:
├── Full-text search with tsvector indexes
├── PostGIS geospatial queries
├── Trigram similarity for fuzzy matching
└── Materialized views for performance
```

### Search Engine (Elasticsearch)

```
Indexes:
├── tunes (names, aliases, musical features)
├── recordings (albums, artists, tracks)
├── sessions (venues, locations)
└── Real-time sync from PostgreSQL
```

## Quick Start

### 1. Setup Environment

```bash
# Clone and install dependencies
npm install

# Setup PostgreSQL with PostGIS
createdb thesession
psql thesession < schema.sql

# Setup Elasticsearch (optional)
# Configure connection in config file
```

### 2. Process JSON Data

```bash
# TypeScript compilation
npm run build

# Process all JSON files
npm run process

# Or run directly with ts-node
npm run dev
```

### 3. Import to Database

```bash
# Use generated processed_*.json files
# Import scripts provided in schema.sql
```

## Data Processing Pipeline

### 1. JSON Parsing & Validation

- Load raw JSON files (tunes, sets, recordings, sessions, etc.)
- Validate data structure and handle parsing errors
- Extract user information and build relationships

### 2. Entity Normalization

```typescript
// Example: Tune normalization
const normalizedTune: NormalizedTune = {
  tune_id: parseInt(rawTune.tune_id),
  canonical_name: rawTune.name,
  type: rawTune.type,
  aliases: extractedAliases,
  settings: [
    /* multiple arrangements */
  ],
  popularity_score: calculatedScore,
};
```

### 3. Relationship Building

- Link sets to constituent tunes
- Connect recordings to individual tunes
- Build user attribution networks

### 4. Musical Feature Extraction

```typescript
interface MusicalFeatures {
  melodic_contour: number[]; // Pitch direction sequence
  intervals: number[]; // Interval patterns
  rhythmic_pattern: string; // Encoded rhythm
  harmonic_analysis: object; // Chord progressions
}
```

### 5. Search Index Generation

- PostgreSQL tsvector for full-text search
- Elasticsearch documents for advanced queries
- Trigram indexes for fuzzy text matching

## Advanced Search Capabilities

### 1. Fuzzy Tune Search

```sql
-- Find tunes with similar names using trigram similarity
SELECT t.*, similarity(t.canonical_name, 'cooley') as score
FROM tunes t
WHERE similarity(t.canonical_name, 'cooley') > 0.3
ORDER BY score DESC;
```

### 2. Geographic Session Discovery

```sql
-- Find sessions within 50km of coordinates
SELECT s.venue_name,
       ST_Distance(s.location::geography, ST_Point(-2.244, 53.483)::geography) / 1000 as distance_km
FROM sessions s
WHERE ST_DWithin(s.location::geography, ST_Point(-2.244, 53.483)::geography, 50000)
ORDER BY distance_km;
```

### 3. Musical Similarity Search

```sql
-- Find tunes similar to a given tune
SELECT t2.canonical_name, ts.composite_similarity
FROM tune_similarities ts
JOIN tunes t2 ON ts.tune_id_2 = t2.tune_id
WHERE ts.tune_id_1 = 1 -- Cooley's
AND ts.composite_similarity > 0.7
ORDER BY ts.composite_similarity DESC;
```

### 4. Complex Discovery Queries

```sql
-- Find popular sets containing a tune, with nearby sessions
WITH tune_sets AS (
  SELECT DISTINCT sc.set_id, ts.set_name
  FROM set_compositions sc
  JOIN tune_sets ts ON sc.set_id = ts.set_id
  WHERE sc.tune_id = 1
)
SELECT ts.set_name, s.venue_name, s.town,
       ST_Distance(s.location::geography, ST_Point(-6.266, 53.350)::geography) / 1000 as distance_km
FROM tune_sets ts
CROSS JOIN sessions s
WHERE s.is_active = true
  AND ST_DWithin(s.location::geography, ST_Point(-6.266, 53.350)::geography, 100000)
ORDER BY distance_km;
```

## TypeScript Integration

### Core Types

```typescript
import {
  Tune,
  TuneSet,
  Recording,
  Session,
  NormalizedTune,
  SearchQuery,
  SearchResult,
} from "./types";

// Type-safe data processing
const processor = new TheSessionDataProcessor();
const stats: ImportStats = await processor.processAllData("./data");

// Type-safe search queries
const query: SearchQuery = {
  text: "cooley",
  tune_type: ["reel"],
  location: { latitude: 53.35, longitude: -6.26, radius_km: 50 },
};
```

### Musical Analysis Types

```typescript
interface MusicalFeatures {
  melodic_contour: number[];
  intervals: number[];
  rhythmic_pattern: string;
  harmonic_analysis?: {
    chord_progression?: string[];
    tonal_center?: string;
    modulations?: string[];
  };
}
```

## Performance Optimization

### Database Indexes

```sql
-- Full-text search
CREATE INDEX idx_tunes_search ON tunes USING GIN(search_vector);

-- Geospatial queries
CREATE INDEX idx_sessions_location ON sessions USING GIST(location);

-- Similarity analysis
CREATE INDEX idx_similarities_score ON tune_similarities(composite_similarity DESC);

-- Fuzzy text matching
CREATE INDEX idx_tunes_name_trgm ON tunes USING GIN(canonical_name gin_trgm_ops);
```

### Materialized Views

```sql
-- Pre-computed popular tunes with aggregated data
CREATE MATERIALIZED VIEW popular_tunes AS
SELECT t.tune_id, t.canonical_name, tp.composite_score,
       array_agg(DISTINCT ta.alias) as aliases
FROM tunes t
LEFT JOIN tune_popularity tp ON t.tune_id = tp.tune_id
LEFT JOIN tune_aliases ta ON t.tune_id = ta.tune_id
GROUP BY t.tune_id, t.canonical_name, tp.composite_score
ORDER BY tp.composite_score DESC;
```

### Caching Strategy

- Redis for frequently accessed tune data
- Elasticsearch for all text-based searches
- PostgreSQL for transactional and geospatial queries

## Musical Similarity Analysis

### Approach

1. **ABC Notation Parsing**: Extract musical elements from ABC strings
2. **Feature Extraction**: Calculate intervals, contours, rhythmic patterns
3. **Similarity Metrics**: Compare musical features using various algorithms
4. **Pre-computation**: Store similarity scores for fast retrieval

### Example Similarity Features

```typescript
// Melodic contour: sequence of pitch directions
contour: [-1, 1, 0, 1, -1]; // down, up, same, up, down

// Interval sequence: semitone distances
intervals: [2, -3, 4, -2]; // whole step up, minor third down, etc.

// Rhythmic pattern: encoded note durations
rhythmic_pattern: "XLXS-XLS"; // X=quarter, L=half, S=eighth, -=rest
```

## Future Enhancements

### Machine Learning Integration

- Train models on musical patterns for better similarity detection
- User behavior analysis for personalized recommendations
- Automatic musical feature extraction from audio recordings

### Real-time Features

- Live session updates and notifications
- Real-time collaborative set building
- WebSocket-based live search suggestions

### Mobile Optimization

- Specialized indexes for mobile app queries
- Offline data synchronization
- Location-based session discovery

### Community Features

- User ratings and reviews
- Collaborative filtering for recommendations
- Social features for musicians and session attendees

## API Design

### RESTful Endpoints

```typescript
GET /api/tunes?search=cooley&type=reel&limit=20
GET /api/tunes/:id/similar?threshold=0.7
GET /api/sessions/nearby?lat=53.35&lng=-6.26&radius=50
GET /api/sets/:id/tunes
POST /api/search/advanced (complex search queries)
```

### GraphQL Schema

```graphql
type Tune {
  id: ID!
  name: String!
  type: TuneType!
  aliases: [String!]!
  settings: [TuneSetting!]!
  similarTunes(threshold: Float): [TuneSimilarity!]!
  recordings: [Recording!]!
}

type Query {
  searchTunes(query: SearchInput!): TuneSearchResult!
  nearbySessions(location: LocationInput!, radius: Float!): [Session!]!
}
```

## Deployment & Scaling

### Infrastructure Requirements

- PostgreSQL 15+ with PostGIS extension
- Elasticsearch 8+ cluster for search
- Redis for caching and session management
- Node.js application server

### Scaling Considerations

- Read replicas for query performance
- Sharded Elasticsearch indexes by geographic region
- CDN for static musical notation rendering
- Horizontal scaling with load balancers

## Contributing

### Development Setup

```bash
git clone <repository>
cd thesession-database
npm install
npm run build
npm run test
```

### Data Processing

```bash
# Process new JSON data
npm run process -- /path/to/data

# Validate processed output
npm run validate

# Import to database
npm run import
```

### Adding New Features

1. Update TypeScript types in `types.ts`
2. Modify database schema in `schema.sql`
3. Update data processor in `data-processor.ts`
4. Add tests and documentation

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- [TheSession.org](https://thesession.org/) for providing the musical data
- Traditional Irish music community for preserving this cultural heritage
- Contributors to ABC notation standards and tools
