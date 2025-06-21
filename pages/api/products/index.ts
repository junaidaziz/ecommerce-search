import type { NextApiRequest, NextApiResponse } from 'next';
import { getProductsByCategorySlug } from '../../../lib/products';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../lib/utils/getQueryParam';
import type { Product } from '../../../types/product';
import type { ApiMessage } from '../../../types';

export interface ProductsQuery {
  categorySlug?: string | string[];
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
  try {
    const products = slug ? await getProductsByCategorySlug(slug) : [];
    return res.status(200).json({ products });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load products');
  }
}
