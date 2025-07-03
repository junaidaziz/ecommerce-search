import type { NextApiRequest, NextApiResponse } from 'next';
import { SearchAnalyticsResponse, ApiMessage } from '../@/types';
import { getDb } from '@lib/db';
import { withRole } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { METHOD_NOT_ALLOWED } from '@/constants/messages';

interface SearchLog {
  query: string;
  noResults: boolean;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchAnalyticsResponse | ApiMessage>
): Promise<void> {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ message: METHOD_NOT_ALLOWED });
      return;
    }

    const db = getDb();
    const logs: SearchLog[] = await db.searchLog.findMany();
    const counts: Record<string, number> = {};
    const fails: Record<string, number> = {};
    for (const log of logs) {
      counts[log.query] = (counts[log.query] ?? 0) + 1;
      if (log.noResults) {
        fails[log.query] = (fails[log.query] ?? 0) + 1;
      }
    }
    const topSearches = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query, count]): { query: string; count: number } => ({
        query,
        count,
      }));
    const failedSearches = Object.entries(fails)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query, count]): { query: string; count: number } => ({
        query,
        count,
      }));

    res.status(200).json({ topSearches, failedSearches });
    return;
  } catch (error) {
    handleApiError(res, error, 'Failed to load analytics');
  }
}

export default withRole(['SUPER_ADMIN'])(handler);
