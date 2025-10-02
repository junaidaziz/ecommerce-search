export async function apiFetch<T = unknown>(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  return fetch(input, init);
}
