import { MockPaymentProvider } from '@lib/paymentProvider';

describe('MockPaymentProvider', () => {
  let provider: MockPaymentProvider;

  beforeEach(() => {
    provider = new MockPaymentProvider();
  });

  test('tokenizeCard generates a token for a valid card', async () => {
    const result = await provider.tokenizeCard({
      number: '4242424242424242',
      expMonth: 12,
      expYear: 2025,
      cvc: '123',
    });

    expect(result.token).toMatch(/^tok_card_/);
    expect(result.cardLast4).toBe('4242');
    expect(result.cardBrand).toBe('mock');
    expect(result.expMonth).toBe(12);
    expect(result.expYear).toBe(2025);
  });

  test('tokenizePayPal generates a token for a valid PayPal account', async () => {
    const result = await provider.tokenizePayPal({
      email: 'test@example.com',
    });

    expect(result.token).toMatch(/^tok_paypal_/);
    expect(result.email).toBe('test@example.com');
  });

  test('charge generates a successful transaction', async () => {
    const result = await provider.charge('tok_123', 100);

    expect(result.transactionId).toMatch(/^ch_/);
    expect(result.status).toBe('succeeded');
  });

  test('tokenizeCard returns unique tokens for different calls', async () => {
    const result1 = await provider.tokenizeCard({
      number: '4242424242424242',
      expMonth: 12,
      expYear: 2025,
      cvc: '123',
    });

    const result2 = await provider.tokenizeCard({
      number: '4242424242424242',
      expMonth: 12,
      expYear: 2025,
      cvc: '123',
    });

    expect(result1.token).not.toBe(result2.token);
  });

  test('tokenizePayPal returns unique tokens for different calls', async () => {
    const result1 = await provider.tokenizePayPal({
      email: 'test@example.com',
    });

    const result2 = await provider.tokenizePayPal({
      email: 'test@example.com',
    });

    expect(result1.token).not.toBe(result2.token);
  });
});
