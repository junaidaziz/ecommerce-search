export async function apiFetch<T = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error((data && data.message) || res.statusText);
  }
  return res.json();
}
