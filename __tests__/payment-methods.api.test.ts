import handler from '@pages/api/payment-methods/index';
import { getServerSession } from 'next-auth/next';
import { paymentProvider } from '@lib/paymentProvider';
import {
  addPaymentMethod,
  getPaymentMethodsForUser,
} from '@lib/paymentMethods';
import { findUser } from '@lib/users';

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@lib/paymentProvider', () => ({
  paymentProvider: {
    tokenizeCard: jest.fn(),
    tokenizePayPal: jest.fn(),
  },
}));

jest.mock('@lib/paymentMethods', () => ({
  addPaymentMethod: jest.fn(),
  getPaymentMethodsForUser: jest.fn(),
}));

jest.mock('@lib/users', () => ({
  findUser: jest.fn(),
}));

describe('Payment Methods API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET returns payment methods for authenticated user', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });
    (findUser as jest.Mock).mockResolvedValue({ id: 1 });
    (getPaymentMethodsForUser as jest.Mock).mockResolvedValue([
      {
        id: 1,
        provider: 'card',
        cardLast4: '4242',
        cardBrand: 'visa',
        expMonth: 12,
        expYear: 2025,
        isDefault: true,
      },
    ]);

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const req = { method: 'GET' } as any;
    const res = { status } as any;

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith([
      {
        id: 1,
        provider: 'card',
        cardLast4: '4242',
        cardBrand: 'visa',
        expMonth: 12,
        expYear: 2025,
        isDefault: true,
      },
    ]);
  });

  test('POST adds a new card payment method', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });
    (findUser as jest.Mock).mockResolvedValue({ id: 1 });
    (paymentProvider.tokenizeCard as jest.Mock).mockResolvedValue({
      token: 'tok_card_123',
      cardLast4: '4242',
      cardBrand: 'visa',
      expMonth: 12,
      expYear: 2025,
    });
    (addPaymentMethod as jest.Mock).mockResolvedValue({
      id: 1,
      provider: 'card',
      cardLast4: '4242',
      cardBrand: 'visa',
      expMonth: 12,
      expYear: 2025,
      token: 'tok_card_123',
      isDefault: true,
    });

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const req = {
      method: 'POST',
      body: {
        number: '4242424242424242',
        expMonth: '12',
        expYear: '2025',
        cvc: '123',
        setDefault: true,
      },
    } as any;
    const res = { status } as any;

    await handler(req, res);

    expect(paymentProvider.tokenizeCard).toHaveBeenCalledWith({
      number: '4242424242424242',
      expMonth: 12,
      expYear: 2025,
      cvc: '123',
    });
    expect(addPaymentMethod).toHaveBeenCalledWith(1, {
      provider: 'card',
      cardLast4: '4242',
      cardBrand: 'visa',
      expMonth: 12,
      expYear: 2025,
      token: 'tok_card_123',
      isDefault: true,
    });
    expect(status).toHaveBeenCalledWith(200);
  });

  test('POST adds a new PayPal payment method', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });
    (findUser as jest.Mock).mockResolvedValue({ id: 1 });
    (paymentProvider.tokenizePayPal as jest.Mock).mockResolvedValue({
      token: 'tok_paypal_123',
      email: 'paypal@example.com',
    });
    (addPaymentMethod as jest.Mock).mockResolvedValue({
      id: 2,
      provider: 'paypal',
      paypalEmail: 'paypal@example.com',
      token: 'tok_paypal_123',
      isDefault: false,
    });

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const req = {
      method: 'POST',
      body: {
        provider: 'paypal',
        paypalEmail: 'paypal@example.com',
        setDefault: false,
      },
    } as any;
    const res = { status } as any;

    await handler(req, res);

    expect(paymentProvider.tokenizePayPal).toHaveBeenCalledWith({
      email: 'paypal@example.com',
    });
    expect(addPaymentMethod).toHaveBeenCalledWith(1, {
      provider: 'paypal',
      paypalEmail: 'paypal@example.com',
      token: 'tok_paypal_123',
      isDefault: false,
    });
    expect(status).toHaveBeenCalledWith(200);
  });

  test('POST returns 400 when card details are missing', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });
    (findUser as jest.Mock).mockResolvedValue({ id: 1 });

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const req = {
      method: 'POST',
      body: {
        number: '4242424242424242',
        // Missing expMonth, expYear, cvc
      },
    } as any;
    const res = { status } as any;

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'card details required' });
  });

  test('POST returns 400 when PayPal email is missing', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    });
    (findUser as jest.Mock).mockResolvedValue({ id: 1 });

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const req = {
      method: 'POST',
      body: {
        provider: 'paypal',
        // Missing paypalEmail
      },
    } as any;
    const res = { status } as any;

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'PayPal email required' });
  });

  test('returns 401 for unauthenticated requests', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const req = { method: 'GET' } as any;
    const res = { status } as any;

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(401);
  });
});
