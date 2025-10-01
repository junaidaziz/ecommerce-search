import type { NextApiRequest, NextApiResponse } from 'next';
import { findUser } from '@lib/users';
import { handleApiError } from '@utils/handleApiError';
import type { ApiMessage } from '@/types';
import {
  METHOD_NOT_ALLOWED,
  MISSING_REQUIRED_FIELDS,
} from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: METHOD_NOT_ALLOWED });
    }

    const { email } = req.body as {
      email?: string;
    };

    if (!email) {
      return res.status(400).json({ message: MISSING_REQUIRED_FIELDS });
    }

    const user = await findUser(email);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // TODO: Send verification email here
    // This would typically call a function like sendVerificationEmail(email, user.verificationToken)
    // For now, we'll just return success
    
    return res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to resend verification email');
  }
}
