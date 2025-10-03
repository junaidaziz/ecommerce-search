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

export interface TokenizedStripe {
  token: string;
  stripePaymentId: string;
  cardLast4: string;
  cardBrand: string;
}

export interface TokenizedBankDetails {
  token: string;
  bankName: string;
  accountLast4: string;
  accountType: string;
  routingNumber: string;
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

  tokenizeStripe(card: {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
  }): Promise<TokenizedStripe>;

  tokenizeBankDetails(bank: {
    bankName: string;
    accountNumber: string;
    accountType: string;
    routingNumber: string;
  }): Promise<TokenizedBankDetails>;

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

  async tokenizeStripe(card: {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
  }): Promise<TokenizedStripe> {
    // In a real implementation, this would integrate with Stripe's API
    // For now, we mock it similar to card tokenization
    return {
      token: 'tok_stripe_' + Math.random().toString(36).substring(2),
      stripePaymentId: 'pm_' + Math.random().toString(36).substring(2),
      cardLast4: card.number.slice(-4),
      cardBrand: this.detectCardBrand(card.number),
    };
  }

  async tokenizeBankDetails(bank: {
    bankName: string;
    accountNumber: string;
    accountType: string;
    routingNumber: string;
  }): Promise<TokenizedBankDetails> {
    // In a real implementation, this would validate and tokenize bank details
    return {
      token: 'tok_bank_' + Math.random().toString(36).substring(2),
      bankName: bank.bankName,
      accountLast4: bank.accountNumber.slice(-4),
      accountType: bank.accountType,
      routingNumber: bank.routingNumber,
    };
  }

  private detectCardBrand(number: string): string {
    const cleaned = number.replace(/\s+/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    return 'unknown';
  }

  async charge(token: string, amount: number): Promise<PaymentCharge> {
    return {
      transactionId: 'ch_' + Math.random().toString(36).substring(2),
      status: 'succeeded',
    };
  }
}

export const paymentProvider: PaymentProvider = new MockPaymentProvider();
