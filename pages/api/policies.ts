import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/db';
import { handleApiError } from '../../lib/utils/handleApiError';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ message: 'Method Not Allowed' });
      return;
    }
    const type = Array.isArray(req.query.type) ? req.query.type[0] : req.query.type;
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
      res.status(404).json({ message: 'Not found' });
      return;
    }
    res.status(200).json(doc);
  } catch (error) {
    handleApiError(res, error, 'Failed to load policy');
  }
}
