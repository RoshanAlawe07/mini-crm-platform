import { Worker } from "bullmq";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Redis connection configuration
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Create customer worker
const customerWorker = new Worker(
  "ingest-customers",
  async (job) => {
    console.log(`🔄 Processing job ${job.id}:`, job.data);
    
    const { name, email, phone, total_spend, last_active, visits_count } = job.data;
    
    try {
      // Check if customer exists
      const existing = await prisma.customer.findUnique({ 
        where: { email } 
      });
      
      if (existing) {
        // Update existing customer
        const updatedCustomer = await prisma.customer.update({
          where: { id: existing.id },
          data: {
            name,
            phone: phone || existing.phone,
            totalSpend: total_spend ?? existing.totalSpend,
            lastActive: last_active ? new Date(last_active) : existing.lastActive,
            visitsCount: (existing.visitsCount || 0) + (visits_count || 1),
          },
        });
        
        console.log(`✅ Updated existing customer: ${updatedCustomer.email}`);
        return updatedCustomer;
      } else {
        // Create new customer
        const newCustomer = await prisma.customer.create({
          data: {
            name,
            email,
            phone: phone || null,
            totalSpend: total_spend || 0,
            lastActive: last_active ? new Date(last_active) : null,
            visitsCount: visits_count || 0,
          },
        });
        
        console.log(`✅ Created new customer: ${newCustomer.email}`);
        return newCustomer;
      }
    } catch (error) {
      console.error(`❌ Error processing customer ${email}:`, error);
      throw error;
    }
  },
  { 
    connection: redisConnection,
    concurrency: 5 // Process up to 5 jobs concurrently
  }
);

// Event handlers
customerWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

customerWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

customerWorker.on("error", (err) => {
  console.error(`❌ Worker error:`, err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down customer worker...');
  await customerWorker.close();
  await prisma.$disconnect();
  process.exit(0);
});

console.log('🚀 Customer worker started and listening for jobs...');

export { customerWorker };
