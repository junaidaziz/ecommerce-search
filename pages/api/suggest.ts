import type { NextApiRequest, NextApiResponse } from 'next';
import { host, port, protocol, apiKey } from '../../lib/typesenseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    return res.status(200).json(data);
  } catch (err) {
    console.error('Typesense suggest error', err);
    return res.status(500).json({ message: 'Suggest failed' });
  }
}
