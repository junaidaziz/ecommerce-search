import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import type { Coupon, ApiMessage } from '@/types';
import { METHOD_NOT_ALLOWED, UNAUTHORIZED } from '@/constants/messages';
import { getDb } from '@lib/db';

const prisma = getDb();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Coupon[] | ApiMessage>
): Promise<void> {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ message: UNAUTHORIZED });
  if (req.method !== 'GET')
    return res.status(405).json({ message: METHOD_NOT_ALLOWED });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  });
  if (!user) return res.status(401).json({ message: UNAUTHORIZED });

  const [coupons, usages] = await Promise.all([
    prisma.coupon.findMany({
      where: { OR: [{ userId: null }, { userId: user.id }] },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.couponUsage.findMany({
      where: { userId: user.id },
      select: { couponId: true },
    }),
  ]);

  const usedIds = new Set(usages.map((u) => u.couponId));
  const now = new Date();
  const result = coupons.map((c) => ({
    ...c,
    status: usedIds.has(c.id)
      ? 'used'
      : c.expiresAt && new Date(c.expiresAt) < now
        ? 'expired'
        : 'unused',
  }));

  res.status(200).json(result as unknown as Coupon[]);
}
