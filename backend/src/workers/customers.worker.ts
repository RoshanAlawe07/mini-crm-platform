
import { Worker } from "bullmq";
import { redisConnection, prisma } from "../services/db.service";

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
