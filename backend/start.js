const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting XenoCRM Backend...');

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate --schema=./prisma/schema.prisma', { stdio: 'inherit' });

  // Push database schema (for Railway deployment)
  console.log('🗄️  Pushing database schema...');
  execSync('npx prisma db push --schema=./prisma/schema.prisma', { stdio: 'inherit' });

  // Start the application
  console.log('🎯 Starting application...');
  require('./dist/index.js');
} catch (error) {
  console.error('❌ Error starting application:', error);
  process.exit(1);
}
