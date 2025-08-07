import { Tune, TuneSet, Recording, Session, TuneAlias } from './types';

// Configuration pour la génération d'échantillons
export interface SampleConfig {
  // Tailles des échantillons
  userCount: number;
  tuneCount: number;
  setCount: number;
  recordingCount: number;
  sessionCount: number;
  aliasCount: number;
  
  // Paramètres de génération
  settingsPerTune: {
    min: number;
    max: number;
  };
  
  tunesPerSet: {
    min: number;
    max: number;
  };
  
  tracksPerRecording: {
    min: number;
    max: number;
  };
  
  // Distribution des types musicaux
  tuneTypeDistribution: {
    reel: number;
    jig: number;
    hornpipe: number;
    polka: number;
    waltz: number;
    other: number;
  };
  
  // Zones géographiques pour sessions
  geographicRegions: Array<{
    name: string;
    centerLat: number;
    centerLng: number;
    radiusKm: number;
  }>;
}

// Types pour les données échantillon
export interface SampleUser {
  id: string;
  name: string;
}

export interface SampleTune extends Tune {}

export interface SampleTuneSet extends TuneSet {}

export interface SampleRecording extends Recording {}

export interface SampleSession extends Session {}

export interface SampleAlias extends TuneAlias {}

export interface SamplePopularity {
  tune_id: string;
  popularity_score: number;
  recording_count: number;
  session_mentions: number;
  alias_count: number;
  setting_count: number;
}

export interface SampleDataSet {
  users: SampleUser[];
  tunes: SampleTune[];
  sets: SampleTuneSet[];
  recordings: SampleRecording[];
  sessions: SampleSession[];
  aliases: SampleAlias[];
  popularity: SamplePopularity[];
}

// Configurations prédéfinies
export const SMALL_SAMPLE_CONFIG: SampleConfig = {
  userCount: 5,
  tuneCount: 10,
  setCount: 3,
  recordingCount: 2,
  sessionCount: 5,
  aliasCount: 8,
  
  settingsPerTune: { min: 1, max: 3 },
  tunesPerSet: { min: 2, max: 4 },
  tracksPerRecording: { min: 5, max: 8 },
  
  tuneTypeDistribution: {
    reel: 0.40,
    jig: 0.25,
    hornpipe: 0.15,
    polka: 0.10,
    waltz: 0.05,
    other: 0.05
  },
  
  geographicRegions: [
    { name: "Dublin", centerLat: 53.3498, centerLng: -6.2603, radiusKm: 25 },
    { name: "Cork", centerLat: 51.8985, centerLng: -8.4756, radiusKm: 20 }
  ]
};

export const DEV_SAMPLE_CONFIG: SampleConfig = {
  userCount: 20,
  tuneCount: 50,
  setCount: 20,
  recordingCount: 15,
  sessionCount: 25,
  aliasCount: 30,
  
  settingsPerTune: { min: 1, max: 4 },
  tunesPerSet: { min: 2, max: 5 },
  tracksPerRecording: { min: 8, max: 15 },
  
  tuneTypeDistribution: {
    reel: 0.40,
    jig: 0.25,
    hornpipe: 0.15,
    polka: 0.10,
    waltz: 0.05,
    other: 0.05
  },
  
  geographicRegions: [
    { name: "Dublin", centerLat: 53.3498, centerLng: -6.2603, radiusKm: 25 },
    { name: "Cork", centerLat: 51.8985, centerLng: -8.4756, radiusKm: 20 },
    { name: "Galway", centerLat: 53.2707, centerLng: -9.0568, radiusKm: 15 },
    { name: "Belfast", centerLat: 54.5973, centerLng: -5.9301, radiusKm: 20 }
  ]
};

export const LARGE_SAMPLE_CONFIG: SampleConfig = {
  userCount: 100,
  tuneCount: 500,
  setCount: 150,
  recordingCount: 80,
  sessionCount: 200,
  aliasCount: 300,
  
  settingsPerTune: { min: 1, max: 5 },
  tunesPerSet: { min: 2, max: 6 },
  tracksPerRecording: { min: 10, max: 20 },
  
  tuneTypeDistribution: {
    reel: 0.40,
    jig: 0.25,
    hornpipe: 0.15,
    polka: 0.10,
    waltz: 0.05,
    other: 0.05
  },
  
  geographicRegions: [
    { name: "Dublin", centerLat: 53.3498, centerLng: -6.2603, radiusKm: 25 },
    { name: "Cork", centerLat: 51.8985, centerLng: -8.4756, radiusKm: 20 },
    { name: "Galway", centerLat: 53.2707, centerLng: -9.0568, radiusKm: 15 },
    { name: "Belfast", centerLat: 54.5973, centerLng: -5.9301, radiusKm: 20 },
    { name: "Limerick", centerLat: 52.6638, centerLng: -8.6267, radiusKm: 15 },
    { name: "Waterford", centerLat: 52.2593, centerLng: -7.1101, radiusKm: 15 }
  ]
};
