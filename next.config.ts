import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: 'standalone',
  images: { formats: ['image/avif', 'image/webp'] },
  async headers() { return [{ source: '/(.*)', headers: [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    { key: 'Content-Security-Policy', value: `default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ""} https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; connect-src 'self'` }
  ]}]; }
};
export default nextConfig;
