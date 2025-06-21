import type { NextApiRequest, NextApiResponse } from 'next';
import {
  updateProduct,
  deleteProduct,
  loadAndIndexProducts,
} from '../../../../lib/products';
import { getProductById, getDb } from '../../../../lib/db';
import { hasOrdersForProduct } from '../../../../lib/orders';
import { handleApiError } from '../../../../lib/utils/handleApiError';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: 'id required' });

    if (req.method === 'PUT') {
      const existing = await getProductById(String(id));
      if (!existing) return res.status(404).json({ message: 'Not found' });
      const {
        title,
        sku,
        vendor,
        description,
        product_type,
        tags,
        category,
        quantity,
        min_price,
        max_price,
        currency,
      } = req.body || {};
      const db = getDb();
      if (sku && sku !== existing.sku) {
        const exists = await db.product.findUnique({ where: { sku } });
        if (exists)
          return res.status(400).json({ message: 'sku must be unique' });
      }
      await updateProduct({
        id: String(id),
        title: title ?? existing.title,
        vendor: vendor ?? existing.vendor,
        description: description ?? existing.description,
        product_type: product_type ?? existing.product_type,
        tags: tags ?? existing.tags,
        category: category ?? existing.category,
        quantity:
          typeof quantity !== 'undefined'
            ? parseInt(quantity, 10)
            : existing.quantity,
        min_price:
          typeof min_price !== 'undefined'
            ? parseFloat(min_price)
            : existing.min_price,
        max_price:
          typeof max_price !== 'undefined'
            ? parseFloat(max_price)
            : existing.max_price,
        currency: currency ?? existing.currency,
        sku: sku ?? existing.sku,
        status: existing.status,
        images: existing.images,
      });
      await loadAndIndexProducts();
      return res.status(200).json({ message: 'product updated' });
    }

    if (req.method === 'DELETE') {
      const existing = await getProductById(String(id));
      if (!existing) return res.status(404).json({ message: 'Not found' });
      if (existing.quantity > 0 || hasOrdersForProduct(String(id))) {
        return res
          .status(400)
          .json({ message: 'cannot delete product with stock or orders' });
      }
      await deleteProduct(String(id));
      await loadAndIndexProducts();
      return res.status(200).json({ message: 'product deleted' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to process product');
  }
}
