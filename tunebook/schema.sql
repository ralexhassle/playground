-- TheSession.org Database Schema
-- PostgreSQL with PostGIS for geospatial data
-- Optimized for musical search and analysis

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS unaccent; -- For accent-insensitive search

-- ===== USERS AND AUTHENTICATION =====

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    profile_data JSONB,
    search_vector TSVECTOR
);

-- ===== CORE MUSICAL ENTITIES =====

CREATE TABLE tunes (
    tune_id INTEGER PRIMARY KEY,
    canonical_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- reel, jig, hornpipe, etc.
    meter VARCHAR(10), -- 4/4, 6/8, 9/8, etc.
    mode VARCHAR(50), -- Gmajor, Dmixolydian, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    search_vector TSVECTOR,
    
    -- Performance optimization
    CONSTRAINT valid_tune_type CHECK (type IN (
        'reel', 'jig', 'hornpipe', 'slip jig', 'strathspey', 'waltz', 
        'march', 'polka', 'mazurka', 'slide', 'barndance', 'schottische',
        'highland', 'fling', 'air', 'song', 'planxty'
    ))
);

CREATE TABLE tune_settings (
    setting_id INTEGER PRIMARY KEY,
    tune_id INTEGER NOT NULL REFERENCES tunes(tune_id) ON DELETE CASCADE,
    abc_notation TEXT NOT NULL,
    contributor_id INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Musical analysis fields for similarity search
    key_signature VARCHAR(10),
    time_signature VARCHAR(10),
    note_count INTEGER,
    musical_contour INTEGER[], -- Melodic contour as array
    intervals INTEGER[], -- Interval sequence
    rhythmic_pattern TEXT, -- Encoded rhythmic pattern
    harmonic_analysis JSONB, -- Advanced harmonic analysis
    
    -- Cached similarity features for performance
    similarity_vector FLOAT[128], -- Dense vector for ML-based similarity
    
    CONSTRAINT valid_note_count CHECK (note_count >= 0)
);

-- ===== TUNE SETS =====

CREATE TABLE tune_sets (
    set_id INTEGER PRIMARY KEY,
    creator_id INTEGER REFERENCES users(user_id),
    set_name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT true,
    play_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    search_vector TSVECTOR
);

CREATE TABLE set_compositions (
    set_id INTEGER REFERENCES tune_sets(set_id) ON DELETE CASCADE,
    tune_id INTEGER REFERENCES tunes(tune_id) ON DELETE CASCADE,
    setting_id INTEGER REFERENCES tune_settings(setting_id) ON DELETE SET NULL,
    position_in_set INTEGER NOT NULL,
    transition_notes TEXT, -- Optional transition/variation notes
    
    PRIMARY KEY (set_id, position_in_set),
    CONSTRAINT valid_position CHECK (position_in_set > 0)
);

-- ===== RECORDINGS AND ARTISTS =====

CREATE TABLE artists (
    artist_id SERIAL PRIMARY KEY,
    artist_name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    region VARCHAR(100),
    active_period VARCHAR(50), -- e.g., "1970s-1990s"
    biography TEXT,
    website_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    search_vector TSVECTOR
);

CREATE TABLE recordings (
    recording_id SERIAL PRIMARY KEY,
    album_name VARCHAR(255) NOT NULL,
    artist_id INTEGER NOT NULL REFERENCES artists(artist_id),
    release_year INTEGER,
    label VARCHAR(255),
    catalog_number VARCHAR(100),
    total_tracks INTEGER,
    duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    search_vector TSVECTOR,
    
    CONSTRAINT valid_year CHECK (release_year BETWEEN 1800 AND 2100),
    CONSTRAINT valid_tracks CHECK (total_tracks > 0)
);

CREATE TABLE recording_tracks (
    track_id SERIAL PRIMARY KEY,
    recording_id INTEGER NOT NULL REFERENCES recordings(recording_id) ON DELETE CASCADE,
    track_number INTEGER NOT NULL,
    track_name VARCHAR(255),
    duration_seconds INTEGER,
    
    UNIQUE(recording_id, track_number),
    CONSTRAINT valid_track_number CHECK (track_number > 0),
    CONSTRAINT valid_duration CHECK (duration_seconds > 0)
);

CREATE TABLE track_tunes (
    track_id INTEGER REFERENCES recording_tracks(track_id) ON DELETE CASCADE,
    tune_id INTEGER REFERENCES tunes(tune_id) ON DELETE CASCADE,
    setting_id INTEGER REFERENCES tune_settings(setting_id) ON DELETE SET NULL,
    position_in_track INTEGER NOT NULL,
    start_time_seconds INTEGER,
    end_time_seconds INTEGER,
    
    PRIMARY KEY (track_id, position_in_track),
    CONSTRAINT valid_position_track CHECK (position_in_track > 0),
    CONSTRAINT valid_timing CHECK (
        start_time_seconds IS NULL OR end_time_seconds IS NULL OR 
        end_time_seconds > start_time_seconds
    )
);

-- ===== GEOGRAPHIC ENTITIES =====

CREATE TABLE sessions (
    session_id INTEGER PRIMARY KEY,
    venue_name VARCHAR(255) NOT NULL,
    address TEXT,
    town VARCHAR(100),
    area VARCHAR(100), -- State/Province/Region
    country VARCHAR(100),
    postal_code VARCHAR(20),
    location GEOMETRY(POINT, 4326), -- PostGIS geospatial data (WGS84)
    
    -- Session details
    session_day VARCHAR(20), -- e.g., "Tuesday", "Monthly"
    session_time TIME,
    frequency VARCHAR(50), -- "weekly", "monthly", "irregular"
    contact_info JSONB, -- phone, email, website
    description TEXT,
    
    -- Status and metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    verified_at TIMESTAMP,
    last_confirmed TIMESTAMP,
    
    search_vector TSVECTOR
);

-- ===== METADATA AND SEARCH ENHANCEMENT =====

CREATE TABLE tune_aliases (
    tune_id INTEGER REFERENCES tunes(tune_id) ON DELETE CASCADE,
    alias VARCHAR(255) NOT NULL,
    alias_type VARCHAR(50) DEFAULT 'common', -- 'common', 'regional', 'historical'
    source VARCHAR(255), -- Where this alias was found
    verified BOOLEAN DEFAULT false,
    
    PRIMARY KEY (tune_id, alias)
);

CREATE TABLE tune_popularity (
    tune_id INTEGER PRIMARY KEY REFERENCES tunes(tune_id) ON DELETE CASCADE,
    tunebook_count INTEGER DEFAULT 0,
    session_play_count INTEGER DEFAULT 0,
    recording_count INTEGER DEFAULT 0,
    set_inclusion_count INTEGER DEFAULT 0,
    user_favorite_count INTEGER DEFAULT 0,
    composite_score DECIMAL(10, 4) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== MUSICAL SIMILARITY AND ANALYSIS =====

CREATE TABLE tune_similarities (
    tune_id_1 INTEGER REFERENCES tunes(tune_id) ON DELETE CASCADE,
    tune_id_2 INTEGER REFERENCES tunes(tune_id) ON DELETE CASCADE,
    
    -- Different similarity types
    melodic_similarity DECIMAL(3,2), -- 0.00 to 1.00
    rhythmic_similarity DECIMAL(3,2),
    harmonic_similarity DECIMAL(3,2),
    contour_similarity DECIMAL(3,2),
    composite_similarity DECIMAL(3,2),
    
    calculation_method VARCHAR(50), -- 'interval_analysis', 'ml_vector', 'abc_diff'
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confidence_score DECIMAL(3,2),
    
    PRIMARY KEY (tune_id_1, tune_id_2),
    CONSTRAINT no_self_similarity CHECK (tune_id_1 != tune_id_2),
    CONSTRAINT ordered_similarity CHECK (tune_id_1 < tune_id_2)
);

-- ===== USER INTERACTIONS AND SOCIAL FEATURES =====

CREATE TABLE user_favorites (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    entity_type VARCHAR(20) NOT NULL, -- 'tune', 'set', 'recording', 'session'
    entity_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, entity_type, entity_id)
);

CREATE TABLE user_ratings (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    entity_type VARCHAR(20) NOT NULL, -- 'tune', 'set', 'recording'
    entity_id INTEGER NOT NULL,
    rating INTEGER NOT NULL, -- 1-5 stars
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, entity_type, entity_id),
    CONSTRAINT valid_rating CHECK (rating BETWEEN 1 AND 5)
);

-- ===== SEARCH AND INDEXING =====

-- Full-text search indexes using PostgreSQL's built-in capabilities
CREATE INDEX idx_tunes_search ON tunes USING GIN(search_vector);
CREATE INDEX idx_tunes_name_trgm ON tunes USING GIN(canonical_name gin_trgm_ops);
CREATE INDEX idx_artists_search ON artists USING GIN(search_vector);
CREATE INDEX idx_recordings_search ON recordings USING GIN(search_vector);
CREATE INDEX idx_sessions_search ON sessions USING GIN(search_vector);

-- Geospatial indexes
CREATE INDEX idx_sessions_location ON sessions USING GIST(location);

-- Performance indexes for common queries
CREATE INDEX idx_tunes_type ON tunes(type);
CREATE INDEX idx_tunes_mode ON tunes(mode);
CREATE INDEX idx_tunes_meter ON tunes(meter);
CREATE INDEX idx_popularity_composite ON tune_popularity(composite_score DESC);
CREATE INDEX idx_similarities_score ON tune_similarities(composite_similarity DESC);

-- Composite indexes for complex queries
CREATE INDEX idx_set_compositions_lookup ON set_compositions(set_id, position_in_set);
CREATE INDEX idx_track_tunes_lookup ON track_tunes(tune_id, track_id);
CREATE INDEX idx_tune_settings_tune ON tune_settings(tune_id, created_at DESC);
CREATE INDEX idx_recordings_artist_year ON recordings(artist_id, release_year DESC);
CREATE INDEX idx_sessions_country_town ON sessions(country, town) WHERE is_active = true;

-- Partial indexes for active/verified data
CREATE INDEX idx_sessions_active ON sessions(session_id) WHERE is_active = true;
CREATE INDEX idx_sets_public ON tune_sets(set_id, created_at DESC) WHERE is_public = true;

-- ===== TRIGGERS FOR SEARCH VECTOR UPDATES =====

-- Function to update search vectors
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'tunes' THEN
        NEW.search_vector := to_tsvector('english', 
            COALESCE(NEW.canonical_name, '') || ' ' ||
            COALESCE(NEW.type, '') || ' ' ||
            COALESCE(NEW.mode, '')
        );
    ELSIF TG_TABLE_NAME = 'artists' THEN
        NEW.search_vector := to_tsvector('english',
            COALESCE(NEW.artist_name, '') || ' ' ||
            COALESCE(NEW.country, '') || ' ' ||
            COALESCE(NEW.region, '')
        );
    ELSIF TG_TABLE_NAME = 'recordings' THEN
        NEW.search_vector := to_tsvector('english',
            COALESCE(NEW.album_name, '') || ' ' ||
            COALESCE(NEW.label, '')
        );
    ELSIF TG_TABLE_NAME = 'sessions' THEN
        NEW.search_vector := to_tsvector('english',
            COALESCE(NEW.venue_name, '') || ' ' ||
            COALESCE(NEW.town, '') || ' ' ||
            COALESCE(NEW.area, '') || ' ' ||
            COALESCE(NEW.country, '')
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER tunes_search_vector_update
    BEFORE INSERT OR UPDATE ON tunes
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();

CREATE TRIGGER artists_search_vector_update
    BEFORE INSERT OR UPDATE ON artists
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();

CREATE TRIGGER recordings_search_vector_update
    BEFORE INSERT OR UPDATE ON recordings
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();

CREATE TRIGGER sessions_search_vector_update
    BEFORE INSERT OR UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- ===== POPULARITY SCORING TRIGGERS =====

CREATE OR REPLACE FUNCTION update_tune_popularity()
RETURNS TRIGGER AS $$
DECLARE
    target_tune_id INTEGER;
BEGIN
    -- Determine which tune_id to update based on the table
    IF TG_TABLE_NAME = 'set_compositions' THEN
        target_tune_id := COALESCE(NEW.tune_id, OLD.tune_id);
    ELSIF TG_TABLE_NAME = 'track_tunes' THEN
        target_tune_id := COALESCE(NEW.tune_id, OLD.tune_id);
    ELSIF TG_TABLE_NAME = 'user_favorites' AND NEW.entity_type = 'tune' THEN
        target_tune_id := NEW.entity_id;
    END IF;
    
    -- Update popularity scores
    UPDATE tune_popularity SET
        set_inclusion_count = (
            SELECT COUNT(*) FROM set_compositions 
            WHERE tune_id = target_tune_id
        ),
        recording_count = (
            SELECT COUNT(*) FROM track_tunes 
            WHERE tune_id = target_tune_id
        ),
        user_favorite_count = (
            SELECT COUNT(*) FROM user_favorites 
            WHERE entity_type = 'tune' AND entity_id = target_tune_id
        ),
        last_updated = CURRENT_TIMESTAMP
    WHERE tune_id = target_tune_id;
    
    -- Calculate composite score
    UPDATE tune_popularity SET
        composite_score = (
            COALESCE(tunebook_count, 0) * 1.0 +
            COALESCE(recording_count, 0) * 2.0 +
            COALESCE(set_inclusion_count, 0) * 1.5 +
            COALESCE(user_favorite_count, 0) * 3.0
        )
    WHERE tune_id = target_tune_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create popularity update triggers
CREATE TRIGGER set_compositions_popularity_update
    AFTER INSERT OR DELETE ON set_compositions
    FOR EACH ROW EXECUTE FUNCTION update_tune_popularity();

CREATE TRIGGER track_tunes_popularity_update
    AFTER INSERT OR DELETE ON track_tunes
    FOR EACH ROW EXECUTE FUNCTION update_tune_popularity();

CREATE TRIGGER user_favorites_popularity_update
    AFTER INSERT OR DELETE ON user_favorites
    FOR EACH ROW EXECUTE FUNCTION update_tune_popularity();

-- ===== MATERIALIZED VIEWS FOR PERFORMANCE =====

CREATE MATERIALIZED VIEW popular_tunes AS
SELECT 
    t.tune_id,
    t.canonical_name,
    t.type,
    t.mode,
    tp.composite_score,
    tp.tunebook_count,
    tp.recording_count,
    tp.set_inclusion_count,
    COUNT(DISTINCT ts.setting_id) as setting_count,
    array_agg(DISTINCT ta.alias) FILTER (WHERE ta.alias IS NOT NULL) as aliases
FROM tunes t
LEFT JOIN tune_popularity tp ON t.tune_id = tp.tune_id
LEFT JOIN tune_settings ts ON t.tune_id = ts.tune_id
LEFT JOIN tune_aliases ta ON t.tune_id = ta.tune_id
GROUP BY t.tune_id, t.canonical_name, t.type, t.mode, 
         tp.composite_score, tp.tunebook_count, tp.recording_count, tp.set_inclusion_count
ORDER BY tp.composite_score DESC NULLS LAST;

CREATE UNIQUE INDEX idx_popular_tunes_id ON popular_tunes(tune_id);

-- ===== SAMPLE QUERIES FOR TESTING =====

-- Example: Fuzzy tune search with popularity
/*
WITH fuzzy_matches AS (
    SELECT tune_id, 
           ts_rank(search_vector, plainto_tsquery('english', 'cooley')) as rank
    FROM tunes 
    WHERE search_vector @@ plainto_tsquery('english', 'cooley')
    UNION
    SELECT ta.tune_id, 
           similarity(ta.alias, 'cooley') as rank
    FROM tune_aliases ta
    WHERE similarity(ta.alias, 'cooley') > 0.3
)
SELECT t.*, fm.rank, tp.composite_score
FROM tunes t
JOIN fuzzy_matches fm ON t.tune_id = fm.tune_id
LEFT JOIN tune_popularity tp ON t.tune_id = tp.tune_id
ORDER BY fm.rank DESC, tp.composite_score DESC NULLS LAST
LIMIT 20;
*/

-- Example: Geographic session search
/*
SELECT s.*, 
       ST_Distance(s.location::geography, ST_MakePoint(-2.244, 53.483)::geography) / 1000 as distance_km
FROM sessions s 
WHERE s.is_active = true
  AND ST_DWithin(s.location::geography, ST_MakePoint(-2.244, 53.483)::geography, 50000)
ORDER BY distance_km
LIMIT 10;
*/

-- ===== COMMENTS AND DOCUMENTATION =====

COMMENT ON TABLE tunes IS 'Core table storing unique traditional music tunes with their basic metadata';
COMMENT ON TABLE tune_settings IS 'Multiple arrangements/versions of each tune with ABC notation and musical analysis';
COMMENT ON TABLE tune_similarities IS 'Computed similarity scores between tunes for music discovery';
COMMENT ON TABLE sessions IS 'Physical locations where traditional music sessions take place';
COMMENT ON COLUMN sessions.location IS 'PostGIS point geometry in WGS84 (SRID 4326) for precise geolocation';
COMMENT ON MATERIALIZED VIEW popular_tunes IS 'Pre-computed popular tunes with aggregated statistics for fast queries';
