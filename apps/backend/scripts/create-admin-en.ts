#!/usr/bin/env tsx

/**
 * Script to create an administrator user
 * Usage: pnpm create:admin
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { db } from '../src/db/connection';
import { users } from '../src/db/schema';
import { hashPassword } from '../src/utils/auth';
import { eq } from 'drizzle-orm';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../../.env') });

async function createAdmin() {
  try {
    console.log('🚀 Creating administrator user...');

    // Get environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminName = process.env.ADMIN_NAME || 'Admin';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('❌ Missing environment variables:');
      console.error('   ADMIN_EMAIL and ADMIN_PASSWORD are required');
      console.error('   ADMIN_NAME is optional (default: Admin)');
      console.error('');
      console.error('Example in .env:');
      console.error('ADMIN_EMAIL=admin@example.com');
      console.error('ADMIN_NAME=Alexandre');
      console.error('ADMIN_PASSWORD=mypassword123');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingUser.length > 0) {
      console.log(`⚠️  A user with email ${adminEmail} already exists`);
      console.log('   ID:', existingUser[0].id);
      console.log('   Name:', existingUser[0].name);
      console.log(
        '   Created:',
        existingUser[0].createdAt.toLocaleDateString()
      );
      process.exit(0);
    }

    // Hash password
    const passwordHash = hashPassword(adminPassword);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        email: adminEmail,
        name: adminName,
        passwordHash,
      })
      .returning();

    console.log('✅ Administrator user created successfully!');
    console.log('   ID:', newUser[0].id);
    console.log('   Email:', newUser[0].email);
    console.log('   Name:', newUser[0].name);
    console.log('   Created:', newUser[0].createdAt.toLocaleDateString());
    console.log('');
    console.log('🔐 You can now log in with:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Execute script
createAdmin();
