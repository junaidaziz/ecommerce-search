import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/constants/messages';

interface CreditHistory {
  amount: number;
  date: string;
  type: string;
}

interface CreditBalance {
  balance: number;
  history: CreditHistory[];
}

const balanceStore = new Map<string, CreditBalance>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreditBalance | { message: string }>
): Promise<void> {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ message: UNAUTHORIZED });

  if (req.method !== 'GET')
    return res.status(405).json({ message: METHOD_NOT_ALLOWED });

  if (!balanceStore.has(session.user.email))
    balanceStore.set(session.user.email, { balance: 0, history: [] });

  res.status(200).json(balanceStore.get(session.user.email)!);
}
