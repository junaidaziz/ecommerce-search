import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '@lib/db';
import { handleApiError } from '@utils/handleApiError';
import { METHOD_NOT_ALLOWED, NOT_FOUND } from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ message: METHOD_NOT_ALLOWED });
      return;
    }
    const type = Array.isArray(req.query.type)
      ? req.query.type[0]
      : req.query.type;
    if (!type) {
      res.status(400).json({ message: 'type required' });
      return;
    }
    const db = getDb();
    const doc = await db.policyDocument.findFirst({
      where: { type: String(type) },
      orderBy: { version: 'desc' },
    });
    if (!doc) {
      res.status(404).json({ message: NOT_FOUND });
      return;
    }
    res.status(200).json(doc);
  } catch (error) {
    handleApiError(res, error, 'Failed to load policy');
  }
}
