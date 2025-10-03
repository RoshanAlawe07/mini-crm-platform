import { PrismaClient } from '@prisma/client';
import IORedis from "ioredis";

export const prisma = new PrismaClient();

export const redisConnection = null;

export type RedisConnection = IORedis;
