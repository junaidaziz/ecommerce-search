import dotenv from 'dotenv';
import Typesense from 'typesense';
import { ObjectNotFound } from 'typesense/lib/Typesense/Errors';

dotenv.config();

const host = process.env.TYPESENSE_HOST;
const port = Number(process.env.TYPESENSE_PORT);
const protocol = process.env.TYPESENSE_PROTOCOL as 'http' | 'https';
const apiKey = process.env.TYPESENSE_API_KEY;

if (!host || !port || !protocol || !apiKey) {
  console.error('❌ Missing Typesense configuration in environment variables.');
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
    { name: 'id', type: 'string' as const },
    { name: 'title', type: 'string' as const },
    { name: 'name', type: 'string' as const },
    { name: 'slug', type: 'string' as const },
    { name: 'description', type: 'string' as const },
    { name: 'price', type: 'float' as const },
    { name: 'category', type: 'string' as const, facet: true },
    { name: 'brand', type: 'string' as const, facet: true },
    { name: 'sold_count', type: 'int32' as const },
  ],
  default_sorting_field: 'sold_count',
};

async function init() {
  try {
    const existing = await client.collections('products').retrieve();
    const fieldsMatch =
      existing.fields?.length === schema.fields.length &&
      existing.fields.every((f, i) => {
        const s = schema.fields[i];
        return (
          f.name === s.name && f.type === s.type && !!f.facet === !!s.facet
        );
      }) &&
      existing.default_sorting_field === schema.default_sorting_field;

    if (fieldsMatch) {
      console.log('✅ Typesense collection "products" already up-to-date.');
      return;
    }

    console.log('ℹ️  Schema mismatch detected. Recreating collection...');
    await client.collections('products').delete();
    await client.collections().create(schema);
    console.log('✅ Recreated Typesense collection "products".');
  } catch (err: unknown) {
    if (err instanceof ObjectNotFound) {
      console.log(
        'ℹ️  "products" collection not found. Creating new collection...'
      );
      try {
        await client.collections().create(schema);
        console.log('✅ Created Typesense collection "products".');
      } catch (createErr) {
        console.error('❌ Failed to create collection:', createErr);
        process.exit(1);
      }
    } else {
      console.error(
        '❌ Unexpected error checking for existing collection:',
        err
      );
      process.exit(1);
    }
  }
}

void init();
