export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function fetchJsonSafe<T>(
  input: RequestInfo | URL,
  fallback: T,
  init?: RequestInit
): Promise<T> {
  try {
    return await fetchJson<T>(input, init);
  } catch {
    return fallback;
  }
}
