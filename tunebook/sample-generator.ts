#!/usr/bin/env ts-node

// Import du générateur principal et CLI
import { main } from './sample-generator-cli';

// Point d'entrée pour npm run generate:samples
main().catch(console.error);
