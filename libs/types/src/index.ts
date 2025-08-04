/**
 * Types partagés entre le frontend et le backend
 * Ces types garantissent la cohérence des données échangées
 */

// ============================================================================
// API Responses
// ============================================================================

/**
 * Réponse standard de l'endpoint /ping
 */
export interface PingResponse {
  message: string;
  timestamp: string;
  environment: string;
}

/**
 * Informations sur l'API
 */
export interface ApiInfo {
  name: string;
  version: string;
  description: string;
  endpoints: ApiEndpoint[];
}

/**
 * Description d'un endpoint API
 */
export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
}

// ============================================================================
// Database Models (pour future utilisation avec Drizzle/Prisma)
// ============================================================================

/**
 * Modèle utilisateur (exemple)
 */
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Données pour créer un utilisateur
 */
export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

/**
 * Données pour mettre à jour un utilisateur
 */
export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

/**
 * Requête de connexion
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Réponse lors de la connexion
 */
export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: Pick<User, 'id' | 'name' | 'email' | 'createdAt'>;
  message?: string;
}

// ============================================================================
// Utilitaires
// ============================================================================

/**
 * Réponse API générique avec métadonnées
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

/**
 * Erreur API standardisée
 */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

/**
 * Paramètres de pagination
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Réponse paginée
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Authentication
// ============================================================================

// ============================================================================
// Configuration et Environment
// ============================================================================

/**
 * Variables d'environnement typées
 */
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  HOST: string;
  DATABASE_URL: string;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}
