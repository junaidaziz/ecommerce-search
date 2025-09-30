import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { stripe } from '@lib/stripe';
import { findUser, updateUserProfile } from '@lib/users';
import {
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
  USER_NOT_FOUND,
} from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ url: string } | { message: string }>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ message: METHOD_NOT_ALLOWED });
    return;
  }
  const session = await getServerSession(req, res, authOptions(req, res));
  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const email = session?.user?.email;
  if (!email) {
    res.status(401).json({ message: UNAUTHORIZED });
    return;
  }
  const user = await findUser(email);
  if (!user) {
    res.status(404).json({ message: USER_NOT_FOUND });
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
