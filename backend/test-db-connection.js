#!/usr/bin/env node

/**
 * Test Database Connection Script
 * This script tests if the database connection is working and tables exist
 */

const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  const prisma = new PrismaClient();
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test if tables exist by trying to query them
    console.log('🔍 Testing table existence...');
    
    try {
      const customers = await prisma.customer.findMany({ take: 1 });
      console.log('✅ Customers table exists');
    } catch (error) {
      console.log('❌ Customers table error:', error.message);
    }
    
    try {
      const orders = await prisma.order.findMany({ take: 1 });
      console.log('✅ Orders table exists');
    } catch (error) {
      console.log('❌ Orders table error:', error.message);
    }
    
    try {
      const campaigns = await prisma.campaign.findMany({ take: 1 });
      console.log('✅ Campaigns table exists');
    } catch (error) {
      console.log('❌ Campaigns table error:', error.message);
    }
    
    try {
      const segments = await prisma.segment.findMany({ take: 1 });
      console.log('✅ Segments table exists');
    } catch (error) {
      console.log('❌ Segments table error:', error.message);
    }
    
    try {
      const users = await prisma.user.findMany({ take: 1 });
      console.log('✅ Users table exists');
    } catch (error) {
      console.log('❌ Users table error:', error.message);
    }
    
    console.log('🎉 Database test completed!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
