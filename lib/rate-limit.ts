import { redis, safeRedis } from './redis';
export async function rateLimit(key:string, limit:number, seconds:number) {
  const count = await safeRedis(async()=> { const n=await redis.incr(`rl:${key}`); if(n===1) await redis.expire(`rl:${key}`,seconds); return n; }, 0);
  return { allowed: count === 0 || count <= limit, remaining: Math.max(0,limit-count) };
}
