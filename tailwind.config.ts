import type { Config } from 'tailwindcss';
export default { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: {
  colors: { ink: '#090909', campaign: '#d71920', cream: '#f5f2ed', muted: '#71717a' },
  fontFamily: { sans: ['Arial', 'Helvetica', 'sans-serif'] },
  boxShadow: { lift: '0 20px 60px rgba(0,0,0,.15)' }
}}, plugins: [] } satisfies Config;
