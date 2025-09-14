const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting XenoCRM Backend on Railway...');

try {
  // Check if we're in the right directory
  console.log('📁 Current working directory:', process.cwd());
  console.log('📁 Checking for prisma schema...');
  
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  
  if (fs.existsSync(schemaPath)) {
    console.log('✅ Found prisma/schema.prisma');
  } else {
    console.log('❌ prisma/schema.prisma not found');
    console.log('📁 Contents of current directory:');
    console.log(fs.readdirSync(process.cwd()));
    
    // Try to find the schema file
    console.log('🔍 Searching for schema files...');
    const findSchema = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          findSchema(fullPath);
        } else if (file === 'schema.prisma') {
          console.log('📄 Found schema at:', fullPath);
        }
      }
    };
    findSchema(process.cwd());
  }

  // Generate Prisma client with explicit schema path
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
