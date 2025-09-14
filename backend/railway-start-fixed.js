const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting XenoCRM Backend on Railway...');
console.log('📁 Current working directory:', process.cwd());
console.log('📁 Contents of current directory:');
console.log(fs.readdirSync(process.cwd()));

// Check if we're in the right directory structure
const expectedSchemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
console.log('🔍 Looking for schema at:', expectedSchemaPath);

if (fs.existsSync(expectedSchemaPath)) {
  console.log('✅ Found prisma/schema.prisma');
} else {
  console.log('❌ prisma/schema.prisma not found');
  
  // Check if we're in the wrong directory
  const parentDir = path.join(process.cwd(), '..');
  const parentSchemaPath = path.join(parentDir, 'prisma', 'schema.prisma');
  console.log('🔍 Checking parent directory:', parentDir);
  console.log('🔍 Looking for schema at:', parentSchemaPath);
  
  if (fs.existsSync(parentSchemaPath)) {
    console.log('✅ Found schema in parent directory');
    console.log('📁 Parent directory contents:');
    console.log(fs.readdirSync(parentDir));
  } else {
    console.log('❌ Schema not found in parent directory either');
    
    // Search recursively for schema files
    console.log('🔍 Searching for schema files recursively...');
    const findSchema = (dir, depth = 0) => {
      if (depth > 3) return; // Limit search depth
      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory() && !file.startsWith('.')) {
            findSchema(fullPath, depth + 1);
          } else if (file === 'schema.prisma') {
            console.log('📄 Found schema at:', fullPath);
          }
        }
      } catch (error) {
        // Ignore permission errors
      }
    };
    findSchema(process.cwd());
  }
}

async function startApplication() {
  try {
    // Generate Prisma client
    console.log('📦 Generating Prisma client...');
    try {
      execSync('npx prisma generate --schema=./prisma/schema.prisma', { 
        stdio: 'inherit',
        timeout: 30000 // 30 second timeout
      });
      console.log('✅ Prisma client generated successfully');
    } catch (error) {
      console.error('❌ Failed to generate Prisma client:', error.message);
      // Try without schema path
      try {
        execSync('npx prisma generate', { 
          stdio: 'inherit',
          timeout: 30000
        });
        console.log('✅ Prisma client generated successfully (without schema path)');
      } catch (error2) {
        console.error('❌ Failed to generate Prisma client (fallback):', error2.message);
        throw error2;
      }
    }

    // Push database schema
    console.log('🗄️  Pushing database schema...');
    try {
      execSync('npx prisma db push --schema=./prisma/schema.prisma', { 
        stdio: 'inherit',
        timeout: 60000 // 60 second timeout
      });
      console.log('✅ Database schema pushed successfully');
    } catch (error) {
      console.error('❌ Failed to push database schema:', error.message);
      // Try without schema path
      try {
        execSync('npx prisma db push', { 
          stdio: 'inherit',
          timeout: 60000
        });
        console.log('✅ Database schema pushed successfully (without schema path)');
      } catch (error2) {
        console.error('❌ Failed to push database schema (fallback):', error2.message);
        // Don't throw here, continue with the app
        console.log('⚠️  Continuing without database schema push...');
      }
    }

    // Start the application
    console.log('🎯 Starting application...');
    require('./dist/index.js');
  } catch (error) {
    console.error('❌ Error starting application:', error);
    process.exit(1);
  }
}

startApplication();
