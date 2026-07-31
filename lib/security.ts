import crypto from 'crypto';
const pepper = () => process.env.HASH_PEPPER || process.env.JWT_SECRET || 'development-only-pepper';
export function blindHash(value: string) { return crypto.createHmac('sha256', pepper()).update(value.trim().toLowerCase()).digest('hex'); }
export function publicId(prefix: string) { return `${prefix}_${crypto.randomBytes(9).toString('base64url')}`; }
export function encrypt(value: string) {
  const key = crypto.createHash('sha256').update(pepper()).digest(); const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv); const body = Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);
  return Buffer.concat([iv,cipher.getAuthTag(),body]).toString('base64url');
}
export function getIp(req: Request) { return (req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown').trim(); }
export async function verifyCaptcha(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY; if (!secret) return process.env.NODE_ENV !== 'production';
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body, signal: AbortSignal.timeout(3000) });
  return Boolean((await r.json() as {success?:boolean}).success);
}
