export interface StrapiLineItem {
  price_data: {
    currency: string;
    product_data: { name: string };
    unit_amount: number;
  };
  quantity: number;
}

export interface StrapiCreateOrderRequest {
  products: { id: string; quantity: number }[];
  userId: string | number;
  paymentMethod: string;
  shippingAddress: Record<string, unknown>;
}

export interface StrapiCreateOrderResponse {
  orderId: string;
  lineItems: StrapiLineItem[];
}

const baseUrl = process.env.STRAPI_URL || '';
const token = process.env.STRAPI_TOKEN;

function headers() {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function strapiCreateOrder(
  data: StrapiCreateOrderRequest
): Promise<StrapiCreateOrderResponse> {
  if (!baseUrl) throw new Error('STRAPI_URL not configured');
  const res = await fetch(`${baseUrl}/orders/create`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return (await res.json()) as StrapiCreateOrderResponse;
}

export async function strapiMarkOrderPaid(data: {
  orderId: string;
  stripeSessionId: string;
}): Promise<void> {
  if (!baseUrl) throw new Error('STRAPI_URL not configured');
  const res = await fetch(`${baseUrl}/orders/mark-paid`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
}
