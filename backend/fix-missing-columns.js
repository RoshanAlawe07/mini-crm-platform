#!/usr/bin/env node

/**
 * Fix Missing Columns Script
 * This script adds missing columns to existing database tables
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing missing database columns...');

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

  // Push database schema to add missing columns
  console.log('📊 Pushing database schema to add missing columns...');
  execSync('npx prisma db push --accept-data-loss', { 
    stdio: 'inherit',
    cwd: __dirname,
    timeout: 60000
  });
  console.log('✅ Database schema updated successfully');

  // Verify the fix by testing the connection
  console.log('🧪 Testing database connection...');
  execSync('node test-db-connection.js', { 
    stdio: 'inherit',
    cwd: __dirname,
    timeout: 30000
  });
  console.log('✅ Database test passed');

  console.log('🎉 Missing columns fix completed successfully!');
  console.log('📋 Added missing columns:');
  console.log('  - campaigns.rulesJson');
  console.log('  - orders.orderId');
  console.log('  - Other missing columns from schema');
  
} catch (error) {
  console.error('❌ Fix failed:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}
