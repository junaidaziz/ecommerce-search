import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { updateUserProfile } from '@lib/users';
import { uploadFileToS3 } from '@lib/s3';
import { handleApiError } from '@utils/handleApiError';
import formidable, { type Fields, type Files, type File } from 'formidable';
import { Prisma } from '@prisma/client';
import {
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
  UPDATED,
} from '@/constants/messages';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseBody(
  req: NextApiRequest
): Promise<{ fields: Fields; files: Files }> {
  const type = req.headers['content-type'] || '';
  if (type.includes('application/json')) {
    const buffers: Uint8Array[] = [];
    for await (const chunk of req) buffers.push(chunk);
    const body = Buffer.concat(buffers).toString();
    return { fields: JSON.parse(body || '{}') as Fields, files: {} as Files };
  }
  return new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    if (req.method !== 'PATCH')
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ message: UNAUTHORIZED });

    const { fields, files } = await parseBody(req);
    const remove = fields.remove === 'true';
    const update: Prisma.UserUpdateInput = {};

    const profileImageFile = files.profileImage as File | File[] | undefined;
    if (profileImageFile) {
      const file = Array.isArray(profileImageFile)
        ? profileImageFile[0]
        : profileImageFile;
      if (
        file.mimetype &&
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
      ) {
        return res
          .status(400)
          .json({ message: 'Only JPG/PNG/WebP images are allowed' });
      }
      if (file.size && file.size > 2 * 1024 * 1024) {
        return res.status(400).json({ message: 'File size exceeds 2MB' });
      }
      const name = Date.now() + '-' + (file.originalFilename || 'avatar');
      const key = `users/${session.user.id}/${name}`;
      const url = await uploadFileToS3(
        file.filepath,
        key,
        file.mimetype || undefined
      );
      update.profileImage = url;
    } else if (remove) {
      update.profileImage = null;
    } else {
      return res.status(400).json({ message: 'No image provided' });
    }

    await updateUserProfile(session.user.email, update);
    return res.status(200).json({ message: UPDATED, profileImage: update.profileImage });
  } catch (error) {
    return handleApiError(res, error, 'Failed to update profile picture');
  }
}
