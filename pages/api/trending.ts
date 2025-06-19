import type { NextApiRequest, NextApiResponse } from 'next';

const trendingKeywords = [
  'iPhone 14',
  'Wireless Earbuds',
  'Gaming Laptop',
  'Smart Watch',
  'Portable Charger',
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ keywords: string[] }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ keywords: [] });
  }
  res.status(200).json({ keywords: trendingKeywords });
}
