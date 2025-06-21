import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { hasOrdersForProduct } from '../../../lib/orders';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { withRole } from '../../../lib/withRole';
import { handleApiError } from '../../../lib/utils/handleApiError';
import { Product, ApiMessage } from '../../../types';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseBody(req: NextApiRequest) {
  const type = req.headers['content-type'] || '';
  if (type.includes('application/json')) {
    const buffers: Uint8Array[] = [];
    for await (const chunk of req) buffers.push(chunk);
    const body = Buffer.concat(buffers).toString();
    return { fields: JSON.parse(body || '{}'), files: {} } as {
      fields: Record<string, any>;
      files: formidable.Files;
    };
  }
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
    (resolve, reject) => {
      const form = formidable({ multiples: true });
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    }
  );
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Product[] | ApiMessage>
) {
  try {
    const db = getDb();

    if (req.method === 'POST' || req.method === 'PUT') {
      const { fields, files } = await parseBody(req);
      const {
        id,
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
      } = fields as Record<string, any>;
      if (!id || !title || !sku) {
        return res
          .status(400)
          .json({ message: 'id, title and sku are required' });
      }
      const photos = files.photos
        ? Array.isArray(files.photos)
          ? files.photos
          : [files.photos]
        : [];
      const destDir = path.join(process.cwd(), 'public', 'uploads', String(id));
      fs.mkdirSync(destDir, { recursive: true });
      const imagePaths = [];
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
          return res.status(404).json({ message: 'Not found' });
        }
        const existingImages = existing.images
          ? JSON.parse(existing.images)
          : [];
        imagePaths.push(...existingImages);
      }
      const existingSku = await db.product.findUnique({ where: { sku } });
      if (
        existingSku &&
        (req.method === 'POST' || existingSku.id !== Number(id))
      ) {
        return res.status(400).json({ message: 'sku must be unique' });
      }
      const slug = slugify(title || (existing?.title as string) || String(id));
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
        await db.product.create({ data });
        return res.status(201).json({ message: 'Product added' });
      }

      await db.product.update({ where: { id: Number(id) }, data });
      return res.status(200).json({ message: 'Product updated' });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: 'id required' });
      }
      const existing = await db.product.findUnique({
        where: { id: Number(id) },
      });
      if (!existing) {
        return res.status(404).json({ message: 'Not found' });
      }
      if (existing.quantity > 0 || (await hasOrdersForProduct(String(id)))) {
        return res
          .status(400)
          .json({ message: 'cannot delete product with stock or orders' });
      }
      await db.product.delete({ where: { id: Number(id) } });
      return res.status(200).json({ message: 'Product deleted' });
    }

    if (req.method === 'GET') {
      const { vendor } = req.query;
      const where: Record<string, unknown> = {};
      if (vendor) where.vendor = { brandName: String(vendor) };
      const rows = await db.product.findMany({
        where,
        include: { category: true, vendor: true },
      });
      const data: Product[] = rows.map((p) => ({
        ID: String(p.id),
        SLUG: p.slug,
        SKU: p.sku,
        TITLE: p.title,
        VENDOR: p.vendor?.brandName ?? String(p.vendorId),
        DESCRIPTION: p.description,
        productType: p.productType,
        tags: p.tags,
        category: p.category?.name,
        images: p.images ? JSON.parse(p.images) : [],
        totalInventory: p.quantity,
        priceRange: {
          minVariantPrice: { amount: p.minPrice, currencyCode: p.currency },
          maxVariantPrice: { amount: p.maxPrice, currencyCode: p.currency },
        },
        minPrice: p.minPrice,
        maxPrice: p.maxPrice,
        currency: p.currency,
        soldCount: 0,
        reviewCount: 0,
        averageRating: 0,
      }));
      return res.status(200).json(data);
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (error) {
    return handleApiError(res, error, 'Failed to process product');
  }
}

export default withRole(['BRAND', 'SUPER_ADMIN'])(handler);
