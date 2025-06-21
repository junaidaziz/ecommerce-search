import type { NextApiRequest, NextApiResponse } from 'next';
import { addProduct, loadAndIndexProducts } from '../../../../lib/products';
import { handleApiError } from '../../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../../lib/utils/getQueryParam';
import { slugify } from '../../../../lib/slugify';
import type { Product, ProductInput, ApiMessage } from '../../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Product[] | ApiMessage>
): Promise<void> {
  try {
    if (req.method === 'GET') {
      const vendor = getQueryParam(req.query.vendor);
      if (!vendor) return res.status(400).json({ message: 'vendor required' });
      const { products } = await loadAndIndexProducts();
      const filtered = products.filter((p) => p.vendor.brandName === vendor);
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
    const payload: ProductInput = {
      sku,
      title,
      slug: slugify(title || String(id)),
      uuid: String(id),
      vendor: { email: '', brandName: vendor },
      description,
      productType: product_type,
      tags,
      category: { name: category, slug: '' },
      quantity: quantity ? parseInt(quantity, 10) : 0,
      minPrice: parseFloat(min_price || '0'),
      maxPrice: parseFloat(max_price || '0'),
      currency: currency || 'USD',
      status: 'approved',
      images: [],
    };
    await addProduct(payload);
      await loadAndIndexProducts();
      return res.status(201).json({ message: 'product created' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage products');
  }
}
