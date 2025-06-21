import type { NextApiRequest, NextApiResponse } from 'next';
import { getBestSellingProducts } from '../../lib/orders';
import { getDb } from '../../lib/db';
import type { Product } from '../../types/product';
import type { SearchApiResponse, ApiMessage } from '../../types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import client from '../../lib/typesenseClient';
import { handleApiError } from '../../lib/utils/handleApiError';
import { getQueryParam } from '../../lib/utils/getQueryParam';

interface SearchParams {
  q: string;
  query_by: string;
  highlight_fields: string;
  highlight_start_tag: string;
  highlight_end_tag: string;
  page: number;
  per_page: number;
  facet_by: string;
  max_facet_values: number;
  filter_by?: string;
  sort_by?: string;
}

interface TypesenseHit {
  document: Product;
  highlights: unknown[];
}

interface FacetCount {
  field_name: string;
  counts: { value: string }[];
}

function buildSort(sort?: string) {
  switch (sort) {
    case 'price_asc':
      return 'price:asc';
    case 'price_desc':
      return 'price:desc';
    case 'date_desc':
    case 'date_asc':
      // Deprecated: createdAt field not indexed in Typesense
      return undefined;
    default:
      return undefined;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchApiResponse | ApiMessage>
): Promise<void> {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const db = getDb();
  const session = await getServerSession(req, res, authOptions);
  let userId: number | null = null;
  if (session?.user?.email) {
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (user) userId = user.id;
  }

  const q = getQueryParam(req.query.q) ?? '';
  const category = getQueryParam(req.query.category);
  const brand = getQueryParam(req.query.brand);
  const minPrice = getQueryParam(req.query.minPrice);
  const maxPrice = getQueryParam(req.query.maxPrice);
  const sort = getQueryParam(req.query.sort);
  const page = getQueryParam(req.query.page) ?? '1';
  const perPage = getQueryParam(req.query.perPage) ?? '20';

  const searchParams: SearchParams = {
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
      for (const facet of result.facet_counts as FacetCount[]) {
        if (facet.field_name === 'brand') {
          brands.push(...facet.counts.map((c) => c.value));
        }
        if (facet.field_name === 'category') {
          categories.push(...facet.counts.map((c) => c.value));
        }
      }
    }
    const fallback = result.found === 0 ? await getBestSellingProducts(8) : [];
    try {
      await db.searchLog.create({
        data: {
          query: String(q),
          user: userId ? { connect: { id: userId } } : undefined,
          noResults: result.found === 0,
        },
      });
    } catch (e) {
      console.error('failed to log search', e);
    }
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
    return handleApiError(res, err, 'Search failed');
  }
}
