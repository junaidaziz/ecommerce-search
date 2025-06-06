import {
  addProduct,
  updateProduct,
  deleteProduct,
  loadAndIndexProducts,
} from '../../../lib/products';
import { getProductById } from '../../../lib/db.js';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method === 'POST' || req.method === 'PUT') {
    const { fields, files } = await parseForm(req);
    const {
      id,
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
    } = fields;
    if (!id || !title) {
      return res.status(400).json({ message: 'id and title are required' });
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
    if (req.method === 'PUT') {
      const existing = getProductById(String(id));
      const existingImages = existing?.images
        ? JSON.parse(existing.images)
        : [];
      imagePaths.push(...existingImages);
    }
    const productData = {
      id: String(id),
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
      images: JSON.stringify(imagePaths),
    };

    if (req.method === 'POST') {
      addProduct(productData);
    } else {
      updateProduct(productData);
    }
    await loadAndIndexProducts();
    return res
      .status(req.method === 'POST' ? 201 : 200)
      .json({
        message: req.method === 'POST' ? 'Product added' : 'Product updated',
      });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: 'id required' });
    }
    deleteProduct(String(id));
    await loadAndIndexProducts();
    return res.status(200).json({ message: 'Product deleted' });
  }

  if (req.method === 'GET') {
    const { products } = await loadAndIndexProducts();
    let filtered = products;
    if (req.query.vendor) {
      filtered = products.filter((p) => p.VENDOR === req.query.vendor);
    }
    return res.status(200).json(filtered);
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
