// Shipping info interface
export interface ShippingInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
}

// Shipping method interface
export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays: number;
  isAvailable: boolean;
}

// Shipping address interface
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
}

// Shipping calculation interface
export interface ShippingCalculation {
  method: ShippingMethod;
  cost: number;
  estimatedDelivery: Date;
}

// Shipping options interface
export interface ShippingOptions {
  methods: ShippingMethod[];
  selectedMethod?: ShippingMethod;
  totalCost: number;
}
