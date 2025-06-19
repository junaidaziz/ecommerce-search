import Typesense from 'typesense';
import dotenv from 'dotenv';
import { getAllFromDb } from '../lib/db';
import { mapDbRowToProduct } from '../lib/products';
import { productsSchema } from './typesense-schema';

dotenv.config();

function createClient() {
  return new Typesense.Client({
    nodes: [
      {
        host: process.env.TYPESENSE_HOST || 'localhost',
        port: Number(process.env.TYPESENSE_PORT || 8108),
        protocol: process.env.TYPESENSE_PROTOCOL || 'http',
      },
    ],
    apiKey: process.env.TYPESENSE_API_KEY || '',
    connectionTimeoutSeconds: 5,
  });
}

async function ensureCollection(client: Typesense.Client) {
  try {
    await client.collections('products').retrieve();
  } catch (_) {
    await client.collections().create(productsSchema);
  }
}

async function run() {
  const client = createClient();
  await ensureCollection(client);
  const rows = getAllFromDb();
  for (const row of rows) {
    const p = mapDbRowToProduct(row);
    const doc = {
      id: String(p.ID),
      title: p.TITLE,
      description: p.DESCRIPTION_TEXT || '',
      category: p.CATEGORY || '',
      price: parseFloat(String(p.MIN_PRICE)) || 0,
      brand: p.VENDOR || '',
      status: p.STATUS || 'approved',
      createdAt: Date.now(),
    };
    try {
      await client.collections('products').documents().upsert(doc);
    } catch (err) {
      console.error('Failed to index product', doc.id, err);
    }
  }
  console.log('Indexing completed');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
