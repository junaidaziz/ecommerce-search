import type { NextApiResponse } from 'next';
import {
  addProduct,
  loadAndIndexProducts,
  mapDbRowToProduct,
} from '../../../../lib/products';
import { handleApiError } from '../../../../lib/utils/handleApiError';
import { slugify } from '../../../../lib/slugify';
import type { Product, ProductInput, ApiMessage } from '../../../../types';
import formidable, { type Fields, type Files, type File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { withRole, type AuthedNextApiRequest } from '../../../../lib/withRole';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { getDb } from '../../../../lib/db';

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

async function handler(
  req: AuthedNextApiRequest,
  res: NextApiResponse<{ products: Product[]; total: number } | ApiMessage>
): Promise<void> {
  try {
    if (req.method === 'GET') {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user || session.user.role !== 'BRAND') {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const db = getDb();
      const page = parseInt(String((req.query.page as string) || '1'), 10);
      const limit = parseInt(String((req.query.limit as string) || '20'), 10);
      const skip = (page - 1) * limit;

      const brandId = (session.user as { brandId?: number }).brandId;
      const [rows, total] = await Promise.all([
        db.product.findMany({
          where: { brandId: brandId },
          include: { category: true, vendor: true },
          orderBy: { id: 'asc' },
          take: limit,
          skip,
        }),
        db.product.count({ where: { brandId: brandId } }),
      ]);

      const products = rows.map((row) => mapDbRowToProduct(row));

      return res.status(200).json({ products, total });
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
        discount_type,
        discount_value,
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
        const basePrice = parseFloat(String(min_price || '0'));
        if (parsedDiscountValue === null || parsedDiscountValue >= basePrice) {
          return res.status(400).json({
            message: 'Fixed discount must be less than product price',
          });
        }
      }

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
        discountType: parsedDiscountType,
        discountValue: parsedDiscountValue,
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

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
