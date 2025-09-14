console.log('🚀 Starting XenoCRM Backend on Railway...');
console.log('📁 Current working directory:', process.cwd());

// Run setup first
try {
  console.log('🔧 Running Railway setup...');
  require('./railway-setup.js');
} catch (error) {
  console.error('❌ Railway setup failed:', error);
  process.exit(1);
}

// Start the application
try {
  console.log('🎯 Starting application...');
  require('./dist/index.js');
} catch (error) {
  console.error('❌ Error starting application:', error);
  process.exit(1);
}
