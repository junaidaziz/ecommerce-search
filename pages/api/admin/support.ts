import type { NextApiRequest, NextApiResponse } from 'next';
import { withRole } from '@lib/withRole';
import { getDb } from '@lib/db';
import { handleApiError } from '@utils/handleApiError';
import { METHOD_NOT_ALLOWED } from '@/constants/messages';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ message: METHOD_NOT_ALLOWED });
      return;
    }
    const status = Array.isArray(req.query.status)
      ? req.query.status[0]
      : req.query.status;
    const db = getDb();
    const tickets = await db.supportTicket.findMany({
      where: status ? { status: String(status) } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
    res.status(200).json(tickets);
  } catch (error) {
    handleApiError(res, error, 'Failed to load tickets');
  }
}

export default withRole(['SUPER_ADMIN'])(handler);
