import type { NextApiResponse } from 'next';
import { withRole, AuthedNextApiRequest } from '@lib/withRole';
import { getDb } from '@lib/db';
import { handleApiError } from '@utils/handleApiError';

async function handler(req: AuthedNextApiRequest, res: NextApiResponse) {
  try {
    const db = getDb();
    if (req.method === 'GET') {
      const type = Array.isArray(req.query.type) ? req.query.type[0] : req.query.type;
      if (type) {
        const doc = await db.policyDocument.findFirst({
          where: { type: String(type) },
          orderBy: { version: 'desc' },
        });
        res.status(200).json(doc);
        return;
      }
      const docs = await db.policyDocument.findMany({
        orderBy: [{ type: 'asc' }, { version: 'desc' }],
      });
      res.status(200).json(docs);
      return;
    }
    if (req.method === 'POST') {
      const { type, content } = req.body as { type?: string; content?: string };
      if (!type || !content) {
        res.status(400).json({ message: 'type and content required' });
        return;
      }
      const adminEmail = req.user?.email as string | undefined;
      const admin = adminEmail
        ? await db.user.findUnique({ where: { email: adminEmail } })
        : null;
      const last = await db.policyDocument.findFirst({
        where: { type },
        orderBy: { version: 'desc' },
      });
      const version = (last?.version || 0) + 1;
      const doc = await db.policyDocument.create({
        data: {
          type,
          content,
          version,
          updatedBy: admin?.id || 0,
        },
      });
      res.status(201).json(doc);
      return;
    }
    res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    handleApiError(res, error, 'Failed to manage policies');
  }
}

export default withRole(['SUPER_ADMIN'])(handler);
