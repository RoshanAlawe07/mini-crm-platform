#!/usr/bin/env node

/**
 * Auto-Fix Startup Script for Render Free Tier
 * This script automatically fixes missing database columns during startup
 */

const { PrismaClient } = require('@prisma/client');

async function autoFixDatabase() {
  console.log('🔧 Auto-fixing database columns...');
  
  const prisma = new PrismaClient();
  
  try {
    // Test if the missing columns exist
    console.log('🔍 Checking for missing columns...');
    
    // Check campaigns.rulesJson
    let campaignsHasRulesJson = false;
    try {
      await prisma.$queryRaw`
        SELECT "rulesJson" FROM "campaigns" LIMIT 1;
      `;
      campaignsHasRulesJson = true;
      console.log('✅ campaigns.rulesJson column exists');
    } catch (error) {
      console.log('❌ campaigns.rulesJson column missing - will add it');
    }
    
    // Check orders.orderId
    let ordersHasOrderId = false;
    try {
      await prisma.$queryRaw`
        SELECT "orderId" FROM "orders" LIMIT 1;
      `;
      ordersHasOrderId = true;
      console.log('✅ orders.orderId column exists');
    } catch (error) {
      console.log('❌ orders.orderId column missing - will add it');
    }
    
    // Add missing columns
    if (!campaignsHasRulesJson) {
      console.log('📊 Adding rulesJson column to campaigns table...');
      await prisma.$executeRaw`
        ALTER TABLE "campaigns" 
        ADD COLUMN IF NOT EXISTS "rulesJson" TEXT;
      `;
      console.log('✅ Added rulesJson column to campaigns');
    }
    
    if (!ordersHasOrderId) {
      console.log('📊 Adding orderId column to orders table...');
      await prisma.$executeRaw`
        ALTER TABLE "orders"
        ADD COLUMN IF NOT EXISTS "orderId" TEXT;
      `;
      console.log('✅ Added orderId column to orders');
      
      // Create unique index for orderId
      console.log('🔑 Creating unique index for orderId...');
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS "orders_orderId_key" ON "orders"("orderId");
      `;
      console.log('✅ Created unique index for orderId');
    }

    // Check communication_logs.messageId
    let communicationLogsHasMessageId = false;
    try {
      await prisma.$queryRaw`
        SELECT "messageId" FROM "communication_logs" LIMIT 1;
      `;
      communicationLogsHasMessageId = true;
      console.log('✅ communication_logs.messageId column exists');
    } catch (error) {
      console.log('❌ communication_logs.messageId column missing - will add it');
    }

    // Add missing messageId column to communication_logs table
    if (!communicationLogsHasMessageId) {
      console.log('📊 Adding messageId column to communication_logs table...');
      await prisma.$executeRaw`
        ALTER TABLE "communication_logs"
        ADD COLUMN IF NOT EXISTS "messageId" TEXT;
      `;
      console.log('✅ Added messageId column to communication_logs');
      
      // Create unique index for messageId
      console.log('🔑 Creating unique index for messageId...');
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS "communication_logs_messageId_key" ON "communication_logs"("messageId");
      `;
      console.log('✅ Created unique index for messageId');
    }
    
    // Verify the fix
    console.log('🧪 Verifying column additions...');
    const campaignsColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'campaigns' 
        AND column_name = 'rulesJson';
    `;
    
    const ordersColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
        AND column_name = 'orderId';
    `;

    const communicationLogColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'communication_logs' 
        AND column_name = 'messageId';
    `;

    console.log('📋 Verification results:');
    console.log('  - campaigns.rulesJson:', campaignsColumns.length > 0 ? '✅ EXISTS' : '❌ MISSING');
    console.log('  - orders.orderId:', ordersColumns.length > 0 ? '✅ EXISTS' : '❌ MISSING');
    console.log('  - communication_logs.messageId:', communicationLogColumns.length > 0 ? '✅ EXISTS' : '❌ MISSING');

    if (campaignsColumns.length > 0 && ordersColumns.length > 0 && communicationLogColumns.length > 0) {
      console.log('🎉 Database auto-fix completed successfully!');
      return true;
    } else {
      console.log('⚠️  Some columns may still be missing. Check the verification results above.');
      return false;
    }

  } catch (error) {
    console.error('❌ Auto-fix failed:', error.message);
    console.error('Full error:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Export the function for use in other scripts
module.exports = { autoFixDatabase };

// If this script is run directly, execute the auto-fix
if (require.main === module) {
  autoFixDatabase().then(success => {
    if (success) {
      console.log('✅ Auto-fix completed successfully');
      process.exit(0);
    } else {
      console.log('❌ Auto-fix failed');
      process.exit(1);
    }
  });
}
