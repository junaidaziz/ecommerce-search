import type { NextApiRequest, NextApiResponse } from 'next';
import { loadAndIndexProducts } from '../../../lib/products';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../lib/utils/getQueryParam';
import type { Product, ApiMessage } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Product[] | ApiMessage>
): Promise<void> {
  try {
    const vendor = getQueryParam(req.query.vendor);
    if (!vendor) return res.status(400).json({ message: 'vendor required' });
    const { products } = await loadAndIndexProducts();
    const low = products.filter(
      (p) => p.VENDOR === vendor && p.TOTAL_INVENTORY <= 5
    );
    res.status(200).json(low);
  } catch (error) {
    return handleApiError(res, error, 'Failed to fetch low stock products');
  }
}
