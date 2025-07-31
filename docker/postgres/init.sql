-- Script d'initialisation de la base de données PostgreSQL
-- Ce script est exécuté au premier démarrage du conteneur

\echo 'Initialisation de la base de données fullstack_db...'

-- Création d'un schéma pour l'application
CREATE SCHEMA IF NOT EXISTS app;

-- Exemple de table users (pour démonstration)
CREATE TABLE IF NOT EXISTS app.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index sur l'email pour les recherches
CREATE INDEX IF NOT EXISTS idx_users_email ON app.users(email);

-- Exemple de données de test
INSERT INTO app.users (email, name) VALUES 
    ('admin@example.com', 'Administrator'),
    ('user@example.com', 'Test User')
ON CONFLICT (email) DO NOTHING;

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION app.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour la table users
DROP TRIGGER IF EXISTS update_users_updated_at ON app.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON app.users
    FOR EACH ROW
    EXECUTE FUNCTION app.update_updated_at_column();

\echo 'Initialisation terminée avec succès!'
