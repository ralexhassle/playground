#!/usr/bin/env ts-node

// Sample generator utilities for tunebook data
// This module provides utilities for generating sample data for testing and development

import {
  Tune,
  TuneSet,
  Recording,
  Session,
  TuneAlias,
  TunePopularity,
  TuneType,
  MusicalMode,
} from './types';

export interface SampleGeneratorConfig {
  tunesCount: number;
  setsCount: number;
  recordingsCount: number;
  sessionsCount: number;
  aliasesCount: number;
  popularityCount: number;
}

export const defaultConfig: SampleGeneratorConfig = {
  tunesCount: 100,
  setsCount: 30,
  recordingsCount: 50,
  sessionsCount: 20,
  aliasesCount: 25,
  popularityCount: 50,
};

// Sample data arrays for realistic generation
const TUNE_NAMES = [
  'The Blackbird',
  'The Butterfly',
  'The Cliffs of Moher',
  'The Foggy Dew',
  'The Wind That Shakes the Barley',
  'The Irish Washerwoman',
  'The Sailor\'s Hornpipe',
  'Morrison\'s Jig',
  'The Kesh Jig',
  'The Tailor\'s Twist',
  'The Wild Rover',
  'Whiskey in the Jar',
  'The Parting Glass',
  'The Mountains of Mourne',
  'The Spanish Lady',
  'The Gartan Mother\'s Lullaby',
  'The Star of the County Down',
  'Danny Boy',
  'Molly Malone',
  'The Fields of Athenry',
];

const MUSICIANS = [
  'Paddy O\'Brien',
  'Kevin Burke',
  'Matt Molloy',
  'Sharon Shannon',
  'Cathal McConnell',
  'Mary Bergin',
  'Frankie Gavin',
  'Liz Carroll',
  'Seamus Tansey',
  'Paddy Keenan',
  'Davy Spillane',
  'Máire Ní Chathasaigh',
  'Altan',
  'Clannad',
  'The Chieftains',
  'Planxty',
];

const IRISH_TOWNS = [
  'Dublin',
  'Cork',
  'Galway',
  'Limerick',
  'Waterford',
  'Kilkenny',
  'Ennis',
  'Dingle',
  'Westport',
  'Sligo',
  'Donegal',
  'Killarney',
  'Tralee',
  'Enniskillen',
  'Ballina',
];

const ALBUM_NAMES = [
  'Traditional Music of Ireland',
  'Celtic Heartbeat',
  'The Wind Among the Reeds',
  'Songs of the Emerald Isle',
  'Irish Folk Treasures',
  'The Fiddle and the Dance',
  'Music from the Four Provinces',
  'Celtic Crossroads',
  'The Spirit of Ireland',
  'Treasures of Irish Music',
];

const TUNE_TYPES: TuneType[] = [
  'reel',
  'jig',
  'hornpipe',
  'slip jig',
  'strathspey',
  'waltz',
  'march',
  'polka',
  'air',
];

const MUSICAL_MODES: MusicalMode[] = [
  'Gmajor',
  'Dmajor',
  'Amajor',
  'Emajor',
  'Cmajor',
  'Fmajor',
  'Eminor',
  'Bminor',
  'Aminor',
  'Dminor',
  'Adorian',
  'Ddorian',
  'Amixolydian',
  'Dmixolydian',
];

// Helper functions
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function generateDate(daysBack = 365): string {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysBack));
  return date.toISOString();
}

function generateMeter(type: TuneType): string {
  switch (type) {
    case 'jig':
    case 'slip jig':
      return '6/8';
    case 'reel':
    case 'hornpipe':
      return '4/4';
    case 'waltz':
      return '3/4';
    default:
      return randomChoice(['4/4', '6/8', '2/4', '3/4']);
  }
}

function generateSimpleABC(name: string, type: TuneType, mode: MusicalMode): string {
  const key = mode.replace('major', '').replace('minor', 'm').replace('dorian', 'Dor').replace('mixolydian', 'Mix');
  const meter = generateMeter(type);
  
  return `X:1\nT:${name}\nM:${meter}\nL:1/8\nK:${key}\n|:d2A2 F2A2|d2f2 a2f2|g2e2 c2A2|d2A2 F2A2:|\n|:a2f2 d2f2|a2f2 g2e2|f2d2 A2F2|1 a2f2 d2A2:|2 a2f2 d4||\n`;
}

// Main generation functions
export function generateSampleTunes(count: number): Tune[] {
  const tunes: Tune[] = [];
  
  for (let i = 0; i < count; i++) {
    const name = randomChoice(TUNE_NAMES);
    const type = randomChoice(TUNE_TYPES);
    const mode = randomChoice(MUSICAL_MODES);
    const tune_id = generateId();
    const setting_id = generateId();
    
    tunes.push({
      tune_id,
      setting_id,
      name: `${name} #${i + 1}`,
      type,
      meter: generateMeter(type),
      mode,
      abc: generateSimpleABC(name, type, mode),
      date: generateDate(),
      username: randomChoice(MUSICIANS),
    });
  }
  
  return tunes;
}

export function generateSampleSets(count: number, availableTunes: Tune[]): TuneSet[] {
  const sets: TuneSet[] = [];
  
  for (let i = 0; i < count; i++) {
    const tunesInSet = randomInt(2, 5);
    const setId = generateId();
    const member_id = generateId();
    const username = randomChoice(MUSICIANS);
    const date = generateDate();
    
    for (let j = 0; j < tunesInSet; j++) {
      const tune = randomChoice(availableTunes);
      sets.push({
        tuneset: setId,
        date,
        member_id,
        username,
        settingorder: (j + 1).toString(),
        name: tune.name,
        tune_id: tune.tune_id,
        setting_id: tune.setting_id,
        type: tune.type,
        meter: tune.meter,
        mode: tune.mode,
        abc: tune.abc,
      });
    }
  }
  
  return sets;
}

export function generateSampleRecordings(count: number, availableTunes: Tune[]): Recording[] {
  const recordings: Recording[] = [];
  
  for (let i = 0; i < count; i++) {
    const tune = randomChoice(availableTunes);
    recordings.push({
      id: generateId(),
      artist: randomChoice(MUSICIANS),
      recording: randomChoice(ALBUM_NAMES),
      track: `Track ${randomInt(1, 12)}`,
      number: randomInt(1, 3).toString(),
      tune: tune.name,
      tune_id: tune.tune_id,
    });
  }
  
  return recordings;
}

export function generateSampleSessions(count: number): Session[] {
  const sessions: Session[] = [];
  
  for (let i = 0; i < count; i++) {
    const town = randomChoice(IRISH_TOWNS);
    const lat = 51.5 + Math.random() * 4; // Rough Ireland latitude range
    const lng = -10.5 + Math.random() * 4; // Rough Ireland longitude range
    
    sessions.push({
      id: generateId(),
      name: `${town} Traditional Music Session`,
      address: `${randomInt(1, 100)} Main Street`,
      town,
      area: randomChoice(['Munster', 'Leinster', 'Connacht', 'Ulster']),
      country: 'Ireland',
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
      date: generateDate(),
    });
  }
  
  return sessions;
}

export function generateSampleAliases(count: number, availableTunes: Tune[]): TuneAlias[] {
  const aliases: TuneAlias[] = [];
  
  for (let i = 0; i < count; i++) {
    const tune = randomChoice(availableTunes);
    const aliasModifiers = ['The Old', 'New', 'Young', 'Big', 'Little', 'Wild', 'Sweet'];
    const modifier = randomChoice(aliasModifiers);
    
    aliases.push({
      tune_id: tune.tune_id,
      alias: `${modifier} ${tune.name.replace('The ', '')}`,
      name: tune.name,
    });
  }
  
  return aliases;
}

export function generateSamplePopularity(count: number, availableTunes: Tune[]): TunePopularity[] {
  const popularity: TunePopularity[] = [];
  
  for (let i = 0; i < count; i++) {
    const tune = randomChoice(availableTunes);
    popularity.push({
      name: tune.name,
      tune_id: tune.tune_id,
      tunebooks: randomInt(1, 50).toString(),
    });
  }
  
  return popularity;
}

export interface SampleDataSet {
  tunes: Tune[];
  sets: TuneSet[];
  recordings: Recording[];
  sessions: Session[];
  aliases: TuneAlias[];
  popularity: TunePopularity[];
}

export function generateSampleData(
  config: SampleGeneratorConfig = defaultConfig
): SampleDataSet {
  console.log('🎵 Generating sample tunebook data with configuration:', config);
  
  // Generate tunes first as they're referenced by other entities
  const tunes = generateSampleTunes(config.tunesCount);
  console.log(`   ✓ Generated ${tunes.length} sample tunes`);
  
  // Generate dependent entities
  const sets = generateSampleSets(config.setsCount, tunes);
  console.log(`   ✓ Generated ${sets.length} sample tune sets`);
  
  const recordings = generateSampleRecordings(config.recordingsCount, tunes);
  console.log(`   ✓ Generated ${recordings.length} sample recordings`);
  
  const sessions = generateSampleSessions(config.sessionsCount);
  console.log(`   ✓ Generated ${sessions.length} sample sessions`);
  
  const aliases = generateSampleAliases(config.aliasesCount, tunes);
  console.log(`   ✓ Generated ${aliases.length} sample aliases`);
  
  const popularity = generateSamplePopularity(config.popularityCount, tunes);
  console.log(`   ✓ Generated ${popularity.length} sample popularity entries`);
  
  return {
    tunes,
    sets,
    recordings,
    sessions,
    aliases,
    popularity,
  };
}
