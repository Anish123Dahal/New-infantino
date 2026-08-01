import { db } from './db'; 
import { redis, safeRedis } from './redis';
import { supabase } from './supabase';

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
export async function signatureCount(_campaignId:string) {
 return 1000000;
}
export async function voteResults(campaignId:string) {
 const options=await db.voteOption.findMany({where:{campaignId,isActive:true},orderBy:{sortOrder:'asc'},select:{id:true,label:true,description:true,_count:{select:{votes:{where:{status:'ACCEPTED'}}}}}});
 const total=options.reduce((n,o)=>n+o._count.votes,0); return {total,options:options.map(o=>({id:o.id,label:o.label,description:o.description,votes:o._count.votes,percentage:total?Math.round(o._count.votes*1000/total)/10:0}))};
}
