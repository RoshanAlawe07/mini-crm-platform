#!/usr/bin/env node

/**
 * Add messageId column to CommunicationLog table
 * This script specifically adds the messageId column that's causing the 500 error
 */

const { PrismaClient } = require('@prisma/client');

async function addMessageIdColumn() {
  console.log('🔧 Adding messageId column to CommunicationLog table...');
  
  const prisma = new PrismaClient();
  
  try {
    // Check if messageId column already exists
    console.log('🔍 Checking if messageId column exists...');
    
    try {
      await prisma.$queryRaw`
        SELECT "messageId" FROM "CommunicationLog" LIMIT 1;
      `;
      console.log('✅ messageId column already exists!');
      return true;
    } catch (error) {
      console.log('❌ messageId column does not exist - will add it');
    }
    
    // Add messageId column
    console.log('📊 Adding messageId column...');
    await prisma.$executeRaw`
      ALTER TABLE "CommunicationLog"
      ADD COLUMN "messageId" TEXT;
    `;
    console.log('✅ Added messageId column');
    
    // Create unique index for messageId
    console.log('🔑 Creating unique index for messageId...');
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX "CommunicationLog_messageId_key" ON "CommunicationLog"("messageId");
    `;
    console.log('✅ Created unique index for messageId');
    
    // Verify the column was added
    console.log('🧪 Verifying messageId column...');
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
    
  } catch (error) {
    console.error('❌ Error adding messageId column:', error.message);
    console.error('Full error:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addMessageIdColumn().then(success => {
  if (success) {
    console.log('✅ Script completed successfully');
    process.exit(0);
  } else {
    console.log('❌ Script failed');
    process.exit(1);
  }
});
