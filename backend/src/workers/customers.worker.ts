
import { Worker } from "bullmq";
import { prisma } from "../services/db.service";

// Redis connection configuration
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

export const customerWorker = new Worker(
  "ingest-customers",
  async (job: any) => {
    const { name, email, phone, total_spend, last_active, visits_count } = job.data;

    // Use Prisma instead of raw SQL
    await prisma.customer.upsert({
      where: { email },
      update: {
        name,
        phone,
        totalSpend: total_spend || 0,
        lastActive: last_active ? new Date(last_active) : null,
        visitsCount: visits_count || 0,
      },
      create: {
        name,
        email,
        phone,
        totalSpend: total_spend || 0,
        lastActive: last_active ? new Date(last_active) : null,
        visitsCount: visits_count || 0,
      },
    });
  },
  { connection: redisConnection }
);
