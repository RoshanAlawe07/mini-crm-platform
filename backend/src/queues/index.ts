import { Queue } from "bullmq";
import { redisConnection } from "../services/db.service";

// Disable queues for now since Redis is not running
export const customerQueue = null;
export const orderQueue = null;
export const campaignQueue = null;
