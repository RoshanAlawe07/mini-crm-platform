import { Queue } from "bullmq";
import { redisConnection } from "../services/db.service";

export const customerQueue = new Queue("ingest-customers", { connection: redisConnection });
export const orderQueue = new Queue("ingest-orders", { connection: redisConnection });
export const campaignQueue = new Queue("ingest-campaigns", { connection: redisConnection });
