# TheSession Database Analysis & Architecture

## Overview

This document provides a comprehensive analysis of TheSession.org data entities, their relationships, and recommendations for an optimal database architecture supporting advanced musical search capabilities including fuzzy text search and musical similarity analysis.

## Data Entities Analysis

### 1. Core Musical Entities

#### **TUNES**

```json
{
  "tune_id": "11931",
  "setting_id": "11931",
  "name": "'G Iomain Nan Gamhna",
  "type": "slip jig",
  "meter": "9/8",
  "mode": "Gmajor",
  "abc": "dBB B2 A BAG|dBB Bcd efg...",
  "date": "2012-05-17 07:49:26",
  "username": "iliketurtles"
}
```

**Entity Type**: Musical compositions with multiple arrangements
**Key Attributes**: Unique tune ID, musical metadata (type, meter, mode), ABC notation, version tracking

#### **TUNE_SETS**

```json
{
  "tuneset": "1",
  "date": "2016-02-06 18:33:11",
  "member_id": "1",
  "username": "Jeremy",
  "settingorder": "1",
  "name": "Tarbolton, The",
  "tune_id": "560",
  "setting_id": "560"
}
```

**Entity Type**: Ordered sequences of tunes played together
**Key Attributes**: Set grouping, play order, user attribution

#### **RECORDINGS**

```json
{
  "id": "3720",
  "artist": "1651",
  "recording": "Cast A Bell",
  "track": "1",
  "number": "1",
  "tune": "Kettledrum",
  "tune_id": "14408"
}
```

**Entity Type**: Commercial recordings containing tunes
**Key Attributes**: Album/track structure, artist attribution, tune mapping

### 2. Geographic & Social Entities

#### **SESSIONS**

```json
{
  "id": "6010",
  "name": "Sláinte Irish Pub",
  "address": "Av. San Martín 6066",
  "town": "Buenos Aires",
  "area": "Buenos Aires",
  "country": "Argentina",
  "latitude": "-34.59538269",
  "longitude": "-58.50145340",
  "date": "2016-06-07 15:57:16"
}
```

**Entity Type**: Physical locations for traditional music sessions
**Key Attributes**: Full address hierarchy, precise geolocation, temporal data

### 3. Metadata & Reference Entities

#### **ALIASES**

```json
{
  "tune_id": "1",
  "alias": "Cooley's",
  "name": "Cooley's"
}
```

**Entity Type**: Alternative names for tunes
**Key Attributes**: Canonical name mapping, search enhancement

#### **TUNE_POPULARITY**

```json
{
  "name": "Drowsy Maggie",
  "tune_id": "27",
  "tunebooks": "7319"
}
```

**Entity Type**: Usage statistics and popularity metrics
**Key Attributes**: Quantified popularity, community engagement metrics

## Relational Database Schema (PostgreSQL)

### Core Schema Design

```sql
-- Users and Authentication
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Musical Entities
CREATE TABLE tunes (
    tune_id INTEGER PRIMARY KEY,
    canonical_name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- reel, jig, hornpipe, etc.
    meter VARCHAR(10), -- 4/4, 6/8, 9/8, etc.
    mode VARCHAR(50), -- Gmajor, Dmixolydian, etc.
    created_at TIMESTAMP,
    search_vector TSVECTOR -- Full-text search optimization
);

CREATE TABLE tune_settings (
    setting_id INTEGER PRIMARY KEY,
    tune_id INTEGER REFERENCES tunes(tune_id),
    abc_notation TEXT NOT NULL,
    contributor_id INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP,
    -- Musical analysis fields for similarity search
    key_signature VARCHAR(10),
    time_signature VARCHAR(10),
    note_count INTEGER,
    musical_contour TEXT, -- Encoded melodic contour
    harmonic_analysis JSONB -- Chord progressions, intervals, etc.
);

-- Tune Sets (ordered sequences)
CREATE TABLE tune_sets (
    set_id INTEGER PRIMARY KEY,
    creator_id INTEGER REFERENCES users(user_id),
    set_name VARCHAR(255),
    created_at TIMESTAMP,
    is_public BOOLEAN DEFAULT true
);

CREATE TABLE set_compositions (
    set_id INTEGER REFERENCES tune_sets(set_id),
    tune_id INTEGER REFERENCES tunes(tune_id),
    setting_id INTEGER REFERENCES tune_settings(setting_id),
    position_in_set INTEGER,
    PRIMARY KEY (set_id, position_in_set)
);

-- Recordings and Albums
CREATE TABLE artists (
    artist_id SERIAL PRIMARY KEY,
    artist_name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    search_vector TSVECTOR
);

CREATE TABLE recordings (
    recording_id SERIAL PRIMARY KEY,
    album_name VARCHAR(255),
    artist_id INTEGER REFERENCES artists(artist_id),
    release_year INTEGER,
    search_vector TSVECTOR
);

CREATE TABLE recording_tracks (
    track_id SERIAL PRIMARY KEY,
    recording_id INTEGER REFERENCES recordings(recording_id),
    track_number INTEGER,
    track_name VARCHAR(255),
    duration_seconds INTEGER
);

CREATE TABLE track_tunes (
    track_id INTEGER REFERENCES recording_tracks(track_id),
    tune_id INTEGER REFERENCES tunes(tune_id),
    position_in_track INTEGER,
    PRIMARY KEY (track_id, position_in_track)
);

-- Geographic Entities (PostGIS extension)
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE sessions (
    session_id INTEGER PRIMARY KEY,
    venue_name VARCHAR(255),
    address TEXT,
    town VARCHAR(100),
    area VARCHAR(100),
    country VARCHAR(100),
    location GEOMETRY(POINT, 4326), -- PostGIS geospatial data
    created_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    search_vector TSVECTOR
);

-- Metadata and Search Enhancement
CREATE TABLE tune_aliases (
    tune_id INTEGER REFERENCES tunes(tune_id),
    alias VARCHAR(255),
    alias_type VARCHAR(50), -- 'common', 'regional', 'historical'
    PRIMARY KEY (tune_id, alias)
);

CREATE TABLE tune_popularity (
    tune_id INTEGER PRIMARY KEY REFERENCES tunes(tune_id),
    tunebook_count INTEGER DEFAULT 0,
    play_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Musical Similarity and Analysis
CREATE TABLE tune_similarities (
    tune_id_1 INTEGER REFERENCES tunes(tune_id),
    tune_id_2 INTEGER REFERENCES tunes(tune_id),
    similarity_score DECIMAL(3,2), -- 0.00 to 1.00
    similarity_type VARCHAR(50), -- 'melodic', 'harmonic', 'rhythmic'
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tune_id_1, tune_id_2)
);
```

### Indexing Strategy

```sql
-- Full-text search indexes
CREATE INDEX idx_tunes_search ON tunes USING GIN(search_vector);
CREATE INDEX idx_artists_search ON artists USING GIN(search_vector);
CREATE INDEX idx_sessions_search ON sessions USING GIN(search_vector);

-- Geospatial indexes
CREATE INDEX idx_sessions_location ON sessions USING GIST(location);

-- Performance indexes
CREATE INDEX idx_tunes_type ON tunes(type);
CREATE INDEX idx_tunes_mode ON tunes(mode);
CREATE INDEX idx_popularity_count ON tune_popularity(tunebook_count DESC);
CREATE INDEX idx_similarities_score ON tune_similarities(similarity_score DESC);

-- Composite indexes for common queries
CREATE INDEX idx_set_compositions_lookup ON set_compositions(set_id, position_in_set);
CREATE INDEX idx_track_tunes_lookup ON track_tunes(tune_id, track_id);
```

## Elasticsearch Integration Architecture

### Hybrid Search Strategy

```json
{
  "elasticsearch_mapping": {
    "tunes": {
      "properties": {
        "tune_id": { "type": "integer" },
        "name": {
          "type": "text",
          "analyzer": "standard",
          "fields": {
            "exact": { "type": "keyword" },
            "suggest": { "type": "completion" }
          }
        },
        "aliases": {
          "type": "text",
          "analyzer": "standard"
        },
        "type": { "type": "keyword" },
        "meter": { "type": "keyword" },
        "mode": { "type": "keyword" },
        "abc_notation": { "type": "text" },
        "musical_features": {
          "type": "dense_vector",
          "dims": 128
        },
        "popularity_score": { "type": "float" }
      }
    }
  }
}
```

### Data Synchronization Workflow

```sql
-- PostgreSQL triggers for real-time sync
CREATE OR REPLACE FUNCTION sync_to_elasticsearch()
RETURNS TRIGGER AS $$
BEGIN
    -- Trigger Elasticsearch update via application layer
    PERFORM pg_notify('elasticsearch_sync',
        json_build_object(
            'table', TG_TABLE_NAME,
            'operation', TG_OP,
            'id', NEW.tune_id
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tune_elasticsearch_sync
    AFTER INSERT OR UPDATE OR DELETE ON tunes
    FOR EACH ROW EXECUTE FUNCTION sync_to_elasticsearch();
```

## Data Processing Workflow

### 1. Data Ingestion Pipeline

```python
# Example processing workflow
class TheSessionDataProcessor:

    def process_json_files(self):
        """Main processing pipeline"""
        # 1. Load and validate JSON files
        tunes_data = self.load_json('tunes.json')
        sets_data = self.load_json('sets.json')
        recordings_data = self.load_json('recordings.json')
        sessions_data = self.load_json('sessions.json')

        # 2. Extract and normalize entities
        users = self.extract_users(tunes_data, sets_data)
        tunes = self.normalize_tunes(tunes_data)

        # 3. Build relationships
        self.link_sets_to_tunes(sets_data, tunes)
        self.link_recordings_to_tunes(recordings_data, tunes)

        # 4. Generate search vectors
        self.generate_search_vectors(tunes)

        # 5. Calculate musical similarities
        self.calculate_musical_similarities(tunes)

    def extract_musical_features(self, abc_notation):
        """Extract features for similarity analysis"""
        return {
            'note_sequence': self.parse_abc_notes(abc_notation),
            'intervals': self.calculate_intervals(abc_notation),
            'rhythmic_pattern': self.extract_rhythm(abc_notation),
            'melodic_contour': self.calculate_contour(abc_notation)
        }
```

### 2. Musical Similarity Analysis

```python
class MusicalSimilarityEngine:

    def calculate_similarity(self, tune1_features, tune2_features):
        """Multi-dimensional similarity calculation"""

        # Melodic similarity (interval patterns)
        melodic_sim = self.compare_intervals(
            tune1_features['intervals'],
            tune2_features['intervals']
        )

        # Rhythmic similarity
        rhythmic_sim = self.compare_rhythms(
            tune1_features['rhythmic_pattern'],
            tune2_features['rhythmic_pattern']
        )

        # Contour similarity (shape of melody)
        contour_sim = self.compare_contours(
            tune1_features['melodic_contour'],
            tune2_features['melodic_contour']
        )

        # Weighted composite score
        return {
            'melodic': melodic_sim,
            'rhythmic': rhythmic_sim,
            'contour': contour_sim,
            'composite': (melodic_sim * 0.4 + rhythmic_sim * 0.3 + contour_sim * 0.3)
        }
```

## Advanced Query Examples

### 1. Fuzzy Tune Search

```sql
-- PostgreSQL + Elasticsearch hybrid search
WITH fuzzy_matches AS (
    SELECT tune_id, ts_rank(search_vector, plainto_tsquery('cooley')) as rank
    FROM tunes
    WHERE search_vector @@ plainto_tsquery('cooley')
    UNION
    SELECT tune_id, 0.8 as rank
    FROM tune_aliases
    WHERE similarity(alias, 'cooley') > 0.6
)
SELECT t.*, fm.rank, p.tunebook_count
FROM tunes t
JOIN fuzzy_matches fm ON t.tune_id = fm.tune_id
LEFT JOIN tune_popularity p ON t.tune_id = p.tune_id
ORDER BY fm.rank DESC, p.tunebook_count DESC;
```

### 2. Geographic Session Search

```sql
-- Find sessions within 50km of a location
SELECT s.*,
       ST_Distance(s.location, ST_MakePoint(-2.244, 53.483)) as distance_km
FROM sessions s
WHERE ST_DWithin(
    s.location,
    ST_MakePoint(-2.244, 53.483)::geography,
    50000 -- 50km in meters
)
ORDER BY distance_km;
```

### 3. Musical Similarity Search

```sql
-- Find tunes similar to a given tune
SELECT t2.*, ts.similarity_score, ts.similarity_type
FROM tune_similarities ts
JOIN tunes t2 ON ts.tune_id_2 = t2.tune_id
WHERE ts.tune_id_1 = 1 -- Cooley's
AND ts.similarity_score > 0.7
ORDER BY ts.similarity_score DESC;
```

### 4. Complex Discovery Query

```sql
-- Find popular sets containing a tune, with geographic context
WITH tune_sets_with_popularity AS (
    SELECT sc.set_id, sc.tune_id, ts.set_name,
           COUNT(*) OVER (PARTITION BY sc.set_id) as set_size,
           ROW_NUMBER() OVER (PARTITION BY sc.set_id ORDER BY sc.position_in_set) as position
    FROM set_compositions sc
    JOIN tune_sets ts ON sc.set_id = ts.set_id
    WHERE sc.tune_id = 1 -- Cooley's
),
nearby_sessions AS (
    SELECT session_id, venue_name,
           ST_Distance(location, ST_MakePoint(-2.244, 53.483)) as distance
    FROM sessions
    WHERE ST_DWithin(location, ST_MakePoint(-2.244, 53.483)::geography, 100000)
)
SELECT tswp.*, ns.venue_name, ns.distance,
       array_agg(rt.album_name) as albums_containing_tune
FROM tune_sets_with_popularity tswp
CROSS JOIN nearby_sessions ns
LEFT JOIN track_tunes tt ON tswp.tune_id = tt.tune_id
LEFT JOIN recording_tracks rt_track ON tt.track_id = rt_track.track_id
LEFT JOIN recordings rt ON rt_track.recording_id = rt.recording_id
GROUP BY tswp.set_id, tswp.tune_id, tswp.set_name, tswp.set_size,
         tswp.position, ns.venue_name, ns.distance
ORDER BY tswp.set_size DESC, ns.distance ASC;
```

## Implementation Recommendations

### Technology Stack

- **Database**: PostgreSQL 15+ with PostGIS extension
- **Search Engine**: Elasticsearch 8+ for fuzzy text search
- **Message Queue**: Redis for real-time sync between PostgreSQL and Elasticsearch
- **API Layer**: Node.js/TypeScript with Express or Fastify
- **Musical Analysis**: Python with music21 library for ABC notation processing

### Performance Considerations

1. **Partitioning**: Partition large tables (tunes, recordings) by date or popularity
2. **Caching**: Redis cache for frequently accessed tune data
3. **Search Optimization**: Use Elasticsearch for all text-based searches
4. **Similarity Pre-computation**: Calculate and store similarity scores offline

### Future Enhancements

1. **Machine Learning**: Train models on musical patterns for better similarity detection
2. **Real-time Analytics**: Track user behavior for recommendation systems
3. **Mobile Optimization**: Specialized indexes for mobile app queries
4. **Community Features**: User ratings, comments, and collaborative filtering

This architecture provides a solid foundation for advanced musical search and analysis while maintaining performance and scalability for future growth.
