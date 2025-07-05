import type { NextApiRequest, NextApiResponse } from 'next';
import {
  addProduct,
  loadAndIndexProducts,
  mapDbRowToProduct,
} from '@lib/products';
import { handleApiError } from '@utils/handleApiError';
import { slugify } from '@lib/slugify';
import type { Product, ProductInput, ApiMessage } from '@/types';
import formidable, { type Fields, type Files, type File } from 'formidable';
import { uploadFileToS3 } from '@lib/s3';
import path from 'path';
import { withRole, type AuthedNextApiRequest } from '@lib/withRole';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { getDb } from '@lib/db';
import {
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
  PERCENTAGE_DISCOUNT_BETWEEN_1_AND_99,
} from '@/constants/messages';
import { UserRole } from '@/types';

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
      if (
        !session?.user ||
        (session.user.role !== 'BRAND' && session.user.role !== UserRole.SUPER_ADMIN)
      ) {
        return res.status(401).json({ message: UNAUTHORIZED });
      }

      const db = getDb();
      const page = parseInt(String((req.query.page as string) || '1'), 10);
      const limit = parseInt(String((req.query.limit as string) || '20'), 10);
      const skip = (page - 1) * limit;

      const sortParam = String((req.query.sort as string) || 'title_asc');
      const orderBy = (() => {
        switch (sortParam) {
          case 'title_desc':
            return { title: 'desc' } as const;
          case 'category_asc':
            return { category: { name: 'asc' } } as const;
          case 'category_desc':
            return { category: { name: 'desc' } } as const;
          case 'status_asc':
            return { status: 'asc' } as const;
          case 'status_desc':
            return { status: 'desc' } as const;
          case 'quantity_desc':
            return { quantity: 'desc' } as const;
          case 'quantity_asc':
            return { quantity: 'asc' } as const;
          default:
            return { title: 'asc' } as const;
        }
      })();

      const vendorId = (session.user as { brandId?: number }).brandId;
      if (!vendorId) {
        console.warn('Missing brandId for brand user', session.user);
        return res.status(400).json({ message: 'Invalid session data' });
      }

      const search = String((req.query.search as string) || '');
      const category = String((req.query.category as string) || '');
      const minQty = String((req.query.minQty as string) || '');
      const maxQty = String((req.query.maxQty as string) || '');

      const where: any = { vendorId };
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (category) {
        where.category = { slug: category };
      }
      const qtyFilter: any = {};
      if (minQty) qtyFilter.gte = parseInt(minQty, 10);
      if (maxQty) qtyFilter.lte = parseInt(maxQty, 10);
      if (Object.keys(qtyFilter).length) {
        where.quantity = qtyFilter;
      }

      const [rows, total] = await Promise.all([
        db.product.findMany({
          where,
          include: { category: true, vendor: true },
          orderBy,
          take: limit,
          skip,
        }),
        db.product.count({ where }),
      ]);

      const products = rows.map((row: any) => mapDbRowToProduct(row));

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
            .json({ message: PERCENTAGE_DISCOUNT_BETWEEN_1_AND_99 });
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

      const imagePaths: string[] = [];
      for (const file of photos) {
        const name = Date.now() + '-' + (file.originalFilename || 'image');
        const key = `products/${id}/${name}`;
        const url = await uploadFileToS3(
          file.filepath,
          key,
          file.mimetype || undefined
        );
        imagePaths.push(url);
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
        category: {
          id: parseInt(String(category_id || '0'), 10),
          name: '',
          slug: ''
        },
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

    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  } catch (error) {
    return handleApiError(res, error, 'Failed to manage products');
  }
}

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
