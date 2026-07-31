import { campaign, signatureCount } from '@/lib/campaign'; import { ok, apiError } from '@/lib/http';
export const dynamic='force-dynamic';
export async function GET(){ try { const c=await campaign(); const count=await signatureCount(c.id); return ok({id:c.id,slug:c.slug,title:c.title,headline:c.headline,description:c.description,goal:Number(c.goal),signatureCount:count,votingEnabled:c.votingEnabled}); } catch(e){return apiError(e);} }
