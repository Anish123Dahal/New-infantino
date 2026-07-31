import { campaign, signatureCount } from './lib/campaign';

async function main() {
  try {
    const c = await campaign();
    console.log('Campaign:', c);
    const count = await signatureCount(c.id);
    console.log('Signature Count:', count);
  } catch (e) {
    console.error('Error:', e);
  }
}
main();
