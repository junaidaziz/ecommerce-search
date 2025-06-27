import React from 'react';
import { render } from '@testing-library/react';
import useRequireAuth from '@hooks/useRequireAuth';
import { AppContext } from '@contexts/AppContext';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-auth/react');

const TestComp = () => {
  useRequireAuth();
  return <div>test</div>;
};

const renderWithContext = (value: any) =>
  render(
    <AppContext.Provider value={value}>
      <TestComp />
    </AppContext.Provider>
  );

const mockedUseRouter = useRouter as jest.Mock;
const mockedUseSession = useSession as jest.Mock;

describe('useRequireAuth', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not redirect while loading', () => {
    mockedUseSession.mockReturnValue({ data: null, status: 'loading' });
    const replace = jest.fn();
    mockedUseRouter.mockReturnValue({ replace });
    renderWithContext({ user: null });
    expect(replace).not.toHaveBeenCalled();
  });

  it('redirects when unauthenticated', () => {
    mockedUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    const replace = jest.fn();
    mockedUseRouter.mockReturnValue({ replace });
    renderWithContext({ user: null });
    expect(replace).toHaveBeenCalledWith('/login');
  });

  it('does not redirect when authenticated', () => {
    mockedUseSession.mockReturnValue({
      data: { user: { email: 'a' } },
      status: 'authenticated',
    });
    const replace = jest.fn();
    mockedUseRouter.mockReturnValue({ replace });
    renderWithContext({ user: { email: 'a' } });
    expect(replace).not.toHaveBeenCalled();
  });
});
