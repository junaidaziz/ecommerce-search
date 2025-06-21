export function serializeDates<T>(data: T): T {
  if (data instanceof Date) {
    return data.toISOString() as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => serializeDates(item)) as unknown as T;
  }
  if (data && typeof data === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      result[key] = serializeDates(value as unknown as T);
    }
    return result as T;
  }
  return data;
}
