// Payment method interface matching Prisma schema
export interface PaymentMethod {
  id: number;
  userId: number;
  provider: string;
  cardLast4: string;
  cardBrand: string;
  expMonth: number;
  expYear: number;
  token: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Payment method input for creating payment methods
export type PaymentMethodInput = Pick<
  PaymentMethod,
  'userId' | 'provider' | 'cardLast4' | 'cardBrand' | 'expMonth' | 'expYear' | 'token' | 'isDefault'
>;

// Payment method update interface
export type PaymentMethodUpdate = Partial<Omit<PaymentMethodInput, 'userId'>>;

// Payment method response interface
export type PaymentMethodResponse = PaymentMethod;

// Payment method summary for lists
export type PaymentMethodSummary = Pick<
  PaymentMethod,
  'id' | 'provider' | 'cardLast4' | 'cardBrand' | 'expMonth' | 'expYear' | 'isDefault'
>;
