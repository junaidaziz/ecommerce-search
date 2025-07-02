import type { NextApiRequest, NextApiResponse } from 'next';
import { handleApiError } from '@utils/handleApiError';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const input = String(req.query.input || '').trim();
    if (!input) return res.status(400).json({ message: 'input required' });
    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key) return res.status(500).json({ message: 'api key not set' });
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${key}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`status ${resp.status}`);
    const data = await resp.json();
    return res.status(200).json(data);
  } catch (e) {
    console.error('Address autocomplete error:', e);
    return res.status(200).json({ predictions: [] });
  }
}
