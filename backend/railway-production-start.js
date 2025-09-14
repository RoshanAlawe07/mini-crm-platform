#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting XenoCRM Backend on Railway (Production)...');
console.log('📁 Current working directory:', process.cwd());

// Validate required environment variables
function validateEnvironment() {
  console.log('🔍 Validating environment variables...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required but not set!');
    console.error('   Please set DATABASE_URL in your Railway environment variables.');
    console.error('   Format: postgresql://username:password@host:port/database_name');
    process.exit(1);
  }

  // Validate DATABASE_URL format
  if (!process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
    console.error('❌ DATABASE_URL must be a PostgreSQL connection string!');
    console.error('   Current value:', process.env.DATABASE_URL);
    console.error('   Expected format: postgresql://username:password@host:port/database_name');
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
}

// Run Prisma migrations
async function runMigrations() {
  try {
    console.log('🔄 Running Prisma migrations...');
    
    // Use migrate deploy for production (doesn't create new migrations, just applies existing ones)
    execSync('npx prisma migrate deploy --schema=./prisma/schema.railway.prisma', {
      stdio: 'inherit',
      timeout: 30000, // 30 second timeout
      cwd: process.cwd()
    });
    
    console.log('✅ Prisma migrations completed successfully');
  } catch (error) {
    console.error('❌ Prisma migration failed:', error.message);
    
    // If migrations fail, try db push as fallback
    console.log('🔄 Attempting fallback with db push...');
    try {
      execSync('npx prisma db push --schema=./prisma/schema.railway.prisma', {
        stdio: 'inherit',
        timeout: 30000,
        cwd: process.cwd()
      });
      console.log('✅ Database schema pushed successfully');
    } catch (pushError) {
      console.error('❌ Database push also failed:', pushError.message);
      console.error('   Please check your DATABASE_URL and database connectivity.');
      process.exit(1);
    }
  }
}

// Start the application
async function startApplication() {
  try {
    console.log('🎯 Starting application...');
    require('./dist/index.js');
  } catch (error) {
    console.error('❌ Error starting application:', error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  try {
    validateEnvironment();
    await runMigrations();
    await startApplication();
  } catch (error) {
    console.error('❌ Fatal error during startup:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the application
main();
