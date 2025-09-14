#!/usr/bin/env node

/**
 * One-time fix for messageId column
 * Run this script once to add the messageId column to CommunicationLog table
 */

const { PrismaClient } = require('@prisma/client');

async function fixMessageIdColumn() {
  console.log('🚀 Starting one-time messageId column fix...');
  
  const prisma = new PrismaClient();
  
  try {
    // Step 1: Check if column exists
    console.log('🔍 Step 1: Checking if messageId column exists...');
    
    let columnExists = false;
    try {
      await prisma.$queryRaw`SELECT "messageId" FROM "CommunicationLog" LIMIT 1;`;
      columnExists = true;
      console.log('✅ messageId column already exists!');
    } catch (error) {
      console.log('❌ messageId column does not exist - will add it');
    }
    
    if (columnExists) {
      console.log('🎉 No action needed - column already exists!');
      return true;
    }
    
    // Step 2: Add the column
    console.log('📊 Step 2: Adding messageId column...');
    await prisma.$executeRaw`
      ALTER TABLE "CommunicationLog" 
      ADD COLUMN "messageId" TEXT;
    `;
    console.log('✅ Added messageId column');
    
    // Step 3: Create unique index
    console.log('🔑 Step 3: Creating unique index...');
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX "CommunicationLog_messageId_key" 
      ON "CommunicationLog"("messageId");
    `;
    console.log('✅ Created unique index');
    
    // Step 4: Verify
    console.log('🧪 Step 4: Verifying the fix...');
    await prisma.$queryRaw`SELECT "messageId" FROM "CommunicationLog" LIMIT 1;`;
    console.log('✅ Verification successful!');
    
    console.log('🎉 messageId column successfully added!');
    console.log('📝 You can now send messages without the 500 error.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error adding messageId column:', error.message);
    console.error('Full error:', error);
    
    // Try alternative approach
    console.log('🔄 Trying alternative approach...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE "CommunicationLog" 
        ADD COLUMN IF NOT EXISTS "messageId" TEXT;
      `;
      console.log('✅ Alternative approach succeeded!');
      return true;
    } catch (altError) {
      console.error('❌ Alternative approach also failed:', altError.message);
      return false;
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixMessageIdColumn().then(success => {
  if (success) {
    console.log('✅ One-time fix completed successfully!');
    console.log('🚀 Your message sending should now work!');
    process.exit(0);
  } else {
    console.log('❌ One-time fix failed');
    console.log('💡 Try the manual database access method instead');
    process.exit(1);
  }
});
