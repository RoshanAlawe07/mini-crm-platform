const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting XenoCRM Backend on Railway...');

try {
  // Check if we're in the right directory
  console.log('📁 Current working directory:', process.cwd());
  console.log('📁 Checking for prisma schema...');
  
  const fs = require('fs');
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  
  if (fs.existsSync(schemaPath)) {
    console.log('✅ Found prisma/schema.prisma');
  } else {
    console.log('❌ prisma/schema.prisma not found');
    console.log('📁 Contents of current directory:');
    console.log(fs.readdirSync(process.cwd()));
  }

  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Push database schema (for Railway deployment)
  console.log('🗄️  Pushing database schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  // Start the application
  console.log('🎯 Starting application...');
  require('./dist/index.js');
} catch (error) {
  console.error('❌ Error starting application:', error);
  process.exit(1);
}
