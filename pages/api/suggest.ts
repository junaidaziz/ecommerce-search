import type { NextApiRequest, NextApiResponse } from 'next';
import { host, port, protocol, apiKey } from '../../lib/typesenseClient';
import { handleApiError } from '../../lib/utils/handleApiError';
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

  const url = `${protocol}://${host}:${port}/collections/products/documents/suggest?q=${encodeURIComponent(query)}&query_by=title,description&num_suggestions=5`;

  try {
    const resp = await fetch(url, {
      headers: { 'X-TYPESENSE-API-KEY': apiKey },
    });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }
    const data = await resp.json();
    const suggestions = Array.isArray(data.suggestions)
      ? data.suggestions.map((s: any) =>
          typeof s === 'string' ? s : s.text
        )
      : [];
    return res.status(200).json({ suggestions });
  } catch (err) {
    console.error('Typesense suggest error', err);
    return handleApiError(res, err, 'Suggest failed');
  }
}
