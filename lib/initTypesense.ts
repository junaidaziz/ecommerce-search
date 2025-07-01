import typesense from './typesenseClient';
import { ObjectNotFound } from 'typesense';

export async function ensureTypesenseProductCollection(): Promise<void> {
  try {
    await typesense.collections('products').retrieve();
  } catch (err) {
    if (err instanceof ObjectNotFound) {
      await typesense.collections().create({
        name: 'products',
        fields: [
          { name: 'id', type: 'string' },
          { name: 'title', type: 'string' },
          { name: 'description', type: 'string', optional: true },
          { name: 'category', type: 'string', facet: true },
          { name: 'price', type: 'float' },
          { name: 'brand', type: 'string', facet: true },
          { name: 'sold_count', type: 'int32', optional: true },
        ],
        default_sorting_field: 'price',
      });
    } else {
      throw err;
    }
  }
}
