import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getProductsByCategorySlugPaginated,
  getApprovedProductsPaginated,
} from '../../../lib/products';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../lib/utils/getQueryParam';
import type { Product } from '../../../types/product';
import type { ApiMessage } from '../../../types';

export interface ProductsQuery {
  categorySlug?: string | string[];
  limit?: string | string[];
  offset?: string | string[];
}

export interface ProductsResponse {
  products: Product[];
}

export default async function handler(
  req: NextApiRequest & { query: ProductsQuery },
  res: NextApiResponse<ProductsResponse | ApiMessage>
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const slug = getQueryParam(req.query.categorySlug);
  const limit = parseInt(getQueryParam(req.query.limit) ?? '20', 10);
  const offset = parseInt(getQueryParam(req.query.offset) ?? '0', 10);
  try {
    const products = slug
      ? await getProductsByCategorySlugPaginated(slug, limit, offset)
      : await getApprovedProductsPaginated(limit, offset);
    return res.status(200).json({ products });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load products');
  }
}
