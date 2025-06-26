export interface TokenizedCard {
  token: string;
  cardLast4: string;
  cardBrand: string;
  expMonth: number;
  expYear: number;
}

export interface PaymentCharge {
  transactionId: string;
  status: 'succeeded' | 'failed';
}

export interface PaymentProvider {
  tokenizeCard(card: {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
  }): Promise<TokenizedCard>;

  charge(token: string, amount: number): Promise<PaymentCharge>;
}

// A simple mock provider used for development/testing without network calls
export class MockPaymentProvider implements PaymentProvider {
  async tokenizeCard(card: {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
  }): Promise<TokenizedCard> {
    return {
      token: 'tok_' + Math.random().toString(36).substring(2),
      cardLast4: card.number.slice(-4),
      cardBrand: 'mock',
      expMonth: card.expMonth,
      expYear: card.expYear,
    };
  }

  async charge(token: string, amount: number): Promise<PaymentCharge> {
    return {
      transactionId: 'ch_' + Math.random().toString(36).substring(2),
      status: 'succeeded',
    };
  }
}

export const paymentProvider: PaymentProvider = new MockPaymentProvider();
