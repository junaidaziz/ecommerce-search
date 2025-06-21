import type { NextApiRequest, NextApiResponse } from 'next';
import { addProduct, loadAndIndexProducts } from '../../../../lib/products';
import { handleApiError } from '../../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../../lib/utils/getQueryParam';
import type { Product, ApiMessage } from '../../../../types';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Product[] | ApiMessage>
): Promise<void> {
  try {
    if (req.method === 'GET') {
      const vendor = getQueryParam(req.query.vendor);
      if (!vendor) return res.status(400).json({ message: 'vendor required' });
      const { products } = await loadAndIndexProducts();
      const filtered = products.filter((p) => p.VENDOR === vendor);
      return res.status(200).json(filtered);
    }

    if (req.method === 'POST') {
      const {
        id,
        sku,
        title,
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
    if (!id || !sku || !title || !vendor) {
      return res.status(400).json({ message: 'id, sku, title, vendor required' });
    }
    await addProduct({
      id: String(id),
      slug: slugify(title || String(id)),
      sku,
      title,
      vendor,
      description,
      product_type,
      tags,
      category,
      quantity: quantity ? parseInt(quantity, 10) : 0,
      min_price: parseFloat(min_price || 0),
      max_price: parseFloat(max_price || 0),
      currency: currency || 'USD',
      status: 'approved',
      images: JSON.stringify([]),
      });
      await loadAndIndexProducts();
      return res.status(201).json({ message: 'product created' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage products');
  }
}
