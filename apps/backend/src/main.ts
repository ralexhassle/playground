import Fastify from 'fastify';
import cors from '@fastify/cors';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from root .env file
dotenv.config({ path: resolve(__dirname, '../../../.env') });

import { PingResponse, ApiInfo, ApiEndpoint } from '@/types';
import { testConnection } from './db/connection';
import { userRoutes } from './routes/users';
import { authRoutes } from './routes/auth';
import { setupErrorHandler } from './utils/error-handler';
import { CORS_CONFIG, ENVIRONMENTS } from './constants';

/**
 * Fastify server configuration
 * Uses environment variables for configuration
 */
const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

/**
 * CORS configuration to allow requests from frontend
 */
server.register(cors, {
  origin: process.env.NODE_ENV === ENVIRONMENTS.PRODUCTION 
    ? [...CORS_CONFIG.PRODUCTION_ORIGINS] 
    : [...CORS_CONFIG.DEVELOPMENT_ORIGINS],
  credentials: true,
});

/**
 * Global error handler setup
 */
setupErrorHandler(server);

/**
 * Register user routes
 */
server.register(authRoutes);
server.register(userRoutes);

/**
 * Health check endpoint - /ping
 * Used to verify server is running and database connectivity
 */
server.get<{ Reply: PingResponse }>('/ping', async (request, reply) => {
  // Test database connection
  const dbConnected = await testConnection();

  const response: PingResponse = {
    message: `pong${dbConnected ? ' - DB Connected' : ' - DB Disconnected'}`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  };

  return reply.code(200).send(response);
});

/**
 * API information endpoint
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
    { path: '/api/auth/login', method: 'POST', description: 'User authentication' },
    { path: '/api/auth/register', method: 'POST', description: 'User registration' },
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
