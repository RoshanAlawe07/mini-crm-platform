const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create default user if not exists
    const existingUser = await prisma.user.findFirst({
      where: { email: 'admin@xenocrm.com' }
    });
    
    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: 'admin@xenocrm.com',
          name: 'Admin User',
          role: 'ADMIN'
        }
      });
      console.log('✅ Default user created');
    } else {
      console.log('✅ Default user already exists');
    }
    
    // Create some sample customers
    const customerCount = await prisma.customer.count();
    if (customerCount === 0) {
      await prisma.customer.createMany({
        data: [
          {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            totalSpend: 150.00,
            visitsCount: 5
          },
          {
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+1234567891',
            totalSpend: 75.50,
            visitsCount: 3
          },
          {
            name: 'Bob Johnson',
            email: 'bob@example.com',
            phone: '+1234567892',
            totalSpend: 200.00,
            visitsCount: 8
          }
        ]
      });
      console.log('✅ Sample customers created');
    } else {
      console.log('✅ Customers already exist');
    }
    
    // Create some sample segments
    const segmentCount = await prisma.segment.count();
    if (segmentCount === 0) {
      await prisma.segment.createMany({
        data: [
          {
            name: 'High Value Customers',
            description: 'Customers with high spending',
            rulesJson: JSON.stringify({
              op: 'AND',
              rules: [
                { field: 'totalSpend', operator: 'gte', value: 100 }
              ]
            }),
            createdBy: 'admin@xenocrm.com'
          },
          {
            name: 'New Customers',
            description: 'Recently registered customers',
            rulesJson: JSON.stringify({
              op: 'AND',
              rules: [
                { field: 'createdAt', operator: 'gte', value: '2024-01-01' }
              ]
            }),
            createdBy: 'admin@xenocrm.com'
          }
        ]
      });
      console.log('✅ Sample segments created');
    } else {
      console.log('✅ Segments already exist');
    }
    
    console.log('🎉 Database initialization completed!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initDatabase();
