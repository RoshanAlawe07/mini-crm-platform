// import { Worker } from "bullmq";
import { prisma } from "../services/db.service";

// Batch processing configuration
const BATCH_SIZE = 100;
const BATCH_TIMEOUT = 5000; // 5 seconds

// In-memory batch storage
let pendingUpdates: Array<{
  id: string;
  status: string;
  attempts: number;
  lastAttemptAt: Date;
  deliveryReceipt: string;
}> = [];

let batchTimeout: NodeJS.Timeout | null = null;

// Function to process batch updates
async function processBatch() {
  if (pendingUpdates.length === 0) return;

  const updates = [...pendingUpdates];
  pendingUpdates = [];

  // Group updates by status for efficient batch processing
  const sentUpdates = updates.filter(u => u.status === 'SENT');
  const failedUpdates = updates.filter(u => u.status === 'FAILED');

  try {
    // Batch update for SENT messages
    if (sentUpdates.length > 0) {
      await prisma.communicationLog.updateMany({
        where: { id: { in: sentUpdates.map(u => u.id) } },
        data: {
          status: "SENT",
          attempts: { increment: 1 },
          lastAttemptAt: new Date(),
          deliveryReceipt: "OK",
        },
      });
      console.log(`Batch updated ${sentUpdates.length} messages to SENT status`);
    }

    // Batch update for FAILED messages
    if (failedUpdates.length > 0) {
      await prisma.communicationLog.updateMany({
        where: { id: { in: failedUpdates.map(u => u.id) } },
        data: {
          status: "FAILED",
          attempts: { increment: 1 },
          lastAttemptAt: new Date(),
          deliveryReceipt: "FAILED",
        },
      });
      console.log(`Batch updated ${failedUpdates.length} messages to FAILED status`);
    }
  } catch (error) {
    console.error('Error processing batch updates:', error);
    // Re-add failed updates to pending list
    pendingUpdates.unshift(...updates);
  }
}

// Function to add update to batch
function addToBatch(update: typeof pendingUpdates[0]) {
  pendingUpdates.push(update);

  // Process batch if it reaches the batch size
  if (pendingUpdates.length >= BATCH_SIZE) {
    if (batchTimeout) {
      clearTimeout(batchTimeout);
      batchTimeout = null;
    }
    processBatch();
  } else if (!batchTimeout) {
    // Set timeout to process remaining updates
    batchTimeout = setTimeout(() => {
      batchTimeout = null;
      processBatch();
    }, BATCH_TIMEOUT);
  }
}

// export const campaignWorker = new Worker(
//   "ingest-campaigns",
//   async (job: any) => {
//     const { customerId, campaignId, messageId } = job.data;

//     // Random delay between 200ms and 2s
//     await new Promise((res) => setTimeout(res, Math.random() * 1800 + 200));

//     // 90% success, 10% fail
//     const success = Math.random() < 0.9;

//     // Get the communication log ID first
//     const log = await prisma.communicationLog.findFirst({
//       where: { 
//         campaignId, 
//         customerId, 
//         messageId 
//       },
//       select: { id: true }
//     });

//     if (log) {
//       // Add to batch for processing
//       addToBatch({
//         id: log.id,
//         status: success ? "SENT" : "FAILED",
//         attempts: 1,
//         lastAttemptAt: new Date(),
//         deliveryReceipt: success ? "OK" : "FAILED",
//       });

//       console.log(`Message ${messageId} queued for ${success ? 'sent' : 'failed'} to customer ${customerId}`);
//     } else {
//       console.warn(`Communication log not found for message ${messageId}`);
//     }
//   },
//   // { connection: redisConnection }
// );

// Handle job completion
// campaignWorker.on('completed', (job) => {
//   console.log(`Campaign job ${job.id} completed`);
// });

// Handle job failure
// campaignWorker.on('failed', (job, err) => {
//   console.error(`Campaign job ${job?.id} failed:`, err);
// });

// Process any remaining updates on shutdown
process.on('SIGINT', async () => {
  console.log('Processing remaining batch updates before shutdown...');
  await processBatch();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Processing remaining batch updates before shutdown...');
  await processBatch();
  process.exit(0);
});
