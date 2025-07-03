import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '@lib/db';
import { handleApiError } from '@utils/handleApiError';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { METHOD_NOT_ALLOWED } from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ message: METHOD_NOT_ALLOWED });
      return;
    }
    const { subject, message } = req.body as {
      subject?: string;
      message?: string;
    };
    if (!subject || !message) {
      res.status(400).json({ message: 'subject and message required' });
      return;
    }
    const session = await getServerSession(req, res, authOptions);
    const db = getDb();
    const ticket = await db.supportTicket.create({
      data: {
        subject,
        message,
        userId: session?.user?.email
          ? (await db.user.findUnique({ where: { email: session.user.email } }))
              ?.id
          : null,
      },
    });
    res.status(201).json(ticket);
  } catch (error) {
    handleApiError(res, error, 'Failed to create ticket');
  }
}
