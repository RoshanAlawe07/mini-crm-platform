const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupTestData() {
  try {
    console.log('🔧 Setting up test data...');
    
    // Create test customers
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          totalSpend: 150.50,
          visitsCount: 5,
          lastActive: new Date()
        }
      }),
      prisma.customer.create({
        data: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1234567891',
          totalSpend: 75.25,
          visitsCount: 3,
          lastActive: new Date()
        }
      }),
      prisma.customer.create({
        data: {
          name: 'Bob Johnson',
          email: 'bob@example.com',
          phone: '+1234567892',
          totalSpend: 200.00,
          visitsCount: 8,
          lastActive: new Date()
        }
      }),
      prisma.customer.create({
        data: {
          name: 'Alice Brown',
          email: 'alice@example.com',
          phone: '+1234567893',
          totalSpend: 50.75,
          visitsCount: 2,
          lastActive: new Date()
        }
      })
    ]);
    
    console.log(`✅ Created ${customers.length} test customers`);
    
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        googleId: 'test-google-id'
      }
    });
    
    console.log('✅ Created test user');
    
    // Create a test segment
    const segment = await prisma.segment.create({
      data: {
        userId: user.id,
        name: 'Test Segment',
        description: 'All customers for testing',
        rulesJson: JSON.stringify({
          op: 'AND',
          rules: [
            {
              field: 'total_spend',
              operator: '>',
              value: 0
            }
          ]
        })
      }
    });
    
    console.log('✅ Created test segment');
    
    // Create a test campaign
    const campaign = await prisma.campaign.create({
      data: {
        userId: user.id,
        segmentId: segment.id,
        name: 'Test Campaign',
        messageTemplate: 'Hello! This is a test message for our flash sale!',
        status: 'SCHEDULED'
      }
    });
    
    console.log('✅ Created test campaign');
    
    console.log('\n📊 Test Data Summary:');
    console.log(`- Customers: ${customers.length}`);
    console.log(`- User: ${user.email}`);
    console.log(`- Segment: ${segment.name}`);
    console.log(`- Campaign: ${campaign.name}`);
    console.log('\n🎯 You can now test the message sending functionality!');
    
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestData();
