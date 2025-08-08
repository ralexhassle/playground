# Tunebook Data Directory

This directory contains the real JSON data files from [TheSession.org](https://github.com/adactio/TheSession-data/tree/main/json).

## Setup

Download the data files from: https://github.com/adactio/TheSession-data/tree/main/json

The following files are expected:

- `recordings.json` - Recording information
- `sessions.json` - Session data with geographic information
- `sets.json` - Tune sets data
- `tunes.json` - Individual tunes with ABC notation
- `users.json` - User/member data

These files are **not versioned** due to their large size (several MB each).

## Usage

The playground application will automatically detect and use these files when available.
If the files are missing, the application will use sample data from the lib instead.

## Download Script

To download the files automatically, you can run:

```bash
# From the apps/tunebook-playground directory
npm run download-data
```

Or manually:

```bash
curl -o data/recordings.json https://raw.githubusercontent.com/adactio/TheSession-data/main/json/recordings.json
curl -o data/sessions.json https://raw.githubusercontent.com/adactio/TheSession-data/main/json/sessions.json
curl -o data/sets.json https://raw.githubusercontent.com/adactio/TheSession-data/main/json/sets.json
curl -o data/tunes.json https://raw.githubusercontent.com/adactio/TheSession-data/main/json/tunes.json
curl -o data/users.json https://raw.githubusercontent.com/adactio/TheSession-data/main/json/users.json
```
