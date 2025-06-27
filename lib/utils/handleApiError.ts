import type { NextApiResponse } from 'next';

export const ERROR_MESSAGES = {
  MISSING_ZIP_CODE: 'shipping zip code required',
} as const;

export function handleApiError(
  res: NextApiResponse,
  error: unknown,
  defaultMessage = 'Unexpected server error'
) {
  console.error('API Error:', error);
  if (error instanceof Error && 'code' in error) {
    return res.status(400).json({ error: (error as Error).message });
  }
  return res.status(500).json({ error: defaultMessage });
}
