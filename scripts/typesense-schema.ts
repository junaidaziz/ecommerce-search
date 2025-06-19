export const productsSchema = {
  name: 'products',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'slug', type: 'string' },
    { name: 'description', type: 'string' },
    { name: 'price', type: 'float' },
    { name: 'category', type: 'string', facet: true },
    { name: 'brand', type: 'string', facet: true },
    { name: 'sold_count', type: 'int32' },
  ],
  default_sorting_field: 'sold_count',
};
