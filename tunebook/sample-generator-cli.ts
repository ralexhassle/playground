#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join } from 'path';
import { TheSessionSampleGenerator } from './sample-data-generator';
import {
  SMALL_SAMPLE_CONFIG,
  DEV_SAMPLE_CONFIG,
  LARGE_SAMPLE_CONFIG,
  SampleDataSet
} from './sample-config';

// Parse command line arguments
function parseArgs(): { config: string; output: string } {
  const args = process.argv.slice(2);
  let config = 'dev';
  let output = './samples';
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--config' && args[i + 1]) {
      config = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      output = args[i + 1];
      i++;
    }
  }
  
  return { config, output };
}

// Sauvegarder les données dans la structure de fichiers attendue
async function saveSampleFiles(sampleData: SampleDataSet, outputDir: string): Promise<void> {
  // Créer le répertoire de sortie s'il n'existe pas
  await fs.mkdir(outputDir, { recursive: true });
  
  // Fichiers JSON principaux
  const files = [
    { name: 'tunes.json', data: sampleData.tunes },
    { name: 'sets.json', data: sampleData.sets },
    { name: 'recordings.json', data: sampleData.recordings },
    { name: 'sessions.json', data: sampleData.sessions },
    { name: 'aliases.json', data: sampleData.aliases },
    { name: 'tune_popularity.json', data: sampleData.popularity }
  ];
  
  // Sauvegarder chaque fichier
  for (const file of files) {
    const filePath = join(outputDir, file.name);
    await fs.writeFile(filePath, JSON.stringify(file.data, null, 2));
    console.log(`📁 Saved ${file.data.length} items to ${filePath}`);
  }
  
  // Créer le fichier GeoJSON pour les sessions
  const geoJsonData = {
    type: "FeatureCollection",
    features: sampleData.sessions.map(session => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [parseFloat(session.longitude), parseFloat(session.latitude)]
      },
      properties: {
        name: session.name,
        longitude: parseFloat(session.longitude),
        latitude: parseFloat(session.latitude),
        id: session.id,
        town: session.town,
        area: session.area,
        country: session.country
      }
    }))
  };
  
  const geoJsonPath = join(outputDir, 'sessions.geojson');
  await fs.writeFile(geoJsonPath, JSON.stringify(geoJsonData, null, 2));
  console.log(`🗺️  Saved GeoJSON with ${sampleData.sessions.length} sessions to ${geoJsonPath}`);
  
  // Créer un fichier de métadonnées
  const metadata = {
    generated_at: new Date().toISOString(),
    generator_version: "1.0.0",
    config_used: getConfigName(sampleData),
    total_entities: {
      users: sampleData.users.length,
      tunes: sampleData.tunes.length,
      sets: sampleData.sets.length,
      recordings: sampleData.recordings.length,
      sessions: sampleData.sessions.length,
      aliases: sampleData.aliases.length,
      popularity_entries: sampleData.popularity.length
    },
    notes: [
      "This data is synthetically generated for testing purposes",
      "Data structure matches TheSession.org JSON format",
      "All names and locations are fictional or randomly generated",
      "Musical content (ABC notation) is simplified for testing"
    ]
  };
  
  const metadataPath = join(outputDir, '_metadata.json');
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`📋 Saved metadata to ${metadataPath}`);
}

// Détecter la configuration utilisée
function getConfigName(sampleData: SampleDataSet): string {
  const tuneCount = sampleData.tunes.length;
  if (tuneCount <= 15) return 'small';
  if (tuneCount <= 100) return 'dev';
  return 'large';
}

// Point d'entrée principal
async function main(): Promise<void> {
  try {
    const { config, output } = parseArgs();
    
    // Sélectionner la configuration
    let sampleConfig;
    switch (config.toLowerCase()) {
      case 'small':
        sampleConfig = SMALL_SAMPLE_CONFIG;
        break;
      case 'large':
        sampleConfig = LARGE_SAMPLE_CONFIG;
        break;
      case 'dev':
      default:
        sampleConfig = DEV_SAMPLE_CONFIG;
        break;
    }
    
    console.log(`🎵 TheSession Sample Data Generator`);
    console.log(`📊 Configuration: ${config}`);
    console.log(`📁 Output directory: ${output}`);
    console.log(`🎼 Generating ${sampleConfig.tuneCount} tunes, ${sampleConfig.setCount} sets, ${sampleConfig.recordingCount} recordings...`);
    console.log('');
    
    // Générer les données
    const generator = new TheSessionSampleGenerator(sampleConfig);
    const sampleData = await generator.generateAllSamples();
    
    console.log('');
    
    // Sauvegarder les fichiers
    await saveSampleFiles(sampleData, output);
    
    console.log('');
    console.log('✅ Sample data generation completed!');
    console.log('');
    console.log('🚀 Next steps:');
    console.log(`   1. Review generated files in: ${output}/`);
    console.log(`   2. Process data: npm run process -- --input ${output}`);
    console.log(`   3. Run tests: npm run test:pipeline`);
    console.log('');
    
    // Afficher un résumé des statistiques
    const stats = sampleData.popularity.sort((a, b) => b.popularity_score - a.popularity_score);
    console.log('📈 Top 5 most popular tunes:');
    stats.slice(0, 5).forEach((tune, i) => {
      const tuneData = sampleData.tunes.find(t => t.tune_id === tune.tune_id);
      console.log(`   ${i + 1}. ${tuneData?.name} (score: ${tune.popularity_score})`);
    });
    
  } catch (error) {
    console.error('❌ Error generating sample data:', error);
    process.exit(1);
  }
}

// Exécuter seulement si appelé directement
if (require.main === module) {
  main();
}

export { main, saveSampleFiles };
