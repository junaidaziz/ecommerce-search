import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withRole } from '../../../lib/withRole';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const logs = await prisma.searchLog.findMany();
  const counts: Record<string, number> = {};
  const fails: Record<string, number> = {};
  for (const log of logs) {
    counts[log.query] = (counts[log.query] || 0) + 1;
    if (log.noResults) {
      fails[log.query] = (fails[log.query] || 0) + 1;
    }
  }
  const topSearches = Object.entries(counts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));
  const failedSearches = Object.entries(fails)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));

  return res.status(200).json({ topSearches, failedSearches });
}

export default withRole(['SUPER_ADMIN'])(handler);
