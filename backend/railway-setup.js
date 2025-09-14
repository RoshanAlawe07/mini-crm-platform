const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Railway deployment...');
console.log('📁 Current working directory:', process.cwd());

// Check environment variables
console.log('🔍 Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

// Check if we have a database URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!');
  process.exit(1);
}

// Check if the database URL is valid
if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
  console.error('❌ DATABASE_URL must be a PostgreSQL connection string!');
  console.log('Current DATABASE_URL:', process.env.DATABASE_URL);
  process.exit(1);
}

console.log('✅ Environment setup complete');

// Copy Railway schema if it exists
const railwaySchemaPath = path.join(process.cwd(), 'prisma', 'schema.railway.prisma');
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');

if (fs.existsSync(railwaySchemaPath)) {
  console.log('📋 Copying Railway schema...');
  fs.copyFileSync(railwaySchemaPath, schemaPath);
  console.log('✅ Railway schema copied');
} else {
  console.log('⚠️  Railway schema not found, using default schema');
}

// Generate Prisma client
console.log('📦 Generating Prisma client...');
try {
  execSync('npx prisma generate --schema=./prisma/schema.prisma', { 
    stdio: 'inherit',
    timeout: 60000
  });
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}

// Push database schema
console.log('🗄️  Pushing database schema...');
try {
  execSync('npx prisma db push --schema=./prisma/schema.prisma', { 
    stdio: 'inherit',
    timeout: 120000
  });
  console.log('✅ Database schema pushed successfully');
} catch (error) {
  console.error('❌ Failed to push database schema:', error.message);
  console.log('⚠️  Continuing without database schema push...');
}

console.log('🎉 Railway setup completed successfully!');
