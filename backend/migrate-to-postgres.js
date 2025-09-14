const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

console.log('🔄 Migrating from SQLite to PostgreSQL...');

async function migrateData() {
  // SQLite client (source)
  const sqliteClient = new PrismaClient({
    datasources: {
      db: {
        url: "file:./prisma/dev.db"
      }
    }
  });

  // PostgreSQL client (destination)
  const postgresClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    console.log('📊 Fetching data from SQLite...');
    
    // Fetch all data from SQLite
    const users = await sqliteClient.user.findMany();
    const customers = await sqliteClient.customer.findMany();
    const orders = await sqliteClient.order.findMany();
    const segments = await sqliteClient.segment.findMany();
    const campaigns = await sqliteClient.campaign.findMany();
    const communicationLogs = await sqliteClient.communicationLog.findMany();

    console.log(`📦 Found ${users.length} users, ${customers.length} customers, ${orders.length} orders, ${segments.length} segments, ${campaigns.length} campaigns, ${communicationLogs.length} communication logs`);

    // Migrate data to PostgreSQL
    console.log('🚀 Migrating to PostgreSQL...');
    
    // Migrate users
    for (const user of users) {
      await postgresClient.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    console.log('✅ Users migrated');

    // Migrate customers
    for (const customer of customers) {
      await postgresClient.customer.upsert({
        where: { id: customer.id },
        update: customer,
        create: customer
      });
    }
    console.log('✅ Customers migrated');

    // Migrate segments
    for (const segment of segments) {
      await postgresClient.segment.upsert({
        where: { id: segment.id },
        update: segment,
        create: segment
      });
    }
    console.log('✅ Segments migrated');

    // Migrate campaigns
    for (const campaign of campaigns) {
      await postgresClient.campaign.upsert({
        where: { id: campaign.id },
        update: campaign,
        create: campaign
      });
    }
    console.log('✅ Campaigns migrated');

    // Migrate orders
    for (const order of orders) {
      await postgresClient.order.upsert({
        where: { id: order.id },
        update: order,
        create: order
      });
    }
    console.log('✅ Orders migrated');

    // Migrate communication logs
    for (const log of communicationLogs) {
      await postgresClient.communicationLog.upsert({
        where: { id: log.id },
        update: log,
        create: log
      });
    }
    console.log('✅ Communication logs migrated');

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateData };
