import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { stripe } from '@lib/stripe';
import { findUser, updateUserProfile } from '@lib/users';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ url: string } | { message: string }>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  const session = await getServerSession(req, res, authOptions);
  const email = session?.user?.email;
  if (!email) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  const user = await findUser(email);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  let accountId = user.stripeAccountId || '';
  if (!accountId) {
    const account = await stripe.accounts.create({ type: 'express', email });
    accountId = account.id;
    await updateUserProfile(email, { stripeAccountId: accountId });
  }
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${req.headers.origin}/brand/dashboard`,
    return_url: `${req.headers.origin}/brand/dashboard`,
    type: 'account_onboarding',
  });
  res.status(200).json({ url: link.url });
}
