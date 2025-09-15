const { PrismaClient } = require('@prisma/client');

async function runProductionMigration() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚀 Starting production migration...');
    
    // Check if provider column exists
    const tableInfo = await prisma.$queryRaw`
      PRAGMA table_info(users);
    `;
    
    const hasProviderColumn = tableInfo.some(column => column.name === 'provider');
    
    if (!hasProviderColumn) {
      console.log('🔄 Adding provider column to users table...');
      await prisma.$executeRaw`
        ALTER TABLE users ADD COLUMN provider TEXT;
      `;
      console.log('✅ Provider column added successfully!');
    } else {
      console.log('✅ Provider column already exists!');
    }
    
    // Update existing users with provider values
    console.log('🔄 Updating existing users...');
    
    // Users with googleId should have provider = 'google'
    await prisma.$executeRaw`
      UPDATE users 
      SET provider = 'google' 
      WHERE googleId IS NOT NULL AND (provider IS NULL OR provider = '');
    `;
    
    // Users with password should have provider = 'credentials'
    await prisma.$executeRaw`
      UPDATE users 
      SET provider = 'credentials' 
      WHERE password IS NOT NULL AND googleId IS NULL AND (provider IS NULL OR provider = '');
    `;
    
    console.log('✅ Users updated with provider values!');
    
    // Verify the migration
    const totalUsers = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users;`;
    const googleUsers = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users WHERE provider = 'google';`;
    const credentialUsers = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users WHERE provider = 'credentials';`;
    
    console.log('📊 Migration Results:');
    console.log(`   Total users: ${totalUsers[0].count}`);
    console.log(`   Google users: ${googleUsers[0].count}`);
    console.log(`   Credential users: ${credentialUsers[0].count}`);
    
    console.log('🎉 Production migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
runProductionMigration()
  .then(() => {
    console.log('✅ Migration script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });
