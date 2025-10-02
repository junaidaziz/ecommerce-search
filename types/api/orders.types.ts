// Checkout session response interface
export interface CheckoutSessionResponse {
  url: string;
  message?: string;
  id?: string;
}

// Order ID response interface
export interface OrderIdResponse {
  id: string;
}

// Order placed response interface
export interface OrderPlacedResponse extends OrderIdResponse {
  message: string;
}
