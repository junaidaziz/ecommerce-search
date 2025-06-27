import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '@lib/db';
import { hasOrdersForProduct } from '@lib/orders';
import formidable, { type Fields, type Files, type File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { withRole } from '@lib/withRole';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import { slugify } from '@lib/slugify';
import { Product, ApiMessage, Variant } from '../../../types';
import { mapDbRowToProduct } from '@lib/products';

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
  req: NextApiRequest,
  res: NextApiResponse<Product[] | ApiMessage>
): Promise<void> {
  try {
    const db = getDb();

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
          variantList = typeof variants === 'string' ? JSON.parse(variants) : (variants as any);
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
      const destDir = path.join(process.cwd(), 'public', 'uploads', String(id));
      fs.mkdirSync(destDir, { recursive: true });
      const imagePaths: string[] = [];
      for (const file of photos) {
        const name = Date.now() + '-' + file.originalFilename;
        const destPath = path.join(destDir, name);
        fs.renameSync(file.filepath, destPath);
        imagePaths.push(`/uploads/${id}/${name}`);
      }
      let existing = null;
      if (req.method === 'PUT') {
        existing = await db.product.findUnique({ where: { id: Number(id) } });
        if (!existing) {
          res.status(404).json({ message: 'Not found' });
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
        res.status(400).json({ message: 'uuid required' });
        return;
      }
      const existing = await db.product.findUnique({ where: { uuid } });
      if (!existing) {
        res.status(404).json({ message: 'Not found' });
        return;
      }
      if (existing.quantity > 0 || (await hasOrdersForProduct(String(uuid)))) {
        res
          .status(400)
          .json({ message: 'cannot delete product with stock or orders' });
        return;
      }
      await db.product.delete({ where: { uuid } });
      res.status(200).json({ message: 'Product deleted' });
      return;
    }

    if (req.method === 'GET') {
      const vendor = getQueryParam(req.query.vendor);
      const where: Record<string, unknown> = {};
      if (vendor) where.vendor = { brandName: vendor };
      const rows = await db.product.findMany({
        where,
        include: { category: true, vendor: true, variants: true },
      });
      const data: Product[] = rows.map((p) => mapDbRowToProduct(p));
      res.status(200).json(data);
      return;
    }

    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  } catch (error) {
    handleApiError(res, error, 'Failed to process product');
  }
}

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
