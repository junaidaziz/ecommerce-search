import type { NextApiRequest, NextApiResponse } from 'next';
import {
  updateProduct,
  deleteProduct,
  loadAndIndexProducts,
} from '../../../../lib/products';
import { getProductByUuid } from '../../../../lib/db';
import { hasOrdersForProduct } from '../../../../lib/orders';
import { handleApiError } from '../../../../lib/utils/handleApiError';
import { getQueryParam } from '../../../../lib/utils/getQueryParam';
import type { ApiMessage, ProductInput } from '../../../../types';
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
  res: NextApiResponse<ApiMessage>
): Promise<void> {
  try {
    const uuid = getQueryParam(req.query.uuid);
    if (!uuid) return res.status(400).json({ message: 'uuid required' });

    if (req.method === 'PUT') {
      const existing = await getProductByUuid(String(uuid));
      if (!existing) return res.status(404).json({ message: 'Not found' });
      const { fields, files } = await parseBody(req);
      const {
        title,
        sku,
        vendor,
        description,
        product_type,
        tags,
        category_id,
        quantity,
        min_price,
        max_price,
        currency,
        discount_type,
        discount_value,
      } = fields as Record<string, unknown>;

      const parsedDiscountType =
        discount_type && String(discount_type) !== 'none'
          ? (String(discount_type) as 'percentage' | 'fixed')
          : null;
      const parsedDiscountValue =
        discount_value && String(discount_value) !== ''
          ? parseFloat(String(discount_value))
          : null;
      if (parsedDiscountType === 'percentage') {
        if (
          parsedDiscountValue === null ||
          parsedDiscountValue < 1 ||
          parsedDiscountValue > 99
        ) {
          return res
            .status(400)
            .json({ message: 'Percentage discount must be between 1 and 99' });
        }
      }
      if (parsedDiscountType === 'fixed') {
        const basePrice =
          typeof min_price !== 'undefined'
            ? parseFloat(String(min_price))
            : existing.min_price;
        if (parsedDiscountValue === null || parsedDiscountValue >= basePrice) {
          return res.status(400).json({
            message: 'Fixed discount must be less than product price',
          });
        }
      }
      const photos: File[] = files.photos
        ? Array.isArray(files.photos)
          ? (files.photos as File[])
          : [files.photos as File]
        : [];
      const destDir = path.join(process.cwd(), 'public', 'uploads', String(uuid));
      fs.mkdirSync(destDir, { recursive: true });
      const imagePaths: string[] = [];
      for (const file of photos) {
        const name = Date.now() + '-' + file.originalFilename;
        const destPath = path.join(destDir, name);
        fs.renameSync(file.filepath, destPath);
        imagePaths.push(`/uploads/${uuid}/${name}`);
      }
      const payload: ProductInput & { id?: string } = {
        uuid: String(uuid),
        sku: String(sku ?? existing.sku),
        title: String(title ?? existing.title),
        vendor: { email: '', brandName: String(vendor ?? existing.vendor) },
        description: String(description ?? existing.description),
        productType: String(product_type ?? existing.product_type),
        tags: String(tags ?? existing.tags),
        category: {
          id: parseInt(
            String(category_id ?? (existing as any).categoryId ?? '0'),
            10
          ),
        },
        quantity:
          typeof quantity !== 'undefined'
            ? parseInt(String(quantity), 10)
            : existing.quantity,
        minPrice:
          typeof min_price !== 'undefined'
            ? parseFloat(String(min_price))
            : existing.min_price,
        maxPrice:
          typeof max_price !== 'undefined'
            ? parseFloat(String(max_price))
            : existing.max_price,
        currency: String(currency ?? existing.currency),
        discountType: parsedDiscountType ?? (existing as any).discount_type ?? null,
        discountValue:
          parsedDiscountValue !== null
            ? parsedDiscountValue
            : (existing as any).discount_value ?? null,
        status: existing.status,
        images: imagePaths.length > 0
          ? imagePaths.map((p) => ({ url: p }))
          : undefined,
      };
      await updateProduct(payload);
      await loadAndIndexProducts();
      return res.status(200).json({ message: 'product updated' });
    }

    if (req.method === 'DELETE') {
      const existing = await getProductByUuid(String(uuid));
      if (!existing) return res.status(404).json({ message: 'Not found' });
      if (existing.quantity > 0 || (await hasOrdersForProduct(String(uuid)))) {
        return res
          .status(400)
          .json({ message: 'cannot delete product with stock or orders' });
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
