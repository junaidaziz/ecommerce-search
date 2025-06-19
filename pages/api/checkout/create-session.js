import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { items, email, shippingName, shippingAddress } = req.body || {};
  if (!items || !email) {
    return res.status(400).json({ message: 'items and email required' });
  }
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((it) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: it.TITLE },
          unit_amount: Math.round(parseFloat(it.MIN_PRICE || 0) * 100),
        },
        quantity: it.qty,
      })),
      mode: 'payment',
      success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/checkout/cancel`,
      metadata: {
        email,
        shippingName: shippingName || '',
        shippingAddress: shippingAddress || '',
        items: JSON.stringify(items),
      },
    });
    return res.status(200).json({ url: session.url, id: session.id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'stripe error' });
  }
}
