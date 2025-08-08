#!/usr/bin/env ts-node

// Sample generator utilities for tunebook data
// This module provides utilities for generating sample data for testing and development

export interface SampleGeneratorConfig {
  tunesCount: number;
  setsCount: number;
  recordingsCount: number;
  sessionsCount: number;
  usersCount: number;
}

export const defaultConfig: SampleGeneratorConfig = {
  tunesCount: 100,
  setsCount: 30,
  recordingsCount: 50,
  sessionsCount: 20,
  usersCount: 25,
};

export function generateSampleData(config: SampleGeneratorConfig = defaultConfig) {
  console.log('Sample data generator - configuration:', config);
  // Implementation would go here
  return {
    tunes: [],
    sets: [],
    recordings: [],
    sessions: [],
    users: [],
  };
}
