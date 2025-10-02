import { apiFetch } from '../api';
import type { TrendingResponse, SuggestionsResponse } from '@/types';

export async function getTrending(): Promise<string[]> {
  const res = await apiFetch('/api/trending');
  if (!res.ok) return [];
  const data = await res.json() as TrendingResponse;
  return Array.isArray(data.keywords) ? data.keywords : [];
}

export async function getSuggestions(query: string): Promise<string[]> {
  const params = new URLSearchParams({ q: query });
  const res = await apiFetch(`/api/suggest?${params.toString()}`);
  if (!res.ok) return [];
  const data = await res.json() as SuggestionsResponse;
  return Array.isArray(data.suggestions) ? data.suggestions : [];
}
