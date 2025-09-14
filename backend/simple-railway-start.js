console.log('🚀 Starting XenoCRM Backend on Railway...');
console.log('📁 Current working directory:', process.cwd());

// Simple start script that just starts the app
// Prisma client should already be generated during build
try {
  console.log('🎯 Starting application...');
  require('./dist/index.js');
} catch (error) {
  console.error('❌ Error starting application:', error);
  process.exit(1);
}
