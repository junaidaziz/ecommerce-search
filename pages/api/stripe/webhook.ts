import type { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '@lib/stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).end('Method Not Allowed');
    return;
  }
  const sig = req.headers['stripe-signature'] as string;
  const buf = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    res.status(400).end(`Webhook Error: ${(err as Error).message}`);
    return;
  }
  // Handle events here if needed
  res.json({ received: true });
}
