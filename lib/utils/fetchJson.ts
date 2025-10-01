import ApiError from './ApiError';

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    let message = res.statusText;
    let info: unknown = undefined;
    
    // Clone the response to avoid "body stream already read" error
    const clonedRes = res.clone();
    
    try {
      info = await clonedRes.json();
      if (info && typeof info === 'object' && 'message' in info) {
        message = (info as { message: string }).message;
      }
    } catch {
      try {
        const text = await res.text();
        if (text) message = text;
      } catch {
        // If both json() and text() fail, use statusText
        message = res.statusText;
      }
    }
    throw new ApiError(message || res.statusText, res.status, info);
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
