import type { NextApiRequest, NextApiResponse } from 'next';
import { getCategoryTree } from '../../lib/products';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const data = await getCategoryTree();
    return res.status(200).json(data);
  }
  return res.status(405).json({ message: 'Method Not Allowed' });
}
