import { PrismaClient } from '@prisma/client';
import IORedis from "ioredis";

// Use Prisma instead of raw MySQL
export const prisma = new PrismaClient();

export const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
  lazyConnect: true,
});

// Export types for better TypeScript support
export type RedisConnection = IORedis;
