import type { NextApiRequest, NextApiResponse } from 'next';
import {
  addProduct,
  loadAndIndexProducts,
  getProductsByVendorBrandName,
} from '../../../../lib/products';
import { handleApiError } from '../../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../../lib/utils/getQueryParam';
import { slugify } from '../../../../lib/slugify';
import type { Product, ProductInput, ApiMessage } from '../../../../types';
import formidable, { type Fields, type Files, type File } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseBody(
  req: NextApiRequest
): Promise<{ fields: Fields; files: Files }> {
  const type = req.headers['content-type'] || '';
  if (type.includes('application/json')) {
    const buffers: Uint8Array[] = [];
    for await (const chunk of req) buffers.push(chunk);
    const body = Buffer.concat(buffers).toString();
    return { fields: JSON.parse(body || '{}') as Fields, files: {} as Files };
  }
  return new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Product[] | ApiMessage>
): Promise<void> {
  try {
    if (req.method === 'GET') {
      const vendor = getQueryParam(req.query.vendor);
      if (!vendor) return res.status(400).json({ message: 'vendor required' });
      const products = await getProductsByVendorBrandName(vendor);
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      const { fields, files } = await parseBody(req);
      const {
        id,
        sku,
        title,
        vendor,
        description,
        product_type,
        tags,
        category_id,
        quantity,
        min_price,
        max_price,
        currency,
      } = fields as Record<string, unknown>;
      if (!id || !sku || !title || !vendor) {
        return res
          .status(400)
          .json({ message: 'id, sku, title, vendor required' });
      }
      const photos: File[] = files.photos
        ? Array.isArray(files.photos)
          ? (files.photos as File[])
          : [files.photos as File]
        : [];
      const destDir = path.join(process.cwd(), 'public', 'uploads', String(id));
      fs.mkdirSync(destDir, { recursive: true });
      const imagePaths: string[] = [];
      for (const file of photos) {
        const name = Date.now() + '-' + file.originalFilename;
        const destPath = path.join(destDir, name);
        fs.renameSync(file.filepath, destPath);
        imagePaths.push(`/uploads/${id}/${name}`);
      }
      const payload: ProductInput = {
        sku: String(sku),
        title: String(title),
        slug: slugify(String(title || id)),
        uuid: String(id),
        vendor: { email: '', brandName: String(vendor) },
        description: String(description || ''),
        productType: String(product_type || ''),
        tags: String(tags || ''),
        category: { id: parseInt(String(category_id || '0'), 10) },
        quantity: quantity ? parseInt(String(quantity), 10) : 0,
        minPrice: parseFloat(String(min_price || '0')),
        maxPrice: parseFloat(String(max_price || '0')),
        currency: String(currency || 'USD'),
        status: 'approved',
        images: imagePaths.map((p) => ({ url: p })),
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
