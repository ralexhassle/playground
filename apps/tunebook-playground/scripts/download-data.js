#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../data');
const BASE_URL =
  'https://raw.githubusercontent.com/adactio/TheSession-data/main/json';

const FILES = [
  'recordings.json',
  'sessions.json',
  'sets.json',
  'tunes.json',
  'users.json',
];

/**
 * Download a file from URL to destination
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    https
      .get(url, response => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`)
          );
          return;
        }

        const totalSize = parseInt(response.headers['content-length'] || '0');
        let downloadedSize = 0;

        response.on('data', chunk => {
          downloadedSize += chunk.length;
          const progress =
            totalSize > 0
              ? ((downloadedSize / totalSize) * 100).toFixed(1)
              : '?';
          process.stdout.write(
            `\r   Progress: ${progress}% (${(
              downloadedSize /
              1024 /
              1024
            ).toFixed(1)} MB)`
          );
        });

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          console.log(' ✅');
          resolve();
        });

        file.on('error', err => {
          fs.unlink(dest, () => {}); // Delete the file on error
          reject(err);
        });
      })
      .on('error', reject);
  });
}

/**
 * Main download function
 */
async function downloadData() {
  console.log('📥 Downloading TheSession.org data files...\n');

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  for (const filename of FILES) {
    const url = `${BASE_URL}/${filename}`;
    const dest = path.join(DATA_DIR, filename);

    console.log(`⬇️  Downloading ${filename}...`);

    try {
      await downloadFile(url, dest);
      const stats = fs.statSync(dest);
      console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(1)} MB\n`);
    } catch (error) {
      console.error(`❌ Error downloading ${filename}:`, error.message);
      process.exit(1);
    }
  }

  console.log('🎉 All files downloaded successfully!');
  console.log('\n📊 You can now run the playground with:');
  console.log('   npm start');
  console.log('   # or');
  console.log('   pnpm nx dev tunebook-playground');
}

// Check if this script is being run directly
if (require.main === module) {
  downloadData().catch(console.error);
}

module.exports = { downloadData };
