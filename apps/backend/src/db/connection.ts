/**
 * Configuration de la connexion à la base de données PostgreSQL avec Drizzle ORM
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as schema from './schema';

// Charger les variables d'environnement si pas déjà fait
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: '../../.env' });
}

// Configuration de la connexion PostgreSQL
const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/fullstack_db';

// Créer la connexion postgres
const client = postgres(connectionString, {
  max: 10, // Nombre maximum de connexions simultanées
  idle_timeout: 20, // Timeout d'inactivité en secondes
  connect_timeout: 10, // Timeout de connexion en secondes
});

// Créer l'instance Drizzle
export const db = drizzle(client, { schema });

/**
 * Fonction utilitaire pour tester la connexion à la base de données
 */
export async function testConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    return false;
  }
}

/**
 * Fonction pour fermer proprement la connexion à la base de données
 */
export async function closeConnection(): Promise<void> {
  await client.end();
}
