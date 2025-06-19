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
    brandName,
    phoneNumber,
    businessAddress,
    city,
    country,
    website,
    businessDescription,
    taxId,
  } = req.body;
  if (
    !email ||
    !password ||
    !firstName ||
    !lastName ||
    !brandName ||
    !phoneNumber ||
    !businessAddress ||
    !city ||
    !country
  ) {
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
    brand_name: brandName,
    phone_number: phoneNumber,
    business_address: businessAddress,
    city,
    country,
    website: website || null,
    business_description: businessDescription || null,
    tax_id: taxId || null,
    role: 'BRAND',
    verification_token: token,
  });
  return res.status(201).json({ token });
}
