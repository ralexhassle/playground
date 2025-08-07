import { faker } from '@faker-js/faker';
import {
  SampleConfig,
  SampleDataSet,
  SampleUser,
  SampleTune,
  SampleTuneSet,
  SampleRecording,
  SampleSession,
  SampleAlias,
  SamplePopularity
} from './sample-config';
import { SampleDataUtils } from './sample-utils';
import { TuneType, MusicalMode } from './types';

export class TheSessionSampleGenerator {
  private config: SampleConfig;
  
  constructor(config: SampleConfig) {
    this.config = config;
    // Configuration de faker avec locale irlandaise
    faker.seed(12345); // Seed fixe pour reproductibilité
  }
  
  // Point d'entrée principal
  async generateAllSamples(): Promise<SampleDataSet> {
    console.log('🎵 Generating sample data...');
    
    const users = this.generateUsers();
    console.log(`✅ Generated ${users.length} users`);
    
    const tunes = this.generateTunes(users);
    console.log(`✅ Generated ${tunes.length} tunes`);
    
    const sets = this.generateSets(tunes, users);
    console.log(`✅ Generated ${sets.length} sets`);
    
    const recordings = this.generateRecordings(tunes, users);
    console.log(`✅ Generated ${recordings.length} recordings`);
    
    const sessions = this.generateSessions(users);
    console.log(`✅ Generated ${sessions.length} sessions`);
    
    const aliases = this.generateAliases(tunes, users);
    console.log(`✅ Generated ${aliases.length} aliases`);
    
    const popularity = this.calculatePopularity(tunes, recordings, aliases);
    console.log(`✅ Calculated popularity scores`);
    
    return {
      users,
      tunes,
      sets,
      recordings,
      sessions,
      aliases,
      popularity
    };
  }
  
  // Génération des utilisateurs
  private generateUsers(): SampleUser[] {
    return Array.from({ length: this.config.userCount }, (_, i) => ({
      id: `user_${String(i + 1).padStart(3, '0')}`,
      name: SampleDataUtils.generateIrishUsername()
    }));
  }
  
  // Génération des morceaux avec settings
  private generateTunes(users: SampleUser[]): SampleTune[] {
    return Array.from({ length: this.config.tuneCount }, (_, i) => {
      const tuneId = `tune_${String(i + 1).padStart(3, '0')}`;
      const mainSettingId = `setting_${tuneId}_1`;
      const tuneName = SampleDataUtils.generateTuneName();
      const tuneType = SampleDataUtils.selectTuneTypeByDistribution(
        this.config.tuneTypeDistribution
      ) as TuneType;
      const user = faker.helpers.arrayElement(users);
      
      return {
        tune_id: tuneId,
        setting_id: mainSettingId,
        name: tuneName,
        type: tuneType,
        meter: faker.helpers.arrayElement(SampleDataUtils.MUSICAL_METERS),
        mode: faker.helpers.arrayElement(['major', 'minor', 'dorian', 'mixolydian']) as MusicalMode,
        abc: SampleDataUtils.generateSimpleABC(tuneName),
        date: SampleDataUtils.generateRandomDate(),
        username: user.name
      };
    });
  }
  
  // Génération des sets
  private generateSets(tunes: SampleTune[], users: SampleUser[]): SampleTuneSet[] {
    const sets: SampleTuneSet[] = [];
    
    for (let i = 0; i < this.config.setCount; i++) {
      const setId = `set_${String(i + 1).padStart(3, '0')}`;
      const setName = `${SampleDataUtils.generateTuneName()} Set`;
      const user = faker.helpers.arrayElement(users);
      const date = SampleDataUtils.generateRandomDate();
      
      // Sélectionner 2-5 morceaux pour ce set
      const tuneCount = faker.number.int(this.config.tunesPerSet);
      const selectedTunes = faker.helpers.arrayElements(tunes, tuneCount);
      
      // Créer une entrée pour chaque morceau dans le set
      selectedTunes.forEach((tune, index) => {
        sets.push({
          tuneset: setId,
          date: date,
          member_id: user.id,
          username: user.name,
          settingorder: String(index + 1),
          name: setName,
          tune_id: tune.tune_id,
          setting_id: tune.setting_id,
          type: tune.type,
          meter: tune.meter,
          mode: tune.mode,
          abc: tune.abc
        });
      });
    }
    
    return sets;
  }
  
  // Génération des enregistrements
  private generateRecordings(tunes: SampleTune[], _users: SampleUser[]): SampleRecording[] {
    const recordings: SampleRecording[] = [];
    
    for (let i = 0; i < this.config.recordingCount; i++) {
      const albumName = SampleDataUtils.generateAlbumName();
      const artist = faker.helpers.arrayElement(SampleDataUtils.IRISH_NAMES).replace("O'", "");
      const trackCount = faker.number.int(this.config.tracksPerRecording);
      
      // Sélectionner des morceaux aléatoires pour cet album
      const albumTunes = faker.helpers.arrayElements(tunes, trackCount);
      
      albumTunes.forEach((tune, trackIndex) => {
        recordings.push({
          id: `rec_${String(i + 1).padStart(3, '0')}_${String(trackIndex + 1).padStart(2, '0')}`,
          artist: artist,
          recording: albumName,
          track: `Track ${trackIndex + 1}`,
          number: String(trackIndex + 1),
          tune: tune.name,
          tune_id: tune.tune_id
        });
      });
    }
    
    return recordings;
  }
  
  // Génération des sessions géographiques
  private generateSessions(_users: SampleUser[]): SampleSession[] {
    return Array.from({ length: this.config.sessionCount }, (_, i) => {
      const region = faker.helpers.arrayElement(this.config.geographicRegions);
      const coords = SampleDataUtils.generateCoordinatesInRegion(
        region.centerLat,
        region.centerLng,
        region.radiusKm
      );
      
      return {
        id: `session_${String(i + 1).padStart(3, '0')}`,
        name: SampleDataUtils.generateVenueName(),
        address: SampleDataUtils.generateIrishAddress(),
        town: region.name,
        area: region.name,
        country: 'Ireland',
        latitude: String(coords.latitude),
        longitude: String(coords.longitude),
        date: SampleDataUtils.generateRandomDate()
      };
    });
  }
  
  // Génération des alias
  private generateAliases(tunes: SampleTune[], _users: SampleUser[]): SampleAlias[] {
    const aliases: SampleAlias[] = [];
    
    // Sélectionner des morceaux qui auront des alias (environ 60%)
    const tunesWithAliases = faker.helpers.arrayElements(
      tunes,
      Math.floor(tunes.length * 0.6)
    );
    
    tunesWithAliases.forEach((tune) => {
      // Créer 1-3 alias par morceau sélectionné
      const aliasCount = faker.number.int({ min: 1, max: 3 });
      
      for (let j = 0; j < aliasCount; j++) {
        
        // Générer des variations du nom original
        const originalName = tune.name;
        const aliasVariations = [
          originalName.replace('The ', ''),
          originalName.replace(/Reel|Jig|Hornpipe/, '').trim(),
          originalName.split(' ').slice(0, 2).join(' '),
          originalName.replace("'s", 's'),
          `${originalName.split(' ')[0]} ${faker.helpers.arrayElement(['Reel', 'Jig'])}`
        ];
        
        const aliasName = faker.helpers.arrayElement(aliasVariations);
        
        if (aliasName !== originalName && aliasName.length > 2) {
          aliases.push({
            tune_id: tune.tune_id,
            alias: aliasName,
            name: tune.name
          });
        }
      }
    });
    
    return aliases;
  }
  
  // Calcul des scores de popularité
  private calculatePopularity(
    tunes: SampleTune[],
    recordings: SampleRecording[],
    aliases: SampleAlias[]
  ): SamplePopularity[] {
    return tunes.map(tune => {
      // Compter les occurrences
      const recordingCount = recordings.filter(rec => rec.tune_id === tune.tune_id).length;
      const aliasCount = aliases.filter(alias => alias.tune_id === tune.tune_id).length;
      const settingCount = 1; // Pour simplicité, chaque morceau a 1 setting
      
      const popularityScore = SampleDataUtils.calculatePopularityScore(
        recordingCount,
        aliasCount,
        settingCount
      );
      
      return {
        tune_id: tune.tune_id,
        popularity_score: Number(popularityScore.toFixed(3)),
        recording_count: recordingCount,
        session_mentions: faker.number.int({ min: 0, max: 5 }),
        alias_count: aliasCount,
        setting_count: settingCount
      };
    });
  }
}
