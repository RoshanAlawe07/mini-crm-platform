const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixMessageIdColumn() {
  try {
    console.log('🔧 Fixing messageId column in production database...');
    
    // Check if the column exists
    try {
      await prisma.$executeRaw`SELECT messageId FROM communication_logs LIMIT 1`;
      console.log('✅ messageId column already exists');
      return;
    } catch (error) {
      console.log('❌ messageId column does not exist, adding it...');
    }
    
    // Add the messageId column
    await prisma.$executeRaw`
      ALTER TABLE communication_logs 
      ADD COLUMN messageId TEXT UNIQUE DEFAULT (lower(hex(randomblob(16))))
    `;
    
    console.log('✅ Successfully added messageId column to communication_logs table');
    
    // Update existing records with messageId if they don't have one
    const existingLogs = await prisma.communicationLog.findMany({
      where: {
        messageId: null
      }
    });
    
    if (existingLogs.length > 0) {
      console.log(`📊 Updating ${existingLogs.length} existing records with messageId...`);
      
      for (const log of existingLogs) {
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await prisma.communicationLog.update({
          where: { id: log.id },
          data: { messageId }
        });
      }
      
      console.log('✅ Updated existing records with messageId');
    }
    
    console.log('🎉 Database fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing messageId column:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

fixMessageIdColumn();
