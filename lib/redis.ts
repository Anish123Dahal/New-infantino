import Redis from 'ioredis';
const globalRedis = globalThis as unknown as { redis?: Redis };
export const redis = globalRedis.redis ?? new Redis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: 1, enableOfflineQueue: false, lazyConnect: true, connectTimeout: 1000 });
if (process.env.NODE_ENV !== 'production') globalRedis.redis = redis;
export async function safeRedis<T>(fn: () => Promise<T>, fallback: T): Promise<T> { try { if (redis.status === 'wait') await redis.connect(); return await fn(); } catch { return fallback; } }
