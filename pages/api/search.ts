import type { NextApiRequest, NextApiResponse } from 'next';
import { getBestSellingProducts } from '@lib/orders';
import { getDb } from '@lib/db';
import type { Product, ApiMessage, SearchApiResponse } from '@/types';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@pages/api/auth/[...nextauth]';
import client from '@lib/typesenseClient';
import { handleApiError } from '@utils/handleApiError';
import { getQueryParam } from '@utils/getQueryParam';
import { METHOD_NOT_ALLOWED } from '@/constants/messages';

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
  document: Product & { brand?: string; category?: string };
  highlights: unknown[];
}

interface HitResult extends Product {
  brand?: string;
  category?: string;
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
    return res.status(405).json({ message: METHOD_NOT_ALLOWED });
  }

  const db = getDb();
  const session = await getServerSession(req, res, authOptions(req, res));
  let userId: number | null = null;
  if (session?.user?.email) {
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (user) userId = user.id;
  }

  const q = getQueryParam(req.query.q) ?? '';
  const category =
    getQueryParam(req.query.filterByCategory) ??
    getQueryParam(req.query.category);
  const normalizedCategory = category?.trim().toLowerCase();
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
  if (normalizedCategory && normalizedCategory !== 'all')
    filters.push(`category:=${normalizedCategory}`);
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
    let hits: HitResult[] =
      result.hits?.map((h: any) => ({
        ...h.document,
        highlights: Array.isArray(h.highlights) ? h.highlights : [],
      })) || [];
    const brandNames = Array.from(new Set(hits.map((h) => h.brand))).filter(Boolean) as string[];
    let activeSet = new Set<string>();
    if (brandNames.length > 0) {
      const activeRows = await db.user.findMany({
        where: { role: 'BRAND', brandName: { in: brandNames }, active: true },
        select: { brandName: true },
      });
      activeSet = new Set<string>(
        (activeRows as { brandName: string | null }[]).map((r) => r.brandName || '')
      );
    }
    hits = hits.filter((h) => h.brand && activeSet.has(h.brand));
    const totalPages = Math.ceil(result.found / searchParams.per_page);
    const brands: string[] = [];
    const categories: string[] = [];
    if (Array.isArray(result.facet_counts)) {
      for (const facet of result.facet_counts as FacetCount[]) {
        if (facet.field_name === 'brand') {
          brands.push(...facet.counts.map((c) => c.value).filter((b) => activeSet.has(b)));
        }
        if (facet.field_name === 'category') {
          categories.push(...facet.counts.map((c) => c.value));
        }
      }
    }
    if (
      normalizedCategory &&
      normalizedCategory !== 'all' &&
      !categories.includes(normalizedCategory)
    ) {
      console.warn('Category filter not matched', normalizedCategory);
    }
    if (hits.length === 0) {
      console.warn('No products found for search', {
        q,
        category: normalizedCategory,
      });
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
      total: hits.length,
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
