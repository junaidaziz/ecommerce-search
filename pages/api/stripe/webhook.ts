import type { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '@lib/stripe';
import { strapiMarkOrderPaid } from '@lib/strapi';
import { METHOD_NOT_ALLOWED } from '@/constants/messages';

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
    res.status(405).end(METHOD_NOT_ALLOWED);
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
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    try {
      if (orderId) {
        await strapiMarkOrderPaid({ orderId, stripeSessionId: session.id });
      }
    } catch (err) {
      console.error('Failed to mark order paid', err);
    }
  }
  res.json({ received: true });
}
