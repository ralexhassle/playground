/**
 * Data processing utilities for TheSession.org JSON files
 * Handles parsing, normalization, and re    const tunes: Tune[] = JSON.parse(tryPaths("tunes.json"));
    const sets: TuneSet[] = JSON.parse(tryPaths("sets.json"));
    const recordings: Recording[] = JSON.parse(tryPaths("recordings.json"));

    const sessions: Session[] = JSON.parse(tryPaths("sessions.json"));

    const aliases: TuneAlias[] = JSON.parse(tryPaths("aliases.json"));

    const popularity: TunePopularity[] = JSON.parse(tryPaths("tune_popularity.json"));sions: Session[] = JSON.parse(tryPaths("sessions.json"));

    const aliases: TuneAlias[] = JSON.parse(tryPaths("aliases.json"));

    const popularity: TunePopularity[] = JSON.parse(tryPaths("tune_popularity.json"));building
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import {
  Tune,
  TuneSet,
  Recording,
  Session,
  TuneAlias,
  TunePopularity,
  NormalizedTune,
  NormalizedTuneSet,
  NormalizedRecording,
  NormalizedSession,
  ImportStats,
  ImportError,
  MusicalFeatures,
} from "./types";

export class TheSessionDataProcessor {
  private errors: ImportError[] = [];

  /**
   * Main processing pipeline - orchestrates the entire data transformation
   */
  async processAllData(dataDir: string): Promise<ImportStats> {
    console.log("Starting TheSession data processing...");

    try {
      // 1. Load raw JSON data
      const rawData = this.loadRawData(dataDir);

      // 2. Extract and normalize core entities
      const users = this.extractUsers(rawData.tunes, rawData.sets);
      const normalizedTunes = this.normalizeTunes(
        rawData.tunes,
        rawData.aliases
      );
      const normalizedSets = this.normalizeSets(rawData.sets, users);
      const normalizedRecordings = this.normalizeRecordings(rawData.recordings);
      const normalizedSessions = this.normalizeSessions(rawData.sessions);

      // 3. Build relationships
      this.linkSetsToTunes(normalizedSets, normalizedTunes);
      this.linkRecordingsToTunes(normalizedRecordings, normalizedTunes);

      // 4. Generate musical features for similarity analysis
      await this.generateMusicalFeatures(normalizedTunes);

      // 5. Create search indexes
      this.generateSearchVectors(normalizedTunes, normalizedSessions);

      // 6. Export processed data
      this.exportProcessedData(
        {
          tunes: normalizedTunes,
          sets: normalizedSets,
          recordings: normalizedRecordings,
          sessions: normalizedSessions,
          users,
        },
        dataDir
      );

      return {
        tunes_processed: normalizedTunes.length,
        sets_processed: normalizedSets.length,
        recordings_processed: normalizedRecordings.length,
        sessions_processed: normalizedSessions.length,
        aliases_processed: rawData.aliases.length,
        errors: this.errors,
      };
    } catch (error) {
      console.error("Processing failed:", error);
      throw error;
    }
  }

  /**
   * Load all JSON files from the data directory
   */
  private loadRawData(dataDir: string) {
    console.log("Loading raw JSON data...");

    // Try to detect structure: json/ subdirectory or direct files
    const tryPaths = (filename: string) => {
      const jsonSubdirPath = join(dataDir, "json", filename);
      const directPath = join(dataDir, filename);
      
      try {
        return readFileSync(jsonSubdirPath, "utf-8");
      } catch {
        return readFileSync(directPath, "utf-8");
      }
    };

    const tunes: Tune[] = JSON.parse(tryPaths("tunes.json"));
    const sets: TuneSet[] = JSON.parse(tryPaths("sets.json"));
    const recordings: Recording[] = JSON.parse(tryPaths("recordings.json"));

    const sessions: Session[] = JSON.parse(tryPaths("sessions.json"));

    const aliases: TuneAlias[] = JSON.parse(tryPaths("aliases.json"));

    const popularity: TunePopularity[] = JSON.parse(tryPaths("tune_popularity.json"));

    console.log(
      `Loaded: ${tunes.length} tunes, ${sets.length} set entries, ${recordings.length} recordings`
    );

    return { tunes, sets, recordings, sessions, aliases, popularity };
  }

  /**
   * Extract unique users from tunes and sets data
   */
  private extractUsers(tunes: Tune[], sets: TuneSet[]) {
    console.log("Extracting users...");

    const usersMap = new Map<string, { user_id: number; username: string }>();
    let userId = 1;

    // Extract from tunes
    tunes.forEach((tune) => {
      if (tune.username && !usersMap.has(tune.username)) {
        usersMap.set(tune.username, {
          user_id: userId++,
          username: tune.username,
        });
      }
    });

    // Extract from sets
    sets.forEach((set) => {
      if (set.username && !usersMap.has(set.username)) {
        usersMap.set(set.username, {
          user_id: userId++,
          username: set.username,
        });
      }
    });

    const users = Array.from(usersMap.values());
    console.log(`Extracted ${users.length} unique users`);
    return users;
  }

  /**
   * Normalize and deduplicate tunes, incorporating aliases and popularity
   */
  private normalizeTunes(
    rawTunes: Tune[],
    aliases: TuneAlias[]
  ): NormalizedTune[] {
    console.log("Normalizing tunes...");

    // Group tunes by tune_id (multiple settings per tune)
    const tunesMap = new Map<string, NormalizedTune>();
    const aliasesMap = new Map<string, string[]>();

    // Build aliases map
    aliases.forEach((alias) => {
      if (!aliasesMap.has(alias.tune_id)) {
        aliasesMap.set(alias.tune_id, []);
      }
      aliasesMap.get(alias.tune_id)!.push(alias.alias);
    });

    rawTunes.forEach((tune) => {
      try {
        if (!tunesMap.has(tune.tune_id)) {
          // Create new normalized tune
          tunesMap.set(tune.tune_id, {
            tune_id: parseInt(tune.tune_id),
            canonical_name: tune.name,
            type: tune.type,
            meter: tune.meter,
            mode: tune.mode,
            created_at: new Date(tune.date),
            aliases: aliasesMap.get(tune.tune_id) || [],
            popularity_score: 0, // Will be updated from popularity data
            settings: [],
          });
        }

        // Add this setting to the tune
        const normalizedTune = tunesMap.get(tune.tune_id)!;
        normalizedTune.settings.push({
          setting_id: parseInt(tune.setting_id),
          tune_id: parseInt(tune.tune_id),
          abc_notation: tune.abc,
          contributor_username: tune.username,
          created_at: new Date(tune.date),
        });
      } catch (error) {
        this.errors.push({
          entity_type: "tune",
          entity_id: tune.tune_id,
          error_message: `Failed to normalize tune: ${error}`,
          raw_data: tune,
        });
      }
    });

    const normalizedTunes = Array.from(tunesMap.values());
    console.log(
      `Normalized ${normalizedTunes.length} unique tunes with ${rawTunes.length} total settings`
    );
    return normalizedTunes;
  }

  /**
   * Normalize tune sets, grouping by set ID and maintaining order
   */
  private normalizeSets(
    rawSets: TuneSet[],
    _users: { user_id: number; username: string }[]
  ): NormalizedTuneSet[] {
    console.log("Normalizing tune sets...");

    const setsMap = new Map<string, NormalizedTuneSet>();

    rawSets.forEach((setEntry) => {
      try {
        if (!setsMap.has(setEntry.tuneset)) {
          // Create new normalized set
          setsMap.set(setEntry.tuneset, {
            set_id: parseInt(setEntry.tuneset),
            creator_username: setEntry.username,
            created_at: new Date(setEntry.date),
            is_public: true, // Assume public by default
            compositions: [],
          });
        }

        // Add composition to set
        const normalizedSet = setsMap.get(setEntry.tuneset)!;
        normalizedSet.compositions.push({
          set_id: parseInt(setEntry.tuneset),
          tune_id: parseInt(setEntry.tune_id),
          setting_id: parseInt(setEntry.setting_id),
          position_in_set: parseInt(setEntry.settingorder),
          tune_name: setEntry.name,
          tune_type: setEntry.type,
        });
      } catch (error) {
        this.errors.push({
          entity_type: "set",
          entity_id: setEntry.tuneset,
          error_message: `Failed to normalize set: ${error}`,
          raw_data: setEntry,
        });
      }
    });

    // Sort compositions within each set by position
    setsMap.forEach((set) => {
      set.compositions.sort((a, b) => a.position_in_set - b.position_in_set);
    });

    const normalizedSets = Array.from(setsMap.values());
    console.log(`Normalized ${normalizedSets.length} unique sets`);
    return normalizedSets;
  }

  /**
   * Normalize recordings and extract artist information
   */
  private normalizeRecordings(
    rawRecordings: Recording[]
  ): NormalizedRecording[] {
    console.log("Normalizing recordings...");

    const recordingsMap = new Map<string, NormalizedRecording>();
    const artistsMap = new Map<
      string,
      { artist_id: number; artist_name: string }
    >();
    let artistId = 1;

    rawRecordings.forEach((recording) => {
      try {
        // Extract artist info
        if (!artistsMap.has(recording.artist)) {
          artistsMap.set(recording.artist, {
            artist_id: artistId++,
            artist_name: recording.artist,
          });
        }

        const recordingKey = `${recording.artist}:${recording.recording}`;

        if (!recordingsMap.has(recordingKey)) {
          recordingsMap.set(recordingKey, {
            recording_id: parseInt(recording.id),
            album_name: recording.recording,
            artist_name: recording.artist,
            artist_id: artistsMap.get(recording.artist)!.artist_id,
            tracks: [],
          });
        }

        const normalizedRecording = recordingsMap.get(recordingKey)!;

        // Find or create track
        let track = normalizedRecording.tracks.find(
          (t) => t.track_number === parseInt(recording.track)
        );
        if (!track) {
          track = {
            track_id: parseInt(`${recording.id}${recording.track}`),
            track_number: parseInt(recording.track),
            track_name: `Track ${recording.track}`,
            tunes: [],
          };
          normalizedRecording.tracks.push(track);
        }

        // Add tune to track
        if (recording.tune_id) {
          track.tunes.push({
            tune_id: parseInt(recording.tune_id),
            tune_name: recording.tune,
            position_in_track: parseInt(recording.number),
          });
        }
      } catch (error) {
        this.errors.push({
          entity_type: "recording",
          entity_id: recording.id,
          error_message: `Failed to normalize recording: ${error}`,
          raw_data: recording,
        });
      }
    });

    const normalizedRecordings = Array.from(recordingsMap.values());
    console.log(
      `Normalized ${normalizedRecordings.length} unique recordings from ${artistsMap.size} artists`
    );
    return normalizedRecordings;
  }

  /**
   * Normalize sessions with geographic data
   */
  private normalizeSessions(rawSessions: Session[]): NormalizedSession[] {
    console.log("Normalizing sessions...");

    return rawSessions
      .map((session) => {
        try {
          return {
            session_id: parseInt(session.id),
            venue_name: session.name,
            full_address:
              `${session.address}, ${session.town}, ${session.area}, ${session.country}`.replace(
                /, ,/g,
                ","
              ),
            location: {
              town: session.town,
              area: session.area,
              country: session.country,
              coordinates: {
                latitude: parseFloat(session.latitude),
                longitude: parseFloat(session.longitude),
              },
            },
            created_at: new Date(session.date),
            is_active: true,
          };
        } catch (error) {
          this.errors.push({
            entity_type: "session",
            entity_id: session.id,
            error_message: `Failed to normalize session: ${error}`,
            raw_data: session,
          });
          return null;
        }
      })
      .filter((session) => session !== null) as NormalizedSession[];
  }

  /**
   * Generate musical features for similarity analysis
   */
  private async generateMusicalFeatures(
    tunes: NormalizedTune[]
  ): Promise<void> {
    console.log("Generating musical features for similarity analysis...");

    let processed = 0;
    const total = tunes.reduce((sum, tune) => sum + tune.settings.length, 0);

    for (const tune of tunes) {
      for (const setting of tune.settings) {
        try {
          setting.musical_features = this.extractMusicalFeatures(
            setting.abc_notation
          );
          processed++;

          if (processed % 1000 === 0) {
            console.log(
              `Processed ${processed}/${total} settings for musical features`
            );
          }
        } catch (error) {
          this.errors.push({
            entity_type: "tune",
            entity_id: tune.tune_id.toString(),
            error_message: `Failed to extract musical features: ${error}`,
            raw_data: setting,
          });
        }
      }
    }

    console.log(`Generated musical features for ${processed} settings`);
  }

  /**
   * Extract musical features from ABC notation for similarity analysis
   */
  private extractMusicalFeatures(abcNotation: string): MusicalFeatures {
    // This is a simplified implementation - in production, you'd use a proper ABC parser
    // like abcjs or music21 Python library

    const notes = this.extractNotesFromABC(abcNotation);
    const intervals = this.calculateIntervals(notes);
    const contour = this.calculateMelodicContour(notes);

    return {
      key_signature: this.extractKeySignature(abcNotation) || "C",
      time_signature: this.extractTimeSignature(abcNotation) || "4/4",
      note_count: notes.length,
      melodic_contour: contour,
      intervals: intervals,
      rhythmic_pattern: this.extractRhythmicPattern(abcNotation),
    };
  }

  /**
   * Simple ABC notation parser to extract notes
   */
  private extractNotesFromABC(abc: string): string[] {
    // Remove ABC headers and keep only the music
    const musicLines = abc
      .split("\n")
      .filter(
        (line) =>
          !line.startsWith("K:") &&
          !line.startsWith("M:") &&
          !line.startsWith("L:") &&
          line.trim().length > 0
      );

    const musicString = musicLines.join("");

    // Extract notes (simplified - doesn't handle all ABC features)
    const noteRegex = /[A-Ga-g][',]*[0-9\/]*/g;
    return musicString.match(noteRegex) || [];
  }

  private calculateIntervals(notes: string[]): number[] {
    // Simplified interval calculation
    const noteValues: { [key: string]: number } = {
      C: 0,
      D: 2,
      E: 4,
      F: 5,
      G: 7,
      A: 9,
      B: 11,
      c: 12,
      d: 14,
      e: 16,
      f: 17,
      g: 19,
      a: 21,
      b: 23,
    };

    const intervals: number[] = [];
    for (let i = 1; i < notes.length; i++) {
      const prev = noteValues[notes[i - 1][0]] || 0;
      const curr = noteValues[notes[i][0]] || 0;
      intervals.push(curr - prev);
    }

    return intervals;
  }

  private calculateMelodicContour(notes: string[]): number[] {
    // Simplified contour: -1 = down, 0 = same, 1 = up
    const noteValues: { [key: string]: number } = {
      C: 0,
      D: 2,
      E: 4,
      F: 5,
      G: 7,
      A: 9,
      B: 11,
      c: 12,
      d: 14,
      e: 16,
      f: 17,
      g: 19,
      a: 21,
      b: 23,
    };

    const contour: number[] = [];
    for (let i = 1; i < notes.length; i++) {
      const prev = noteValues[notes[i - 1][0]] || 0;
      const curr = noteValues[notes[i][0]] || 0;
      contour.push(Math.sign(curr - prev));
    }

    return contour;
  }

  private extractKeySignature(abc: string): string | null {
    const keyMatch = abc.match(
      /K:\s*([A-G][#b]?(?:maj|min|dor|mix|lyd|phr|loc)?)/
    );
    return keyMatch ? keyMatch[1] : null;
  }

  private extractTimeSignature(abc: string): string | null {
    const timeMatch = abc.match(/M:\s*(\d+\/\d+)/);
    return timeMatch ? timeMatch[1] : null;
  }

  private extractRhythmicPattern(abc: string): string {
    // Simplified rhythmic pattern extraction
    // In production, this would be much more sophisticated
    return abc.replace(/[A-Ga-g]/g, "X").substring(0, 32);
  }

  /**
   * Generate search vectors for full-text search
   */
  private generateSearchVectors(
    tunes: NormalizedTune[],
    sessions: NormalizedSession[]
  ): void {
    console.log("Generating search vectors...");

    // In a real implementation, this would generate PostgreSQL tsvector data
    // or prepare documents for Elasticsearch indexing

    tunes.forEach((tune) => {
      const searchText = [
        tune.canonical_name,
        ...tune.aliases,
        tune.type,
        tune.mode,
      ]
        .join(" ")
        .toLowerCase();

      // Store search text for later indexing
      (tune as any).search_text = searchText;
    });

    sessions.forEach((session) => {
      const searchText = [
        session.venue_name,
        session.location.town,
        session.location.area,
        session.location.country,
      ]
        .join(" ")
        .toLowerCase();

      (session as any).search_text = searchText;
    });
  }

  /**
   * Link sets to their constituent tunes
   */
  private linkSetsToTunes(
    sets: NormalizedTuneSet[],
    tunes: NormalizedTune[]
  ): void {
    console.log("Linking sets to tunes...");

    const tunesMap = new Map(tunes.map((t) => [t.tune_id, t]));

    sets.forEach((set) => {
      set.compositions.forEach((composition) => {
        const tune = tunesMap.get(composition.tune_id);
        if (tune) {
          // Link is already established through the composition structure
          // Additional relationship data could be added here
        }
      });
    });
  }

  /**
   * Link recordings to their constituent tunes
   */
  private linkRecordingsToTunes(
    recordings: NormalizedRecording[],
    tunes: NormalizedTune[]
  ): void {
    console.log("Linking recordings to tunes...");

    const tunesMap = new Map(tunes.map((t) => [t.tune_id, t]));

    recordings.forEach((recording) => {
      recording.tracks.forEach((track) => {
        track.tunes.forEach((trackTune) => {
          const tune = tunesMap.get(trackTune.tune_id);
          if (tune) {
            // Link is already established through the track structure
            // Additional relationship data could be added here
          }
        });
      });
    });
  }

  /**
   * Export processed data to JSON files for database import
   */
  private exportProcessedData(
    data: {
      tunes: NormalizedTune[];
      sets: NormalizedTuneSet[];
      recordings: NormalizedRecording[];
      sessions: NormalizedSession[];
      users: { user_id: number; username: string }[];
    },
    outputDir: string
  ): void {
    console.log("Exporting processed data...");

    writeFileSync(
      join(outputDir, "processed_tunes.json"),
      JSON.stringify(data.tunes, null, 2)
    );

    writeFileSync(
      join(outputDir, "processed_sets.json"),
      JSON.stringify(data.sets, null, 2)
    );

    writeFileSync(
      join(outputDir, "processed_recordings.json"),
      JSON.stringify(data.recordings, null, 2)
    );

    writeFileSync(
      join(outputDir, "processed_sessions.json"),
      JSON.stringify(data.sessions, null, 2)
    );

    writeFileSync(
      join(outputDir, "processed_users.json"),
      JSON.stringify(data.users, null, 2)
    );

    console.log("Data export completed");
  }
}

// CLI usage
// Parse command line arguments
if (require.main === module) {
  const processor = new TheSessionDataProcessor();
  let dataDir = "./";
  
  // Parse arguments
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) {
      dataDir = args[i + 1];
      i++; // Skip next argument
    } else if (!args[i].startsWith('--') && i === 0) {
      // First positional argument is dataDir (for backward compatibility)
      dataDir = args[i];
    }
  }
  
  console.log(`Processing data from: ${dataDir}`);

  processor
    .processAllData(dataDir)
    .then((stats) => {
      console.log("\n=== Processing Complete ===");
      console.log(`Tunes: ${stats.tunes_processed}`);
      console.log(`Sets: ${stats.sets_processed}`);
      console.log(`Recordings: ${stats.recordings_processed}`);
      console.log(`Sessions: ${stats.sessions_processed}`);
      console.log(`Aliases: ${stats.aliases_processed}`);
      console.log(`Errors: ${stats.errors.length}`);

      if (stats.errors.length > 0) {
        console.log("\nErrors:");
        stats.errors.slice(0, 10).forEach((error) => {
          console.log(
            `- ${error.entity_type} ${error.entity_id}: ${error.error_message}`
          );
        });
      }
    })
    .catch((error) => {
      console.error("Processing failed:", error);
      process.exit(1);
    });
}
