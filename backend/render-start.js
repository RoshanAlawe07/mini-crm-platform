console.log('🚀 Starting XenoCRM Backend on Render...');
console.log('📁 Current working directory:', process.cwd());

// Check environment variables
console.log('🔍 Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!');
  console.error('   Please set DATABASE_URL in your Render environment variables.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set!');
  console.error('   Please set JWT_SECRET in your Render environment variables.');
  process.exit(1);
}

// Start the application
try {
  console.log('🎯 Starting application...');
  // Register ts-node to handle TypeScript files
  require('ts-node/register');
  require('./src/index.ts');
} catch (error) {
  console.error('❌ Error starting application:', error);
  process.exit(1);
}
