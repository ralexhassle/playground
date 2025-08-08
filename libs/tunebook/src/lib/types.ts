/**
 * TypeScript type definitions for TheSession.org data entities
 * Generated from JSON data analysis for database schema design
 */

// ===== CORE MUSICAL ENTITIES =====

export interface Tune {
  tune_id: string;
  setting_id: string;
  name: string;
  type: TuneType;
  meter: string; // e.g., "4/4", "6/8", "9/8"
  mode: MusicalMode;
  abc: string; // ABC notation
  date: string; // ISO timestamp
  username: string;
}

export interface TuneSet {
  tuneset: string;
  date: string; // ISO timestamp
  member_id: string;
  username: string;
  settingorder: string; // Position in set (1, 2, 3...)
  name: string;
  tune_id: string;
  setting_id: string;
  type: TuneType;
  meter: string;
  mode: MusicalMode;
  abc: string;
}

export interface Recording {
  id: string;
  artist: string;
  recording: string; // Album name
  track: string;
  number: string; // Position within track
  tune: string; // Tune name
  tune_id: string;
}

// ===== GEOGRAPHIC & SOCIAL ENTITIES =====

export interface Session {
  id: string;
  name: string; // Venue name
  address: string;
  town: string;
  area: string; // State/Province/Region
  country: string;
  latitude: string;
  longitude: string;
  date: string; // ISO timestamp
}

export interface SessionGeoJSON {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    name: string;
    longitude: number;
    latitude: number;
  };
}

// ===== METADATA & REFERENCE ENTITIES =====

export interface TuneAlias {
  tune_id: string;
  alias: string;
  name: string; // Canonical name
}

export interface TunePopularity {
  name: string;
  tune_id: string;
  tunebooks: string; // Number of tunebooks containing this tune
}

// ===== ENUMS AND TYPES =====

export type TuneType =
  | "reel"
  | "jig"
  | "hornpipe"
  | "slip jig"
  | "strathspey"
  | "waltz"
  | "march"
  | "polka"
  | "mazurka"
  | "slide"
  | "barndance"
  | "schottische"
  | "highland"
  | "fling"
  | "air"
  | "song"
  | "planxty";

export type MusicalMode =
  | "Gmajor"
  | "Dmajor"
  | "Amajor"
  | "Emajor"
  | "Bmajor"
  | "F#major"
  | "C#major"
  | "Cmajor"
  | "Fmajor"
  | "Bbmajor"
  | "Ebmajor"
  | "Abmajor"
  | "Dbmajor"
  | "Eminor"
  | "Bminor"
  | "F#minor"
  | "C#minor"
  | "G#minor"
  | "D#minor"
  | "A#minor"
  | "Aminor"
  | "Dminor"
  | "Gminor"
  | "Cminor"
  | "Fminor"
  | "Edorian"
  | "Adorian"
  | "Bdorian"
  | "Ddorian"
  | "Gdorian"
  | "Cdorian"
  | "Fdorian"
  | "Amixolydian"
  | "Dmixolydian"
  | "Gmixolydian"
  | "Cmixolydian"
  | "Fmixolydian"
  | "Bbmixolydian";

// ===== PROCESSED/NORMALIZED ENTITIES =====

export interface NormalizedTune {
  tune_id: number;
  canonical_name: string;
  type: TuneType;
  meter: string;
  mode: MusicalMode;
  created_at: Date;
  aliases: string[];
  popularity_score: number;
  settings: TuneSetting[];
}

export interface TuneSetting {
  setting_id: number;
  tune_id: number;
  abc_notation: string;
  contributor_username: string;
  created_at: Date;
  musical_features?: MusicalFeatures;
}

export interface MusicalFeatures {
  key_signature: string;
  time_signature: string;
  note_count: number;
  melodic_contour: number[]; // Simplified contour representation
  intervals: number[]; // Interval sequence
  rhythmic_pattern: string; // Encoded rhythm
  harmonic_analysis?: {
    chord_progression?: string[];
    tonal_center?: string;
    modulations?: string[];
  };
}

export interface NormalizedTuneSet {
  set_id: number;
  creator_username: string;
  set_name?: string;
  created_at: Date;
  is_public: boolean;
  compositions: SetComposition[];
}

export interface SetComposition {
  set_id: number;
  tune_id: number;
  setting_id: number;
  position_in_set: number;
  tune_name: string;
  tune_type: TuneType;
}

export interface NormalizedRecording {
  recording_id: number;
  album_name: string;
  artist_name: string;
  artist_id: number;
  release_year?: number;
  tracks: RecordingTrack[];
}

export interface RecordingTrack {
  track_id: number;
  track_number: number;
  track_name: string;
  duration_seconds?: number;
  tunes: TrackTune[];
}

export interface TrackTune {
  tune_id: number;
  tune_name: string;
  position_in_track: number;
}

export interface NormalizedSession {
  session_id: number;
  venue_name: string;
  full_address: string;
  location: {
    town: string;
    area: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  created_at: Date;
  is_active: boolean;
}

// ===== SEARCH AND ANALYSIS TYPES =====

export interface SearchQuery {
  text?: string;
  tune_type?: TuneType[];
  musical_mode?: MusicalMode[];
  meter?: string[];
  location?: {
    latitude: number;
    longitude: number;
    radius_km: number;
  };
  popularity_threshold?: number;
  include_similar?: boolean;
  similarity_threshold?: number;
}

export interface SearchResult<T> {
  items: T[];
  total_count: number;
  facets?: SearchFacets;
  suggestions?: string[];
}

export interface SearchFacets {
  tune_types: FacetCount[];
  musical_modes: FacetCount[];
  meters: FacetCount[];
  countries: FacetCount[];
}

export interface FacetCount {
  value: string;
  count: number;
}

export interface TuneSearchResult extends NormalizedTune {
  search_score: number;
  highlight?: {
    name?: string[];
    aliases?: string[];
  };
  similar_tunes?: SimilarTune[];
  recordings?: RecordingReference[];
  sets?: SetReference[];
  nearby_sessions?: SessionReference[];
}

export interface SimilarTune {
  tune_id: number;
  name: string;
  similarity_score: number;
  similarity_type: "melodic" | "harmonic" | "rhythmic" | "composite";
}

export interface RecordingReference {
  recording_id: number;
  album_name: string;
  artist_name: string;
  track_name: string;
}

export interface SetReference {
  set_id: number;
  set_name?: string;
  creator_username: string;
  position_in_set: number;
  total_tunes_in_set: number;
}

export interface SessionReference {
  session_id: number;
  venue_name: string;
  town: string;
  country: string;
  distance_km: number;
}

// ===== DATA PROCESSING TYPES =====

export interface ProcessingJob {
  job_id: string;
  job_type: "import" | "similarity_calculation" | "search_index_rebuild";
  status: "pending" | "running" | "completed" | "failed";
  progress_percentage: number;
  created_at: Date;
  completed_at?: Date;
  error_message?: string;
  metadata?: Record<string, any>;
}

export interface ImportStats {
  tunes_processed: number;
  sets_processed: number;
  recordings_processed: number;
  sessions_processed: number;
  aliases_processed: number;
  errors: ImportError[];
}

export interface ImportError {
  entity_type: "tune" | "set" | "recording" | "session" | "alias";
  entity_id: string;
  error_message: string;
  raw_data?: any;
}

// ===== API RESPONSE TYPES =====

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    request_id: string;
    processing_time_ms: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

// ===== CONFIGURATION TYPES =====

export interface DatabaseConfig {
  postgresql: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
    pool_size?: number;
  };
  elasticsearch: {
    nodes: string[];
    auth?: {
      username: string;
      password: string;
    };
    indices: {
      tunes: string;
      recordings: string;
      sessions: string;
    };
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
}

export interface ProcessingConfig {
  similarity_calculation: {
    batch_size: number;
    similarity_threshold: number;
    enable_melodic: boolean;
    enable_rhythmic: boolean;
    enable_harmonic: boolean;
  };
  search_indexing: {
    bulk_size: number;
    refresh_interval: string;
    number_of_shards: number;
    number_of_replicas: number;
  };
}

// ===== USER ENTITIES =====

export interface User {
  id: string;
  name: string;
  username?: string;
  member_id?: string;
  location?: string;
  joined_date?: string;
}
