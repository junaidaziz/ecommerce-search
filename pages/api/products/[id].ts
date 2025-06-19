import type { NextApiRequest, NextApiResponse } from 'next';
import { getProductById, getAverageRating } from '../../../lib/db.js';
import { mapDbRowToProduct } from '../../../lib/products.js';
import { Product } from '../../../types/product';

export type ProductResponse = Product & {
  AVERAGE_RATING: number;
  REVIEW_COUNT: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProductResponse | { message: string }>
) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: 'id required' });
  }
  try {
    const row = getProductById(String(id));
    if (!row) {
      return res.status(404).json({ message: 'Not found' });
    }
    const product = mapDbRowToProduct(row) as Product;
    const stats = getAverageRating(String(id));
    res.status(200).json({
      ...product,
      AVERAGE_RATING: stats.average,
      REVIEW_COUNT: stats.count,
    });
  } catch (e) {
    res.status(500).json({ message: 'Failed to load product' });
  }
}
