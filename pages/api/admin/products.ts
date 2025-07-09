import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import { withRole } from '@lib/withRole';
import { getDb } from '@lib/db';
import { uploadFileToS3 } from '@lib/s3';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import { slugify } from '@lib/slugify';
import { Product, ApiMessage, Variant, USER_ROLES } from '@/types';
import { mapDbRowToProduct } from '@lib/products';
import {
  METHOD_NOT_ALLOWED,
  NOT_FOUND,
  UUID_REQUIRED,
  CANNOT_DELETE_PRODUCT_WITH_ORDERS,
} from '@/constants/messages';
import { hasOrdersForProduct } from '@lib/orders';

export interface AuthedNextApiRequest extends NextApiRequest {
  user?: any;
}

interface ProductsListResponse {
  products: Product[];
  total: number;
}

function parseBody(
  req: NextApiRequest
): Promise<{ fields: any; files: any }> {
  return new Promise((resolve, reject) => {
    formidable().parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

async function handler(
  req: AuthedNextApiRequest,
  res: NextApiResponse<Product[] | ProductsListResponse | ApiMessage>
): Promise<void> {
  try {
    const db = getDb();
    const user = req.user;
    if (user?.role !== USER_ROLES.SUPER_ADMIN && !user?.brandId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const { fields, files } = await parseBody(req);
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
        variants,
      } = fields as Record<string, unknown>;

      let variantList: Variant[] = [];
      if (variants) {
        try {
          variantList =
            typeof variants === 'string'
              ? JSON.parse(variants)
              : (variants as any);
          if (!Array.isArray(variantList)) variantList = [];
        } catch {
          variantList = [];
        }
      }

      const seen = new Set<string>();
      variantList = variantList.filter((v) => {
        const key = JSON.stringify(v.attributes);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (!id || !title || !sku) {
        res.status(400).json({ message: 'id, sku and title are required' });
        return;
      }
      const photos: File[] = files.photos
        ? Array.isArray(files.photos)
          ? (files.photos as File[])
          : [files.photos as File]
        : [];
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
      let existing = null;
      if (req.method === 'PUT') {
        existing = await db.product.findUnique({ where: { id: Number(id) } });
        if (!existing) {
          res.status(404).json({ message: NOT_FOUND });
          return;
        }
        const existingImages = existing.images
          ? JSON.parse(existing.images)
          : [];
        imagePaths.push(...existingImages);
      }
      const slug = slugify(String(title || existing?.title || id));
      const qty = quantity ? parseInt(String(quantity), 10) : 0;
      const data: Record<string, unknown> = {
        id: Number(id),
        slug,
        sku,
        title,
        description: description || '',
        productType: product_type || '',
        tags: tags || '',
        quantity: qty,
        minPrice: parseFloat(String(min_price || 0)),
        maxPrice: parseFloat(String(max_price || 0)),
        currency: (currency as string) || 'USD',
        status: 'approved',
        images: JSON.stringify(imagePaths),
      };

      if (vendor) {
        const vid = parseInt(String(vendor), 10);
        if (!isNaN(vid)) data.vendorId = vid;
        else {
          const v = await db.user.findFirst({
            where: { brandName: String(vendor) },
          });
          if (v) data.vendorId = v.id;
        }
      }

      if (category) {
        const cid = parseInt(String(category), 10);
        if (!isNaN(cid)) data.categoryId = cid;
        else {
          const c = await db.category.findFirst({
            where: { name: String(category) },
          });
          if (c) data.categoryId = c.id;
        }
      }

      if (req.method === 'POST') {
        const product = await db.product.create({ data });
        if (variantList.length > 0) {
          await db.variant.createMany({
            data: variantList.map((v) => ({
              productId: product.id,
              attributes: v.attributes,
              quantity: v.quantity || 0,
              priceModifier: v.priceModifier ?? null,
            })),
          });
        }
        res.status(201).json({ message: 'Product added' });
        return;
      }

      await db.product.update({ where: { id: Number(id) }, data });
      await db.variant.deleteMany({ where: { productId: Number(id) } });
      if (variantList.length > 0) {
        await db.variant.createMany({
          data: variantList.map((v) => ({
            productId: Number(id),
            attributes: v.attributes,
            quantity: v.quantity || 0,
            priceModifier: v.priceModifier ?? null,
          })),
        });
      }
      res.status(200).json({ message: 'Product updated' });
      return;
    }

    if (req.method === 'DELETE') {
      const uuid = getQueryParam(req.query.uuid);
      if (!uuid) {
        res.status(400).json({ message: UUID_REQUIRED });
        return;
      }
      const existing = await db.product.findUnique({ where: { uuid } });
      if (!existing) {
        res.status(404).json({ message: NOT_FOUND });
        return;
      }
      if (await hasOrdersForProduct(String(uuid))) {
        res.status(409).json({ message: CANNOT_DELETE_PRODUCT_WITH_ORDERS });
        return;
      }
      await db.product.delete({ where: { uuid } });
      res.status(200).json({ message: 'Product deleted' });
      return;
    }

    if (req.method === 'PATCH') {
      if (user?.role !== USER_ROLES.SUPER_ADMIN) {
        return res.status(403).json({ message: 'Only super admins can disable products.' });
      }
      const { id, uuid } = req.body;
      if (!id && !uuid) {
        return res.status(400).json({ message: 'Product id or uuid required.' });
      }
      const where = id ? { id: Number(id) } : { uuid };
      const product = await db.product.findFirst({ where });
      if (!product) {
        return res.status(404).json({ message: NOT_FOUND });
      }
      await db.product.update({ where, data: { status: 'DISABLED' } });
      return res.status(200).json({ message: `Product '${product.title}' disabled.` });
    }

    if (req.method === 'GET') {
      const vendor = getQueryParam(req.query.vendor);
      const page = parseInt(getQueryParam(req.query.page) || '1', 10);
      const limit = parseInt(getQueryParam(req.query.limit) || '20', 10);
      const search = getQueryParam(req.query.q);
      const sortBy = getQueryParam(req.query.sort) || 'newest';
      
      const skip = (page - 1) * limit;
      
      // Build where clause
      const where: Record<string, unknown> = {};
      if (vendor) where.vendor = { brandName: vendor };
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Build orderBy clause
      let orderBy: any = {};
      switch (sortBy) {
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'title_asc':
          orderBy = { title: 'asc' };
          break;
        case 'title_desc':
          orderBy = { title: 'desc' };
          break;
        case 'price_asc':
          orderBy = { minPrice: 'asc' };
          break;
        case 'price_desc':
          orderBy = { minPrice: 'desc' };
          break;
        case 'stock_asc':
          orderBy = { quantity: 'asc' };
          break;
        case 'stock_desc':
          orderBy = { quantity: 'desc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }

      // Get total count
      const total = await db.product.count({ where });
      
      // Get paginated results
      const rows = await db.product.findMany({
        where,
        include: { category: true, vendor: true, variants: true },
        orderBy,
        skip,
        take: limit,
      });
      
      const data: Product[] = rows.map((p: any) => mapDbRowToProduct(p));
      res.status(200).json({ products: data, total });
      return;
    }

    res.status(405).json({ message: METHOD_NOT_ALLOWED });
    return;
  } catch (error) {
    handleApiError(res, error, 'Failed to process product');
  }
}

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
