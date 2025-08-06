#!/usr/bin/env tsx

/**
 * Script pour créer un utilisateur administrateur
 * Usage: pnpm create:admin
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { db } from '../src/db/connection';
import { users } from '../src/db/schema';
import { hashPassword } from '../src/utils/auth';
import { eq } from 'drizzle-orm';

// Charger les variables d'environnement
dotenv.config({ path: resolve(__dirname, '../../../.env') });

async function createAdmin() {
  try {
    console.log("🚀 Création de l'utilisateur administrateur...");

    // Récupérer les variables d'environnement
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminName = process.env.ADMIN_NAME || 'Admin';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("❌ Variables d'environnement manquantes:");
      console.error('   ADMIN_EMAIL et ADMIN_PASSWORD sont requis');
      console.error('   ADMIN_NAME est optionnel (défaut: Admin)');
      console.error('');
      console.error('Exemple dans .env:');
      console.error('ADMIN_EMAIL=admin@example.com');
      console.error('ADMIN_NAME=Alexandre');
      console.error('ADMIN_PASSWORD=monmotdepasse123');
      process.exit(1);
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingUser.length > 0) {
      console.log(`⚠️  Un utilisateur avec l'email ${adminEmail} existe déjà`);
      console.log('   ID:', existingUser[0].id);
      console.log('   Nom:', existingUser[0].name);
      console.log(
        '   Créé le:',
        existingUser[0].createdAt.toLocaleDateString()
      );
      process.exit(0);
    }

    // Hasher le mot de passe
    const passwordHash = hashPassword(adminPassword);

    // Créer l'utilisateur
    const newUser = await db
      .insert(users)
      .values({
        email: adminEmail,
        name: adminName,
        passwordHash,
      })
      .returning();

    console.log('✅ Utilisateur administrateur créé avec succès!');
    console.log('   ID:', newUser[0].id);
    console.log('   Email:', newUser[0].email);
    console.log('   Nom:', newUser[0].name);
    console.log('   Créé le:', newUser[0].createdAt.toLocaleDateString());
    console.log('');
    console.log('🔐 Vous pouvez maintenant vous connecter avec:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Mot de passe: ${adminPassword}`);
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'utilisateur:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Exécuter le script
createAdmin();
