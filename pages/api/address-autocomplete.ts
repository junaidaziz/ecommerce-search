import type { NextApiRequest, NextApiResponse } from 'next';
import { handleApiError } from '../../lib/utils/handleApiError';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const input = (req.query.input as string) || '';
    if (!input) return res.status(400).json({ message: 'input required' });
    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key) return res.status(500).json({ message: 'api key not set' });
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${key}`;
    const resp = await fetch(url);
    const data = await resp.json();
    return res.status(200).json(data);
  } catch (e) {
    return handleApiError(res, e, 'autocomplete error');
  }
}
