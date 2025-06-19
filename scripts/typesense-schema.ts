export const productsSchema = {
  name: 'products',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'description', type: 'string' },
    { name: 'category', type: 'string', facet: true },
    { name: 'price', type: 'float', facet: true },
    { name: 'brand', type: 'string', facet: true },
    { name: 'status', type: 'string', facet: true },
    { name: 'createdAt', type: 'int64' },
  ],
  default_sorting_field: 'price',
};
