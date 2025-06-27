import type { NextApiRequest, NextApiResponse } from 'next';
import { updateUserProfile, findUser } from '@lib/users';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { handleApiError } from '@utils/handleApiError';
import type { User, ApiMessage } from '../../../types';
import formidable, { type Fields, type Files, type File } from 'formidable';
import fs from 'fs';
import path from 'path';

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
  res: NextApiResponse<User | ApiMessage>
): Promise<void> {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (req.method === 'GET') {
      const userData = await findUser(session.user.email);
      return res.status(200).json(userData);
    }
    if (req.method === 'PUT') {
      const { fields, files } = await parseBody(req);
      const {
        firstName,
        lastName,
        email,
        password,
        gender,
        phoneNumber,
        address,
        city,
        country,
      } = fields as Partial<User> & { password?: string };
      const update: any = {
        firstName,
        lastName,
        gender,
        phoneNumber,
        address,
        city,
        country,
      };
      if (email) update.email = email;
      if (password) update.password = await bcrypt.hash(String(password), 10);
      const profileImageFile = (files.profileImage || files.logo) as File | File[] | undefined;
      if (profileImageFile) {
        const file = Array.isArray(profileImageFile) ? profileImageFile[0] : profileImageFile;
        if (
          file.mimetype && !['image/jpeg', 'image/png'].includes(file.mimetype)
        ) {
          return res.status(400).json({ message: 'Only JPEG/PNG images are allowed' });
        }
        if (file.size && file.size > 2 * 1024 * 1024) {
          return res.status(400).json({ message: 'File size exceeds 2MB' });
        }
        const dir = path.join(process.cwd(), 'public', 'avatars', String(session.user.id));
        fs.mkdirSync(dir, { recursive: true });
        const name = Date.now() + '-' + file.originalFilename;
        const dest = path.join(dir, name);
        fs.renameSync(file.filepath, dest);
        update.profileImage = `/avatars/${session.user.id}/${name}`;
      }
      await updateUserProfile(session.user.email, update);
      return res.status(200).json({ message: 'updated' });
    }
    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to update profile');
  }
}
