import Typesense from 'typesense';

export const host = process.env.TYPESENSE_HOST || 'localhost';
export const port = Number(process.env.TYPESENSE_PORT || 8108);
export const protocol = process.env.TYPESENSE_PROTOCOL || 'http';
export const apiKey = process.env.TYPESENSE_API_KEY || '';

const client = new Typesense.Client({
  nodes: [{ host, port, protocol }],
  apiKey,
  connectionTimeoutSeconds: 5,
});

async function healthCheck() {
  const url = `${protocol}://${host}:${port}/health`;
  try {
    const resp = await fetch(url, {
      headers: { 'X-TYPESENSE-API-KEY': apiKey },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (!data.ok) {
      console.warn('Typesense health check failed', data);
    }
  } catch (err) {
    console.warn(`Warning: Typesense server not reachable at ${url}`);
  }
}

void healthCheck();

export default client;
