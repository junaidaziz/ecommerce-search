import { apiFetch } from '../api';

export async function searchTags(query: string): Promise<string[]> {
  const params = new URLSearchParams({ search: query });
  const res = await apiFetch(`/api/tags?${params.toString()}`);
  if (!res.ok) return [];
  const data = await res.json() as { tags: string[] };
  return Array.isArray(data.tags) ? data.tags : [];
}
