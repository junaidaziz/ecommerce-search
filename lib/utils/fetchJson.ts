import ApiError from './ApiError';

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    let message = res.statusText;
    let info: any = undefined;
    try {
      info = await res.json();
      if (info && typeof info === 'object' && 'message' in info) {
        message = (info as any).message as string;
      }
    } catch {
      const text = await res.text();
      if (text) message = text;
    }
    throw new ApiError(message || res.statusText, res.status, info);
  }
  return res.json() as Promise<T>;
}
