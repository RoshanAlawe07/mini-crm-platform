#!/usr/bin/env node

/**
 * Fix CommunicationLog schema for both SQLite and PostgreSQL
 * This script handles the messageId column addition for different database providers
 */

const { PrismaClient } = require('@prisma/client');

async function fixCommunicationLogSchema() {
  console.log('🔧 Fixing CommunicationLog schema...');
  
  const prisma = new PrismaClient();
  
  try {
    // Detect database provider
    const dbUrl = process.env.DATABASE_URL || '';
    const isPostgreSQL = dbUrl.includes('postgresql://') || dbUrl.includes('postgres://');
    const isSQLite = dbUrl.includes('sqlite://') || dbUrl.includes('file:');
    
    console.log(`📊 Detected database: ${isPostgreSQL ? 'PostgreSQL' : isSQLite ? 'SQLite' : 'Unknown'}`);
    
    // Check if messageId column exists
    console.log('🔍 Checking if messageId column exists...');
    
    let columnExists = false;
    try {
      if (isPostgreSQL) {
        const result = await prisma.$queryRaw`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'CommunicationLog' 
            AND column_name = 'messageId';
        `;
        columnExists = result.length > 0;
      } else {
        // SQLite
        await prisma.$queryRaw`
          SELECT "messageId" FROM "CommunicationLog" LIMIT 1;
        `;
        columnExists = true;
      }
      
      if (columnExists) {
        console.log('✅ messageId column already exists!');
        return true;
      }
    } catch (error) {
      console.log('❌ messageId column does not exist - will add it');
    }
    
    // Add messageId column
    console.log('📊 Adding messageId column...');
    
    if (isPostgreSQL) {
      // PostgreSQL syntax
      await prisma.$executeRaw`
        ALTER TABLE "CommunicationLog"
        ADD COLUMN IF NOT EXISTS "messageId" TEXT;
      `;
      console.log('✅ Added messageId column (PostgreSQL)');
      
      // Create unique index
      console.log('🔑 Creating unique index for messageId...');
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS "CommunicationLog_messageId_key" 
        ON "CommunicationLog"("messageId");
      `;
      console.log('✅ Created unique index for messageId');
      
    } else {
      // SQLite syntax
      await prisma.$executeRaw`
        ALTER TABLE "CommunicationLog"
        ADD COLUMN "messageId" TEXT;
      `;
      console.log('✅ Added messageId column (SQLite)');
      
      // Create unique index
      console.log('🔑 Creating unique index for messageId...');
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX "CommunicationLog_messageId_key" 
        ON "CommunicationLog"("messageId");
      `;
      console.log('✅ Created unique index for messageId');
    }
    
    // Verify the column was added
    console.log('🧪 Verifying messageId column...');
    
    if (isPostgreSQL) {
      const result = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'CommunicationLog' 
          AND column_name = 'messageId';
      `;
      
      if (result.length > 0) {
        console.log('🎉 messageId column successfully added and verified!');
        return true;
      } else {
        console.log('❌ messageId column verification failed');
        return false;
      }
    } else {
      // SQLite verification
      try {
        await prisma.$queryRaw`
          SELECT "messageId" FROM "CommunicationLog" LIMIT 1;
        `;
        console.log('🎉 messageId column successfully added and verified!');
        return true;
      } catch (error) {
        console.log('❌ messageId column verification failed');
        return false;
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing CommunicationLog schema:', error.message);
    console.error('Full error:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixCommunicationLogSchema().then(success => {
  if (success) {
    console.log('✅ Schema fix completed successfully');
    process.exit(0);
  } else {
    console.log('❌ Schema fix failed');
    process.exit(1);
  }
});
