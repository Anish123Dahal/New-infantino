import { z } from 'zod';
import { apiError, fail, ok } from '@/lib/http';
import { blindHash, getIp } from '@/lib/security';
import { rateLimit } from '@/lib/rate-limit';
import { supabase } from '@/lib/supabase';
import { campaign } from '@/lib/campaign';
import { redis, safeRedis } from '@/lib/redis';

const schema = z.object({ deviceId: z.string().min(10).max(100) });

export async function POST(req: Request) {
  try {
    const input = schema.parse(await req.json());
    const ip = getIp(req);
    
    if (!(await rateLimit(`sign:ip:${blindHash(ip)}`, 20, 3600)).allowed) {
      return fail('RATE_LIMITED', 'Too many attempts. Please try again later.', 429);
    }

    const { error } = await supabase
      .from('signatures')
      .insert([{ device_id: input.deviceId }]);

    if (error) {
      if (error.code === '23505') {
        return fail('ALREADY_SIGNED', 'This device has already signed this petition.', 409);
      }
      throw error;
    }

    const c = await campaign();
    await safeRedis(() => redis.incr(`campaign:${c.id}:verified-count`), null);

    return ok({ status: 'VERIFIED' }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
