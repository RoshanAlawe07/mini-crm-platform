#!/usr/bin/env node

/**
 * Run SQL Fix Script
 * This script runs the SQL commands to add missing columns
 */

const { PrismaClient } = require('@prisma/client');

async function runSqlFix() {
  console.log('🔧 Running SQL fix for missing columns...');
  
  const prisma = new PrismaClient();
  
  try {
    // Add missing columns to campaigns table
    console.log('📊 Adding rulesJson column to campaigns table...');
    await prisma.$executeRaw`
      ALTER TABLE "campaigns" 
      ADD COLUMN IF NOT EXISTS "rulesJson" TEXT;
    `;
    console.log('✅ Added rulesJson column to campaigns');

    // Add missing columns to orders table
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

    // Verify the changes
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

    console.log('📋 Verification results:');
    console.log('  - campaigns.rulesJson:', campaignsColumns.length > 0 ? '✅ EXISTS' : '❌ MISSING');
    console.log('  - orders.orderId:', ordersColumns.length > 0 ? '✅ EXISTS' : '❌ MISSING');

    if (campaignsColumns.length > 0 && ordersColumns.length > 0) {
      console.log('🎉 All missing columns have been added successfully!');
    } else {
      console.log('⚠️  Some columns may still be missing. Check the verification results above.');
    }

  } catch (error) {
    console.error('❌ SQL fix failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSqlFix();
