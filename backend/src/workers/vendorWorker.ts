import { Worker } from "bullmq";
import axios from "axios";

const vendorWorker = new Worker(
  "ingest-campaigns",
  async (job) => {
    const { messageId, customerId, campaignId, message } = job.data;
    
    try {
      const vendorResponse = await axios.post("http://localhost:3001/vendor/send", {
        message_id: messageId,
        customer_id: customerId,
        campaign_id: campaignId,
        message: message
      });
      
      return {
        success: true,
        messageId,
        vendorStatus: vendorResponse.data.status,
        processingTime: vendorResponse.data.processing_time_ms
      };
      
    } catch (error: any) {
      console.error(`Worker failed to call vendor for ${messageId}:`, error.message);
      
      return {
        success: false,
        messageId,
        error: error.message
      };
    }
  },
  {
    connection: {
      host: "localhost",
      port: 6379,
    },
    concurrency: 5,
  }
);

vendorWorker.on("completed", (job) => {
  console.log(`Job completed: ${job.id} - ${job.returnvalue.messageId}`);
});

vendorWorker.on("failed", (job, err) => {
  console.error(`Job failed: ${job?.id} - ${err.message}`);
});

vendorWorker.on("error", (err) => {
  console.error("Worker error:", err);
});

process.on("SIGINT", async () => {
  await vendorWorker.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await vendorWorker.close();
  process.exit(0);
});

console.log("Vendor worker started - listening for campaign delivery jobs");

export default vendorWorker;
