import type { Image } from '@/types';

export function parseImages(raw: string | null): Image[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return arr.map((img) =>
        typeof img === 'string' ? { url: img } : (img as Image)
      );
    }
  } catch {
    // ignore parsing errors
  }
  return [];
}
