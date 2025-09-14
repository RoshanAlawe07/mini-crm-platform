#!/usr/bin/env node

/**
 * Test Redis Connection Script
 * This script tests if Redis is accessible and working
 */

const { Queue } = require('bullmq');

async function testRedisConnection() {
  console.log('🔍 Testing Redis connection...');
  
  let redisConnection;

  if (process.env.REDIS_URL) {
    // Parse REDIS_URL (format: redis://username:password@hostname:port)
    const redisUrl = new URL(process.env.REDIS_URL);
    redisConnection = {
      host: redisUrl.hostname,
      port: parseInt(redisUrl.port) || 6379,
      password: redisUrl.password || undefined,
      username: redisUrl.username || undefined,
    };
    console.log('✅ Using REDIS_URL:', process.env.REDIS_URL);
  } else {
    // Fallback to individual environment variables
    redisConnection = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    };
    console.log('✅ Using individual Redis env vars');
  }

  console.log('🔧 Redis connection config:', {
    host: redisConnection.host,
    port: redisConnection.port,
    hasPassword: !!redisConnection.password,
    hasUsername: !!redisConnection.username
  });

  try {
    // Create a test queue
    const testQueue = new Queue('test-connection', { connection: redisConnection });
    
    // Test adding a job
    console.log('📤 Adding test job to queue...');
    const job = await testQueue.add('test-job', { message: 'Hello Redis!' });
    console.log('✅ Job added successfully:', job.id);
    
    // Test getting job count
    const waiting = await testQueue.getWaiting();
    const active = await testQueue.getActive();
    const completed = await testQueue.getCompleted();
    
    console.log('📊 Queue stats:');
    console.log(`  - Waiting: ${waiting.length}`);
    console.log(`  - Active: ${active.length}`);
    console.log(`  - Completed: ${completed.length}`);
    
    // Clean up test job
    await job.remove();
    console.log('🧹 Test job cleaned up');
    
    // Close connection
    await testQueue.close();
    console.log('🎉 Redis connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testRedisConnection();
