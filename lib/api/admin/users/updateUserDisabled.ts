import type { NextApiRequest, NextApiResponse } from 'next';
import { setUserDisabled, findUser } from '@lib/users';
import type { UserDisabledUpdateRequest, ApiMessage } from '@/types';

export default async function updateUserDisabledHandler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
) {
  const { email, disabled } = req.body as UserDisabledUpdateRequest;
  if (typeof disabled !== 'boolean' || !email)
    return res.status(400).json({ message: 'email and disabled required' });
  const target = await findUser(email);
  if (target?.role === 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'cannot modify super admin' });
  }
  await setUserDisabled(email, disabled);
  res.status(200).json({ message: 'status updated' });
}
