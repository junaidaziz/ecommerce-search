import type { NextApiRequest, NextApiResponse } from 'next';
import { getProductsPaginated } from '../../../lib/products';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../lib/utils/getQueryParam';
import type { Product } from '../../../types/product';
import type { ApiMessage } from '../../../types';

export interface ProductsQuery {
  category?: string | string[];
  categorySlug?: string | string[];
  q?: string | string[];
  inStock?: string | string[];
  minPrice?: string | string[];
  maxPrice?: string | string[];
  page?: string | string[];
  limit?: string | string[];
  offset?: string | string[];
}

export interface ProductsResponse {
  products: Product[];
  total: number;
}

export default async function handler(
  req: NextApiRequest & { query: ProductsQuery },
  res: NextApiResponse<ProductsResponse | ApiMessage>
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const slug =
    getQueryParam(req.query.category) || getQueryParam(req.query.categorySlug);
  const limit = parseInt(getQueryParam(req.query.limit) ?? '20', 10);
  const page = parseInt(getQueryParam(req.query.page) ?? '1', 10);
  const offset = parseInt(getQueryParam(req.query.offset) ?? String((page - 1) * limit), 10);
  const q = getQueryParam(req.query.q);
  const inStock = getQueryParam(req.query.inStock) === 'true';
  const minPriceQuery = getQueryParam(req.query.minPrice);
  const maxPriceQuery = getQueryParam(req.query.maxPrice);
  const minPrice = minPriceQuery ? parseFloat(minPriceQuery) : undefined;
  const maxPrice = maxPriceQuery ? parseFloat(maxPriceQuery) : undefined;
  try {
    const result = await getProductsPaginated({
      limit,
      offset,
      categorySlug: slug || undefined,
      search: q || undefined,
      inStock,
      minPrice,
      maxPrice,
    });
    return res.status(200).json({ products: result.products, total: result.total });
  } catch (error) {
    return handleApiError(res, error, 'Failed to load products');
  }
}
