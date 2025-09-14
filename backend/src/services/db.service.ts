import { PrismaClient } from '@prisma/client';
import IORedis from "ioredis";

// Use Prisma instead of raw MySQL
export const prisma = new PrismaClient();

// Redis connection - disabled for now since Redis is not running
export const redisConnection = null;

// Export types for better TypeScript support
export type RedisConnection = IORedis;
