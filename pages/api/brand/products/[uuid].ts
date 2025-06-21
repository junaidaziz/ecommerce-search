import type { NextApiRequest, NextApiResponse } from 'next';
import { updateProduct, deleteProduct, loadAndIndexProducts } from '../../../../lib/products';
import { getProductByUuid } from '../../../../lib/db';
import { hasOrdersForProduct } from '../../../../lib/orders';
import { handleApiError } from '../../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../../lib/utils/getQueryParam';
import type { ApiMessage } from '../../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  try {
    const uuid = getQueryParam(req.query.uuid);
    if (!uuid) return res.status(400).json({ message: 'uuid required' });

    if (req.method === 'PUT') {
      const existing = await getProductByUuid(String(uuid));
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
    await updateProduct({
      id: String(uuid),
      sku: sku ?? existing.sku,
      title: title ?? existing.title,
      vendor: vendor ?? existing.vendor,
      description: description ?? existing.description,
      product_type: product_type ?? existing.product_type,
      tags: tags ?? existing.tags,
      category: category ?? existing.category,
      quantity:
        typeof quantity !== 'undefined' ? parseInt(quantity, 10) : existing.quantity,
      min_price: typeof min_price !== 'undefined' ? parseFloat(min_price) : existing.min_price,
      max_price: typeof max_price !== 'undefined' ? parseFloat(max_price) : existing.max_price,
      currency: currency ?? existing.currency,
      status: existing.status,
      images: existing.images,
    });
      await loadAndIndexProducts();
      return res.status(200).json({ message: 'product updated' });
    }

    if (req.method === 'DELETE') {
      const existing = await getProductByUuid(String(uuid));
      if (!existing) return res.status(404).json({ message: 'Not found' });
      if (existing.quantity > 0 || hasOrdersForProduct(String(uuid))) {
        return res.status(400).json({ message: 'cannot delete product with stock or orders' });
      }
      await deleteProduct(String(uuid));
      await loadAndIndexProducts();
      return res.status(200).json({ message: 'product deleted' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to process product');
  }
}
