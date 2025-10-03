export interface TokenizedCard {
  token: string;
  cardLast4: string;
  cardBrand: string;
  expMonth: number;
  expYear: number;
}

export interface TokenizedPayPal {
  token: string;
  email: string;
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

  tokenizePayPal(paypal: { email: string }): Promise<TokenizedPayPal>;

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
      token: 'tok_card_' + Math.random().toString(36).substring(2),
      cardLast4: card.number.slice(-4),
      cardBrand: 'mock',
      expMonth: card.expMonth,
      expYear: card.expYear,
    };
  }

  async tokenizePayPal(paypal: { email: string }): Promise<TokenizedPayPal> {
    // In a real implementation, this would integrate with PayPal's API
    return {
      token: 'tok_paypal_' + Math.random().toString(36).substring(2),
      email: paypal.email,
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
