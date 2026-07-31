import { z } from 'zod';
import { apiError, fail, ok } from '@/lib/http';
import { blindHash, getIp } from '@/lib/security';
import { rateLimit } from '@/lib/rate-limit';
import { db } from '@/lib/db';
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

    const c = await campaign();
    const dHash = blindHash(input.deviceId);

    const existing = await db.signature.findFirst({
      where: { campaignId: c.id, deviceHash: dHash }
    });

    if (existing) {
      return fail('ALREADY_SIGNED', 'This device has already signed this petition.', 409);
    }

    await db.signature.create({
      data: {
        campaignId: c.id,
        displayName: 'Anonymous Supporter',
        countryCode: 'ZZ',
        deviceHash: dHash,
        ipHash: blindHash(ip),
        status: 'VERIFIED',
        verifiedAt: new Date()
      }
    });
    await safeRedis(() => redis.incr(`campaign:${c.id}:verified-count`), null);

    return ok({ status: 'VERIFIED' }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
