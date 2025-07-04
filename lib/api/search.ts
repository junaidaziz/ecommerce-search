import { apiFetch } from '../api';
import type { TrendingResponse, SuggestionsResponse } from '@/types';

export async function getTrending(): Promise<string[]> {
  const data = await apiFetch<TrendingResponse>('/api/trending');
  return Array.isArray(data.keywords) ? data.keywords : [];
}

export async function getSuggestions(query: string): Promise<string[]> {
  const params = new URLSearchParams({ q: query });
  const data = await apiFetch<SuggestionsResponse>(`/api/suggest?${params.toString()}`);
  return Array.isArray(data.suggestions) ? data.suggestions : [];
}
