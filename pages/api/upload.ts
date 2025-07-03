import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import { uploadFileToS3 } from '@/lib/s3';
import path from 'path';
import { METHOD_NOT_ALLOWED, INVALID_FORM_DATA } from '@/constants/messages';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ urls: string[] } | { message: string }>
) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: METHOD_NOT_ALLOWED });
    return;
  }

  const form = formidable({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(400).json({ message: INVALID_FORM_DATA });
      return;
    }
    const folder = String(fields.folder || 'uploads');
    const fileList = files.file
      ? Array.isArray(files.file)
        ? (files.file as File[])
        : [files.file as File]
      : [];
    const urls: string[] = [];
    for (const f of fileList) {
      const name = Date.now() + '-' + (f.originalFilename || 'file');
      const key = path.posix.join(folder, name);
      const url = await uploadFileToS3(
        f.filepath,
        key,
        f.mimetype || undefined
      );
      urls.push(url);
    }
    res.status(200).json({ urls });
  });
}
