import type { NextApiRequest, NextApiResponse } from 'next';
import { loadAndIndexProducts } from '@lib/products';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import type { Product, ApiMessage } from '../@/types';
import { VENDOR_REQUIRED } from '@/constants/messages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Product[] | ApiMessage>
): Promise<void> {
  try {
    const vendor = getQueryParam(req.query.vendor);
    if (!vendor) return res.status(400).json({ message: VENDOR_REQUIRED });
    const { products } = await loadAndIndexProducts();
    const low = products.filter(
      (p) => p.vendor.brandName === vendor && (p.totalInventory ?? 0) <= 5
    );
    res.status(200).json(low);
  } catch (error) {
    return handleApiError(res, error, 'Failed to fetch low stock products');
  }
}
