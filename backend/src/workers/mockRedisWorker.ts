import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class MockRedisWorker {
  private isProcessing = false;
  private jobQueue: any[] = [];

  constructor() {
    console.log('Mock Redis Worker started');
    this.startProcessing();
  }

  async addJob(jobData: any) {
    const jobId = Date.now().toString();
    const job = {
      id: jobId,
      data: jobData,
      timestamp: new Date()
    };
    
    this.jobQueue.push(job);
    console.log(`Job ${jobId} added to queue:`, jobData);
    
    this.processJob(job);
    
    return { id: jobId };
  }

  private async processJob(job: any) {
    try {
      console.log(`Processing job ${job.id}:`, job.data);
      
      const { name, email, phone, total_spend, last_active, visits_count } = job.data;
      
      const existing = await prisma.customer.findUnique({ 
        where: { email } 
      });
      
      if (existing) {
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
        
        console.log(`Updated existing customer: ${updatedCustomer.email}`);
        return updatedCustomer;
      } else {
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
        
        console.log(`Created new customer: ${newCustomer.email}`);
        return newCustomer;
      }
    } catch (error) {
      console.error(`Error processing customer ${job.data.email}:`, error);
      throw error;
    }
  }

  private startProcessing() {
    console.log('Worker listening for jobs...');
  }

  async close() {
    console.log('Mock Redis Worker shutting down...');
    await prisma.$disconnect();
  }
}

const mockWorker = new MockRedisWorker();

process.on('SIGINT', async () => {
  console.log('Shutting down mock worker...');
  await mockWorker.close();
  process.exit(0);
});

export { mockWorker };
