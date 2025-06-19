import type { NextApiRequest, NextApiResponse } from 'next';
import Typesense from 'typesense';
import { getBestSellingProducts } from '../../lib/orders';

const client = new Typesense.Client({
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

function buildSort(sort?: string) {
  switch (sort) {
    case 'price_asc':
      return 'price:asc';
    case 'price_desc':
      return 'price:desc';
    case 'date_desc':
      return 'createdAt:desc';
    case 'date_asc':
      return 'createdAt:asc';
    default:
      return undefined;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const {
    q = '',
    category,
    brand,
    minPrice,
    maxPrice,
    sort,
    page = '1',
    perPage = '20',
  } = req.query as { [key: string]: string };

  const searchParams: Record<string, any> = {
    q: q || '*',
    query_by: 'title,description',
    highlight_fields: 'title,description',
    highlight_start_tag: '<mark class="bg-yellow-200 font-bold">',
    highlight_end_tag: '</mark>',
    page: parseInt(page, 10),
    per_page: parseInt(perPage, 10),
    facet_by: 'brand,category',
    max_facet_values: 250,
  };

  const filters: string[] = [];
  if (category && category !== 'All') filters.push(`category:=${category}`);
  if (brand && brand !== 'All') filters.push(`brand:=${brand}`);
  if (minPrice) filters.push(`price:>=${minPrice}`);
  if (maxPrice) filters.push(`price:<=${maxPrice}`);
  if (filters.length) searchParams.filter_by = filters.join(' && ');

  const sortBy = buildSort(sort);
  if (sortBy) searchParams.sort_by = sortBy;

  try {
    const result = await client
      .collections('products')
      .documents()
      .search(searchParams);
    const hits =
      result.hits?.map((h: any) => ({
        ...h.document,
        highlights: h.highlights,
      })) || [];
    const totalPages = Math.ceil(result.found / searchParams.per_page);
    const brands: string[] = [];
    const categories: string[] = [];
    if (Array.isArray(result.facet_counts)) {
      for (const facet of result.facet_counts) {
        if (facet.field_name === 'brand') {
          brands.push(...facet.counts.map((c: any) => c.value));
        }
        if (facet.field_name === 'category') {
          categories.push(...facet.counts.map((c: any) => c.value));
        }
      }
    }
    const fallback = result.found === 0 ? getBestSellingProducts(8) : [];
    return res.status(200).json({
      results: hits,
      total: result.found,
      page: searchParams.page,
      totalPages,
      brands,
      categories,
      fallback,
    });
  } catch (err) {
    console.error('Typesense search error', err);
    return res.status(500).json({ message: 'Search failed' });
  }
}
