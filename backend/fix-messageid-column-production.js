#!/usr/bin/env node

/**
 * Fix missing messageId column in production database
 * This script adds the messageId column to the communication_logs table
 */

const { PrismaClient } = require('@prisma/client');

async function fixMessageIdColumn() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Starting messageId column fix...');
    
    // Check if messageId column exists
    console.log('🔍 Checking if messageId column exists...');
    
    try {
      // Try to query with messageId to see if column exists
      await prisma.$queryRaw`SELECT messageId FROM communication_logs LIMIT 1`;
      console.log('✅ messageId column already exists!');
      return;
    } catch (error) {
      if (error.message.includes('messageId') || error.message.includes('does not exist')) {
        console.log('⚠️  messageId column not found, adding it...');
      } else {
        throw error;
      }
    }
    
    // Add messageId column
    console.log('🔧 Adding messageId column...');
    await prisma.$executeRaw`
      ALTER TABLE communication_logs 
      ADD COLUMN messageId TEXT UNIQUE DEFAULT gen_random_uuid()
    `;
    
    console.log('✅ messageId column added successfully!');
    
    // Update existing records to have unique messageIds
    console.log('🔧 Updating existing records with unique messageIds...');
    await prisma.$executeRaw`
      UPDATE communication_logs 
      SET messageId = gen_random_uuid() 
      WHERE messageId IS NULL
    `;
    
    console.log('✅ Existing records updated with unique messageIds!');
    
    // Verify the fix
    console.log('🔍 Verifying fix...');
    const testLogs = await prisma.communicationLog.findMany({
      take: 3,
      select: { id: true, messageId: true, status: true }
    });
    
    console.log('📊 Sample records after fix:', testLogs);
    console.log('✅ Fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing messageId column:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
if (require.main === module) {
  fixMessageIdColumn()
    .then(() => {
      console.log('🎉 MessageId column fix completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 MessageId column fix failed:', error);
      process.exit(1);
    });
}

module.exports = { fixMessageIdColumn };