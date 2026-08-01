import { db } from './db'; 
import { redis, safeRedis } from './redis';


export async function campaign() {
  return db.campaign.upsert({
    where: { slug: 'infantino-out' },
    update: {},
    create: {
      slug: 'infantino-out',
      title: 'Infantino Out',
      headline: 'Remove Gianni Infantino — FIFA Needs Accountability',
      description: 'Football belongs to the fans. This campaign calls for greater accountability, transparency, and leadership that puts football, players, and supporters first.',
      goal: 5000000,
      votingEnabled: false,
    },
  });
}
// Base count that the petition starts from (pre-existing supporters).
// Every new real signature increments on top of this.
const BASE_COUNT = 1_000_000;

export async function signatureCount(campaignId: string): Promise<number> {
  // Try Redis cache first (fast path).
  // The Redis key stores the REAL db count (without the base).
  const cached = await safeRedis(
    () => redis.get(`campaign:${campaignId}:verified-count`),
    null
  );
  if (cached !== null) return BASE_COUNT + parseInt(cached, 10);

  // Fall back to real DB count
  const count = await db.signature.count({
    where: { campaignId, status: 'VERIFIED' },
  });

  // Warm the cache so future requests are fast (60s TTL)
  await safeRedis(
    () => redis.set(`campaign:${campaignId}:verified-count`, String(count), 'EX', 60),
    null
  );

  return BASE_COUNT + count;
}
export async function voteResults(campaignId:string) {
 const options=await db.voteOption.findMany({where:{campaignId,isActive:true},orderBy:{sortOrder:'asc'},select:{id:true,label:true,description:true,_count:{select:{votes:{where:{status:'ACCEPTED'}}}}}});
 const total=options.reduce((n,o)=>n+o._count.votes,0); return {total,options:options.map(o=>({id:o.id,label:o.label,description:o.description,votes:o._count.votes,percentage:total?Math.round(o._count.votes*1000/total)/10:0}))};
}
