import * as dotenv from 'dotenv';
import Typesense from 'typesense';
import { productsSchema } from './typesense-schema';

dotenv.config();

const host = process.env.TYPESENSE_HOST || 'localhost';
const port = Number(process.env.TYPESENSE_PORT || 8108);
const protocol = process.env.TYPESENSE_PROTOCOL || 'http';
const apiKey = process.env.TYPESENSE_API_KEY || '';

const client = new Typesense.Client({
  nodes: [{ host, port, protocol }],
  apiKey,
  connectionTimeoutSeconds: 5,
});

async function init() {
  try {
    await client.collections('products').retrieve();
    console.log('Typesense collection "products" already exists, skipping');
  } catch (err: any) {
    if (err?.httpStatus === 404) {
      await client.collections().create(productsSchema as any);
      console.log('Created Typesense collection "products"');
    } else {
      console.error('Failed to initialize Typesense:', err);
      process.exit(1);
    }
  }
}

void init();
