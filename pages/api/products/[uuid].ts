import type { NextApiRequest, NextApiResponse } from 'next';
import { getProductByUuid, getAverageRating } from '@lib/db';
import { mapDbRowToProduct } from '@lib/products';
import { Product, ApiMessage } from '@/types';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import { NOT_FOUND, UUID_REQUIRED } from '@/constants/messages';

export interface ProductParams {
  uuid?: string | string[];
}

export type ProductDetailResponse = Product & {
  AVERAGE_RATING: number;
  REVIEW_COUNT: number;
};

export default async function handler(
  req: NextApiRequest & { query: ProductParams },
  res: NextApiResponse<ProductDetailResponse | ApiMessage>
): Promise<void> {
  const uuid = getQueryParam(req.query.uuid);
  if (!uuid) {
    return res.status(400).json({ message: UUID_REQUIRED });
  }
  try {
    const row = await getProductByUuid(String(uuid));
    if (!row) {
      return res.status(404).json({ message: NOT_FOUND });
    }
    const product = mapDbRowToProduct(row) as Product;
    const stats = getAverageRating(String(uuid));
    res.status(200).json({
      ...product,
      AVERAGE_RATING: stats.average,
      REVIEW_COUNT: stats.count,
    });
  } catch (e) {
    return handleApiError(res, e, 'Failed to load product');
  }
}
