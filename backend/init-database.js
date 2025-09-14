#!/usr/bin/env node

/**
 * Database Initialization Script for Render
 * This script ensures the database is properly set up with all required tables
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting database initialization...');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required!');
  process.exit(1);
}

console.log('✅ DATABASE_URL is set');

// Copy the Railway schema to the main schema location
const railwaySchemaPath = path.join(__dirname, 'prisma', 'schema.railway.prisma');
const mainSchemaPath = path.join(__dirname, 'prisma', 'schema.prisma');

if (fs.existsSync(railwaySchemaPath)) {
  console.log('📋 Copying Railway schema to main schema...');
  fs.copyFileSync(railwaySchemaPath, mainSchemaPath);
  console.log('✅ Schema copied successfully');
} else {
  console.error('❌ Railway schema not found at:', railwaySchemaPath);
  process.exit(1);
}

try {
  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: __dirname,
    timeout: 30000
  });
  console.log('✅ Prisma client generated successfully');

  // Push database schema
  console.log('📊 Pushing database schema...');
  execSync('npx prisma db push', { 
    stdio: 'inherit',
    cwd: __dirname,
    timeout: 60000
  });
  console.log('✅ Database schema pushed successfully');

  // Try to run migrations as well
  console.log('🔄 Running database migrations...');
  try {
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      cwd: __dirname,
      timeout: 60000
    });
    console.log('✅ Database migrations completed successfully');
  } catch (migrationError) {
    console.log('⚠️  Migration failed, but db push succeeded. This is often normal for new deployments.');
    console.log('Migration error:', migrationError.message);
  }

  console.log('🎉 Database initialization completed successfully!');
  
} catch (error) {
  console.error('❌ Database initialization failed:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}
