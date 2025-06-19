import dotenv from 'dotenv';
import Typesense from 'typesense';

dotenv.config();

const host = process.env.TYPESENSE_HOST;
const port = Number(process.env.TYPESENSE_PORT);
const protocol = process.env.TYPESENSE_PROTOCOL as 'http' | 'https' | undefined;
const apiKey = process.env.TYPESENSE_API_KEY;

if (!host || !port || !protocol || !apiKey) {
  console.error('Missing Typesense configuration in environment variables.');
  process.exit(1);
}

const client = new Typesense.Client({
  nodes: [{ host, port, protocol }],
  apiKey,
  connectionTimeoutSeconds: 5,
});

const schema = {
  name: 'products',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'slug', type: 'string' },
    { name: 'description', type: 'string' },
    { name: 'price', type: 'float' },
    { name: 'category', type: 'string', facet: true },
    { name: 'sold_count', type: 'int32' },
  ],
  default_sorting_field: 'sold_count',
};

async function init() {
  try {
    await client.collections('products').retrieve();
    console.log('Typesense collection "products" already exists, skipping');
  } catch (err: any) {
    if (err && err.httpStatus === 404) {
      try {
        await client.collections().create(schema);
        console.log('Created Typesense collection "products"');
      } catch (createErr) {
        console.error('Failed to create collection', createErr);
        process.exit(1);
      }
    } else {
      console.error('Failed to check existing collection', err);
      process.exit(1);
    }
  }
}

void init();
