import type { NextApiRequest, NextApiResponse } from 'next';
import { addUser, findUser } from '../../../lib/users';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const {
    email,
    password,
    firstName,
    lastName,
    gender,
    phoneNumber,
    address,
    city,
    country,
  } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'missing required fields' });
  }
  if (await findUser(email)) {
    return res.status(409).json({ message: 'User exists' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const token = crypto.randomBytes(20).toString('hex');
  await addUser({
    email,
    password: hashed,
    first_name: firstName,
    last_name: lastName,
    gender: gender || '',
    phone_number: phoneNumber || null,
    address: address || null,
    city: city || null,
    country: country || null,
    role: 'USER',
    verification_token: token,
  });
  return res.status(201).json({ token });
}
