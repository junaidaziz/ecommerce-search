import { apiFetch } from '../api';

export async function searchTags(query: string): Promise<string[]> {
  const params = new URLSearchParams({ search: query });
  const data = await apiFetch<{ tags: string[] }>(`/api/tags?${params.toString()}`);
  return Array.isArray(data.tags) ? data.tags : [];
}
