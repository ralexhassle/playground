import Fastify from 'fastify';
import cors from '@fastify/cors';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement depuis le fichier .env à la racine
dotenv.config({ path: '../../.env' });

import { PingResponse, ApiInfo, ApiEndpoint } from '@/types';
import { testConnection } from './db/connection';
import { userRoutes } from './routes/users';

/**
 * Configuration du serveur Fastify
 * Utilise des variables d'environnement pour la configuration
 */
const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

/**
 * Configuration CORS pour autoriser les requêtes depuis le frontend
 */
server.register(cors, {
  origin: [
    'http://localhost:4200', // Frontend en développement
    'http://localhost:3000', // Autres configurations possibles
  ],
  credentials: true,
});

/**
 * Enregistrement des routes utilisateurs
 */
server.register(userRoutes);

/**
 * Route de santé - endpoint /ping
 * Utilisé pour vérifier que le serveur fonctionne
 */
server.get<{ Reply: PingResponse }>('/ping', async (request, reply) => {
  // Test de la connexion à la base de données
  const dbConnected = await testConnection();

  const response: PingResponse = {
    message: `pong${dbConnected ? ' - DB Connected' : ' - DB Disconnected'}`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  };

  return reply.code(200).send(response);
});

/**
 * Route d'informations sur l'API
 */
server.get<{ Reply: ApiInfo }>('/api/info', async (request, reply) => {
  const endpoints: ApiEndpoint[] = [
    {
      path: '/ping',
      method: 'GET',
      description: 'Health check with database status',
    },
    { path: '/api/info', method: 'GET', description: 'API information' },
    { path: '/api/users', method: 'GET', description: 'List all users' },
    { path: '/api/users/:id', method: 'GET', description: 'Get user by ID' },
    { path: '/api/users', method: 'POST', description: 'Create new user' },
    { path: '/api/users/:id', method: 'PUT', description: 'Update user' },
    { path: '/api/users/:id', method: 'DELETE', description: 'Delete user' },
  ];

  const response: ApiInfo = {
    name: 'Backend API',
    version: '1.0.0',
    description: 'API backend pour le monorepo Nx avec Drizzle ORM',
    endpoints,
  };

  return reply.code(200).send(response);
});

/**
 * Configuration et démarrage du serveur
 */
const start = async () => {
  try {
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || '0.0.0.0';

    await server.listen({ port: Number(PORT), host: HOST });

    console.log(`🚀 Backend server running on http://${HOST}:${PORT}`);
    console.log(`📊 Health check: http://${HOST}:${PORT}/ping`);
    console.log(`📋 API info: http://${HOST}:${PORT}/api/info`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Gestion propre de l'arrêt du serveur
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  try {
    await server.close();
    console.log('Server closed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Démarrage du serveur
start();
