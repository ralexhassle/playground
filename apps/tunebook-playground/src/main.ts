#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import readline from 'readline';

// Import types and utilities from the shared tunebook library
import type { 
  Tune, 
  TuneSet, 
  Recording, 
  Session, 
  User 
} from '@monorepo/tunebook';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Interface for the playground data loader
 */
interface DataLoader {
  loadTunes(): Tune[];
  loadSets(): TuneSet[];
  loadRecordings(): Recording[];
  loadSessions(): Session[];
  loadUsers(): User[];
  stats(): void;
}

/**
 * Tunebook Playground - Interactive data exploration tool
 */
class TunebookPlayground implements DataLoader {
  private dataDir: string;
  private tunes: Tune[] = [];
  private sets: TuneSet[] = [];
  private recordings: Recording[] = [];
  private sessions: Session[] = [];
  private users: User[] = [];

  constructor() {
    this.dataDir = resolve(__dirname, '../data');
    console.log('🎵 Tunebook Playground - TheSession.org Data Explorer');
    console.log('====================================================\n');
    this.loadData();
  }

  /**
   * Load data from JSON files or use sample data
   */
  private loadData(): void {
    console.log('📂 Loading data...');
    
    this.tunes = this.loadJsonFile('tunes.json', []);
    this.sets = this.loadJsonFile('sets.json', []);
    this.recordings = this.loadJsonFile('recordings.json', []);
    this.sessions = this.loadJsonFile('sessions.json', []);
    this.users = this.loadJsonFile('users.json', []);
    
    console.log('✅ Data loaded successfully!\n');
    this.stats();
  }

  /**
   * Load a JSON file or return default value
   */
  private loadJsonFile<T>(filename: string, defaultValue: T): T {
    const filePath = resolve(this.dataDir, filename);
    
    if (existsSync(filePath)) {
      try {
        const data = readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(data);
        console.log(`   ✓ ${filename}: ${Array.isArray(parsed) ? parsed.length : 'loaded'} items`);
        return parsed;
      } catch (error) {
        console.log(`   ⚠️  ${filename}: Error loading file, using default`);
        return defaultValue;
      }
    } else {
      console.log(`   ℹ️  ${filename}: File not found, using sample data`);
      return defaultValue;
    }
  }

  /**
   * Public interface methods
   */
  loadTunes(): Tune[] { return this.tunes; }
  loadSets(): TuneSet[] { return this.sets; }
  loadRecordings(): Recording[] { return this.recordings; }
  loadSessions(): Session[] { return this.sessions; }
  loadUsers(): User[] { return this.users; }

  /**
   * Display data statistics
   */
  stats(): void {
    console.log('📊 Data Statistics:');
    console.log(`   Tunes: ${this.tunes.length.toLocaleString()}`);
    console.log(`   Tune Sets: ${this.sets.length.toLocaleString()}`);
    console.log(`   Recordings: ${this.recordings.length.toLocaleString()}`);
    console.log(`   Sessions: ${this.sessions.length.toLocaleString()}`);
    console.log(`   Users: ${this.users.length.toLocaleString()}\n`);
  }

  /**
   * Interactive commands
   */
  async startInteractive(): Promise<void> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('🎮 Interactive Mode - Available Commands:');
    console.log('   stats          - Show data statistics');
    console.log('   tunes [type]   - List tunes (optionally filter by type)');
    console.log('   search [term]  - Search tunes by name');
    console.log('   random         - Show a random tune');
    console.log('   users [limit]  - List users');
    console.log('   sessions       - List sessions');
    console.log('   help           - Show this help');
    console.log('   exit           - Exit playground\n');

    const prompt = () => {
      rl.question('tunebook> ', (input) => {
        this.processCommand(input.trim(), rl, prompt);
      });
    };

    prompt();
  }

  /**
   * Process interactive commands
   */
  private processCommand(input: string, rl: readline.Interface, prompt: () => void): void {
    const [command, ...args] = input.split(' ');

    switch (command.toLowerCase()) {
      case 'stats':
        this.stats();
        break;

      case 'tunes':
        this.listTunes(args[0], parseInt(args[1]) || 10);
        break;

      case 'search':
        this.searchTunes(args.join(' '));
        break;

      case 'random':
        this.showRandomTune();
        break;

      case 'users':
        this.listUsers(parseInt(args[0]) || 10);
        break;

      case 'sessions':
        this.listSessions(parseInt(args[0]) || 10);
        break;

      case 'help':
        this.showHelp();
        break;

      case 'exit':
      case 'quit':
        console.log('👋 Goodbye!');
        rl.close();
        return;

      default:
        if (input) {
          console.log(`❌ Unknown command: ${command}. Type 'help' for available commands.`);
        }
        break;
    }

    prompt();
  }

  /**
   * List tunes with optional filtering
   */
  private listTunes(type?: string, limit: number = 10): void {
    let filtered = this.tunes;
    
    if (type) {
      filtered = this.tunes.filter(tune => 
        tune.type?.toLowerCase().includes(type.toLowerCase())
      );
      console.log(`🎵 Tunes of type "${type}" (showing ${Math.min(limit, filtered.length)} of ${filtered.length}):`);
    } else {
      console.log(`🎵 All Tunes (showing ${Math.min(limit, filtered.length)} of ${filtered.length}):`);
    }

    filtered.slice(0, limit).forEach((tune, index) => {
      console.log(`   ${index + 1}. ${tune.name} (${tune.type}) - ${tune.meter} - by ${tune.username}`);
    });
    console.log();
  }

  /**
   * Search tunes by name
   */
  private searchTunes(searchTerm: string): void {
    if (!searchTerm) {
      console.log('❌ Please provide a search term.');
      return;
    }

    const results = this.tunes.filter(tune =>
      tune.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log(`🔍 Search results for "${searchTerm}" (${results.length} found):`);
    results.slice(0, 10).forEach((tune, index) => {
      console.log(`   ${index + 1}. ${tune.name} (${tune.type}) - ${tune.meter}`);
    });
    
    if (results.length > 10) {
      console.log(`   ... and ${results.length - 10} more`);
    }
    console.log();
  }

  /**
   * Show a random tune
   */
  private showRandomTune(): void {
    if (this.tunes.length === 0) {
      console.log('❌ No tunes available.');
      return;
    }

    const randomTune = this.tunes[Math.floor(Math.random() * this.tunes.length)];
    console.log('🎲 Random Tune:');
    console.log(`   Name: ${randomTune.name}`);
    console.log(`   Type: ${randomTune.type}`);
    console.log(`   Meter: ${randomTune.meter}`);
    console.log(`   Mode: ${randomTune.mode}`);
    console.log(`   By: ${randomTune.username}`);
    if (randomTune.abc) {
      console.log(`   ABC: ${randomTune.abc.substring(0, 100)}...`);
    }
    console.log();
  }

  /**
   * List users
   */
  private listUsers(limit: number = 10): void {
    console.log(`👥 Users (showing ${Math.min(limit, this.users.length)} of ${this.users.length}):`);
    this.users.slice(0, limit).forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (ID: ${user.id})`);
    });
    console.log();
  }

  /**
   * List sessions
   */
  private listSessions(limit: number = 10): void {
    console.log(`🎭 Sessions (showing ${Math.min(limit, this.sessions.length)} of ${this.sessions.length}):`);
    this.sessions.slice(0, limit).forEach((session, index) => {
      console.log(`   ${index + 1}. ${session.name} - ${session.address || 'Location TBD'}`);
    });
    console.log();
  }

  /**
   * Show help
   */
  private showHelp(): void {
    console.log('📚 Available Commands:');
    console.log('   stats                    - Show data statistics');
    console.log('   tunes [type] [limit]     - List tunes, optionally filter by type');
    console.log('   search <term>            - Search tunes by name');
    console.log('   random                   - Show a random tune');
    console.log('   users [limit]            - List users');
    console.log('   sessions [limit]         - List sessions');
    console.log('   help                     - Show this help');
    console.log('   exit                     - Exit playground');
    console.log();
    console.log('💡 Examples:');
    console.log('   tunes jig 5              - Show 5 jigs');
    console.log('   search "blackbird"       - Find tunes with "blackbird" in name');
    console.log('   users 20                 - Show 20 users');
    console.log();
  }
}

/**
 * Main entry point
 */
async function main() {
  const playground = new TunebookPlayground();
  
  // Check if we have command line arguments
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Non-interactive mode - execute command and exit
    const command = args[0];
    
    switch (command) {
      case 'stats':
        playground.stats();
        break;
      case 'download':
        console.log('📥 To download the data files, run:');
        console.log('cd apps/tunebook-playground && npm run download-data');
        break;
      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log('Available commands: stats, download');
        process.exit(1);
    }
  } else {
    // Interactive mode
    await playground.startInteractive();
  }
}

// Run the playground
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { TunebookPlayground };
export type { DataLoader };
