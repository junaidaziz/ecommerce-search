import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import formidable, { File } from 'formidable';
import { uploadFileToS3 } from '../../../lib/s3';
import type { ApiMessage } from '@/types';
import {
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
  INVALID_FORM_DATA,
} from '@/constants/messages';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ url: string } | ApiMessage>
) {
  const session = await getServerSession(req, res, authOptions(req, res));
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  }

  const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({ message: INVALID_FORM_DATA });
      return;
    }
    const file = files.file as File | undefined;
    if (!file) {
      res.status(400).json({ message: 'file required' });
      return;
    }
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (file.mimetype && !allowed.includes(file.mimetype)) {
      res.status(400).json({ message: 'Invalid file type' });
      return;
    }
    const key = `chat/${session.user!.id}/${Date.now()}-${file.originalFilename || 'file'}`;
    const url = await uploadFileToS3(
      file.filepath,
      key,
      file.mimetype || undefined
    );
    res.status(200).json({ url });
  });
}
