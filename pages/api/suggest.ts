import type { NextApiRequest, NextApiResponse } from 'next';
import client from '../../lib/typesenseClient';
import { handleApiError } from '../../lib/utils/handleApiError';
import { ObjectNotFound } from 'typesense/lib/Typesense/Errors';
import type { SuggestionsResponse, ApiMessage } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuggestionsResponse | ApiMessage>
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { q = '' } = req.query as { q?: string };
  const query = Array.isArray(q) ? q[0] : q;

  if (!query.trim()) {
    return res.status(200).json({ suggestions: [] });
  }

  try {
    const result = await client
      .collections('products')
      .documents()
      .search({
        q: query,
        query_by: 'title,description',
        prefix: 'true',
        page: 1,
        per_page: 5,
      });

    const suggestions = Array.isArray(result.hits)
      ? result.hits.map((h: any) => h.document.title).filter(Boolean)
      : [];
    return res.status(200).json({ suggestions });
  } catch (err) {
    if (err instanceof ObjectNotFound) {
      console.error('Typesense collection "products" not found');
      return res.status(500).json({ message: 'Search index missing' });
    }
    console.error('Typesense suggest error', err);
    return handleApiError(res, err, 'Suggest failed');
  }
}
