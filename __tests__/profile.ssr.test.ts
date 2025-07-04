jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }));
jest.mock('@pages/api/auth/[...nextauth]', () => ({ authOptions: {} }));

import { getServerSideProps } from '../pages/profile';
import { getServerSession } from 'next-auth/next';

const mockedGetServerSession = getServerSession as jest.Mock;

describe('profile getServerSideProps', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login when unauthenticated', async () => {
    mockedGetServerSession.mockResolvedValueOnce(null);
    const result = (await getServerSideProps({
      req: {},
      res: {},
    } as any)) as any;
    expect(result).toEqual({
      redirect: { destination: '/login', permanent: false },
    });
  });

  it('returns props when authenticated', async () => {
    mockedGetServerSession.mockResolvedValueOnce({
      user: { email: 'a@a.com' },
    });
    const result = (await getServerSideProps({
      req: {},
      res: {},
    } as any)) as any;
    expect(result).toEqual({ props: {} });
  });
});
