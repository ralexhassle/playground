# Tunebook Playground 🎵

Interactive Node.js playground for exploring and analyzing [TheSession.org](https://thesession.org) data.

## Overview

This application provides a command-line interface to explore the extensive database of Irish traditional music from TheSession.org, including:

- **Tunes**: Individual melodies with ABC notation, types (jig, reel, etc.), and musical metadata
- **Tune Sets**: Collections of tunes played together in sessions
- **Recordings**: Discography information linking tunes to albums and artists
- **Sessions**: Geographic data about traditional music sessions worldwide
- **Users**: Community members who contribute to the database

## Features

### 🎮 Interactive Mode
- Search and filter tunes by type, name, or other criteria
- Browse users, sessions, and recordings
- Display random tunes for discovery
- Real-time data statistics

### 📊 Data Analysis
- Comprehensive statistics about the dataset
- Type-safe TypeScript interfaces for all data entities
- Shared utilities from `@monorepo/tunebook` library

### 🔄 Data Management
- Automatic download script for latest data from GitHub
- Fallback to sample data when full dataset is not available
- Git-ignored data directory to keep repository lightweight

## Quick Start

### 1. Download Data (Optional)
```bash
# Download the latest data from TheSession.org repository
pnpm tunebook:download

# Or manually:
cd apps/tunebook-playground
npm run download-data
```

### 2. Run Playground
```bash
# Interactive mode
pnpm tunebook:playground

# Quick stats
pnpm tunebook:stats

# Or directly with Nx
nx dev tunebook-playground
```

## Usage Examples

### Interactive Commands
Once in interactive mode, you can use these commands:

```bash
tunebook> stats                    # Show data statistics
tunebook> tunes jig 10            # Show 10 jigs
tunebook> search "blackbird"      # Search for tunes with "blackbird"
tunebook> random                  # Display a random tune
tunebook> users 20               # List 20 users
tunebook> sessions 5             # Show 5 sessions
tunebook> help                   # Show all commands
tunebook> exit                   # Exit playground
```

### Example Output
```
🎵 Tunebook Playground - TheSession.org Data Explorer
====================================================

📂 Loading data...
   ✓ tunes.json: 47,851 items
   ✓ sets.json: 15,234 items
   ✓ recordings.json: 8,492 items
   ✓ sessions.json: 3,247 items
   ✓ users.json: 12,891 items
✅ Data loaded successfully!

📊 Data Statistics:
   Tunes: 47,851
   Tune Sets: 15,234
   Recordings: 8,492
   Sessions: 3,247
   Users: 12,891

🎮 Interactive Mode - Available Commands:
   stats          - Show data statistics
   tunes [type]   - List tunes (optionally filter by type)
   search [term]  - Search tunes by name
   random         - Show a random tune
   users [limit]  - List users
   sessions       - List sessions
   help           - Show this help
   exit           - Exit playground

tunebook> tunes reel 3
🎵 Tunes of type "reel" (showing 3 of 18,234):
   1. The Banshee (reel) - 4/4 - by user123
   2. The Butterfly (reel) - 4/4 - by fiddler456
   3. The Sailor's Hornpipe (reel) - 4/4 - by musician789
```

## Data Structure

The playground works with these main data types:

```typescript
interface Tune {
  tune_id: string;
  setting_id: string;
  name: string;
  type: TuneType;     // "jig", "reel", "hornpipe", etc.
  meter: string;      // "4/4", "6/8", "9/8"
  mode: MusicalMode;  // "major", "dorian", etc.
  abc: string;        // ABC notation
  date: string;       // ISO timestamp
  username: string;
}

interface TuneSet {
  tuneset: string;
  member_id: string;
  username: string;
  tunes: Tune[];      // Associated tunes in the set
}

interface Recording {
  id: string;
  artist: string;
  recording: string;  // Album name
  track: string;
  tune: string;
  tune_id: string;
}

interface Session {
  id: string;
  name: string;       // Venue name
  address: string;
  latitude: number;
  longitude: number;
  country: string;
}
```

## Development

### Project Structure
```
apps/tunebook-playground/
├── src/
│   └── main.ts           # Main playground application
├── data/                 # Data files (git-ignored)
│   ├── README.md
│   ├── tunes.json        # Downloaded from TheSession
│   ├── sets.json
│   ├── recordings.json
│   ├── sessions.json
│   └── users.json
├── scripts/
│   └── download-data.js  # Data download utility
└── package.json
```

### Building and Testing
```bash
# Build the playground
nx build tunebook-playground

# Run tests (when available)
nx test tunebook-playground

# Lint code
nx lint tunebook-playground
```

### Integration with Shared Library

The playground uses the shared `@monorepo/tunebook` library for:
- TypeScript type definitions
- Data processing utilities
- Sample data generators
- Common interfaces

This ensures consistency across the monorepo and allows other applications to reuse the same tunebook functionality.

## Data Source

All data comes from [TheSession.org Data Repository](https://github.com/adactio/TheSession-data/tree/main/json), maintained by Jeremy Keith ([@adactio](https://github.com/adactio)).

The data includes:
- Traditional Irish music tunes in ABC notation
- Session information from around the world
- Recording discography
- User-contributed content

## Contributing

To add new features to the playground:

1. Extend the `TunebookPlayground` class in `src/main.ts`
2. Add new interactive commands to the `processCommand` method
3. Use types from `@monorepo/tunebook` for type safety
4. Update this README with new functionality

## License

This playground tool is part of the monorepo project. The data from TheSession.org has its own licensing terms - please refer to their repository for details.
