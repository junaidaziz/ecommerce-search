jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@pages/api/auth/[...nextauth]', () => ({ authOptions: {} }));
jest.mock('@lib/prisma', () => ({
  __esModule: true,
  default: {
    address: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { getServerSession } from 'next-auth/next';
import handler from '@pages/api/user/addresses';
import prisma from '@lib/prisma';

const mockSession = {
  user: {
    id: 1,
    email: 'test@example.com',
  },
};

describe('/api/user/addresses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET returns unauthorized if no session', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const req = { method: 'GET' } as any;
    const res = { status } as any;

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });

  test('GET returns addresses list', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const addresses = [
      {
        id: 1,
        uuid: 'uuid-1',
        userId: 1,
        type: 'SHIPPING',
        fullName: 'John Doe',
        addressLine1: '123 Main St',
        addressLine2: null,
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phoneNumber: '+1234567890',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    (prisma.address.findMany as jest.Mock).mockResolvedValue(addresses);

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const req = { method: 'GET' } as any;
    const res = { status } as any;

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(addresses);
    expect(prisma.address.findMany).toHaveBeenCalledWith({
      where: { userId: 1 },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  });

  test('POST creates new address', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const newAddress = {
      type: 'SHIPPING',
      fullName: 'John Doe',
      addressLine1: '123 Main St',
      addressLine2: '',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      phoneNumber: '+1234567890',
      isDefault: true,
    };

    const createdAddress = {
      id: 1,
      uuid: 'uuid-1',
      userId: 1,
      ...newAddress,
      addressLine2: null,
      phoneNumber: newAddress.phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.address.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.address.create as jest.Mock).mockResolvedValue(createdAddress);

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const req = {
      method: 'POST',
      body: newAddress,
    } as any;
    const res = { status } as any;

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({
      message: 'Created',
      address: createdAddress,
    });
    expect(prisma.address.updateMany).toHaveBeenCalledWith({
      where: { userId: 1, type: 'SHIPPING', isDefault: true },
      data: { isDefault: false },
    });
    expect(prisma.address.create).toHaveBeenCalled();
  });

  test('DELETE removes address', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const existingAddress = {
      id: 1,
      userId: 1,
      type: 'SHIPPING',
    };

    (prisma.address.findFirst as jest.Mock).mockResolvedValue(existingAddress);
    (prisma.address.delete as jest.Mock).mockResolvedValue(existingAddress);

    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const req = {
      method: 'DELETE',
      query: { id: '1' },
    } as any;
    const res = { status } as any;

    await handler(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ message: 'Deleted' });
    expect(prisma.address.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
